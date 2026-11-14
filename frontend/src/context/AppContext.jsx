import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from 'axios';

export const AppContext = createContext();

const AppContextProvider = (props) => {
    const currencySymbol = '₹';
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

    const [doctors, setDoctors] = useState([]);
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [userData, setUserData] = useState(false);
    const [prescriptions, setPrescriptions] = useState([]);
    const [labReports, setLabReports] = useState([]);
    const [invoices, setInvoices] = useState([]);

    const authHeader = { headers: { token } };

    const getDoctorsData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/list');
            if (data.success) {
                setDoctors(data.doctors);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    };

    const loadUserProfileData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/user/get-profile', authHeader);

            if (data.success) {
                const safeUserData = {
                    ...data.userData,
                    address: data.userData.address || { line1: '', line2: '' },
                    gender: data.userData.gender || '',
                    dob: data.userData.dob || '',
                    bloodGroup: data.userData.bloodGroup || 'Not Specified',
                    emergencyContact: data.userData.emergencyContact || { name: '', phone: '', relation: '' },
                    medicalHistory: data.userData.medicalHistory || {
                        allergies: [],
                        chronicConditions: [],
                        pastSurgeries: [],
                        currentMedications: []
                    },
                    insurance: data.userData.insurance || {
                        provider: '',
                        policyNumber: '',
                        coverageAmount: 0,
                        validTill: ''
                    }
                };
                setUserData(safeUserData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    };

    const getPrescriptions = async () => {
        if (!token) return;
        try {
            const { data } = await axios.get(backendUrl + '/api/user/prescriptions', authHeader);
            if (data.success) {
                setPrescriptions(data.prescriptions);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const getLabReports = async () => {
        if (!token) return;
        try {
            const { data } = await axios.get(backendUrl + '/api/user/lab-reports', authHeader);
            if (data.success) {
                setLabReports(data.labReports);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const uploadLabReport = async (formData) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/user/upload-lab-report',
                formData,
                authHeader
            );
            if (data.success) {
                toast.success(data.message);
                getLabReports();
                return true;
            } else {
                toast.error(data.message);
                return false;
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
            return false;
        }
    };

    const getInvoices = async () => {
        if (!token) return;
        try {
            const { data } = await axios.get(backendUrl + '/api/user/invoices', authHeader);
            if (data.success) {
                setInvoices(data.invoices);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const submitFeedback = async (appointmentId, docId, rating, comment) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/user/submit-rating',
                { appointmentId, docId, rating, comment },
                authHeader
            );
            if (data.success) {
                toast.success(data.message);
                getDoctorsData();
                return true;
            } else {
                toast.error(data.message);
                return false;
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
            return false;
        }
    };

    const rescheduleAppointment = async (appointmentId, newSlotDate, newSlotTime) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/user/reschedule-appointment',
                { appointmentId, newSlotDate, newSlotTime },
                authHeader
            );
            if (data.success) {
                toast.success(data.message);
                getDoctorsData();
                return true;
            } else {
                toast.error(data.message);
                return false;
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
            return false;
        }
    };

    useEffect(() => {
        getDoctorsData();
    }, []);

    useEffect(() => {
        if (token) {
            loadUserProfileData();
            getPrescriptions();
            getLabReports();
            getInvoices();
        }
    }, [token]);

    const value = {
        doctors, getDoctorsData,
        currencySymbol,
        backendUrl,
        token, setToken,
        userData, setUserData, loadUserProfileData,
        prescriptions, getPrescriptions,
        labReports, getLabReports, uploadLabReport,
        invoices, getInvoices,
        submitFeedback,
        rescheduleAppointment
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;

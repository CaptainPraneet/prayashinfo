import { createContext, useCallback, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const ReceptionistContext = createContext();

const ReceptionistContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

    const [rToken, setRToken] = useState(localStorage.getItem("rToken") || "");
    const [receptionistUser, setReceptionistUser] = useState(
        JSON.parse(localStorage.getItem("receptionistUser") || "null")
    );
    const [queue, setQueue] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [doctorsLoading, setDoctorsLoading] = useState(Boolean(rToken));
    const [doctorsError, setDoctorsError] = useState("");
    const [patients, setPatients] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);

    const authHeader = {
        headers: {
            rtoken: rToken
        }
    };

    const getTodayQueue = useCallback(async (docId = "") => {
        if (!rToken) return;
        try {
            setLoading(true);
            const url = docId 
                ? `${backendUrl}/api/receptionist/queue?docId=${docId}` 
                : `${backendUrl}/api/receptionist/queue`;
            const { data } = await axios.get(url, { headers: { rtoken: rToken } });
            if (data.success) {
                setQueue(data.queue);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }, [backendUrl, rToken]);

    const getDoctors = useCallback(async () => {
        if (!rToken) return;
        try {
            setDoctorsLoading(true);
            setDoctorsError("");
            const { data } = await axios.get(
                `${backendUrl}/api/receptionist/doctors`,
                { headers: { rtoken: rToken } }
            );
            if (data.success && Array.isArray(data.doctors)) {
                setDoctors(data.doctors);
            } else {
                const message = data.message || "Unable to load doctors.";
                setDoctors([]);
                setDoctorsError(message);
                toast.error(message);
            }
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Unable to load doctors.";
            setDoctors([]);
            setDoctorsError(message);
            toast.error(message);
        } finally {
            setDoctorsLoading(false);
        }
    }, [backendUrl, rToken]);

    const updateQueueStatus = async (appointmentId, status, docId = "") => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/receptionist/update-queue-status`,
                { appointmentId, status },
                authHeader
            );
            if (data.success) {
                toast.success(data.message);
                getTodayQueue(docId);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    };

    const searchPatients = useCallback(async (query = "") => {
        try {
            const { data } = await axios.get(
                `${backendUrl}/api/receptionist/patients?query=${encodeURIComponent(query)}`,
                { headers: { rtoken: rToken } }
            );
            if (data.success) {
                setPatients(data.patients);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    }, [backendUrl, rToken]);

    const registerWalkinPatient = async (patientData) => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/receptionist/register-patient`,
                patientData,
                authHeader
            );
            if (data.success) {
                toast.success(data.message);
                searchPatients();
                return data.patient;
            } else {
                toast.error(data.message);
                return null;
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
            return null;
        }
    };

    const bookWalkinAppointment = async (bookingData) => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/receptionist/book-appointment`,
                bookingData,
                authHeader
            );
            if (data.success) {
                toast.success(data.message);
                getTodayQueue();
                return data.appointment;
            } else {
                toast.error(data.message);
                return null;
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
            return null;
        }
    };

    const generateBill = async (billData) => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/receptionist/generate-bill`,
                billData,
                authHeader
            );
            if (data.success) {
                toast.success(data.message);
                getInvoices();
                return data.invoice;
            } else {
                toast.error(data.message);
                return null;
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
            return null;
        }
    };

    const getInvoices = async () => {
        try {
            const { data } = await axios.get(
                `${backendUrl}/api/receptionist/invoices`,
                authHeader
            );
            if (data.success) {
                setInvoices(data.invoices);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const value = {
        rToken, setRToken,
        receptionistUser, setReceptionistUser,
        queue, getTodayQueue, updateQueueStatus,
        doctors, doctorsLoading, doctorsError, getDoctors,
        patients, searchPatients, registerWalkinPatient,
        bookWalkinAppointment,
        generateBill, invoices, getInvoices,
        loading
    };

    return (
        <ReceptionistContext.Provider value={value}>
            {props.children}
        </ReceptionistContext.Provider>
    );
};

export default ReceptionistContextProvider;

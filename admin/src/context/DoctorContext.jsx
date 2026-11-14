import { createContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

    const [dToken, setDToken] = useState(localStorage.getItem("dToken") || "");
    const [appointments, setAppointments] = useState([]);
    const [dashData, setDashData] = useState(false);
    const [profileData, setProfileData] = useState(false);
    const [medicinesCatalog, setMedicinesCatalog] = useState([]);

    const authHeader = {
        headers: {
            Authorization: `Bearer ${dToken}`,
            dtoken: dToken
        },
    };

    const getAppointments = async (filter = "") => {
        try {
            const url = filter 
                ? `${backendUrl}/api/doctor/appointments?filter=${filter}` 
                : `${backendUrl}/api/doctor/appointments`;
            const { data } = await axios.get(url, authHeader);

            if (data.success) {
                setAppointments(data.appointments);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    };

    const completeAppointment = async (appointmentId, diagnosis = "", treatmentNotes = "", vitals = null) => {
        try {
            const { data } = await axios.post(
                backendUrl + "/api/doctor/complete-appointment",
                { appointmentId, diagnosis, treatmentNotes, vitals },
                authHeader
            );

            if (data.success) {
                toast.success(data.message);
                getAppointments();
                getDashData();
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

    const cancelAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(
                backendUrl + "/api/doctor/cancel-appointment",
                { appointmentId },
                authHeader
            );

            if (data.success) {
                toast.success(data.message);
                getAppointments();
                getDashData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    };

    const createDigitalPrescription = async (prescriptionData) => {
        try {
            const { data } = await axios.post(
                backendUrl + "/api/doctor/create-prescription",
                prescriptionData,
                authHeader
            );

            if (data.success) {
                toast.success("Prescription generated successfully");
                getAppointments();
                getDashData();
                return data.prescription;
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

    const formatAINotes = async (rawNotes) => {
        try {
            const { data } = await axios.post(
                backendUrl + "/api/doctor/format-ai-notes",
                { rawNotes },
                authHeader
            );

            if (data.success) {
                return data.formatted;
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

    const getMedicines = async (search = "") => {
        try {
            const { data } = await axios.get(
                `${backendUrl}/api/doctor/medicine-catalog?search=${encodeURIComponent(search)}`,
                authHeader
            );
            if (data.success) {
                setMedicinesCatalog(data.medicines);
                return data.medicines;
            }
        } catch (error) {
            console.error(error);
        }
        return [];
    };

    const getPatientMedicalHistory = async (patientId) => {
        try {
            const { data } = await axios.get(
                `${backendUrl}/api/doctor/patient-history/${patientId}`,
                authHeader
            );
            if (data.success) {
                return data;
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

    const scheduleFollowUp = async (appointmentId, followUpDate, followUpTime) => {
        try {
            const { data } = await axios.post(
                backendUrl + "/api/doctor/schedule-followup",
                { appointmentId, followUpDate, followUpTime },
                authHeader
            );
            if (data.success) {
                toast.success(data.message);
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

    const getDashData = async () => {
        try {
            const { data } = await axios.get(
                backendUrl + "/api/doctor/dashboard",
                authHeader
            );

            if (data.success) {
                setDashData(data.dashData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    };

    const getProfileData = async () => {
        try {
            const { data } = await axios.get(
                backendUrl + "/api/doctor/profile",
                authHeader
            );

            if (data.success) {
                setProfileData(data.profileData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    };

    const updateProfile = async (updateData) => {
        try {
            const { data } = await axios.post(
                backendUrl + "/api/doctor/update-profile",
                updateData,
                authHeader
            );
            if (data.success) {
                toast.success(data.message);
                getProfileData();
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

    const value = {
        dToken,
        setDToken,
        backendUrl,
        getAppointments,
        appointments,
        setAppointments,
        completeAppointment,
        cancelAppointment,
        createDigitalPrescription,
        formatAINotes,
        getMedicines,
        medicinesCatalog,
        getPatientMedicalHistory,
        scheduleFollowUp,
        getDashData,
        dashData,
        setDashData,
        getProfileData,
        setProfileData,
        profileData,
        updateProfile
    };

    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    );
};

export default DoctorContextProvider;

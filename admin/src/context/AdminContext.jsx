import axios from "axios";
import { createContext, useState } from "react";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
    const [aToken, setAToken] = useState(localStorage.getItem('aToken') || '');
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [dashData, setDashData] = useState(false);
    const [staffList, setStaffList] = useState([]);
    const [branches, setBranches] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [inventoryItems, setInventoryItems] = useState([]);
    const [lowStockItems, setLowStockItems] = useState([]);
    const [expiredItems, setExpiredItems] = useState([]);
    const [labReports, setLabReports] = useState([]);
    const [allInvoices, setAllInvoices] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);

    const authHeader = { headers: { aToken } };

    // Doctors
    const getAllDoctors = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/admin/all-doctors', authHeader);
            if (data.success) {
                setDoctors(data.doctors);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const changeAvailability = async (docId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/change-availability', { docId }, authHeader);
            if (data.success) {
                toast.success(data.message);
                getAllDoctors();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    };

    // Appointments
    const getAllAppointments = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/admin/appointments', authHeader);
            if (data.success) {
                setAppointments(data.appointments);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const cancelAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/cancel-appointment', { appointmentId }, authHeader);
            if (data.success) {
                toast.success(data.message);
                getAllAppointments();
                getDashData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Dashboard
    const getDashData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/admin/dashboard', authHeader);
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

    // Staff
    const getStaff = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/admin/staff', authHeader);
            if (data.success) {
                setStaffList(data.staff);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const addStaff = async (staffData) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/add-staff', staffData, authHeader);
            if (data.success) {
                toast.success(data.message);
                getStaff();
                return true;
            } else {
                toast.error(data.message);
                return false;
            }
        } catch (error) {
            toast.error(error.message);
            return false;
        }
    };

    const toggleStaffStatus = async (staffId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/toggle-staff', { staffId }, authHeader);
            if (data.success) {
                toast.success(data.message);
                getStaff();
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Branches
    const getBranches = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/admin/branches', authHeader);
            if (data.success) {
                setBranches(data.branches);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const addBranch = async (branchData) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/add-branch', branchData, authHeader);
            if (data.success) {
                toast.success(data.message);
                getBranches();
                return true;
            } else {
                toast.error(data.message);
                return false;
            }
        } catch (error) {
            toast.error(error.message);
            return false;
        }
    };

    // Expenses
    const getExpenses = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/admin/expenses', authHeader);
            if (data.success) {
                setExpenses(data.expenses);
                setTotalExpenses(data.total);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const addExpense = async (expenseData) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/add-expense', expenseData, authHeader);
            if (data.success) {
                toast.success(data.message);
                getExpenses();
                getDashData();
                return true;
            } else {
                toast.error(data.message);
                return false;
            }
        } catch (error) {
            toast.error(error.message);
            return false;
        }
    };

    // Inventory
    const getInventory = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/admin/inventory', authHeader);
            if (data.success) {
                setInventoryItems(data.items);
                setLowStockItems(data.lowStock);
                setExpiredItems(data.expiredOrNear);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const addInventoryItem = async (itemData) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/add-inventory', itemData, authHeader);
            if (data.success) {
                toast.success(data.message);
                getInventory();
                return true;
            } else {
                toast.error(data.message);
                return false;
            }
        } catch (error) {
            toast.error(error.message);
            return false;
        }
    };

    const updateInventoryStock = async (itemId, adjustment, type) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/update-stock', { itemId, adjustment, type }, authHeader);
            if (data.success) {
                toast.success(data.message);
                getInventory();
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Laboratory
    const getLabReports = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/admin/lab-tests', authHeader);
            if (data.success) {
                setLabReports(data.reports);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const updateLabStatus = async (reportId, sampleStatus, results, notes) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/update-lab-status', { reportId, sampleStatus, results, notes }, authHeader);
            if (data.success) {
                toast.success(data.message);
                getLabReports();
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Invoices
    const getAllInvoices = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/admin/invoices', authHeader);
            if (data.success) {
                setAllInvoices(data.invoices);
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Audit Logs
    const getAuditLogs = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/admin/audit-logs', authHeader);
            if (data.success) {
                setAuditLogs(data.logs);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const value = {
        aToken, setAToken,
        backendUrl, doctors,
        getAllDoctors, changeAvailability,
        appointments, setAppointments,
        getAllAppointments, cancelAppointment,
        getDashData, dashData,
        staffList, getStaff, addStaff, toggleStaffStatus,
        branches, getBranches, addBranch,
        expenses, totalExpenses, getExpenses, addExpense,
        inventoryItems, lowStockItems, expiredItems, getInventory, addInventoryItem, updateInventoryStock,
        labReports, getLabReports, updateLabStatus,
        allInvoices, getAllInvoices,
        auditLogs, getAuditLogs
    };

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    );
};

export default AdminContextProvider;

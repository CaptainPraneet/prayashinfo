import express from 'express';
import { 
    addDoctor, 
    adminDashboard, 
    allDoctors, 
    appointmentCancel, 
    appointmentsAdmin, 
    loginAdmin,
    getStaffList,
    addStaffMember,
    toggleStaffStatus,
    getBranches,
    addBranch,
    getExpenses,
    addExpense,
    getInventory,
    addInventoryItem,
    updateInventoryStock,
    getLabTestsCatalog,
    updateLabSampleStatus,
    getAuditLogs,
    getAllInvoices
} from '../controllers/adminController.js';
import upload from '../middlewares/multer.js';
import authAdmin from '../middlewares/authAdmin.js';
import { changeAvailability } from '../controllers/doctorController.js';

const adminRouter = express.Router();

// Authentication
adminRouter.post("/login", loginAdmin);

// Doctor Management
adminRouter.post("/add-doctor", authAdmin, upload.single('image'), addDoctor);
adminRouter.get("/all-doctors", authAdmin, allDoctors);
adminRouter.post("/change-availability", authAdmin, changeAvailability);

// Appointments
adminRouter.get("/appointments", authAdmin, appointmentsAdmin);
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel);

// Analytics & Dashboard
adminRouter.get("/dashboard", authAdmin, adminDashboard);

// Staff Management
adminRouter.get("/staff", authAdmin, getStaffList);
adminRouter.post("/add-staff", authAdmin, addStaffMember);
adminRouter.post("/toggle-staff", authAdmin, toggleStaffStatus);

// Branches Management
adminRouter.get("/branches", authAdmin, getBranches);
adminRouter.post("/add-branch", authAdmin, addBranch);

// Expenses Management
adminRouter.get("/expenses", authAdmin, getExpenses);
adminRouter.post("/add-expense", authAdmin, addExpense);

// Pharmacy & Inventory
adminRouter.get("/inventory", authAdmin, getInventory);
adminRouter.post("/add-inventory", authAdmin, addInventoryItem);
adminRouter.post("/update-stock", authAdmin, updateInventoryStock);

// Laboratory Management
adminRouter.get("/lab-tests", authAdmin, getLabTestsCatalog);
adminRouter.post("/update-lab-status", authAdmin, updateLabSampleStatus);

// Billing & Invoices
adminRouter.get("/invoices", authAdmin, getAllInvoices);

// Audit Logs
adminRouter.get("/audit-logs", authAdmin, getAuditLogs);

export default adminRouter;

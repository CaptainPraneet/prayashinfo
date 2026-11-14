import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";
import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import userModel from "../models/userModel.js";
import staffModel from "../models/staffModel.js";
import branchModel from "../models/branchModel.js";
import expenseModel from "../models/expenseModel.js";
import invoiceModel from "../models/invoiceModel.js";
import inventoryModel from "../models/inventoryModel.js";
import labReportModel from "../models/labReportModel.js";
import auditLogModel from "../models/auditLogModel.js";
import { getAIOperationalInsights } from "../services/aiService.js";

// API for admin login
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const expectedEmail = process.env.ADMIN_EMAIL || "admin@appointy.com";
        const expectedPass = process.env.ADMIN_PASSWORD || "qwerty123";

        if (email === expectedEmail && password === expectedPass) {
            const token = jwt.sign(
                { role: 'admin', email: expectedEmail }, 
                process.env.JWT_SECRET, 
                { expiresIn: '7d' }
            );
            res.json({ success: true, token, role: 'admin' });
        } else {
            res.json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// API for adding Doctor
const addDoctor = async (req, res) => {
    try {
        const { name, email, password, speciality, department, degree, experience, about, fees, address, branchName } = req.body;
        const imageFile = req.file;

        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.status(400).json({ success: false, message: "Missing Details" });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Please enter a valid email" });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Please enter a strong password (min 8 characters)" });
        }

        const existing = await doctorModel.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: "Doctor already registered with this email" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let imageUrl = 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png';
        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            imageUrl = imageUpload.secure_url;
        }

        const doctorData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            speciality,
            department: department || speciality,
            degree,
            experience,
            about,
            fees: Number(fees),
            address: typeof address === 'string' ? JSON.parse(address) : address,
            branchName: branchName || 'Main Hospital',
            date: Date.now()
        };

        const newDoctor = new doctorModel(doctorData);
        await newDoctor.save();

        await auditLogModel.create({
            action: 'DOCTOR_ADDED',
            performedBy: { role: 'admin' },
            targetType: 'Doctor',
            targetId: newDoctor._id.toString(),
            details: { name, email, speciality }
        });

        res.status(200).json({ success: true, message: "Doctor Added Successfully" });
    } catch (error) {
        console.error("Error adding doctor:", error);
        res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
};

// API to get all doctors
const allDoctors = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select('-password');
        res.json({ success: true, doctors });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to get all appointments
const appointmentsAdmin = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({}).sort({ date: -1 });
        res.json({ success: true, appointments });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// API for appointment cancellation by admin
const appointmentCancel = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const appointmentData = await appointmentModel.findById(appointmentId);

        if (!appointmentData) {
            return res.json({ success: false, message: "Appointment not found" });
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { 
            cancelled: true, 
            status: 'Cancelled' 
        });

        // Release doctor slot
        const { docId, slotDate, slotTime } = appointmentData;
        const doctorData = await doctorModel.findById(docId);

        if (doctorData && doctorData.slots_booked && doctorData.slots_booked[slotDate]) {
            let slots_booked = doctorData.slots_booked;
            slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);
            await doctorModel.findByIdAndUpdate(docId, { slots_booked });
        }

        await auditLogModel.create({
            action: 'APPOINTMENT_CANCELLED_BY_ADMIN',
            performedBy: { role: 'admin' },
            targetType: 'Appointment',
            targetId: appointmentId
        });

        res.json({ success: true, message: 'Appointment Cancelled' });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// API to get comprehensive Admin Dashboard Analytics
const adminDashboard = async (req, res) => {
    try {
        const doctors = await doctorModel.find({});
        const users = await userModel.find({});
        const appointments = await appointmentModel.find({});
        const expenses = await expenseModel.find({});
        const branches = await branchModel.find({});
        const staff = await staffModel.find({});

        let totalRevenue = 0;
        let onlineRevenue = 0;
        let cashRevenue = 0;

        // Daily / Weekly / Monthly counts
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        const oneWeek = 7 * oneDay;
        const oneMonth = 30 * oneDay;

        let dailyAppointments = 0;
        let weeklyAppointments = 0;
        let monthlyAppointments = 0;

        appointments.forEach(a => {
            if (a.payment || a.isCompleted) {
                totalRevenue += a.amount;
                if (a.paymentMode === 'Razorpay' || a.payment) {
                    onlineRevenue += a.amount;
                } else {
                    cashRevenue += a.amount;
                }
            }

            const appTime = a.date || now;
            if (now - appTime <= oneDay) dailyAppointments++;
            if (now - appTime <= oneWeek) weeklyAppointments++;
            if (now - appTime <= oneMonth) monthlyAppointments++;
        });

        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

        const aiInsights = await getAIOperationalInsights();

        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            staffCount: staff.length,
            branchesCount: branches.length,
            dailyAppointments,
            weeklyAppointments,
            monthlyAppointments,
            totalRevenue,
            onlineRevenue,
            cashRevenue,
            totalExpenses,
            netProfit: totalRevenue - totalExpenses,
            aiInsights,
            latestAppointments: appointments.slice(-6).reverse()
        };

        res.json({ success: true, dashData });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// STAFF MANAGEMENT
const getStaffList = async (req, res) => {
    try {
        const staff = await staffModel.find({}).select('-password').sort({ date: -1 });
        res.json({ success: true, staff });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

const addStaffMember = async (req, res) => {
    try {
        const { name, email, password, role, phone, branchName } = req.body;

        if (!name || !email || !password || !role) {
            return res.json({ success: false, message: "Name, email, password, and role are required" });
        }

        const existing = await staffModel.findOne({ email });
        if (existing) {
            return res.json({ success: false, message: "Staff member already exists with this email" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newStaff = new staffModel({
            name,
            email,
            password: hashedPassword,
            role,
            phone: phone || '',
            branchName: branchName || 'Main Hospital'
        });

        await newStaff.save();
        res.json({ success: true, message: "Staff Member Added Successfully" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

const toggleStaffStatus = async (req, res) => {
    try {
        const { staffId } = req.body;
        const staff = await staffModel.findById(staffId);
        if (!staff) return res.json({ success: false, message: "Staff not found" });

        staff.active = !staff.active;
        await staff.save();
        res.json({ success: true, message: `Staff status updated to ${staff.active ? 'Active' : 'Inactive'}` });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// BRANCH MANAGEMENT
const getBranches = async (req, res) => {
    try {
        const branches = await branchModel.find({}).sort({ date: -1 });
        res.json({ success: true, branches });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

const addBranch = async (req, res) => {
    try {
        const { name, city, address, phone, email } = req.body;
        if (!name || !city || !address || !phone || !email) {
            return res.json({ success: false, message: "All branch fields are required" });
        }

        const newBranch = new branchModel({ name, city, address, phone, email });
        await newBranch.save();
        res.json({ success: true, message: "Branch Added Successfully" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// EXPENSES MANAGEMENT
const getExpenses = async (req, res) => {
    try {
        const expenses = await expenseModel.find({}).sort({ createdAt: -1 });
        const total = expenses.reduce((sum, e) => sum + e.amount, 0);
        res.json({ success: true, expenses, total });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

const addExpense = async (req, res) => {
    try {
        const { title, category, amount, date, notes, branchName } = req.body;
        if (!title || !amount || !date) {
            return res.json({ success: false, message: "Title, amount and date are required" });
        }

        const newExpense = new expenseModel({
            title,
            category: category || 'Medical Supplies',
            amount: Number(amount),
            date,
            notes: notes || '',
            branchName: branchName || 'Main Hospital'
        });

        await newExpense.save();
        res.json({ success: true, message: "Expense Recorded Successfully" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// PHARMACY INVENTORY MANAGEMENT
const getInventory = async (req, res) => {
    try {
        const items = await inventoryModel.find({}).sort({ name: 1 });
        const lowStock = items.filter(i => i.stockQuantity <= i.reorderLevel);
        const now = new Date().toISOString().split('T')[0];
        const expiredOrNear = items.filter(i => i.expiryDate <= now);

        res.json({ success: true, items, lowStock, expiredOrNear });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

const addInventoryItem = async (req, res) => {
    try {
        const { name, genericName, category, batchNumber, manufacturer, stockQuantity, reorderLevel, unitPrice, costPrice, expiryDate, dosageForm, strength } = req.body;

        if (!name || !batchNumber || !unitPrice || !stockQuantity || !expiryDate) {
            return res.json({ success: false, message: "Name, batch, unit price, stock, and expiry date are required" });
        }

        const newItem = new inventoryModel({
            name,
            genericName: genericName || '',
            category: category || 'General',
            batchNumber,
            manufacturer: manufacturer || '',
            stockQuantity: Number(stockQuantity),
            reorderLevel: Number(reorderLevel || 20),
            unitPrice: Number(unitPrice),
            costPrice: Number(costPrice || unitPrice * 0.7),
            expiryDate,
            dosageForm: dosageForm || 'Tablet',
            strength: strength || ''
        });

        await newItem.save();
        res.json({ success: true, message: "Medicine Added to Inventory" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

const updateInventoryStock = async (req, res) => {
    try {
        const { itemId, adjustment, type } = req.body; // type: 'add' or 'subtract'
        const item = await inventoryModel.findById(itemId);
        if (!item) return res.json({ success: false, message: "Item not found" });

        const qty = Number(adjustment);
        if (type === 'subtract') {
            item.stockQuantity = Math.max(0, item.stockQuantity - qty);
        } else {
            item.stockQuantity += qty;
        }

        await item.save();
        res.json({ success: true, message: "Stock Updated Successfully", updatedStock: item.stockQuantity });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// LABORATORY MANAGEMENT
const getLabTestsCatalog = async (req, res) => {
    try {
        const reports = await labReportModel.find({}).sort({ requestedDate: -1 });
        res.json({ success: true, reports });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

const updateLabSampleStatus = async (req, res) => {
    try {
        const { reportId, sampleStatus, results, notes } = req.body;
        const updateData = { sampleStatus };

        if (sampleStatus === 'Completed') {
            updateData.completedDate = Date.now();
        }
        if (results) updateData.results = results;
        if (notes) updateData.notes = notes;

        const report = await labReportModel.findByIdAndUpdate(reportId, updateData, { new: true });
        res.json({ success: true, message: `Lab sample status updated to ${sampleStatus}`, report });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// AUDIT LOGS
const getAuditLogs = async (req, res) => {
    try {
        const logs = await auditLogModel.find({}).sort({ timestamp: -1 }).limit(100);
        res.json({ success: true, logs });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// BILLING & INVOICES (Admin View)
const getAllInvoices = async (req, res) => {
    try {
        const invoices = await invoiceModel.find({}).sort({ date: -1 });
        res.json({ success: true, invoices });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

export {
    loginAdmin,
    addDoctor,
    allDoctors,
    appointmentsAdmin,
    appointmentCancel,
    adminDashboard,
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
};

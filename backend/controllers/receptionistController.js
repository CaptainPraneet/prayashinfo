import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import staffModel from "../models/staffModel.js";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import invoiceModel from "../models/invoiceModel.js";
import auditLogModel from "../models/auditLogModel.js";
import { notifyAppointmentBooked } from "../services/notificationService.js";
import { predictNoShowRisk } from "../services/aiService.js";

// Receptionist Login
export const loginReceptionist = async (req, res) => {
    try {
        const { email, password } = req.body;
        const staff = await staffModel.findOne({ email, role: 'receptionist', active: true });

        if (!staff) {
            return res.status(401).json({ success: false, message: "Invalid credentials or inactive receptionist account" });
        }

        const isMatch = await bcrypt.compare(password, staff.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: staff._id, role: 'receptionist', name: staff.name }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );
        res.json({ 
            success: true, 
            token, 
            user: { id: staff._id, name: staff.name, email: staff.email, role: 'receptionist', branchName: staff.branchName } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 1. Patient Registration (Walk-in quick registration)
export const registerWalkinPatient = async (req, res) => {
    try {
        const { name, email, phone, gender, dob, bloodGroup, address } = req.body;

        if (!name || !phone) {
            return res.json({ success: false, message: "Patient name and phone number are required" });
        }

        const patientEmail = email && validator.isEmail(email) ? email : `patient_${Date.now()}@prayashcare.local`;

        const existing = await userModel.findOne({ email: patientEmail });
        if (existing) {
            return res.json({ success: false, message: "Patient already registered with this email" });
        }

        const defaultPassword = await bcrypt.hash("Patient@123", 10);

        const newPatient = new userModel({
            name,
            email: patientEmail,
            phone,
            gender: gender || 'Not Selected',
            dob: dob || 'Not Selected',
            bloodGroup: bloodGroup || 'Not Specified',
            address: address || { line1: '', line2: '' },
            password: defaultPassword
        });

        await newPatient.save();

        await auditLogModel.create({
            action: 'WALKIN_PATIENT_REGISTERED',
            performedBy: { role: 'receptionist' },
            targetType: 'User',
            targetId: newPatient._id.toString(),
            details: { name, phone }
        });

        res.json({ success: true, message: "Patient Registered Successfully", patient: newPatient });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// 2. Patient Search (by name, phone, email, patient ID)
export const searchPatients = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query || query.trim() === '') {
            const recentPatients = await userModel.find({}).select('-password').sort({ date: -1 }).limit(10);
            return res.json({ success: true, patients: recentPatients });
        }

        const regex = new RegExp(query.trim(), 'i');
        const patients = await userModel.find({
            $or: [
                { name: regex },
                { phone: regex },
                { email: regex }
            ]
        }).select('-password').limit(20);

        res.json({ success: true, patients });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// 3. Appointment Booking (Walk-in or Phone by receptionist)
export const bookReceptionistAppointment = async (req, res) => {
    try {
        const { userId, docId, slotDate, slotTime, symptoms, paymentMode } = req.body;

        const doctor = await doctorModel.findById(docId);
        const patient = await userModel.findById(userId);

        if (!doctor || !patient) {
            return res.json({ success: false, message: "Doctor or Patient not found" });
        }

        let slots_booked = doctor.slots_booked || {};

        if (slots_booked[slotDate] && slots_booked[slotDate].includes(slotTime)) {
            return res.json({ success: false, message: "This slot is already booked" });
        }

        if (!slots_booked[slotDate]) {
            slots_booked[slotDate] = [];
        }
        slots_booked[slotDate].push(slotTime);

        // Queue Token calculation for today
        const todaysCount = await appointmentModel.countDocuments({ docId, slotDate });
        const queueToken = todaysCount + 1;

        const noShowRisk = predictNoShowRisk({
            leadTimeDays: 0,
            pastCancellations: 0,
            isPrepaid: paymentMode === 'Cash' ? false : true,
            slotHour: parseInt((slotTime || "10").split(':')[0])
        });

        const appointment = new appointmentModel({
            userId,
            docId,
            userData: patient,
            docData: {
                _id: doctor._id,
                name: doctor.name,
                image: doctor.image,
                speciality: doctor.speciality,
                fees: doctor.fees,
                address: doctor.address
            },
            amount: doctor.fees,
            slotTime,
            slotDate,
            date: Date.now(),
            type: 'in-person',
            status: 'Checked In', // Walk-in is immediately Checked In
            payment: paymentMode !== 'Cash',
            paymentStatus: paymentMode === 'Cash' ? 'Pending' : 'Paid',
            paymentMode: paymentMode || 'Cash',
            symptoms: symptoms || 'Walk-in consultation',
            queueToken,
            branchName: doctor.branchName || 'Main Hospital',
            noShowRiskScore: noShowRisk.score,
            noShowRiskFactors: noShowRisk.factors
        });

        await appointment.save();
        await doctorModel.findByIdAndUpdate(docId, { slots_booked });

        notifyAppointmentBooked(appointment, patient, doctor).catch(err => console.error(err));

        res.json({ success: true, message: "Walk-in Appointment Booked & Checked In", appointment });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// 4. Live Queue Management
export const getTodayQueue = async (req, res) => {
    try {
        const now = new Date();
        const todayStr = `${now.getDate()}_${now.getMonth() + 1}_${now.getFullYear()}`;
        const { docId } = req.query;

        let query = { slotDate: todayStr, cancelled: false };
        if (docId) query.docId = docId;

        const queue = await appointmentModel.find(query).sort({ queueToken: 1 });
        res.json({ success: true, queue, todayDate: todayStr });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

export const getReceptionistDoctors = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select('name speciality fees');
        res.json({ success: true, doctors });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateQueueStatus = async (req, res) => {
    try {
        const { appointmentId, status } = req.body;
        // status: 'Checked In', 'In Consultation', 'Completed'
        const validStatuses = ['Confirmed', 'Checked In', 'In Consultation', 'Completed', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.json({ success: false, message: "Invalid queue status" });
        }

        const updateData = { status };
        if (status === 'Completed') updateData.isCompleted = true;

        const appointment = await appointmentModel.findByIdAndUpdate(appointmentId, updateData, { new: true });
        res.json({ success: true, message: `Patient status updated to ${status}`, appointment });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// 5. Receptionist Billing Management
export const generateWalkinBill = async (req, res) => {
    try {
        const { appointmentId, patientId, patientName, doctorName, items, paymentMethod } = req.body;

        if (!items || items.length === 0) {
            return res.json({ success: false, message: "Invoice items are required" });
        }

        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const gstRate = 18;
        const gstAmount = Math.round((subtotal * gstRate) / 100);
        const grandTotal = subtotal + gstAmount;
        const invoiceNumber = `REC-${Date.now().toString().slice(-6)}`;

        const newInvoice = new invoiceModel({
            invoiceNumber,
            patientId: patientId || "Walk-in",
            patientName: patientName || "Walk-in Patient",
            appointmentId: appointmentId || "",
            doctorName: doctorName || "General Consultation",
            items,
            subtotal,
            gstRate,
            gstAmount,
            grandTotal,
            paymentStatus: 'Paid',
            paymentMethod: paymentMethod || 'Cash',
            date: Date.now()
        });

        await newInvoice.save();

        if (appointmentId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, {
                payment: true,
                paymentStatus: 'Paid',
                paymentMode: paymentMethod || 'Cash'
            });
        }

        res.json({ success: true, message: "Bill Generated & Payment Recorded", invoice: newInvoice });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

export const getReceptionistInvoices = async (req, res) => {
    try {
        const invoices = await invoiceModel.find({}).sort({ date: -1 }).limit(50);
        res.json({ success: true, invoices });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// 🌟 Feature: Rapid QR Code Check-in System
export const checkInViaQR = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        if (!appointmentId) {
            return res.status(400).json({ success: false, message: "Appointment ID or QR code is required" });
        }

        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found for this QR code" });
        }

        if (appointment.cancelled) {
            return res.status(400).json({ success: false, message: "This appointment was cancelled" });
        }

        appointment.status = 'Checked In';
        await appointment.save();

        await auditLogModel.create({
            action: 'QR_CHECKIN',
            performedBy: { id: req.user ? req.user.id : 'reception', role: 'receptionist', name: 'Reception Desk' },
            targetType: 'Appointment',
            targetId: appointment._id.toString(),
            details: { patientName: appointment.userData.name, queueToken: appointment.queueToken }
        });

        res.json({
            success: true,
            message: `Check-in successful! Token #${appointment.queueToken}`,
            patient: appointment.userData.name,
            queueToken: appointment.queueToken,
            doctor: appointment.docData.name,
            status: appointment.status
        });
    } catch (error) {
        console.error("QR Check-in Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 🌟 Feature: Live Waiting Room / Lobby TV Display System
export const getLiveLobbyQueueDisplay = async (req, res) => {
    try {
        const now = new Date();
        const todayStr = `${now.getDate()}_${now.getMonth() + 1}_${now.getFullYear()}`;
        const { branchName } = req.query;

        const query = { slotDate: todayStr, cancelled: false };
        if (branchName) query.branchName = branchName;

        const appointments = await appointmentModel.find(query).sort({ queueToken: 1 });

        const doctorsInConsultation = [];
        const waitingQueue = [];

        appointments.forEach(app => {
            if (app.status === 'In Consultation') {
                doctorsInConsultation.push({
                    doctorId: app.docId,
                    doctorName: app.docData.name,
                    speciality: app.docData.speciality,
                    currentToken: app.queueToken,
                    patientName: app.userData.name
                });
            } else if (app.status === 'Checked In' || app.status === 'Confirmed') {
                waitingQueue.push({
                    appointmentId: app._id,
                    queueToken: app.queueToken,
                    doctorName: app.docData.name,
                    speciality: app.docData.speciality,
                    status: app.status,
                    estimatedWaitMinutes: (waitingQueue.length + 1) * 12
                });
            }
        });

        res.json({
            success: true,
            branch: branchName || 'All Branches',
            date: todayStr,
            activeConsultations: doctorsInConsultation,
            waitingQueue: waitingQueue.slice(0, 15),
            totalToday: appointments.length,
            completedToday: appointments.filter(a => a.isCompleted || a.status === 'Completed').length
        });
    } catch (error) {
        console.error("Live Lobby Queue Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

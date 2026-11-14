import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import prescriptionModel from "../models/prescriptionModel.js";
import inventoryModel from "../models/inventoryModel.js";
import userModel from "../models/userModel.js";
import auditLogModel from "../models/auditLogModel.js";
import { formatPrescriptionFromNotes } from "../services/aiService.js";

// Doctor login
const loginDoctor = async (req, res) => {
    try {
        const { email, password } = req.body;
        const doctor = await doctorModel.findOne({ email });

        if (!doctor) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, doctor.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: doctor._id, role: 'doctor' }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ success: true, token, doctor: { id: doctor._id, name: doctor.name, speciality: doctor.speciality } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get doctor's appointments (with optional filters: today, status)
const appointmentsDoctor = async (req, res) => {
    try {
        const docId = req.user.id;
        const { filter } = req.query; // 'today', 'upcoming', 'completed', 'cancelled'

        let query = { docId };

        if (filter === 'today') {
            const now = new Date();
            const todayStr = `${now.getDate()}_${now.getMonth() + 1}_${now.getFullYear()}`;
            query.slotDate = todayStr;
        } else if (filter === 'completed') {
            query.isCompleted = true;
        } else if (filter === 'cancelled') {
            query.cancelled = true;
        }

        const appointments = await appointmentModel.find(query).sort({ date: -1 });
        res.json({ success: true, appointments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Cancel appointment
const appointmentCancel = async (req, res) => {
    try {
        const docId = req.user.id;
        const { appointmentId } = req.body;

        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment || appointment.docId.toString() !== docId) {
            return res.status(403).json({ success: false, message: "Invalid doctor or appointment" });
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { 
            cancelled: true, 
            status: 'Cancelled' 
        });

        // Release doctor slot
        const doctorData = await doctorModel.findById(docId);
        if (doctorData && doctorData.slots_booked && doctorData.slots_booked[appointment.slotDate]) {
            let slots_booked = doctorData.slots_booked;
            slots_booked[appointment.slotDate] = slots_booked[appointment.slotDate].filter(e => e !== appointment.slotTime);
            await doctorModel.findByIdAndUpdate(docId, { slots_booked });
        }

        await auditLogModel.create({
            action: 'APPOINTMENT_CANCELLED_BY_DOCTOR',
            performedBy: { id: docId, role: 'doctor' },
            targetType: 'Appointment',
            targetId: appointmentId
        });

        res.json({ success: true, message: "Appointment Cancelled" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Complete appointment with clinical consultation notes & vitals
const appointmentComplete = async (req, res) => {
    try {
        const docId = req.user.id;
        const { appointmentId, diagnosis, treatmentNotes, vitals } = req.body;

        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment || appointment.docId.toString() !== docId) {
            return res.status(403).json({ success: false, message: "Invalid doctor or appointment" });
        }

        const updateData = { 
            isCompleted: true, 
            status: 'Completed' 
        };

        if (diagnosis) updateData.diagnosis = diagnosis;
        if (treatmentNotes) updateData.treatmentNotes = treatmentNotes;
        if (vitals) updateData.vitals = vitals;

        await appointmentModel.findByIdAndUpdate(appointmentId, updateData);

        await auditLogModel.create({
            action: 'APPOINTMENT_COMPLETED',
            performedBy: { id: docId, role: 'doctor' },
            targetType: 'Appointment',
            targetId: appointmentId
        });

        res.json({ success: true, message: "Appointment Completed" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create digital prescription
const createPrescription = async (req, res) => {
    try {
        const docId = req.user.id;
        const { appointmentId, diagnosis, symptoms, medicines, advice, followUpDate, vitals } = req.body;

        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment || appointment.docId.toString() !== docId) {
            return res.status(403).json({ success: false, message: "Unauthorized for this appointment" });
        }

        const doctor = await doctorModel.findById(docId);
        const patient = await userModel.findById(appointment.userId);

        const newPrescription = new prescriptionModel({
            appointmentId,
            patientId: appointment.userId,
            doctorId: docId,
            patientName: patient ? patient.name : appointment.userData.name,
            doctorName: doctor.name,
            doctorSpeciality: doctor.speciality,
            diagnosis: diagnosis || "General Clinical Evaluation",
            symptoms: symptoms || appointment.symptoms || "",
            vitals: vitals || appointment.vitals || {},
            medicines: medicines || [],
            advice: advice || "",
            followUpDate: followUpDate || "",
            doctorApproved: true,
            date: Date.now()
        });

        await newPrescription.save();

        // Mark appointment as completed
        await appointmentModel.findByIdAndUpdate(appointmentId, {
            isCompleted: true,
            status: 'Completed',
            diagnosis: diagnosis || appointment.diagnosis,
            treatmentNotes: advice || appointment.treatmentNotes
        });

        await auditLogModel.create({
            action: 'PRESCRIPTION_CREATED',
            performedBy: { id: docId, role: 'doctor', name: doctor.name },
            targetType: 'Prescription',
            targetId: newPrescription._id.toString(),
            details: { patientId: appointment.userId, medicinesCount: (medicines || []).length }
        });

        res.json({ success: true, message: "Digital Prescription Created Successfully", prescription: newPrescription });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// AI Assisted Prescription Formatting from doctor's raw/dictated notes
const formatAIPrescription = async (req, res) => {
    try {
        const { rawNotes } = req.body;
        if (!rawNotes) {
            return res.json({ success: false, message: "Clinical notes text is required" });
        }
        const formatted = formatPrescriptionFromNotes(rawNotes);
        res.json({ success: true, formatted });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Fetch medicines catalogue for doctor prescription autocomplete
const getMedicineCatalog = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        if (search) {
            query = { name: { $regex: new RegExp(search, 'i') } };
        }
        const medicines = await inventoryModel.find(query).select('name genericName category dosageForm strength unitPrice stockQuantity').limit(20);
        res.json({ success: true, medicines });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get patient's full medical history for consulting doctor
const getPatientMedicalHistory = async (req, res) => {
    try {
        const docId = req.user.id;
        const { patientId } = req.params;

        // Verify doctor has an appointment with this patient
        const hasAppointment = await appointmentModel.findOne({ docId, userId: patientId });
        if (!hasAppointment) {
            return res.status(403).json({ success: false, message: "Doctor not authorized to access this patient history" });
        }

        const patient = await userModel.findById(patientId).select('-password');
        const pastAppointments = await appointmentModel.find({ userId: patientId, isCompleted: true }).sort({ date: -1 });
        const prescriptions = await prescriptionModel.find({ patientId }).sort({ date: -1 });

        res.json({
            success: true,
            patient,
            pastAppointments,
            prescriptions
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Schedule follow-up appointment directly from consultation
const scheduleFollowUp = async (req, res) => {
    try {
        const docId = req.user.id;
        const { appointmentId, followUpDate, followUpTime } = req.body;

        const original = await appointmentModel.findById(appointmentId);
        if (!original || original.docId.toString() !== docId) {
            return res.status(403).json({ success: false, message: "Unauthorized action" });
        }

        const docData = await doctorModel.findById(docId);
        const userData = await userModel.findById(original.userId);

        const followUpAppointment = new appointmentModel({
            userId: original.userId,
            docId,
            userData: original.userData,
            docData: original.docData,
            amount: 0, // Follow-up visit
            slotDate: followUpDate,
            slotTime: followUpTime || "10:30 AM",
            date: Date.now(),
            type: original.type,
            status: 'Confirmed',
            payment: true,
            paymentStatus: 'Paid',
            symptoms: `Follow-up for previous consultation (${original.diagnosis || 'General'})`,
            branchName: docData.branchName || 'Main Hospital'
        });

        await followUpAppointment.save();
        res.json({ success: true, message: "Follow-up Appointment Scheduled Successfully", appointment: followUpAppointment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all doctors (for frontend list)
const doctorList = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select("-password -email");
        res.json({ success: true, doctors });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Toggle doctor availability
const changeAvailability = async (req, res) => {
    try {
        const { docId } = req.body;
        if (!docId) {
            return res.status(400).json({ success: false, message: "Doctor ID missing" });
        }

        const doctor = await doctorModel.findById(docId);
        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        doctor.available = !doctor.available;
        await doctor.save();

        res.json({ success: true, message: "Availability changed successfully", available: doctor.available });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get doctor profile
const doctorProfile = async (req, res) => {
    try {
        const docId = req.user.id;
        const profile = await doctorModel.findById(docId).select("-password");
        res.json({ success: true, profileData: profile });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update doctor profile
const updateDoctorProfile = async (req, res) => {
    try {
        const docId = req.user.id;
        const { fees, address, available, about, availableDays, slotDuration } = req.body;

        const updateData = {};
        if (fees !== undefined) updateData.fees = fees;
        if (address !== undefined) updateData.address = address;
        if (available !== undefined) updateData.available = available;
        if (about !== undefined) updateData.about = about;
        if (availableDays !== undefined) updateData.availableDays = availableDays;
        if (slotDuration !== undefined) updateData.slotDuration = slotDuration;

        await doctorModel.findByIdAndUpdate(docId, updateData);
        res.json({ success: true, message: "Profile Updated Successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get doctor dashboard analytics
const doctorDashboard = async (req, res) => {
    try {
        const docId = req.user.id;
        const appointments = await appointmentModel.find({ docId });

        let earnings = 0;
        let completedCount = 0;
        let todayCount = 0;
        const patientSet = new Set();

        const now = new Date();
        const todayStr = `${now.getDate()}_${now.getMonth() + 1}_${now.getFullYear()}`;

        appointments.forEach((a) => {
            if (a.isCompleted || a.payment) earnings += a.amount;
            if (a.isCompleted) completedCount++;
            if (a.slotDate === todayStr) todayCount++;
            patientSet.add(a.userId.toString());
        });

        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patientSet.size,
            todayAppointments: todayCount,
            completedAppointments: completedCount,
            latestAppointments: appointments.slice(-6).reverse(),
        };

        res.json({ success: true, dashData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export {
    loginDoctor,
    appointmentsDoctor,
    appointmentCancel,
    appointmentComplete,
    createPrescription,
    formatAIPrescription,
    getMedicineCatalog,
    getPatientMedicalHistory,
    scheduleFollowUp,
    doctorList,
    changeAvailability,
    doctorProfile,
    updateDoctorProfile,
    doctorDashboard,
};

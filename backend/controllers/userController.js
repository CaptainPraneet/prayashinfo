import validator from 'validator';
import bcrypt from 'bcrypt';
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import prescriptionModel from "../models/prescriptionModel.js";
import labReportModel from "../models/labReportModel.js";
import invoiceModel from "../models/invoiceModel.js";
import auditLogModel from "../models/auditLogModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from 'cloudinary';
import razorpay from 'razorpay';
import { 
    notifyAppointmentBooked, 
    notifyLabReportReady 
} from "../services/notificationService.js";
import { 
    analyzeSymptomsAndRecommend, 
    getAIChatbotResponse, 
    predictNoShowRisk,
    suggestOptimalSlots 
} from "../services/aiService.js";

// Initialize Razorpay instance safely
const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_Tynzj09Y0sYiFU',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'j62eWAIccwI4r5OcdHy6YkK2'
});

// API to register user
const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, bloodGroup, emergencyContact, medicalHistory } = req.body;

        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Missing Details' });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password (at least 8 characters)" });
        }

        const existing = await userModel.findOne({ email });
        if (existing) {
            return res.json({ success: false, message: "User already exists with this email" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userData = {
            name,
            email,
            password: hashedPassword,
            phone: phone || '000000000',
            bloodGroup: bloodGroup || 'Not Specified',
            emergencyContact: emergencyContact || { name: '', phone: '', relation: '' },
            medicalHistory: medicalHistory || {
                allergies: [],
                chronicConditions: [],
                pastSurgeries: [],
                currentMedications: []
            }
        };

        const newUser = new userModel(userData);
        const user = await newUser.save();
        const token = jwt.sign({ id: user._id, role: 'patient' }, process.env.JWT_SECRET, { expiresIn: '7d' });

        await auditLogModel.create({
            action: 'USER_REGISTERED',
            performedBy: { id: user._id.toString(), role: 'patient', name: user.name },
            targetType: 'User',
            targetId: user._id.toString()
        });

        res.json({ success: true, token });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// API to login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User does not exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const token = jwt.sign({ id: user._id, role: 'patient' }, process.env.JWT_SECRET, { expiresIn: '7d' });
            res.json({ success: true, token });
        } else {
            res.json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// API to get user profile data
const getProfile = async (req, res) => {
    try {
        const { userId } = req.body;
        const userData = await userModel.findById(userId).select('-password');
        res.json({ success: true, userData });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// API to update user profile
const updateProfile = async (req, res) => {
    try {
        const { userId, name, phone, address, dob, gender, bloodGroup, emergencyContact, medicalHistory, insurance } = req.body;
        const imageFile = req.file;

        if (!name || !phone) {
            return res.json({ success: false, message: "Name and Phone are required" });
        }

        const updateData = {
            name,
            phone,
            dob: dob || 'Not Selected',
            gender: gender || 'Not Selected',
            bloodGroup: bloodGroup || 'Not Specified'
        };

        if (address) {
            updateData.address = typeof address === 'string' ? JSON.parse(address) : address;
        }
        if (emergencyContact) {
            updateData.emergencyContact = typeof emergencyContact === 'string' ? JSON.parse(emergencyContact) : emergencyContact;
        }
        if (medicalHistory) {
            updateData.medicalHistory = typeof medicalHistory === 'string' ? JSON.parse(medicalHistory) : medicalHistory;
        }
        if (insurance) {
            updateData.insurance = typeof insurance === 'string' ? JSON.parse(insurance) : insurance;
        }

        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            updateData.image = imageUpload.secure_url;
        }

        await userModel.findByIdAndUpdate(userId, updateData);
        res.json({ success: true, message: 'Profile Updated Successfully' });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// API to book appointment
const bookAppointment = async (req, res) => {
    try {
        const { userId, docId, slotDate, slotTime, type, symptoms } = req.body;
        const docData = await doctorModel.findById(docId).select("-password");

        if (!docData) {
            return res.json({ success: false, message: 'Doctor not found' });
        }

        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor Not Available' });
        }

        // Atomic double-booking check against existing active appointments
        const existingActiveAppointment = await appointmentModel.findOne({
            docId,
            slotDate,
            slotTime,
            cancelled: false
        });

        if (existingActiveAppointment) {
            return res.json({ success: false, message: 'This slot was just booked by another patient. Please choose another time slot.' });
        }

        let slots_booked = docData.slots_booked || {};

        // Checking slot availability
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'Slot Not Available' });
            } else {
                slots_booked[slotDate].push(slotTime);
            }
        } else {
            slots_booked[slotDate] = [slotTime];
        }

        const userData = await userModel.findById(userId).select("-password");

        // Calculate queue token for today's date
        const todaysAppointmentsCount = await appointmentModel.countDocuments({
            docId,
            slotDate
        });
        const queueToken = todaysAppointmentsCount + 1;

        // Calculate AI No-Show Risk Score
        const pastAppointments = await appointmentModel.find({ userId });
        const pastCancellations = pastAppointments.filter(a => a.cancelled).length;
        const leadTimeDays = 1; // Default
        const isPrepaid = false;
        const slotHour = parseInt((slotTime || "10").split(':')[0]);
        const noShowRisk = predictNoShowRisk({ leadTimeDays, pastCancellations, isPrepaid, slotHour });

        const videoRoomId = (type === 'telemedicine') ? `appointy-room-${Date.now()}-${Math.floor(Math.random() * 1000)}` : '';

        const appointmentData = {
            userId,
            docId,
            userData,
            docData: {
                _id: docData._id,
                name: docData.name,
                image: docData.image,
                speciality: docData.speciality,
                degree: docData.degree,
                experience: docData.experience,
                fees: docData.fees,
                address: docData.address
            },
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now(),
            type: type || 'in-person',
            status: 'Confirmed',
            symptoms: symptoms || '',
            queueToken,
            branchName: docData.branchName || 'Main Hospital',
            videoRoomId,
            noShowRiskScore: noShowRisk.score,
            noShowRiskFactors: noShowRisk.factors
        };

        const newAppointment = new appointmentModel(appointmentData);
        await newAppointment.save();

        // Update slots_booked in doctor record
        await doctorModel.findByIdAndUpdate(docId, { slots_booked });

        // Dispatch asynchronous notification
        notifyAppointmentBooked(newAppointment, userData, docData).catch(err => console.error("Notification error:", err));

        // Audit log
        await auditLogModel.create({
            action: 'APPOINTMENT_BOOKED',
            performedBy: { id: userId, role: 'patient', name: userData.name },
            targetType: 'Appointment',
            targetId: newAppointment._id.toString(),
            details: { docId, slotDate, slotTime, type }
        });

        res.json({ success: true, message: 'Appointment Booked Successfully', appointmentId: newAppointment._id });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// API to reschedule appointment
const rescheduleAppointment = async (req, res) => {
    try {
        const { userId, appointmentId, newSlotDate, newSlotTime } = req.body;
        const appointmentData = await appointmentModel.findById(appointmentId);

        if (!appointmentData || appointmentData.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' });
        }

        if (appointmentData.cancelled || appointmentData.isCompleted) {
            return res.json({ success: false, message: 'Cannot reschedule completed or cancelled appointment' });
        }

        const { docId, slotDate: oldSlotDate, slotTime: oldSlotTime } = appointmentData;
        const doctorData = await doctorModel.findById(docId);
        let slots_booked = doctorData.slots_booked || {};

        // Release old slot
        if (slots_booked[oldSlotDate]) {
            slots_booked[oldSlotDate] = slots_booked[oldSlotDate].filter(e => e !== oldSlotTime);
        }

        // Reserve new slot
        if (slots_booked[newSlotDate]) {
            if (slots_booked[newSlotDate].includes(newSlotTime)) {
                return res.json({ success: false, message: 'New slot is not available' });
            }
            slots_booked[newSlotDate].push(newSlotTime);
        } else {
            slots_booked[newSlotDate] = [newSlotTime];
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, {
            slotDate: newSlotDate,
            slotTime: newSlotTime,
            status: 'Confirmed'
        });

        await doctorModel.findByIdAndUpdate(docId, { slots_booked });

        res.json({ success: true, message: 'Appointment Rescheduled Successfully' });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// API to cancel appointment
const cancelAppointment = async (req, res) => {
    try {
        const { userId, appointmentId } = req.body;
        const appointmentData = await appointmentModel.findById(appointmentId);

        if (!appointmentData || appointmentData.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' });
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { 
            cancelled: true, 
            status: 'Cancelled' 
        });

        // Releasing doctor slot
        const { docId, slotDate, slotTime } = appointmentData;
        const doctorData = await doctorModel.findById(docId);

        if (doctorData && doctorData.slots_booked && doctorData.slots_booked[slotDate]) {
            let slots_booked = doctorData.slots_booked;
            slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);
            await doctorModel.findByIdAndUpdate(docId, { slots_booked });
        }

        await auditLogModel.create({
            action: 'APPOINTMENT_CANCELLED_BY_PATIENT',
            performedBy: { id: userId, role: 'patient' },
            targetType: 'Appointment',
            targetId: appointmentId
        });

        res.json({ success: true, message: 'Appointment Cancelled' });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// API to get user appointments
const listAppointment = async (req, res) => {
    try {
        const { userId } = req.body;
        const appointments = await appointmentModel.find({ userId }).sort({ date: -1 });
        res.json({ success: true, appointments });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// API to make payment using Razorpay
const paymentRazorpay = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const appointmentData = await appointmentModel.findById(appointmentId);

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment Cancelled or not found' });
        }

        const options = {
            amount: appointmentData.amount * 100, // paise
            currency: process.env.CURRENCY || 'INR',
            receipt: appointmentId.toString(),
        };

        const order = await razorpayInstance.orders.create(options);
        await appointmentModel.findByIdAndUpdate(appointmentId, { razorpayOrderId: order.id });

        res.json({ success: true, order });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// API to verify Razorpay payment and generate GST invoice
const verifyRazorpay = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id } = req.body;
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

        if (orderInfo.status === 'paid') {
            const appointmentId = orderInfo.receipt;
            const appointment = await appointmentModel.findById(appointmentId);

            await appointmentModel.findByIdAndUpdate(appointmentId, { 
                payment: true,
                paymentStatus: 'Paid',
                paymentMode: 'Razorpay',
                razorpayPaymentId: razorpay_payment_id || orderInfo.id
            });

            // Automatically generate official GST tax invoice
            const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
            const gstRate = 18;
            const baseAmount = appointment.amount;
            const gstAmount = Math.round((baseAmount * gstRate) / 100);
            const grandTotal = baseAmount + gstAmount;

            const newInvoice = new invoiceModel({
                invoiceNumber,
                patientId: appointment.userId,
                patientName: appointment.userData.name,
                patientEmail: appointment.userData.email,
                patientPhone: appointment.userData.phone || '',
                appointmentId: appointment._id.toString(),
                doctorName: appointment.docData.name,
                items: [
                    {
                        description: `Consultation Fee - Dr. ${appointment.docData.name} (${appointment.type === 'telemedicine' ? 'Telemedicine' : 'In-Person'})`,
                        type: 'Consultation',
                        quantity: 1,
                        unitPrice: baseAmount,
                        total: baseAmount
                    }
                ],
                subtotal: baseAmount,
                gstRate,
                gstAmount,
                discount: 0,
                grandTotal,
                paymentStatus: 'Paid',
                paymentMethod: 'Razorpay',
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id || ''
            });
            await newInvoice.save();

            res.json({ success: true, message: "Payment Successful & Invoice Generated", invoiceNumber });
        } else {
            res.json({ success: false, message: 'Payment verification failed' });
        }
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// API for patient feedback and doctor rating
const submitDoctorRating = async (req, res) => {
    try {
        const { userId, appointmentId, docId, rating, comment } = req.body;
        const user = await userModel.findById(userId);
        const doctor = await doctorModel.findById(docId);

        if (!doctor) {
            return res.json({ success: false, message: 'Doctor not found' });
        }

        const numericRating = Number(rating);
        if (numericRating < 1 || numericRating > 5) {
            return res.json({ success: false, message: 'Rating must be between 1 and 5' });
        }

        doctor.reviews.push({
            userId,
            userName: user ? user.name : 'Patient',
            rating: numericRating,
            comment: comment || '',
            date: Date.now()
        });

        // Recalculate average rating
        const totalRating = doctor.reviews.reduce((sum, r) => sum + r.rating, 0);
        doctor.ratingCount = doctor.reviews.length;
        doctor.rating = parseFloat((totalRating / doctor.reviews.length).toFixed(1));
        await doctor.save();

        await appointmentModel.findByIdAndUpdate(appointmentId, { hasFeedback: true });

        res.json({ success: true, message: 'Thank you for your rating & feedback!' });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// API to list patient digital prescriptions
const getPatientPrescriptions = async (req, res) => {
    try {
        const { userId } = req.body;
        const prescriptions = await prescriptionModel.find({ patientId: userId }).sort({ date: -1 });
        res.json({ success: true, prescriptions });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// API to list patient lab reports & upload external reports
const getPatientLabReports = async (req, res) => {
    try {
        const { userId } = req.body;
        const labReports = await labReportModel.find({ patientId: userId }).sort({ requestedDate: -1 });
        res.json({ success: true, labReports });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

const uploadPatientLabReport = async (req, res) => {
    try {
        const { userId, testName, category, notes } = req.body;
        const user = await userModel.findById(userId);
        const file = req.file;

        if (!testName) {
            return res.json({ success: false, message: 'Test name is required' });
        }

        let fileUrl = '';
        if (file) {
            const uploadRes = await cloudinary.uploader.upload(file.path, { resource_type: "auto" });
            fileUrl = uploadRes.secure_url;
        }

        const newReport = new labReportModel({
            patientId: userId,
            patientName: user ? user.name : 'Patient',
            testName,
            category: category || 'Biochemistry',
            sampleStatus: fileUrl ? 'Completed' : 'Requested',
            fileUrl,
            notes: notes || '',
            requestedDate: Date.now(),
            completedDate: fileUrl ? Date.now() : null
        });

        await newReport.save();
        res.json({ success: true, message: 'Lab Report Uploaded Successfully' });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// API to list patient payment invoices & receipts
const getPatientInvoices = async (req, res) => {
    try {
        const { userId } = req.body;
        const invoices = await invoiceModel.find({ patientId: userId }).sort({ date: -1 });
        res.json({ success: true, invoices });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// AI Endpoints
const aiSymptomCheck = async (req, res) => {
    try {
        const { symptoms } = req.body;
        if (!symptoms) {
            return res.json({ success: false, message: 'Symptoms description is required' });
        }
        const recommendation = await analyzeSymptomsAndRecommend(symptoms);
        res.json({ success: true, ...recommendation });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

const aiChat = async (req, res) => {
    try {
        const { message } = req.body;
        const chatResponse = await getAIChatbotResponse(message);
        res.json({ success: true, ...chatResponse });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// In-memory slot hold map: `${docId}_${slotDate}_${slotTime}` => { userId, expiresAt }
const slotHoldCache = new Map();

const cleanExpiredHolds = () => {
    const now = Date.now();
    for (const [key, value] of slotHoldCache.entries()) {
        if (value.expiresAt <= now) {
            slotHoldCache.delete(key);
        }
    }
};

// 🌟 Feature: Hold Slot for 5 Minutes with Live Countdown (Prevents Double Booking)
const holdSlot = async (req, res) => {
    try {
        cleanExpiredHolds();
        const { userId, docId, slotDate, slotTime } = req.body;
        if (!docId || !slotDate || !slotTime) {
            return res.status(400).json({ success: false, message: "Missing slot details" });
        }

        const slotKey = `${docId}_${slotDate}_${slotTime}`;
        const existingHold = slotHoldCache.get(slotKey);

        if (existingHold && existingHold.expiresAt > Date.now()) {
            if (existingHold.userId !== userId) {
                const remainingSecs = Math.ceil((existingHold.expiresAt - Date.now()) / 1000);
                return res.json({ 
                    success: false, 
                    message: `This slot is currently being booked by another patient. Available again in ${remainingSecs}s if not confirmed.`,
                    isHeld: true,
                    remainingSeconds: remainingSecs
                });
            }
        }

        // Check if slot is already booked in database
        const existingAppointment = await appointmentModel.findOne({ docId, slotDate, slotTime, cancelled: false });
        if (existingAppointment) {
            return res.json({ success: false, message: "Slot already booked" });
        }

        // Reserve for 5 minutes (300 seconds)
        const expiresAt = Date.now() + 5 * 60 * 1000;
        slotHoldCache.set(slotKey, { userId, expiresAt });

        res.json({
            success: true,
            message: "Slot reserved for 5 minutes. Please complete your booking before the timer expires.",
            slotKey,
            expiresAt,
            holdDurationSeconds: 300
        });
    } catch (error) {
        console.error("Hold Slot Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Release held slot if user cancels or leaves
const releaseHeldSlot = async (req, res) => {
    try {
        const { docId, slotDate, slotTime } = req.body;
        const slotKey = `${docId}_${slotDate}_${slotTime}`;
        slotHoldCache.delete(slotKey);
        res.json({ success: true, message: "Slot released" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export {
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
    bookAppointment,
    rescheduleAppointment,
    cancelAppointment,
    listAppointment,
    paymentRazorpay,
    verifyRazorpay,
    submitDoctorRating,
    getPatientPrescriptions,
    getPatientLabReports,
    uploadPatientLabReport,
    getPatientInvoices,
    aiSymptomCheck,
    aiChat,
    holdSlot,
    releaseHeldSlot
};

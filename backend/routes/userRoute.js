import express from 'express';
import { 
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
} from '../controllers/userController.js';
import authUser from '../middlewares/authUser.js';
import upload from '../middlewares/multer.js';

const userRouter = express.Router();

// Authentication
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

// Profile
userRouter.get("/get-profile", authUser, getProfile);
userRouter.post("/update-profile", upload.single('image'), authUser, updateProfile);

// Appointments & Slot Reservation
userRouter.post("/hold-slot", authUser, holdSlot);
userRouter.post("/release-slot", authUser, releaseHeldSlot);
userRouter.post("/book-appointment", authUser, bookAppointment);
userRouter.post("/reschedule-appointment", authUser, rescheduleAppointment);
userRouter.get("/appointments", authUser, listAppointment);
userRouter.post("/cancel-appointment", authUser, cancelAppointment);

// Payments & Invoices
userRouter.post("/payment-razorpay", authUser, paymentRazorpay);
userRouter.post("/verifyRazorpay", authUser, verifyRazorpay);
userRouter.get("/invoices", authUser, getPatientInvoices);

// Prescriptions & Lab Reports
userRouter.get("/prescriptions", authUser, getPatientPrescriptions);
userRouter.get("/lab-reports", authUser, getPatientLabReports);
userRouter.post("/upload-lab-report", upload.single('reportFile'), authUser, uploadPatientLabReport);

// Feedback & Ratings
userRouter.post("/submit-rating", authUser, submitDoctorRating);

// AI Assistant & Chatbot
userRouter.post("/ai-symptom-check", aiSymptomCheck);
userRouter.post("/ai-chat", aiChat);

export default userRouter;

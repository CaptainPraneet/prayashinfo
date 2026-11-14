import express from 'express';
import { 
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
    doctorDashboard 
} from '../controllers/doctorController.js';
import authDoctor from '../middlewares/authDoctor.js';

const doctorRouter = express.Router();

// Authentication
doctorRouter.post("/login", loginDoctor);

// Appointments
doctorRouter.get("/appointments", authDoctor, appointmentsDoctor);
doctorRouter.post("/cancel-appointment", authDoctor, appointmentCancel);
doctorRouter.post("/complete-appointment", authDoctor, appointmentComplete);
doctorRouter.post("/schedule-followup", authDoctor, scheduleFollowUp);

// Prescriptions & EMR
doctorRouter.post("/create-prescription", authDoctor, createPrescription);
doctorRouter.post("/format-ai-notes", authDoctor, formatAIPrescription);
doctorRouter.get("/medicine-catalog", authDoctor, getMedicineCatalog);
doctorRouter.get("/patient-history/:patientId", authDoctor, getPatientMedicalHistory);

// Doctor Profile & Public List
doctorRouter.get("/list", doctorList);
doctorRouter.get("/profile", authDoctor, doctorProfile);
doctorRouter.post("/update-profile", authDoctor, updateDoctorProfile);
doctorRouter.post("/change-availability", authDoctor, changeAvailability);

// Analytics
doctorRouter.get("/dashboard", authDoctor, doctorDashboard);

export default doctorRouter;

import express from 'express';
import { 
    loginReceptionist, 
    registerWalkinPatient, 
    searchPatients, 
    bookReceptionistAppointment, 
    getTodayQueue, 
    getReceptionistDoctors,
    updateQueueStatus, 
    generateWalkinBill,
    getReceptionistInvoices,
    checkInViaQR,
    getLiveLobbyQueueDisplay 
} from '../controllers/receptionistController.js';
import authReceptionist from '../middlewares/authReceptionist.js';

const receptionistRouter = express.Router();

// Receptionist login
receptionistRouter.post('/login', loginReceptionist);

// Public Live Lobby Queue Display (For TV screens in clinic waiting lobby)
receptionistRouter.get('/live-display', getLiveLobbyQueueDisplay);

// Protected routes
receptionistRouter.post('/register-patient', authReceptionist, registerWalkinPatient);
receptionistRouter.get('/patients', authReceptionist, searchPatients);
receptionistRouter.post('/book-appointment', authReceptionist, bookReceptionistAppointment);
receptionistRouter.get('/doctors', authReceptionist, getReceptionistDoctors);
receptionistRouter.get('/queue', authReceptionist, getTodayQueue);
receptionistRouter.post('/update-queue-status', authReceptionist, updateQueueStatus);
receptionistRouter.post('/generate-bill', authReceptionist, generateWalkinBill);
receptionistRouter.get('/invoices', authReceptionist, getReceptionistInvoices);
receptionistRouter.post('/check-in-qr', authReceptionist, checkInViaQR);

export default receptionistRouter;

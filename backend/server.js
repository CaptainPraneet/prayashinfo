import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';
import connectDB, { getDBStatus } from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import userRouter from './routes/userRoute.js';
import receptionistRouter from './routes/receptionistRoute.js';

// app config
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 4000;

// Socket.IO configuration for WebRTC signaling and real-time live queue
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Connect to database and storage
connectDB();
connectCloudinary();

// Production Security Headers via Helmet
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate Limiting: General API Limiter (Prevents DDoS & API abuse)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Max 1000 requests per 15 min per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes." }
});
app.use('/api', apiLimiter);

// Stricter Rate Limiter for Authentication endpoints (Prevents brute-force)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30, // 30 attempts per 15 min
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many login attempts. Please wait 15 minutes before trying again." }
});
app.use(['/api/user/login', '/api/admin/login', '/api/doctor/login', '/api/receptionist/login'], authLimiter);

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    credentials: true
}));

// api endpoints
app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/user', userRouter);
app.use('/api/receptionist', receptionistRouter);

app.get("/", (req, res) => {
    res.json({
        success: true,
        service: "PrayashCare Clinic & Hospital Management API",
        version: "2.0.0",
        environment: process.env.NODE_ENV || 'production',
        timestamp: new Date().toISOString()
    });
});

app.get('/health', (req, res) => {
    const databaseConnected = getDBStatus();
    res.status(databaseConnected ? 200 : 503).json({
        status: databaseConnected ? "healthy" : "degraded",
        service: "PrayashCare API",
        database: databaseConnected ? "connected" : "disconnected / IP check needed",
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Socket.IO real-time handlers for WebRTC Telemedicine & Queue notifications
io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Telemedicine Video Consultation room join
    socket.on('join-room', ({ roomId, userId, userName, role }) => {
        socket.join(roomId);
        console.log(`[Telemedicine] User ${userName || userId} (${role}) joined room: ${roomId}`);
        socket.to(roomId).emit('user-connected', { userId, userName, role, socketId: socket.id });
    });

    // WebRTC Signaling (Offers, Answers, ICE candidates)
    socket.on('signal', ({ roomId, signalData, toSocketId }) => {
        if (toSocketId) {
            io.to(toSocketId).emit('signal', { signalData, fromSocketId: socket.id });
        } else {
            socket.to(roomId).emit('signal', { signalData, fromSocketId: socket.id });
        }
    });

    // Live Queue updates
    socket.on('queue-update', ({ doctorId, branchName, queueToken, status }) => {
        io.emit('queue-changed', { doctorId, branchName, queueToken, status, timestamp: Date.now() });
    });

    socket.on('leave-room', ({ roomId, userName }) => {
        socket.leave(roomId);
        socket.to(roomId).emit('user-disconnected', { socketId: socket.id, userName });
    });

    socket.on('disconnect', () => {
        console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
});

// Centralized Production Error Handler (Does not leak raw stack traces to clients)
app.use((err, req, res, next) => {
    console.error(`[Unhandled Error] ${req.method} ${req.url}:`, err);
    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' 
            ? "An unexpected internal server error occurred. Please contact support." 
            : err.message || "Internal Server Error"
    });
});

server.listen(port, () => console.log(`Server started on PORT:${port}`));

export { app, server, io };

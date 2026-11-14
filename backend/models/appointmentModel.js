import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    docId: { type: String, required: true },
    slotDate: { type: String, required: true },
    slotTime: { type: String, required: true },
    userData: { type: Object, required: true },
    docData: { type: Object, required: true },
    amount: { type: Number, required: true },
    date: { type: Number, required: true },
    cancelled: { type: Boolean, default: false },
    payment: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    
    // Upgrades
    type: { type: String, enum: ['in-person', 'telemedicine'], default: 'in-person' },
    status: { 
        type: String, 
        enum: ['Pending', 'Confirmed', 'Checked In', 'In Consultation', 'Completed', 'Cancelled'], 
        default: 'Confirmed' 
    },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Refunded'], default: 'Pending' },
    paymentMode: { type: String, default: 'Cash' },
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    symptoms: { type: String, default: '' },
    vitals: {
        bloodPressure: { type: String, default: '' },
        pulse: { type: Number, default: 0 },
        temperature: { type: Number, default: 0 },
        spo2: { type: Number, default: 0 },
        weight: { type: Number, default: 0 },
        height: { type: Number, default: 0 },
        bmi: { type: Number, default: 0 }
    },
    diagnosis: { type: String, default: '' },
    treatmentNotes: { type: String, default: '' },
    videoRoomId: { type: String, default: '' },
    queueToken: { type: Number, default: 0 },
    branchName: { type: String, default: 'Main Hospital' },
    noShowRiskScore: { type: Number, default: 15 },
    noShowRiskFactors: { type: [String], default: [] },
    hasFeedback: { type: Boolean, default: false }
});

// Production Compound Indexes
appointmentSchema.index({ docId: 1, slotDate: 1, slotTime: 1, cancelled: 1 });
appointmentSchema.index({ userId: 1, date: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ branchName: 1, date: -1 });

const appointmentModel = mongoose.models.appointment || mongoose.model("appointment", appointmentSchema);
export default appointmentModel;

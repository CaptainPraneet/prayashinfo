import mongoose from "mongoose";

const medicineItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true }, // e.g. "1-0-1", "Once daily", "Twice daily"
    duration: { type: String, required: true }, // e.g. "5 days"
    instructions: { type: String, default: "After meals" } // e.g. "Before food", "After food"
});

const prescriptionSchema = new mongoose.Schema({
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "appointment", required: true },
    patientId: { type: String, required: true },
    doctorId: { type: String, required: true },
    patientName: { type: String, required: true },
    doctorName: { type: String, required: true },
    doctorSpeciality: { type: String, default: "" },
    diagnosis: { type: String, required: true },
    symptoms: { type: String, default: "" },
    vitals: {
        bloodPressure: { type: String, default: "" },
        pulse: { type: Number, default: 0 },
        temperature: { type: Number, default: 0 },
        spo2: { type: Number, default: 0 },
        weight: { type: Number, default: 0 }
    },
    medicines: { type: [medicineItemSchema], default: [] },
    advice: { type: String, default: "" },
    followUpDate: { type: String, default: "" },
    doctorApproved: { type: Boolean, default: true },
    date: { type: Number, default: Date.now }
});

const prescriptionModel = mongoose.models.prescription || mongoose.model("prescription", prescriptionSchema);
export default prescriptionModel;

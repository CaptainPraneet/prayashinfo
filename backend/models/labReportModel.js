import mongoose from "mongoose";

const labResultParamSchema = new mongoose.Schema({
    parameter: { type: String, required: true },
    value: { type: String, required: true },
    unit: { type: String, default: "" },
    normalRange: { type: String, default: "" },
    status: { type: String, enum: ["Normal", "High", "Low", "Abnormal"], default: "Normal" }
});

const labReportSchema = new mongoose.Schema({
    patientId: { type: String, required: true },
    patientName: { type: String, required: true },
    doctorId: { type: String, default: "" },
    doctorName: { type: String, default: "" },
    appointmentId: { type: String, default: "" },
    testName: { type: String, required: true },
    category: { type: String, default: "Biochemistry" },
    sampleStatus: { 
        type: String, 
        enum: ["Requested", "Sample Collected", "Processing", "Completed"], 
        default: "Requested" 
    },
    results: { type: [labResultParamSchema], default: [] },
    fileUrl: { type: String, default: "" },
    notes: { type: String, default: "" },
    requestedDate: { type: Number, default: Date.now },
    completedDate: { type: Number, default: null }
});

const labReportModel = mongoose.models.labReport || mongoose.model("labReport", labReportSchema);
export default labReportModel;

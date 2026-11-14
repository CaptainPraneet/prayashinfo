import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
    action: { type: String, required: true },
    performedBy: {
        id: { type: String, default: "" },
        role: { type: String, default: "" },
        name: { type: String, default: "" }
    },
    targetType: { type: String, default: "" },
    targetId: { type: String, default: "" },
    details: { type: Object, default: {} },
    ipAddress: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now }
});

const auditLogModel = mongoose.models.auditLog || mongoose.model("auditLog", auditLogSchema);
export default auditLogModel;

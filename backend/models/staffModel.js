import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['receptionist', 'pharmacist', 'lab_tech', 'admin', 'nurse'], 
        default: 'receptionist' 
    },
    phone: { type: String, default: "" },
    branchName: { type: String, default: "Main Hospital" },
    active: { type: Boolean, default: true },
    date: { type: Number, default: Date.now }
});

const staffModel = mongoose.models.staff || mongoose.model("staff", staffSchema);
export default staffModel;

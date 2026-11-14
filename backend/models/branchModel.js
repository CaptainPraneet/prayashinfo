import mongoose from "mongoose";

const branchSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    totalDoctors: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    date: { type: Number, default: Date.now }
});

const branchModel = mongoose.models.branch || mongoose.model("branch", branchSchema);
export default branchModel;

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String, default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' },
    phone: { type: String, default: '000000000' },
    address: { type: Object, default: { line1: '', line2: '' } },
    gender: { type: String, default: 'Not Selected' },
    dob: { type: String, default: 'Not Selected' },
    bloodGroup: { type: String, default: 'Not Specified' },
    password: { type: String, required: true },
    role: { type: String, default: 'patient' },
    emergencyContact: {
        name: { type: String, default: '' },
        phone: { type: String, default: '' },
        relation: { type: String, default: '' }
    },
    medicalHistory: {
        allergies: { type: [String], default: [] },
        chronicConditions: { type: [String], default: [] },
        pastSurgeries: { type: [String], default: [] },
        currentMedications: { type: [String], default: [] }
    },
    insurance: {
        provider: { type: String, default: '' },
        policyNumber: { type: String, default: '' },
        coverageAmount: { type: Number, default: 0 },
        validTill: { type: String, default: '' }
    },
    date: { type: Number, default: Date.now }
});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;

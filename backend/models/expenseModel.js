import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { 
        type: String, 
        enum: ['Rent', 'Salaries', 'Utilities', 'Medical Supplies', 'Equipment', 'Maintenance', 'Marketing', 'Other'], 
        default: 'Medical Supplies' 
    },
    amount: { type: Number, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    recordedBy: { type: String, default: "Admin" },
    branchName: { type: String, default: "Main Hospital" },
    notes: { type: String, default: "" },
    createdAt: { type: Number, default: Date.now }
});

const expenseModel = mongoose.models.expense || mongoose.model("expense", expenseSchema);
export default expenseModel;

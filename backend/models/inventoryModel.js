import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    genericName: { type: String, default: "" },
    category: { type: String, required: true }, // e.g. Antibiotics, Analgesics, Antipyretics
    batchNumber: { type: String, required: true },
    manufacturer: { type: String, default: "" },
    stockQuantity: { type: Number, required: true, default: 0 },
    reorderLevel: { type: Number, default: 20 },
    unitPrice: { type: Number, required: true }, // Selling price
    costPrice: { type: Number, required: true }, // Buying price
    expiryDate: { type: String, required: true }, // YYYY-MM-DD
    dosageForm: { type: String, default: "Tablet" }, // Tablet, Syrup, Injection, Capsule
    strength: { type: String, default: "" }, // 500mg, 10ml, etc.
    dateAdded: { type: Number, default: Date.now }
});

const inventoryModel = mongoose.models.inventory || mongoose.model("inventory", inventorySchema);
export default inventoryModel;

import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema({
    description: { type: String, required: true },
    type: { type: String, enum: ['Consultation', 'Medicine', 'Lab Test', 'Procedure', 'Other'], default: 'Consultation' },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, required: true },
    total: { type: Number, required: true }
});

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: { type: String, required: true, unique: true },
    patientId: { type: String, required: true },
    patientName: { type: String, required: true },
    patientPhone: { type: String, default: "" },
    patientEmail: { type: String, default: "" },
    appointmentId: { type: String, default: "" },
    doctorName: { type: String, default: "" },
    items: { type: [invoiceItemSchema], required: true },
    subtotal: { type: Number, required: true },
    gstRate: { type: Number, default: 18 }, // Standard GST rate in India
    gstAmount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['Unpaid', 'Paid', 'Refunded'], default: 'Paid' },
    paymentMethod: { type: String, enum: ['Cash', 'Razorpay', 'Card', 'UPI', 'Insurance'], default: 'Cash' },
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    date: { type: Number, default: Date.now }
});

const invoiceModel = mongoose.models.invoice || mongoose.model("invoice", invoiceSchema);
export default invoiceModel;

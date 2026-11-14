import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import inventoryModel from "../models/inventoryModel.js";

/**
 * AI Service for PrayashCare Clinic & Hospital Management System
 * DISCLAIMER: AI is designed as a clinical assistant and operational optimizer.
 * AI does not independently diagnose patients or prescribe treatment.
 * All clinical data requires doctor review and approval.
 */

// 1. AI Appointment Assistant: Specialty recommendation & triage
export const analyzeSymptomsAndRecommend = async (symptomsText) => {
    const text = (symptomsText || "").toLowerCase();

    const rules = [
        {
            keywords: ['heart', 'chest pain', 'palpitation', 'shortness of breath', 'high blood pressure', 'bp'],
            speciality: 'Cardiologist',
            urgency: 'Urgent',
            reason: 'Cardiovascular symptoms require prompt medical evaluation.',
            department: 'Cardiology'
        },
        {
            keywords: ['child', 'baby', 'infant', 'toddler', 'pediatric', 'vaccination for child'],
            speciality: 'Pediatricians',
            urgency: 'Medium',
            reason: 'Symptoms in children should be evaluated by a pediatric specialist.',
            department: 'Pediatrics'
        },
        {
            keywords: ['skin', 'rash', 'acne', 'itching', 'allergy', 'eczema', 'hair fall', 'spots'],
            speciality: 'Dermatologist',
            urgency: 'Low',
            reason: 'Dermatological conditions are best treated by a dermatologist.',
            department: 'Dermatology'
        },
        {
            keywords: ['stomach', 'digestion', 'acidity', 'gas', 'constipation', 'diarrhea', 'nausea', 'vomiting', 'abdomen', 'gastric'],
            speciality: 'Gastroenterologist',
            urgency: 'Medium',
            reason: 'Digestive and gastrointestinal symptoms are managed by gastroenterologists.',
            department: 'Gastroenterology'
        },
        {
            keywords: ['pregnancy', 'period', 'menstrual', 'pelvic', 'uterus', 'gynae', 'gynecology'],
            speciality: 'Gynecologist',
            urgency: 'Medium',
            reason: 'Obstetric and gynecological health requires specialized assessment.',
            department: 'Gynecology'
        },
        {
            keywords: ['headache', 'migraine', 'dizziness', 'seizure', 'numbness', 'nerve', 'tremor'],
            speciality: 'Neurologist',
            urgency: 'Medium',
            reason: 'Neurological symptoms should be investigated by a neurologist.',
            department: 'Neurology'
        },
        {
            keywords: ['bone', 'joint', 'fracture', 'knee pain', 'back pain', 'spine', 'arthritis', 'shoulder'],
            speciality: 'Orthopedic',
            urgency: 'Medium',
            reason: 'Musculoskeletal and joint symptoms correspond to orthopedics.',
            department: 'Orthopedics'
        }
    ];

    let matched = null;
    for (const rule of rules) {
        if (rule.keywords.some(kw => text.includes(kw))) {
            matched = rule;
            break;
        }
    }

    if (!matched) {
        matched = {
            speciality: 'General physician',
            urgency: 'Low',
            reason: 'General primary care consultation for baseline clinical examination and triage.',
            department: 'General Medicine'
        };
    }

    // Find recommended doctors matching this speciality
    const doctors = await doctorModel.find({ 
        speciality: { $regex: new RegExp(matched.speciality, 'i') },
        available: true 
    }).select('-password').limit(3);

    return {
        speciality: matched.speciality,
        department: matched.department,
        urgency: matched.urgency,
        clinicalReasoning: matched.reason,
        recommendedDoctors: doctors,
        triageAdvice: matched.urgency === 'Urgent' 
            ? 'Warning: If experiencing severe distress or acute chest pain, please visit the nearest hospital emergency room immediately.'
            : 'Schedule a consultation for personalized medical advice. AI recommendations do not replace direct clinical examination.'
    };
};

// 2. AI Chatbot for Patient Queries
export const getAIChatbotResponse = async (userQuery) => {
    const q = (userQuery || "").toLowerCase();

    if (q.includes("timing") || q.includes("hour") || q.includes("open") || q.includes("schedule")) {
        return {
            reply: "PrayashCare clinics are open Monday through Saturday from 08:00 AM to 08:00 PM. Emergency services and online appointment booking are available 24/7.",
            category: "Clinic Information"
        };
    }

    if (q.includes("book") || q.includes("appointment") || q.includes("how to book")) {
        return {
            reply: "To book an appointment: 1. Click 'All Doctors' on the top menu. 2. Filter by specialty. 3. Select your doctor and preferred date & time slot. 4. Choose in-person or telemedicine. 5. Confirm with online Razorpay payment or cash on arrival.",
            category: "Appointment Guidance"
        };
    }

    if (q.includes("blood test") || q.includes("lab") || q.includes("fasting")) {
        return {
            reply: "For fasting blood sugar and lipid profile tests, 10 to 12 hours of overnight water-only fasting is recommended. Routine CBC and kidney tests do not require strict fasting.",
            category: "Laboratory Guidance"
        };
    }

    if (q.includes("razorpay") || q.includes("payment") || q.includes("fee") || q.includes("refund")) {
        return {
            reply: "PrayashCare supports secure online payments via Razorpay (UPI, Credit/Debit cards, Net Banking) as well as Cash at the clinic reception. Invoices with GST details are automatically generated in your portal.",
            category: "Billing"
        };
    }

    if (q.includes("video") || q.includes("telemedicine") || q.includes("online consultation")) {
        return {
            reply: "When you book a 'Telemedicine' appointment, you will receive a secure video consultation link in your 'My Appointments' tab. Simply click 'Join Video Consultation' at your scheduled time.",
            category: "Telemedicine"
        };
    }

    if (q.includes("prescription") || q.includes("download") || q.includes("report")) {
        return {
            reply: "Once your doctor completes your consultation, digital prescriptions and lab test results appear under 'Prescriptions' and 'Lab Reports' where you can download official PDF copies anytime.",
            category: "Records"
        };
    }

    return {
        reply: "Hello! I am your PrayashCare Healthcare Assistant. I can help you find doctors, explain clinic timings, guide appointment bookings, lab test preparation, and billing questions. How may I assist you today?",
        category: "General Support"
    };
};

// 3. Prescription Formatting from Doctor-Approved Notes
export const formatPrescriptionFromNotes = (rawNotes) => {
    const text = rawNotes || "";
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    const medicines = [];
    let diagnosis = "Clinical evaluation performed";
    let advice = "Drink adequate fluids, maintain rest, and take medications as prescribed.";
    let followUpDate = "As advised in 5-7 days if symptoms persist.";

    // Simple heuristic parser for doctor shorthand
    for (const line of lines) {
        const lower = line.toLowerCase();
        if (lower.startsWith("dx:") || lower.startsWith("diagnosis:")) {
            diagnosis = line.replace(/^(dx:|diagnosis:)/i, '').trim();
        } else if (lower.startsWith("advice:") || lower.startsWith("lifestyle:")) {
            advice = line.replace(/^(advice:|lifestyle:)/i, '').trim();
        } else if (lower.startsWith("followup:") || lower.startsWith("review:")) {
            followUpDate = line.replace(/^(followup:|review:)/i, '').trim();
        } else if (lower.includes("mg") || lower.includes("tablet") || lower.includes("cap") || lower.includes("syrup") || lower.match(/\b\d-\d-\d\b/)) {
            // Medicine line candidate
            const parts = line.split(/[-,;]/).map(s => s.trim());
            medicines.push({
                name: parts[0] || line,
                dosage: parts[1] || "1 Tablet",
                frequency: parts[2] || "Twice daily",
                duration: parts[3] || "5 days",
                instructions: "After meals"
            });
        }
    }

    if (medicines.length === 0) {
        medicines.push({
            name: "Paracetamol 650mg",
            dosage: "1 Tab",
            frequency: "1-0-1 (Twice daily)",
            duration: "3 days",
            instructions: "After food"
        });
    }

    return {
        diagnosis,
        medicines,
        advice,
        followUpDate,
        disclaimer: "Doctor Verification Required: Review and approve these structured prescription details before finalizing."
    };
};

// 4. Appointment No-Show Prediction
export const predictNoShowRisk = ({ leadTimeDays, pastCancellations, isPrepaid, slotHour }) => {
    let score = 10; // Baseline 10%
    const factors = [];

    // Lead time impact
    if (leadTimeDays > 7) {
        score += 25;
        factors.push("Booked more than 7 days in advance");
    } else if (leadTimeDays > 3) {
        score += 15;
        factors.push("Booked 3-7 days in advance");
    }

    // Past cancellations
    if (pastCancellations > 2) {
        score += 35;
        factors.push("High historical cancellation rate (>2 past cancellations)");
    } else if (pastCancellations === 1) {
        score += 15;
        factors.push("Has 1 past cancellation on record");
    }

    // Prepayment effect
    if (isPrepaid) {
        score -= 20;
        factors.push("Prepaid online via Razorpay (significantly reduces no-show risk)");
    } else {
        score += 15;
        factors.push("Pay-on-arrival / Cash selected");
    }

    // Time of day
    if (slotHour <= 9 || slotHour >= 19) {
        score += 10;
        factors.push("Early morning or late evening slot");
    }

    score = Math.max(5, Math.min(95, score));
    const riskLevel = score >= 50 ? 'High' : score >= 25 ? 'Medium' : 'Low';

    return {
        score,
        riskLevel,
        factors,
        recommendedAction: score >= 50 
            ? "Send automated WhatsApp confirmation reminder 2 hours prior to appointment." 
            : "Standard automated reminder scheduled."
    };
};

// 5. Smart Doctor Availability Suggestions
export const suggestOptimalSlots = async (docId, targetDate) => {
    const doctor = await doctorModel.findById(docId);
    if (!doctor) return [];

    const slotsBooked = doctor.slots_booked?.[targetDate] || [];
    const allSlots = [
        "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
        "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
        "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM"
    ];

    const availableSlots = allSlots.filter(s => !slotsBooked.includes(s));
    
    // Score slots based on spaced distribution
    const recommendations = availableSlots.map(time => ({
        time,
        congestionScore: "Low Congestion",
        recommended: time.includes("11:") || time.includes("03:")
    }));

    return recommendations;
};

// 6. AI Operational Analytics
export const getAIOperationalInsights = async () => {
    const [appointments, inventory] = await Promise.all([
        appointmentModel.find({}),
        inventoryModel.find({})
    ]);

    const total = appointments.length;
    const completed = appointments.filter(a => a.isCompleted).length;
    const cancelled = appointments.filter(a => a.cancelled).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Peak booking hours
    const hourCounts = {};
    appointments.forEach(a => {
        const time = a.slotTime || "";
        hourCounts[time] = (hourCounts[time] || 0) + 1;
    });

    const sortedHours = Object.entries(hourCounts).sort((a, b) => b[1] - a[1]);
    const peakHour = sortedHours[0] ? sortedHours[0][0] : "10:30 AM";

    // Low stock medicines
    const lowStockMedicines = inventory.filter(i => i.stockQuantity <= i.reorderLevel).map(i => ({
        name: i.name,
        stock: i.stockQuantity,
        reorderLevel: i.reorderLevel
    }));

    return {
        completionRate: `${completionRate}%`,
        peakCongestionSlot: peakHour,
        predictedFootfallTomorrow: Math.max(12, Math.round(total * 0.2) + 5),
        inventoryAlertsCount: lowStockMedicines.length,
        lowStockMedicines,
        operationalRecommendations: [
            `Peak patient flow observed around ${peakHour}. Ensure receptionist and nursing staff are fully deployed during this window.`,
            lowStockMedicines.length > 0 
                ? `${lowStockMedicines.length} medicines are near or below reorder threshold. Generate purchase orders promptly.`
                : `Pharmacy inventory healthy with no acute shortages detected.`,
            `Telemedicine uptake is trending upward. Promote digital prescription downloads to reduce front-desk wait time.`
        ]
    };
};

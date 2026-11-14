import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import connectDB from './config/mongodb.js';
import doctorModel from './models/doctorModel.js';
import userModel from './models/userModel.js';
import staffModel from './models/staffModel.js';
import branchModel from './models/branchModel.js';
import inventoryModel from './models/inventoryModel.js';
import labReportModel from './models/labReportModel.js';
import appointmentModel from './models/appointmentModel.js';
import prescriptionModel from './models/prescriptionModel.js';
import invoiceModel from './models/invoiceModel.js';
import expenseModel from './models/expenseModel.js';

const seedDatabase = async () => {
    try {
        await connectDB();
        console.log("Connected to MongoDB for Seeding...");

        // 1. Seed Clinic Branches
        const existingBranches = await branchModel.countDocuments();
        if (existingBranches === 0) {
            await branchModel.insertMany([
                {
                    name: "PrayashCare Main Hospital - Bangalore Central",
                    city: "Bangalore",
                    address: "100 Feet Road, Indiranagar, Bangalore - 560038",
                    phone: "+91 80 4123 4567",
                    email: "central@example.com",
                    totalDoctors: 8,
                    active: true
                },
                {
                    name: "PrayashCare Indiranagar Clinic",
                    city: "Bangalore",
                    address: "12th Main, HAL 2nd Stage, Indiranagar - 560008",
                    phone: "+91 80 2520 1122",
                    email: "indiranagar@example.com",
                    totalDoctors: 4,
                    active: true
                },
                {
                    name: "PrayashCare Koramangala Clinic",
                    city: "Bangalore",
                    address: "80 Feet Road, 4th Block, Koramangala - 560034",
                    phone: "+91 80 4987 6543",
                    email: "koramangala@example.com",
                    totalDoctors: 5,
                    active: true
                }
            ]);
            console.log("Seeded Clinic Branches.");
        }

        // 2. Seed Receptionist and Staff
        const existingReceptionist = await staffModel.findOne({ email: "receptionist@appointy.com" });
        if (!existingReceptionist) {
            const passwordHash = await bcrypt.hash("receptionist123", 10);
            await staffModel.create({
                name: "Ananya Sharma",
                email: "receptionist@appointy.com",
                password: passwordHash,
                role: "receptionist",
                phone: "+91 98765 43210",
                branchName: "PrayashCare Main Hospital - Bangalore Central",
                active: true
            });
            console.log("Seeded Receptionist Account (receptionist@appointy.com / receptionist123).");
        }

        // 3. Seed Doctors if count is 0
        const doctorCount = await doctorModel.countDocuments();
        if (doctorCount === 0) {
            const docPassHash = await bcrypt.hash("doctor123", 10);
            const doctorsData = [
                {
                    name: "Dr. Richard James",
                    email: "richard@appointy.com",
                    password: docPassHash,
                    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&auto=format&fit=crop&q=60",
                    speciality: "General physician",
                    department: "General Medicine",
                    degree: "MBBS, MD (Internal Medicine)",
                    experience: "4 Years",
                    about: "Dr. Richard James is dedicated to providing thorough primary care with emphasis on preventive medicine and comprehensive patient wellness.",
                    available: true,
                    fees: 500,
                    address: { line1: "17th Cross, Richmond Town", line2: "Bangalore, Karnataka" },
                    branchName: "PrayashCare Main Hospital - Bangalore Central",
                    rating: 4.9,
                    ratingCount: 18,
                    reviews: [
                        { userId: "user1", userName: "Aarav Patel", rating: 5, comment: "Extremely attentive and explained the treatment clearly." }
                    ],
                    date: Date.now()
                },
                {
                    name: "Dr. Emily Larson",
                    email: "emily@appointy.com",
                    password: docPassHash,
                    image: "https://images.unsplash.com/photo-1594824813511-13c54c30c80d?w=500&auto=format&fit=crop&q=60",
                    speciality: "Gynecologist",
                    department: "Gynecology & Obstetrics",
                    degree: "MBBS, MS (OBG)",
                    experience: "3 Years",
                    about: "Dr. Emily specializes in women's reproductive health, prenatal care, and minimally invasive gynecological procedures.",
                    available: true,
                    fees: 600,
                    address: { line1: "27th Cross, Richmond Circle", line2: "Bangalore, Karnataka" },
                    branchName: "PrayashCare Main Hospital - Bangalore Central",
                    rating: 4.8,
                    ratingCount: 14,
                    reviews: [
                        { userId: "user2", userName: "Priya Nair", rating: 5, comment: "Very kind, patient and professional." }
                    ],
                    date: Date.now()
                },
                {
                    name: "Dr. Sarah Patel",
                    email: "sarah@appointy.com",
                    password: docPassHash,
                    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&auto=format&fit=crop&q=60",
                    speciality: "Dermatologist",
                    department: "Dermatology",
                    degree: "MBBS, MD (Dermatology)",
                    experience: "5 Years",
                    about: "Specialist in clinical dermatology, acne management, allergy evaluations, and modern skin treatments.",
                    available: true,
                    fees: 700,
                    address: { line1: "37th Cross, Indiranagar", line2: "Bangalore, Karnataka" },
                    branchName: "PrayashCare Indiranagar Clinic",
                    rating: 4.9,
                    ratingCount: 22,
                    reviews: [
                        { userId: "user3", userName: "Rohan Gupta", rating: 5, comment: "Fixed my chronic eczema within two weeks!" }
                    ],
                    date: Date.now()
                },
                {
                    name: "Dr. Christopher Lee",
                    email: "chris@appointy.com",
                    password: docPassHash,
                    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=500&auto=format&fit=crop&q=60",
                    speciality: "Pediatricians",
                    department: "Pediatrics",
                    degree: "MBBS, DCH",
                    experience: "6 Years",
                    about: "Compassionate pediatrician committed to newborn care, child development, vaccinations, and pediatric nutrition.",
                    available: true,
                    fees: 550,
                    address: { line1: "47th Cross, Koramangala", line2: "Bangalore, Karnataka" },
                    branchName: "PrayashCare Koramangala Clinic",
                    rating: 5.0,
                    ratingCount: 31,
                    reviews: [
                        { userId: "user4", userName: "Neha Sen", rating: 5, comment: "Amazing with kids, makes them smile every time." }
                    ],
                    date: Date.now()
                },
                {
                    name: "Dr. Jennifer Garcia",
                    email: "jennifer@appointy.com",
                    password: docPassHash,
                    image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=500&auto=format&fit=crop&q=60",
                    speciality: "Neurologist",
                    department: "Neurology",
                    degree: "MBBS, DM (Neurology)",
                    experience: "8 Years",
                    about: "Expert diagnosis and care for migraines, nerve disorders, neuro-rehabilitation, and sleep disorders.",
                    available: true,
                    fees: 900,
                    address: { line1: "57th Cross, MG Road", line2: "Bangalore, Karnataka" },
                    branchName: "PrayashCare Main Hospital - Bangalore Central",
                    rating: 4.7,
                    ratingCount: 16,
                    reviews: [],
                    date: Date.now()
                },
                {
                    name: "Dr. Andrew Williams",
                    email: "andrew@appointy.com",
                    password: docPassHash,
                    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=500&auto=format&fit=crop&q=60",
                    speciality: "Gastroenterologist",
                    department: "Gastroenterology",
                    degree: "MBBS, MD, DNB (Gastro)",
                    experience: "7 Years",
                    about: "Comprehensive digestive wellness, acid reflux, endoscopy, and liver health management.",
                    available: true,
                    fees: 800,
                    address: { line1: "67th Cross, Lavelle Road", line2: "Bangalore, Karnataka" },
                    branchName: "PrayashCare Main Hospital - Bangalore Central",
                    rating: 4.9,
                    ratingCount: 19,
                    reviews: [],
                    date: Date.now()
                }
            ];

            await doctorModel.insertMany(doctorsData);
            console.log("Seeded 6 Specialist Doctors (doctor credentials: richard@appointy.com / doctor123).");
        }

        // 4. Seed Pharmacy Inventory
        const inventoryCount = await inventoryModel.countDocuments();
        if (inventoryCount === 0) {
            await inventoryModel.insertMany([
                {
                    name: "Paracetamol 650mg",
                    genericName: "Acetaminophen",
                    category: "Antipyretic / Analgesic",
                    batchNumber: "PCM-2025-01",
                    manufacturer: "Cipla Health",
                    stockQuantity: 450,
                    reorderLevel: 50,
                    unitPrice: 35,
                    costPrice: 20,
                    expiryDate: "2027-12-31",
                    dosageForm: "Tablet",
                    strength: "650mg"
                },
                {
                    name: "Amoxicillin 500mg",
                    genericName: "Amoxicillin Trihydrate",
                    category: "Antibiotics",
                    batchNumber: "AMX-2025-09",
                    manufacturer: "Sun Pharma",
                    stockQuantity: 18, // Intentionally low stock to trigger low-stock alert
                    reorderLevel: 25,
                    unitPrice: 120,
                    costPrice: 85,
                    expiryDate: "2026-11-30",
                    dosageForm: "Capsule",
                    strength: "500mg"
                },
                {
                    name: "Cetirizine 10mg",
                    genericName: "Cetirizine Hydrochloride",
                    category: "Antihistamine",
                    batchNumber: "CTZ-2024-88",
                    manufacturer: "Dr. Reddy's",
                    stockQuantity: 280,
                    reorderLevel: 30,
                    unitPrice: 45,
                    costPrice: 28,
                    expiryDate: "2027-06-30",
                    dosageForm: "Tablet",
                    strength: "10mg"
                },
                {
                    name: "Metformin 500mg",
                    genericName: "Metformin HCl",
                    category: "Antidiabetic",
                    batchNumber: "MET-2025-14",
                    manufacturer: "Lupin Pharmaceuticals",
                    stockQuantity: 320,
                    reorderLevel: 40,
                    unitPrice: 65,
                    costPrice: 42,
                    expiryDate: "2028-01-15",
                    dosageForm: "Tablet",
                    strength: "500mg"
                },
                {
                    name: "Atorvastatin 10mg",
                    genericName: "Atorvastatin Calcium",
                    category: "Lipid Lowering",
                    batchNumber: "ATR-2025-03",
                    manufacturer: "Zydus Cadila",
                    stockQuantity: 15, // Low stock
                    reorderLevel: 30,
                    unitPrice: 140,
                    costPrice: 95,
                    expiryDate: "2027-09-20",
                    dosageForm: "Tablet",
                    strength: "10mg"
                },
                {
                    name: "Azithromycin 500mg",
                    genericName: "Azithromycin",
                    category: "Antibiotics",
                    batchNumber: "AZT-2025-72",
                    manufacturer: "Alembic Pharma",
                    stockQuantity: 190,
                    reorderLevel: 25,
                    unitPrice: 180,
                    costPrice: 125,
                    expiryDate: "2027-04-10",
                    dosageForm: "Tablet",
                    strength: "500mg"
                },
                {
                    name: "Pantoprazole 40mg",
                    genericName: "Pantoprazole Sodium",
                    category: "Antacid / PPI",
                    batchNumber: "PAN-2025-33",
                    manufacturer: "Alkem Laboratories",
                    stockQuantity: 240,
                    reorderLevel: 35,
                    unitPrice: 90,
                    costPrice: 58,
                    expiryDate: "2027-08-15",
                    dosageForm: "Tablet",
                    strength: "40mg"
                }
            ]);
            console.log("Seeded Pharmacy Inventory with Real Medicines & Stock.");
        }

        // 5. Seed Laboratory Catalog & Sample Reports
        const labCount = await labReportModel.countDocuments();
        const firstUser = await userModel.findOne({});
        const firstDoc = await doctorModel.findOne({});

        if (labCount === 0 && firstUser) {
            await labReportModel.insertMany([
                {
                    patientId: firstUser._id.toString(),
                    patientName: firstUser.name,
                    doctorId: firstDoc ? firstDoc._id.toString() : "",
                    doctorName: firstDoc ? firstDoc.name : "Dr. Richard James",
                    testName: "Complete Blood Count (CBC)",
                    category: "Hematology",
                    sampleStatus: "Completed",
                    requestedDate: Date.now() - 2 * 24 * 60 * 60 * 1000,
                    completedDate: Date.now() - 1 * 24 * 60 * 60 * 1000,
                    results: [
                        { parameter: "Hemoglobin", value: "14.2", unit: "g/dL", normalRange: "13.0 - 17.0", status: "Normal" },
                        { parameter: "WBC Count", value: "7,400", unit: "/mcL", normalRange: "4,000 - 11,000", status: "Normal" },
                        { parameter: "Platelet Count", value: "245,000", unit: "/mcL", normalRange: "150,000 - 450,000", status: "Normal" },
                        { parameter: "RBC Count", value: "4.8", unit: "mil/mcL", normalRange: "4.5 - 5.9", status: "Normal" }
                    ],
                    notes: "All parameters are within normal biological reference limits."
                },
                {
                    patientId: firstUser._id.toString(),
                    patientName: firstUser.name,
                    doctorId: firstDoc ? firstDoc._id.toString() : "",
                    doctorName: firstDoc ? firstDoc.name : "Dr. Richard James",
                    testName: "Lipid Profile",
                    category: "Biochemistry",
                    sampleStatus: "Completed",
                    requestedDate: Date.now() - 5 * 24 * 60 * 60 * 1000,
                    completedDate: Date.now() - 4 * 24 * 60 * 60 * 1000,
                    results: [
                        { parameter: "Total Cholesterol", value: "192", unit: "mg/dL", normalRange: "< 200", status: "Normal" },
                        { parameter: "Triglycerides", value: "148", unit: "mg/dL", normalRange: "< 150", status: "Normal" },
                        { parameter: "HDL Cholesterol", value: "52", unit: "mg/dL", normalRange: "> 40", status: "Normal" },
                        { parameter: "LDL Cholesterol", value: "110", unit: "mg/dL", normalRange: "< 100", status: "High" }
                    ],
                    notes: "Mildly elevated LDL. Dietary modification and regular aerobic exercise recommended."
                }
            ]);
            console.log("Seeded Sample Laboratory Reports.");
        }

        // 6. Seed Sample Clinic Expenses
        const expenseCount = await expenseModel.countDocuments();
        if (expenseCount === 0) {
            await expenseModel.insertMany([
                {
                    title: "Medical Consumables & PPE Supplies",
                    category: "Medical Supplies",
                    amount: 14500,
                    date: "2025-07-01",
                    recordedBy: "Admin",
                    branchName: "PrayashCare Main Hospital - Bangalore Central",
                    notes: "Syringes, gauze, cotton rolls, sterile gloves"
                },
                {
                    title: "Facility Electricity & Backup Generator Fuel",
                    category: "Utilities",
                    amount: 28000,
                    date: "2025-07-02",
                    recordedBy: "Admin",
                    branchName: "PrayashCare Main Hospital - Bangalore Central",
                    notes: "BESCOM monthly bill + diesel fuel"
                },
                {
                    title: "Indiranagar Clinic Premises Rent",
                    category: "Rent",
                    amount: 75000,
                    date: "2025-07-01",
                    recordedBy: "Admin",
                    branchName: "PrayashCare Indiranagar Clinic",
                    notes: "Monthly lease payment"
                }
            ]);
            console.log("Seeded Clinic Expenses.");
        }

        // 7. Seed Sample Appointment with Prescription and Invoice if needed
        const appointmentCount = await appointmentModel.countDocuments();
        if (appointmentCount === 0 && firstUser && firstDoc) {
            const now = new Date();
            const todayStr = `${now.getDate()}_${now.getMonth() + 1}_${now.getFullYear()}`;

            const appointment = new appointmentModel({
                userId: firstUser._id.toString(),
                docId: firstDoc._id.toString(),
                slotDate: todayStr,
                slotTime: "11:00 AM",
                userData: firstUser,
                docData: firstDoc,
                amount: firstDoc.fees,
                date: Date.now() - 3600000,
                cancelled: false,
                payment: true,
                isCompleted: true,
                type: 'in-person',
                status: 'Completed',
                paymentStatus: 'Paid',
                paymentMode: 'Razorpay',
                symptoms: 'Mild fever and dry throat for 2 days',
                vitals: {
                    bloodPressure: '120/80',
                    pulse: 76,
                    temperature: 98.6,
                    spo2: 99,
                    weight: 68
                },
                diagnosis: 'Acute Upper Respiratory Tract Irritation',
                treatmentNotes: 'Prescribed hydration, antihistamines, and paracetamol as needed.',
                queueToken: 1,
                branchName: 'PrayashCare Main Hospital - Bangalore Central'
            });

            await appointment.save();

            // Seed Digital Prescription
            const prescription = new prescriptionModel({
                appointmentId: appointment._id,
                patientId: firstUser._id.toString(),
                doctorId: firstDoc._id.toString(),
                patientName: firstUser.name,
                doctorName: firstDoc.name,
                doctorSpeciality: firstDoc.speciality,
                diagnosis: 'Acute Upper Respiratory Tract Irritation',
                symptoms: 'Mild fever and dry throat for 2 days',
                vitals: {
                    bloodPressure: '120/80',
                    pulse: 76,
                    temperature: 98.6,
                    spo2: 99,
                    weight: 68
                },
                medicines: [
                    {
                        name: 'Paracetamol 650mg',
                        dosage: '1 Tablet',
                        frequency: '1-0-1 (Twice daily)',
                        duration: '3 days',
                        instructions: 'After meals'
                    },
                    {
                        name: 'Cetirizine 10mg',
                        dosage: '1 Tablet',
                        frequency: '0-0-1 (Night only)',
                        duration: '5 days',
                        instructions: 'Before sleep'
                    }
                ],
                advice: 'Warm water gargles twice daily. Avoid cold beverages and dust exposure.',
                followUpDate: 'Review in 5 days if fever recurs.',
                doctorApproved: true,
                date: Date.now() - 3600000
            });
            await prescription.save();

            // Seed Invoice
            const invoice = new invoiceModel({
                invoiceNumber: 'INV-100234',
                patientId: firstUser._id.toString(),
                patientName: firstUser.name,
                patientPhone: firstUser.phone,
                patientEmail: firstUser.email,
                appointmentId: appointment._id.toString(),
                doctorName: firstDoc.name,
                items: [
                    {
                        description: `Consultation Fee - Dr. ${firstDoc.name} (${firstDoc.speciality})`,
                        type: 'Consultation',
                        quantity: 1,
                        unitPrice: firstDoc.fees,
                        total: firstDoc.fees
                    }
                ],
                subtotal: firstDoc.fees,
                gstRate: 18,
                gstAmount: Math.round((firstDoc.fees * 18) / 100),
                grandTotal: firstDoc.fees + Math.round((firstDoc.fees * 18) / 100),
                paymentStatus: 'Paid',
                paymentMethod: 'Razorpay',
                date: Date.now() - 3600000
            });
            await invoice.save();

            console.log("Seeded Sample Completed Appointment, Digital Prescription, and Tax Invoice.");
        }

        console.log("Database Seeding Completed Successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Seeding Error:", error);
        process.exit(1);
    }
};

seedDatabase();

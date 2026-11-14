import 'dotenv/config';
import axios from 'axios';

const BASE_URL = 'http://localhost:4000';

async function runTestSuite() {
    console.log("=== PRAYASHCARE COMPREHENSIVE SYSTEM VERIFICATION ===");
    let passed = 0;
    let failed = 0;

    const assert = (condition, testName) => {
        if (condition) {
            console.log(`✅ [PASS] ${testName}`);
            passed++;
        } else {
            console.error(`❌ [FAIL] ${testName}`);
            failed++;
        }
    };

    try {
        // 1. Health check
        const health = await axios.get(`${BASE_URL}/`);
        assert(health.data.includes("PrayashCare"), "Backend root API response healthy");

        // 2. Doctor List Public API
        const docList = await axios.get(`${BASE_URL}/api/doctor/list`);
        assert(docList.data.success && docList.data.doctors.length > 0, `Doctors catalog returned (${docList.data.doctors.length} doctors)`);

        // 3. Super Admin Login
        const adminLogin = await axios.post(`${BASE_URL}/api/admin/login`, {
            email: process.env.ADMIN_EMAIL || 'admin@appointy.com',
            password: process.env.ADMIN_PASSWORD || 'qwerty123'
        });
        assert(adminLogin.data.success && !!adminLogin.data.token, "Super Admin authenticated via JWT");
        const aToken = adminLogin.data.token;

        // 4. Admin Dashboard Metrics & AI Insights
        const adminDash = await axios.get(`${BASE_URL}/api/admin/dashboard`, { headers: { aToken } });
        assert(adminDash.data.success && adminDash.data.dashData.doctors >= 1, "Admin dashboard metrics returned with doctor count");
        assert(!!adminDash.data.dashData.aiInsights, "AI operational insights generated for Admin");

        // 5. Admin Staff Management
        const staffRes = await axios.get(`${BASE_URL}/api/admin/staff`, { headers: { aToken } });
        assert(staffRes.data.success && staffRes.data.staff.length > 0, `Staff management list returned (${staffRes.data.staff.length} staff)`);

        // 6. Admin Clinic Branches
        const branchRes = await axios.get(`${BASE_URL}/api/admin/branches`, { headers: { aToken } });
        assert(branchRes.data.success && branchRes.data.branches.length > 0, `Multiple branches listed (${branchRes.data.branches.length} branches)`);

        // 7. Pharmacy Inventory
        const invRes = await axios.get(`${BASE_URL}/api/admin/inventory`, { headers: { aToken } });
        assert(invRes.data.success && invRes.data.items.length > 0, `Pharmacy stock loaded (${invRes.data.items.length} medicines)`);

        // 8. Laboratory Management
        const labRes = await axios.get(`${BASE_URL}/api/admin/lab-tests`, { headers: { aToken } });
        assert(labRes.data.success, "Laboratory diagnostic tests catalog accessible");

        // 9. Receptionist Authentication
        const recLogin = await axios.post(`${BASE_URL}/api/receptionist/login`, {
            email: 'receptionist@appointy.com',
            password: 'receptionist123'
        });
        assert(recLogin.data.success && !!recLogin.data.token, "Receptionist authenticated via JWT");
        const rToken = recLogin.data.token;

        // 10. Receptionist Live Queue
        const queueRes = await axios.get(`${BASE_URL}/api/receptionist/queue`, { headers: { rtoken: rToken } });
        assert(queueRes.data.success, "Live reception queue retrieved");

        // 11. Doctor Login
        const docLogin = await axios.post(`${BASE_URL}/api/doctor/login`, {
            email: 'richard@appointy.com',
            password: 'doctor123'
        });
        assert(docLogin.data.success && !!docLogin.data.token, "Doctor authenticated via JWT");
        const dToken = docLogin.data.token;

        // 12. Doctor Appointments & Dashboard
        const docApps = await axios.get(`${BASE_URL}/api/doctor/appointments`, { headers: { dtoken: dToken } });
        assert(docApps.data.success, "Doctor authorized appointments retrieved");

        // 13. Patient Authentication (Register/Login)
        const testEmail = `patient_verify_${Date.now()}@example.com`;
        const patReg = await axios.post(`${BASE_URL}/api/user/register`, {
            name: "Test Verification Patient",
            email: testEmail,
            password: "Password123",
            phone: "+91 9988776655",
            bloodGroup: "O+"
        });
        assert(patReg.data.success && !!patReg.data.token, "Patient registered with blood group and emergency fields");
        const pToken = patReg.data.token;

        // 14. Patient Profile retrieval
        const profileRes = await axios.get(`${BASE_URL}/api/user/get-profile`, { headers: { token: pToken } });
        assert(profileRes.data.success && profileRes.data.userData.name === "Test Verification Patient", "Patient profile with EMR retrieved");

        // 15. AI Symptom Checker
        const aiSymptom = await axios.post(`${BASE_URL}/api/user/ai-symptom-check`, {
            symptoms: "chest pain and shortness of breath"
        });
        assert(aiSymptom.data.success && aiSymptom.data.speciality === "Cardiologist", "AI symptom checker correctly mapped to Cardiologist");

        // 16. AI Chatbot
        const aiChat = await axios.post(`${BASE_URL}/api/user/ai-chat`, {
            message: "What are clinic operating hours?"
        });
        assert(aiChat.data.success && aiChat.data.reply.includes("PrayashCare"), "AI chatbot generated intelligent hospital guidance");

        // 17. AI Clinical Notes Formatter for Doctor
        const aiNotes = await axios.post(`${BASE_URL}/api/doctor/format-ai-notes`, {
            rawNotes: "Dx: Allergic Rhinitis\nCetirizine 10mg - 1 Tab - 0-0-1 - 5 days\nAdvice: Avoid cold water"
        }, { headers: { dtoken: dToken } });
        assert(aiNotes.data.success && aiNotes.data.formatted.medicines.length > 0, "AI formatted doctor clinical notes into structured Rx");

        // 18. Audit Logs
        const auditRes = await axios.get(`${BASE_URL}/api/admin/audit-logs`, { headers: { aToken } });
        assert(auditRes.data.success && auditRes.data.logs.length > 0, `Security audit logs recorded (${auditRes.data.logs.length} events logged)`);

        console.log(`\n========================================`);
        console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
        console.log(`========================================\n`);

        process.exit(failed > 0 ? 1 : 0);
    } catch (err) {
        console.error("Test Suite execution failed:", err.response?.data || err.message);
        process.exit(1);
    }
}

runTestSuite();

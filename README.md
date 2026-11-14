# PrayashCare – Modern Clinic & Hospital Management System (HMS)

**PrayashCare** is an enterprise-grade, full-stack Clinic & Hospital Management SaaS platform built on the MERN stack with real-time WebRTC Telemedicine, Razorpay payments, Socket.IO live queuing, Digital Prescriptions (EMR), Pharmacy & Laboratory Management, and AI Clinical & Operational Assistance.

The patient and staff portals use the shared PrayashCare identity and original SVG logo set in their respective `public/brand` directories. Existing demo login email addresses and the MongoDB database name are retained for compatibility with seeded and deployed data.

Set `PUBLIC_APP_URL` in the backend environment to the public patient-portal origin to display the branded logo in notification emails.

---

## 🏥 Role-Based Dashboards & Portals

### 1. Patient Health Portal (Frontend: `http://localhost:5173`)
- **Authentication**: JWT patient registration & secure login with password hashing.
- **Appointments**: Real-time slot booking, In-Person vs Telemedicine selection, slot rescheduling, and cancellation with automatic doctor slot release.
- **WebRTC Video Consultation**: Real-time peer-to-peer telemedicine calls with audio/video toggles.
- **Digital Prescriptions**: View and 1-click download authenticated PDF prescriptions.
- **Electronic Medical Records (EMR)**: Allergies, chronic conditions, past surgeries, and insurance policy details.
- **Diagnostic Lab Reports**: View parameter reference ranges, download reports, and upload external diagnostic records.
- **Billing & Invoices**: Razorpay online payments, cash-at-reception tracking, and downloadable GST Tax Invoices.
- **Doctor Feedback & Ratings**: 1-5 star ratings and reviews visible on doctor profiles.
- **AI Health Assistant**: Interactive symptom analyzer recommending medical specialties, triage urgency, and doctor matches.
- **AI Chatbot**: 24/7 patient guidance on clinic hours, lab test fasting, booking rules, and payment options.

### 2. Doctor Consultation Panel (Admin / Provider: `http://localhost:5174`)
- **Schedule**: Filter visits by Today's Queue, Upcoming, Completed, and Cancelled.
- **Patient History**: Instant access to patient's medical records, known allergies, and previous consultations.
- **Consultation Workspace**:
  - Live patient vitals capture (Blood Pressure, Pulse, Temperature, SpO2, Weight).
  - **Voice-to-Text Clinical Dictation**: Hands-free note taking via the Web Speech API.
  - **AI Prescription Formatter**: Formats dictated notes into structured prescriptions for doctor review.
  - **Pharmacy Autocomplete**: Select medicines directly from the hospital pharmacy catalog.
  - **Digital Prescriptions**: Generate authenticated PDF prescriptions with follow-up scheduling.
  - **WebRTC Telemedicine**: Conduct browser-based video calls for remote consultations.
- **Availability Management**: Set consulting fees, available weekdays, slot duration, and leave toggle.
- **Financial Reports**: Consultation earnings and patient volume breakdowns.

### 3. Receptionist Desk (Admin / Provider: `http://localhost:5174`)
- **Live Queue Management**: Real-time token tracking (`Checked In` → `In Consultation` → `Completed`) with AI no-show risk indicators.
- **Patient Registration**: Rapid walk-in patient registration with demographic details.
- **Patient Directory & Search**: Instant lookup by name, phone number, email, or patient ID.
- **Walk-in Appointment Booking**: Schedule immediate consultations and assign live queue tokens.
- **Billing & Point of Sale (POS)**: Generate invoices for consultations, medicines, procedures, and lab tests with automatic 18% GST calculation and receipt printing.

### 4. Super Admin Executive Panel (Admin / Provider: `http://localhost:5174`)
- **Executive Dashboard**: Real-time KPI metrics, daily/weekly/monthly appointment velocity, and net profit calculations.
- **AI Operational Analytics**: Peak congestion hour forecasting, footfall projections, and inventory shortage warnings.
- **Doctor Management**: Onboard specialists, assign departments and branches, and manage availability.
- **Staff Management & RBAC**: Manage receptionists, pharmacists, and lab technicians with active/suspended controls.
- **Multiple Clinic Branches**: Multi-location branch network tracking (Main Hospital, Indiranagar, Koramangala).
- **Pharmacy & Inventory**: Medicine catalog, batch tracking, stock-in/stock-out adjustments, expiry warnings, and low-stock reorder alerts.
- **Laboratory Management**: Diagnostic test catalog, sample tracking workflow, and test report releases.
- **Billing & GST Auditing**: Hospital-wide revenue reports, GST collections, and payment transaction tracking.
- **Clinic Expenses**: Track rent, salaries, utilities, and pharmaceutical procurement.
- **Security Audit Logs**: Immutable audit trail of appointments, logins, and clinical actions.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, jsPDF
- **Admin / Provider Portal**: React 19, Vite, Tailwind CSS, Lucide Icons, jsPDF
- **Backend API**: Node.js, Express.js (ES Modules)
- **Database**: MongoDB Atlas with Mongoose ODM
- **Real-Time Signaling**: Socket.IO (WebRTC Telemedicine & Live Queue)
- **Payment Gateway**: Razorpay (Orders, Signatures, Verification)
- **Cloud Storage**: Cloudinary & AWS S3 integration
- **Notifications**: Nodemailer (Email), Meta WhatsApp Cloud API / Twilio (WhatsApp & SMS)
- **Deployment**: Docker, Docker Compose, Nginx, AWS EC2, GitHub Actions CI/CD

---

## 🚀 Quick Start & Running Locally

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas connection string (already configured in `backend/.env`)

### 2. Backend Setup
```bash
cd backend
npm install
node seed.js    # Pre-seeds branches, doctors, pharmacy stock, lab tests
node server.js  # Starts API on http://localhost:4000
```

### 3. Patient Portal Setup
```bash
cd frontend
npm install
npm run dev     # Runs on http://localhost:5173
```

### 4. Admin / Doctor / Receptionist Portal Setup
```bash
cd admin
npm install
npm run dev     # Runs on http://localhost:5174
```

---

## 🔑 Demo Access Credentials

| Role | Email | Password | Access Portal |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@appointy.com` | `qwerty123` | `http://localhost:5174` (Admin Tab) |
| **Specialist Doctor** | `richard@appointy.com` | `doctor123` | `http://localhost:5174` (Doctor Tab) |
| **Receptionist** | `receptionist@appointy.com` | `receptionist123` | `http://localhost:5174` (Receptionist Tab) |
| **Patient** | `aarav@example.com` | `Password123` | `http://localhost:5173` (Patient Login) |

*(Quick-fill buttons are also available on both login screens for one-click access).*

---

## 🧪 Verification & Automated Tests

A comprehensive 19-point automated test suite verifies all system modules:
```bash
cd backend
node test-suite.js
```
**Results: 19 PASSED, 0 FAILED** (Covering authentication, RBAC, live queue, doctor appointments, EMR, AI symptom triage, AI notes formatting, and audit logs).

---

## 🐳 Docker & CI/CD Deployment

### Run Complete Multi-Container Stack:
```bash
docker-compose -p prayashcare up --build
```
- **Backend Service**: `http://localhost:4000`
- **Patient Frontend**: `http://localhost:5173`
- **Admin/Staff Portal**: `http://localhost:5174`

### Jenkins CI/CD:
The root `Jenkinsfile` builds the patient portal, staff portal, and backend Docker images on every run. On the `main` branch it also pushes the images to GHCR and updates the existing Kubernetes deployments.

#### Jenkins setup
1. Use a Linux Jenkins agent labeled `appointy-ci` with Git, Docker, and `kubectl` installed. Give the Jenkins agent's Docker daemon permission to build images.
2. Update `IMAGE_PREFIX` in `Jenkinsfile` to your lowercase registry namespace (for example, `ghcr.io/your-org/prayashcare`). The registry must match `DOCKER_REGISTRY`.
3. Add a Jenkins **Username with password** credential with ID `appointy-container-registry` and permission to push to that registry.
4. Add a Jenkins **Secret file** credential with ID `appointy-kubeconfig`. It must have access to the target cluster and the `prayashcare` namespace.
5. Configure the `main` branch job as a Jenkins Multibranch Pipeline so pull requests can build without publishing or deploying. Supply the `VITE_BACKEND_URL` build parameter; `VITE_RAZORPAY_KEY_ID` is optional if Razorpay is not enabled.
6. Create the namespace with `kubectl apply -f k8s/00-namespace.yaml`. Keep a private env file outside the repository with the backend runtime settings, then run `kubectl create secret generic prayashcare-backend-secrets --namespace prayashcare --from-env-file=/path/to/backend-secrets.env --dry-run=client -o yaml | kubectl apply -f -`. Include at least `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`; also supply the payment, Cloudinary, SMTP, and `ALLOWED_ORIGINS` settings needed by your deployment. Do not commit the env file or Secret manifest.
7. Edit the image prefix in `k8s/10-workloads.yaml` and `Jenkinsfile` to the same registry namespace. Create a `prayashcare-registry-pull` Kubernetes Secret in that namespace with read-only registry credentials (or remove the `imagePullSecrets` entries if the images are public). Edit the sample hosts and TLS Secret name in `k8s/20-ingress.yaml`, then provision an NGINX Ingress Controller, DNS records, and the TLS Secret for your domain.
8. The Jenkins deployment stage renders the image prefix/tag into the workload manifest, applies it, and waits for rollouts. After the first successful deployment, apply the ingress with `kubectl apply -f k8s/20-ingress.yaml`. Set `VITE_BACKEND_URL` to the API host and configure `ALLOWED_ORIGINS` with the patient and staff portal HTTPS origins.

The backend runs one replica because the current Socket.IO setup has no cross-pod adapter; the deployment uses a recreate strategy to avoid two active signaling instances during an update. The API readiness probe waits for MongoDB connectivity. The pipeline uses the Dockerfiles and lockfiles in this repository. Local `.env` files and `node_modules` are excluded from Docker build contexts.

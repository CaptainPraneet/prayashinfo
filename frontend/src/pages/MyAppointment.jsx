import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import { 
  Calendar, 
  FileText, 
  Activity, 
  Receipt, 
  FlaskConical, 
  Video, 
  Star, 
  Download, 
  Clock, 
  Upload, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react'
import { jsPDF } from 'jspdf'
import VideoConsultationModal from '../components/VideoConsultationModal'

const MyAppointments = () => {
  const { 
    backendUrl, 
    token, 
    getDoctorsData, 
    userData, 
    loadUserProfileData,
    prescriptions, 
    getPrescriptions,
    labReports, 
    getLabReports, 
    uploadLabReport,
    invoices, 
    getInvoices,
    submitFeedback,
    rescheduleAppointment
  } = useContext(AppContext)

  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('appointments') // 'appointments', 'prescriptions', 'history', 'invoices', 'labs'
  const [appointments, setAppointments] = useState([])
  const [videoCallModal, setVideoCallModal] = useState({ open: false, roomId: '' })

  // Feedback Modal State
  const [feedbackModal, setFeedbackModal] = useState({ open: false, appointment: null, rating: 5, comment: '' })

  // Reschedule Modal State
  const [rescheduleModal, setRescheduleModal] = useState({ open: false, appointment: null, newDate: '', newTime: '11:00 AM' })

  // Upload Lab Report State
  const [uploadModal, setUploadModal] = useState(false)
  const [uploadData, setUploadData] = useState({ testName: '', category: 'Biochemistry', notes: '', file: null })
  const [uploading, setUploading] = useState(false)

  const months = [" ", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const slotDateFormat = (slotDate) => {
    if (!slotDate) return ''
    const parts = slotDate.split('_')
    if (parts.length < 3) return slotDate
    return `${parts[0]} ${months[Number(parts[1])]} ${parts[2]}`
  }

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } })
      if (data.success) {
        setAppointments(data.appointments)
      }
    } catch (error) {
      console.error(error)
      toast.error(error.message)
    }
  }

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + '/api/user/cancel-appointment',
        { appointmentId },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        getUserAppointments()
        getDoctorsData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error(error.message)
    }
  }

  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_Tynzj09Y0sYiFU',
      amount: order.amount,
      currency: order.currency,
      name: 'PrayashCare',
      description: "Consultation Fee Payment",
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        try {
          const { data } = await axios.post(
            backendUrl + "/api/user/verifyRazorpay",
            response,
            { headers: { token } }
          )
          if (data.success) {
            toast.success("Payment Successful! Invoice generated.")
            getUserAppointments()
            getInvoices()
          } else {
            toast.error(data.message)
          }
        } catch (error) {
          console.error(error)
          toast.error(error.message)
        }
      }
    }
    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  const appointmentRazorpay = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + '/api/user/payment-razorpay',
        { appointmentId },
        { headers: { token } }
      )
      if (data.success) {
        initPay(data.order)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error(error.message)
    }
  }

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault()
    if (!feedbackModal.appointment) return

    const success = await submitFeedback(
      feedbackModal.appointment._id,
      feedbackModal.appointment.docId,
      feedbackModal.rating,
      feedbackModal.comment
    )
    if (success) {
      setFeedbackModal({ open: false, appointment: null, rating: 5, comment: '' })
      getUserAppointments()
    }
  }

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault()
    if (!rescheduleModal.appointment) return

    const success = await rescheduleAppointment(
      rescheduleModal.appointment._id,
      rescheduleModal.newDate,
      rescheduleModal.newTime
    )
    if (success) {
      setRescheduleModal({ open: false, appointment: null, newDate: '', newTime: '11:00 AM' })
      getUserAppointments()
    }
  }

  const handleUploadReport = async (e) => {
    e.preventDefault()
    if (!uploadData.testName) return

    const fd = new FormData()
    fd.append('testName', uploadData.testName)
    fd.append('category', uploadData.category)
    fd.append('notes', uploadData.notes)
    if (uploadData.file) {
      fd.append('reportFile', uploadData.file)
    }

    setUploading(true)
    const success = await uploadLabReport(fd)
    setUploading(false)

    if (success) {
      setUploadModal(false)
      setUploadData({ testName: '', category: 'Biochemistry', notes: '', file: null })
    }
  }

  // PDF Generator for Digital Prescriptions
  const downloadPrescriptionPDF = (rx) => {
    const doc = new jsPDF()
    doc.setFontSize(22)
    doc.setTextColor(37, 99, 235)
    doc.text("PRAYASHCARE", 20, 20)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text("Digital Prescription & Treatment Plan", 20, 28)
    doc.text("Accredited Multispecialty Medical Center", 20, 34)

    doc.setDrawColor(200)
    doc.line(20, 38, 190, 38)

    doc.setFontSize(11)
    doc.setTextColor(40)
    doc.text(`Doctor: ${rx.doctorName} (${rx.doctorSpeciality || 'Consultant'})`, 20, 48)
    doc.text(`Date: ${new Date(rx.date).toLocaleDateString()}`, 140, 48)
    doc.text(`Patient Name: ${rx.patientName}`, 20, 56)
    doc.text(`Diagnosis: ${rx.diagnosis}`, 20, 64)

    if (rx.vitals?.bloodPressure) {
      doc.text(`Vitals: BP: ${rx.vitals.bloodPressure} | Pulse: ${rx.vitals.pulse} bpm | Temp: ${rx.vitals.temperature}°F`, 20, 72)
    }

    doc.line(20, 78, 190, 78)
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text("Rx Prescribed Medications:", 20, 88)

    doc.setFontSize(10)
    doc.text("Medicine", 22, 98)
    doc.text("Dosage", 90, 98)
    doc.text("Frequency", 120, 98)
    doc.text("Duration", 160, 98)
    doc.setFont(undefined, 'normal')

    let y = 108
    rx.medicines.forEach((med) => {
      doc.text(med.name, 22, y)
      doc.text(med.dosage, 90, y)
      doc.text(med.frequency, 120, y)
      doc.text(med.duration, 160, y)
      y += 8
    })

    doc.line(20, y + 4, 190, y + 4)
    y += 14
    doc.setFont(undefined, 'bold')
    doc.text("Advice & Instructions:", 20, y)
    doc.setFont(undefined, 'normal')
    doc.text(rx.advice || 'Follow medication schedule strictly.', 20, y + 6)

    if (rx.followUpDate) {
      doc.text(`Follow-up: ${rx.followUpDate}`, 20, y + 14)
    }

    doc.setFontSize(9)
    doc.setTextColor(120)
    doc.text("This is an authenticated computer-generated digital prescription.", 20, y + 30)

    doc.save(`Prescription_${rx.patientName.replace(/\s+/g, '_')}_${new Date(rx.date).toLocaleDateString()}.pdf`)
  }

  // PDF Generator for Invoices
  const downloadInvoicePDF = (inv) => {
    const doc = new jsPDF()
    doc.setFontSize(22)
    doc.setTextColor(37, 99, 235)
    doc.text("PRAYASHCARE", 20, 20)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text("Official Tax Invoice & Payment Receipt", 20, 28)
    doc.text("GSTIN: 29AAAAA0000A1Z5 | HSN/SAC: 999312", 20, 34)

    doc.setDrawColor(200)
    doc.line(20, 38, 190, 38)

    doc.setFontSize(11)
    doc.setTextColor(40)
    doc.text(`Invoice No: ${inv.invoiceNumber}`, 20, 48)
    doc.text(`Date: ${new Date(inv.date || Date.now()).toLocaleDateString()}`, 140, 48)
    doc.text(`Patient: ${inv.patientName}`, 20, 56)
    doc.text(`Doctor: ${inv.doctorName || 'General Consultation'}`, 140, 56)
    doc.text(`Payment Method: ${inv.paymentMethod} (PAID)`, 20, 64)

    doc.line(20, 70, 190, 70)
    doc.setFontSize(10)
    doc.setFont(undefined, 'bold')
    doc.text("Item Description", 22, 78)
    doc.text("Qty", 120, 78)
    doc.text("Unit Price", 140, 78)
    doc.text("Total", 170, 78)
    doc.setFont(undefined, 'normal')

    let y = 88
    inv.items.forEach((item) => {
      doc.text(item.description, 22, y)
      doc.text(String(item.quantity), 122, y)
      doc.text(`₹${item.unitPrice}`, 142, y)
      doc.text(`₹${item.quantity * item.unitPrice}`, 172, y)
      y += 8
    })

    doc.line(20, y + 4, 190, y + 4)
    y += 12
    doc.text(`Subtotal: ₹${inv.subtotal}`, 140, y)
    y += 8
    doc.text(`GST (18%): ₹${inv.gstAmount}`, 140, y)
    y += 8
    doc.setFont(undefined, 'bold')
    doc.text(`Grand Total: ₹${inv.grandTotal}`, 140, y)

    doc.setFontSize(9)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(120)
    doc.text("Thank you for choosing PrayashCare. Computer-generated tax invoice.", 20, y + 25)

    doc.save(`${inv.invoiceNumber}.pdf`)
  }

  useEffect(() => {
    if (token) {
      getUserAppointments()
      getPrescriptions()
      getLabReports()
      getInvoices()
    }
  }, [token])

  return (
    <div className='py-8 max-w-6xl mx-auto'>
      <div className='flex flex-wrap items-center justify-between gap-4 pb-4 border-b mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Patient Health Portal</h1>
          <p className='text-xs text-gray-500'>Manage your appointments, prescriptions, diagnostic reports, and medical history.</p>
        </div>

        {/* Navigation Tabs */}
        <div className='flex flex-wrap items-center gap-1.5 bg-gray-100 p-1.5 rounded-2xl text-xs font-semibold'>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition ${activeTab === 'appointments' ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <Calendar className='w-4 h-4' /> Appointments
          </button>
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition ${activeTab === 'prescriptions' ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <FileText className='w-4 h-4' /> Prescriptions
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition ${activeTab === 'history' ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <Activity className='w-4 h-4' /> Medical History
          </button>
          <button
            onClick={() => setActiveTab('labs')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition ${activeTab === 'labs' ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <FlaskConical className='w-4 h-4' /> Lab Reports
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition ${activeTab === 'invoices' ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <Receipt className='w-4 h-4' /> Billing & Invoices
          </button>
        </div>
      </div>

      {/* TAB 1: APPOINTMENTS */}
      {activeTab === 'appointments' && (
        <div className='space-y-4'>
          {appointments.length === 0 ? (
            <div className='bg-white rounded-2xl border border-gray-200 p-12 text-center'>
              <Calendar className='w-12 h-12 text-gray-300 mx-auto mb-3' />
              <p className='text-gray-600 font-medium'>No appointments booked yet.</p>
              <button
                onClick={() => navigate('/doctors')}
                className='mt-4 bg-primary text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition shadow-sm'
              >
                Find Doctors & Book Now
              </button>
            </div>
          ) : (
            appointments.map((item) => (
              <div
                key={item._id}
                className='bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between'
              >
                <div className='flex items-start gap-4'>
                  <img
                    className='w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover bg-gray-50 border flex-shrink-0'
                    src={item.docData?.image}
                    alt=""
                  />
                  <div className='space-y-1 text-xs text-gray-600'>
                    <div className='flex items-center gap-2'>
                      <h3 className='text-base font-bold text-gray-900'>{item.docData?.name}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.type === 'telemedicine' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {item.type === 'telemedicine' ? 'Telemedicine' : 'In-Person'}
                      </span>
                    </div>

                    <p className='font-medium text-gray-700'>{item.docData?.speciality}</p>
                    <p className='text-gray-500'>
                      {item.branchName || 'Main Hospital'} • {item.docData?.address?.line1}
                    </p>
                    <p className='font-semibold text-gray-800 flex items-center gap-1.5 pt-1'>
                      <Clock className='w-3.5 h-3.5 text-primary' />
                      {slotDateFormat(item.slotDate)} at {item.slotTime} (Token #{item.queueToken || 1})
                    </p>
                    <p className='text-[11px] text-gray-400'>Reason: {item.symptoms || 'General Checkup'}</p>
                  </div>
                </div>

                {/* Status and Action Buttons */}
                <div className='flex flex-wrap sm:flex-col gap-2 w-full sm:w-auto sm:min-w-44'>
                  {/* Status Badge */}
                  <span className={`text-center py-1.5 px-3 rounded-xl text-xs font-bold border ${
                    item.cancelled ? 'bg-red-50 text-red-600 border-red-200' :
                    item.isCompleted ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {item.cancelled ? 'Cancelled' : item.isCompleted ? 'Completed' : 'Confirmed'}
                  </span>

                  {/* Telemedicine Video Call Join Button */}
                  {item.type === 'telemedicine' && !item.cancelled && (
                    <button
                      onClick={() => setVideoCallModal({ open: true, roomId: item.videoRoomId || `appointy-${item._id}` })}
                      className='inline-flex items-center justify-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-xl text-xs font-bold transition shadow-sm'
                    >
                      <Video className='w-3.5 h-3.5' /> Join Video Call
                    </button>
                  )}

                  {/* Online Payment using Razorpay */}
                  {!item.cancelled && !item.payment && !item.isCompleted && (
                    <button
                      onClick={() => appointmentRazorpay(item._id)}
                      className='bg-primary hover:bg-primary/90 text-white py-2 px-3 rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5'
                    >
                      <span>Pay ₹{item.amount} Online</span>
                    </button>
                  )}

                  {/* Reschedule Button */}
                  {!item.cancelled && !item.isCompleted && (
                    <button
                      onClick={() => setRescheduleModal({ open: true, appointment: item, newDate: item.slotDate, newTime: item.slotTime })}
                      className='bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 px-3 rounded-xl text-xs font-semibold transition'
                    >
                      Reschedule
                    </button>
                  )}

                  {/* Cancel Button */}
                  {!item.cancelled && !item.isCompleted && (
                    <button
                      onClick={() => cancelAppointment(item._id)}
                      className='text-red-500 hover:bg-red-50 py-1.5 px-3 rounded-xl text-xs font-semibold transition'
                    >
                      Cancel Visit
                    </button>
                  )}

                  {/* Rate / Feedback after completion */}
                  {item.isCompleted && !item.hasFeedback && (
                    <button
                      onClick={() => setFeedbackModal({ open: true, appointment: item, rating: 5, comment: '' })}
                      className='inline-flex items-center justify-center gap-1 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 py-1.5 px-3 rounded-xl text-xs font-bold transition'
                    >
                      <Star className='w-3.5 h-3.5 fill-amber-400 text-amber-400' /> Rate Doctor
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: PRESCRIPTIONS */}
      {activeTab === 'prescriptions' && (
        <div className='space-y-4'>
          {prescriptions.length === 0 ? (
            <div className='bg-white rounded-2xl border border-gray-200 p-12 text-center'>
              <FileText className='w-12 h-12 text-gray-300 mx-auto mb-3' />
              <p className='text-gray-600 font-medium'>No digital prescriptions on record.</p>
              <p className='text-xs text-gray-400 mt-1'>Prescriptions issued by your doctor will appear here for instant download.</p>
            </div>
          ) : (
            prescriptions.map((rx) => (
              <div key={rx._id} className='bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4'>
                <div className='flex flex-wrap items-center justify-between gap-3 pb-3 border-b'>
                  <div>
                    <h3 className='font-bold text-gray-900 text-base'>Dr. {rx.doctorName}</h3>
                    <p className='text-xs text-gray-500'>{rx.doctorSpeciality} • {new Date(rx.date).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => downloadPrescriptionPDF(rx)}
                    className='inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm'
                  >
                    <Download className='w-4 h-4' /> Download Prescription PDF
                  </button>
                </div>

                <div className='text-xs space-y-2 text-gray-700'>
                  <p><strong>Clinical Diagnosis:</strong> {rx.diagnosis}</p>
                  {rx.vitals?.bloodPressure && (
                    <p className='text-gray-500'>
                      Recorded Vitals: BP: {rx.vitals.bloodPressure} | Pulse: {rx.vitals.pulse} bpm | Temp: {rx.vitals.temperature}°F
                    </p>
                  )}
                </div>

                {/* Medicines List */}
                <div className='bg-gray-50 rounded-xl p-3 border border-gray-100 text-xs'>
                  <h4 className='font-bold uppercase text-gray-500 mb-2'>Prescribed Medicines:</h4>
                  <div className='space-y-1.5'>
                    {rx.medicines.map((m, idx) => (
                      <div key={idx} className='flex justify-between items-center py-1 border-b border-gray-200/50 last:border-0'>
                        <span className='font-semibold text-gray-800'>{m.name} ({m.dosage})</span>
                        <span className='text-gray-500'>{m.frequency} • {m.duration} • {m.instructions}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {rx.advice && (
                  <p className='text-xs text-gray-600 bg-blue-50 p-2.5 rounded-xl border border-blue-100'>
                    <strong>Doctor's Advice:</strong> {rx.advice}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: MEDICAL HISTORY */}
      {activeTab === 'history' && (
        <div className='bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6'>
          <div className='flex items-center justify-between pb-4 border-b'>
            <div>
              <h2 className='text-lg font-bold text-gray-900'>Patient Electronic Medical Record (EMR)</h2>
              <p className='text-xs text-gray-500'>Personal medical history, known allergies, chronic conditions, and past surgeries.</p>
            </div>
            <button
              onClick={() => navigate('/my-profile')}
              className='text-xs text-primary font-bold hover:underline'
            >
              Update Medical History in Profile
            </button>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs'>
            <div className='bg-red-50/50 border border-red-100 rounded-2xl p-4 space-y-2'>
              <h3 className='font-bold text-red-900 uppercase tracking-wider flex items-center gap-1.5'>
                <AlertTriangle className='w-4 h-4 text-red-600' /> Known Drug & Food Allergies
              </h3>
              <p className='text-gray-700 leading-relaxed'>
                {userData?.medicalHistory?.allergies?.length > 0
                  ? userData.medicalHistory.allergies.join(', ')
                  : 'No allergies recorded.'}
              </p>
            </div>

            <div className='bg-blue-50/50 border border-blue-100 rounded-2xl p-4 space-y-2'>
              <h3 className='font-bold text-blue-900 uppercase tracking-wider'>Chronic Health Conditions</h3>
              <p className='text-gray-700 leading-relaxed'>
                {userData?.medicalHistory?.chronicConditions?.length > 0
                  ? userData.medicalHistory.chronicConditions.join(', ')
                  : 'No chronic conditions reported.'}
              </p>
            </div>

            <div className='bg-purple-50/50 border border-purple-100 rounded-2xl p-4 space-y-2'>
              <h3 className='font-bold text-purple-900 uppercase tracking-wider'>Past Surgeries & Procedures</h3>
              <p className='text-gray-700 leading-relaxed'>
                {userData?.medicalHistory?.pastSurgeries?.length > 0
                  ? userData.medicalHistory.pastSurgeries.join(', ')
                  : 'None on record.'}
              </p>
            </div>

            <div className='bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 space-y-2'>
              <h3 className='font-bold text-emerald-900 uppercase tracking-wider'>Health Insurance Policy</h3>
              <p className='text-gray-700 leading-relaxed'>
                {userData?.insurance?.provider 
                  ? `${userData.insurance.provider} (Policy #${userData.insurance.policyNumber})` 
                  : 'No health insurance linked.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LAB REPORTS */}
      {activeTab === 'labs' && (
        <div className='space-y-4'>
          <div className='flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-200 shadow-sm'>
            <div>
              <h3 className='font-bold text-gray-900 text-sm'>Diagnostic Lab Reports</h3>
              <p className='text-xs text-gray-500'>Access certified laboratory tests or upload past diagnostic files.</p>
            </div>
            <button
              onClick={() => setUploadModal(true)}
              className='inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm'
            >
              <Upload className='w-4 h-4' /> Upload External Lab Report
            </button>
          </div>

          {labReports.length === 0 ? (
            <div className='bg-white rounded-2xl border border-gray-200 p-12 text-center'>
              <FlaskConical className='w-12 h-12 text-gray-300 mx-auto mb-3' />
              <p className='text-gray-600 font-medium'>No laboratory reports available.</p>
            </div>
          ) : (
            labReports.map((report) => (
              <div key={report._id} className='bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4'>
                <div className='flex flex-wrap items-center justify-between gap-3 pb-3 border-b'>
                  <div>
                    <h3 className='font-bold text-gray-900 text-base'>{report.testName}</h3>
                    <p className='text-xs text-gray-500'>
                      Category: {report.category} • Date: {new Date(report.requestedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    report.sampleStatus === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {report.sampleStatus}
                  </span>
                </div>

                {/* Results Table if any */}
                {report.results && report.results.length > 0 && (
                  <div className='overflow-x-auto'>
                    <table className='min-w-full divide-y divide-gray-200 text-xs text-left'>
                      <thead className='bg-gray-50 text-gray-500 font-semibold'>
                        <tr>
                          <th className='py-2 px-3'>Test Parameter</th>
                          <th className='py-2 px-3'>Observed Value</th>
                          <th className='py-2 px-3'>Normal Biological Range</th>
                          <th className='py-2 px-3'>Status</th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-gray-100'>
                        {report.results.map((res, i) => (
                          <tr key={i}>
                            <td className='py-2 px-3 font-medium text-gray-800'>{res.parameter}</td>
                            <td className='py-2 px-3 font-bold'>{res.value} {res.unit}</td>
                            <td className='py-2 px-3 text-gray-500'>{res.normalRange}</td>
                            <td className='py-2 px-3'>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                res.status === 'High' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                              }`}>
                                {res.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {report.notes && (
                  <p className='text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100'>
                    <strong>Technician Remarks:</strong> {report.notes}
                  </p>
                )}

                {report.fileUrl && (
                  <div className='pt-2'>
                    <a
                      href={report.fileUrl}
                      target='_blank'
                      rel='noreferrer'
                      className='inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline'
                    >
                      <Download className='w-4 h-4' /> View / Download Uploaded Document
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 5: BILLING & INVOICES */}
      {activeTab === 'invoices' && (
        <div className='space-y-4'>
          {invoices.length === 0 ? (
            <div className='bg-white rounded-2xl border border-gray-200 p-12 text-center'>
              <Receipt className='w-12 h-12 text-gray-300 mx-auto mb-3' />
              <p className='text-gray-600 font-medium'>No payment invoices recorded.</p>
            </div>
          ) : (
            invoices.map((inv) => (
              <div key={inv._id} className='bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex items-center justify-between'>
                <div className='space-y-1 text-xs'>
                  <div className='flex items-center gap-2'>
                    <p className='font-bold text-gray-900 text-sm font-mono'>{inv.invoiceNumber}</p>
                    <span className='bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold'>
                      PAID
                    </span>
                  </div>
                  <p className='text-gray-500'>Attending: {inv.doctorName || 'General Consultation'} • {new Date(inv.date).toLocaleDateString()}</p>
                  <p className='text-gray-400'>Payment Method: {inv.paymentMethod} {inv.razorpayPaymentId ? `(${inv.razorpayPaymentId})` : ''}</p>
                </div>

                <div className='text-right space-y-1'>
                  <p className='text-lg font-extrabold text-primary'>₹{inv.grandTotal}</p>
                  <button
                    onClick={() => downloadInvoicePDF(inv)}
                    className='inline-flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-xl font-bold transition'
                  >
                    <Download className='w-3.5 h-3.5' /> PDF Invoice
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModal.open && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-100'>
            <h3 className='font-bold text-gray-900 mb-3'>Reschedule Appointment</h3>
            <form onSubmit={handleRescheduleSubmit} className='space-y-3 text-xs'>
              <div>
                <label className='font-semibold text-gray-700 uppercase'>New Date (DD_MM_YYYY)</label>
                <input
                  type='text'
                  value={rescheduleModal.newDate}
                  onChange={(e) => setRescheduleModal({ ...rescheduleModal, newDate: e.target.value })}
                  placeholder='e.g. 15_11_2026'
                  required
                  className='w-full border rounded-lg p-2 text-sm mt-1'
                />
              </div>
              <div>
                <label className='font-semibold text-gray-700 uppercase'>New Time Slot</label>
                <select
                  value={rescheduleModal.newTime}
                  onChange={(e) => setRescheduleModal({ ...rescheduleModal, newTime: e.target.value })}
                  className='w-full border rounded-lg p-2 text-sm mt-1 bg-white'
                >
                  <option value='10:00 AM'>10:00 AM</option>
                  <option value='11:00 AM'>11:00 AM</option>
                  <option value='12:00 PM'>12:00 PM</option>
                  <option value='02:30 PM'>02:30 PM</option>
                  <option value='04:00 PM'>04:00 PM</option>
                </select>
              </div>

              <div className='flex justify-end gap-2 pt-3 border-t'>
                <button
                  type='button'
                  onClick={() => setRescheduleModal({ open: false, appointment: null, newDate: '', newTime: '' })}
                  className='px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='px-4 py-1.5 bg-primary text-white font-bold rounded-lg hover:bg-primary/90'
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doctor Rating & Feedback Modal */}
      {feedbackModal.open && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-100'>
            <h3 className='font-bold text-gray-900 mb-1'>Rate Dr. {feedbackModal.appointment?.docData?.name}</h3>
            <p className='text-xs text-gray-500 mb-3'>Share your consultation experience to help other patients.</p>

            <form onSubmit={handleFeedbackSubmit} className='space-y-3 text-xs'>
              <div>
                <label className='font-semibold text-gray-700 uppercase'>Rating (1 to 5 Stars)</label>
                <div className='flex gap-2 my-2'>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type='button'
                      onClick={() => setFeedbackModal({ ...feedbackModal, rating: star })}
                      className='p-1'
                    >
                      <Star className={`w-6 h-6 ${star <= feedbackModal.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className='font-semibold text-gray-700 uppercase'>Review Comments</label>
                <textarea
                  rows={3}
                  value={feedbackModal.comment}
                  onChange={(e) => setFeedbackModal({ ...feedbackModal, comment: e.target.value })}
                  placeholder='Very attentive doctor, answered all my questions...'
                  className='w-full border rounded-lg p-2 text-sm mt-1'
                />
              </div>

              <div className='flex justify-end gap-2 pt-2 border-t'>
                <button
                  type='button'
                  onClick={() => setFeedbackModal({ open: false, appointment: null, rating: 5, comment: '' })}
                  className='px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='px-4 py-1.5 bg-primary text-white font-bold rounded-lg hover:bg-primary/90'
                >
                  Submit Rating
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Lab Report Modal */}
      {uploadModal && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100'>
            <h3 className='font-bold text-gray-900 mb-1 flex items-center gap-1.5'>
              <Upload className='w-4 h-4 text-primary' /> Upload External Lab Report
            </h3>
            <p className='text-xs text-gray-500 mb-3'>Keep your diagnostic history centralized in your medical records.</p>

            <form onSubmit={handleUploadReport} className='space-y-3 text-xs'>
              <div>
                <label className='font-semibold text-gray-700 uppercase'>Test Name *</label>
                <input
                  type='text'
                  value={uploadData.testName}
                  onChange={(e) => setUploadData({ ...uploadData, testName: e.target.value })}
                  placeholder='e.g. Thyroid Profile (T3, T4, TSH)'
                  required
                  className='w-full border rounded-lg p-2 text-sm mt-1'
                />
              </div>

              <div>
                <label className='font-semibold text-gray-700 uppercase'>Category</label>
                <input
                  type='text'
                  value={uploadData.category}
                  onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                  placeholder='Biochemistry, Pathology, etc.'
                  className='w-full border rounded-lg p-2 text-sm mt-1'
                />
              </div>

              <div>
                <label className='font-semibold text-gray-700 uppercase'>Notes / Diagnosis</label>
                <textarea
                  rows={2}
                  value={uploadData.notes}
                  onChange={(e) => setUploadData({ ...uploadData, notes: e.target.value })}
                  placeholder='Doctor comments or laboratory notes...'
                  className='w-full border rounded-lg p-2 text-sm mt-1'
                />
              </div>

              <div>
                <label className='font-semibold text-gray-700 uppercase'>Attach Document (PDF or Image)</label>
                <input
                  type='file'
                  accept='image/*,application/pdf'
                  onChange={(e) => setUploadData({ ...uploadData, file: e.target.files[0] })}
                  className='w-full border rounded-lg p-2 text-sm mt-1 bg-white'
                />
              </div>

              <div className='flex justify-end gap-2 pt-3 border-t'>
                <button
                  type='button'
                  onClick={() => setUploadModal(false)}
                  className='px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={uploading}
                  className='px-4 py-1.5 bg-primary text-white font-bold rounded-lg hover:bg-primary/90'
                >
                  {uploading ? 'Uploading...' : 'Save Lab Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Call Modal */}
      {videoCallModal.open && (
        <VideoConsultationModal
          roomId={videoCallModal.roomId}
          userName={userData?.name || "Patient"}
          role="Patient"
          onClose={() => setVideoCallModal({ open: false, roomId: '' })}
        />
      )}
    </div>
  )
}

export default MyAppointments

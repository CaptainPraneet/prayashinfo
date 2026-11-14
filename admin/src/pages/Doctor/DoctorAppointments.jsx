import React, { useContext, useEffect, useState, useRef } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import { 
  Stethoscope, 
  Video, 
  Mic, 
  MicOff, 
  BrainCircuit, 
  Plus, 
  Trash2, 
  Calendar, 
  FileText, 
  AlertCircle,
  Activity,
  CheckCircle,
  Clock
} from 'lucide-react'
import VideoConsultationModal from '../../components/VideoConsultationModal'

const DoctorAppointments = () => {
  const { 
    dToken, 
    appointments, 
    getAppointments, 
    cancelAppointment, 
    completeAppointment,
    createDigitalPrescription,
    formatAINotes,
    getMedicines,
    medicinesCatalog,
    getPatientMedicalHistory,
    scheduleFollowUp
  } = useContext(DoctorContext)

  const { slotDateFormat, calculateAge, currency } = useContext(AppContext)

  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedConsultation, setSelectedConsultation] = useState(null)
  const [patientHistory, setPatientHistory] = useState(null)
  const [videoModalOpen, setVideoModalOpen] = useState(false)

  // Consultation Form State
  const [diagnosis, setDiagnosis] = useState('')
  const [clinicalNotes, setClinicalNotes] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [vitals, setVitals] = useState({
    bloodPressure: '120/80',
    pulse: 72,
    temperature: 98.4,
    spo2: 99,
    weight: 65
  })
  const [medicines, setMedicines] = useState([
    { name: 'Paracetamol 650mg', dosage: '1 Tablet', frequency: '1-0-1', duration: '3 days', instructions: 'After food' }
  ])
  const [advice, setAdvice] = useState('Adequate rest, hydrate with warm water, avoid cold weather.')
  const [followUpDate, setFollowUpDate] = useState('')
  const [medicineSearch, setMedicineSearch] = useState('')
  const [isAiFormatting, setIsAiFormatting] = useState(false)
  const [submittingPrescription, setSubmittingPrescription] = useState(false)

  const recognitionRef = useRef(null)

  useEffect(() => {
    if (dToken) {
      getAppointments(activeFilter === 'all' ? '' : activeFilter)
      getMedicines()
    }
  }, [dToken, activeFilter])

  // Web Speech API Voice-to-Text Clinical Dictation
  const toggleVoiceRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop()
      setIsRecording(false)
    } else {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognition) {
        alert("Web Speech API is not supported in this browser. Please use Chrome/Edge or type notes.")
        return
      }

      const recognition = new SpeechRecognition()
      recognitionRef.current = recognition
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onstart = () => setIsRecording(true)
      recognition.onend = () => setIsRecording(false)
      recognition.onerror = () => setIsRecording(false)

      recognition.onresult = (event) => {
        let transcript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        setClinicalNotes((prev) => (prev ? prev + ' ' + transcript : transcript))
      }

      recognition.start()
    }
  }

  const handleOpenConsultation = async (appointment) => {
    setSelectedConsultation(appointment)
    setDiagnosis(appointment.diagnosis || '')
    setClinicalNotes(appointment.treatmentNotes || appointment.symptoms || '')
    const historyData = await getPatientMedicalHistory(appointment.userId)
    setPatientHistory(historyData)
  }

  const handleAddMedicine = (medItem) => {
    setMedicines([...medicines, {
      name: medItem.name,
      dosage: '1 Tablet',
      frequency: '1-0-1 (Twice daily)',
      duration: '5 days',
      instructions: 'After meals'
    }])
    setMedicineSearch('')
  }

  const handleRemoveMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index))
  }

  const handleUpdateMedicine = (index, field, value) => {
    const updated = [...medicines]
    updated[index][field] = value
    setMedicines(updated)
  }

  // AI Formatting of Clinical Notes
  const handleAIFormat = async () => {
    if (!clinicalNotes) {
      alert("Please enter or dictate clinical notes first.")
      return
    }
    setIsAiFormatting(true)
    const formatted = await formatAINotes(clinicalNotes)
    setIsAiFormatting(false)

    if (formatted) {
      if (formatted.diagnosis) setDiagnosis(formatted.diagnosis)
      if (formatted.medicines && formatted.medicines.length > 0) setMedicines(formatted.medicines)
      if (formatted.advice) setAdvice(formatted.advice)
      if (formatted.followUpDate) setFollowUpDate(formatted.followUpDate)
    }
  }

  // Submit Prescription and Complete Appointment
  const handleCompletePrescription = async (e) => {
    e.preventDefault()
    if (!selectedConsultation) return

    setSubmittingPrescription(true)
    const res = await createDigitalPrescription({
      appointmentId: selectedConsultation._id,
      diagnosis: diagnosis || 'General Clinical Evaluation',
      symptoms: selectedConsultation.symptoms,
      vitals,
      medicines,
      advice,
      followUpDate
    })
    setSubmittingPrescription(false)

    if (res) {
      setSelectedConsultation(null)
    }
  }

  return (
    <div className='p-6 w-full max-w-7xl mx-auto'>
      <div className='flex flex-wrap items-center justify-between gap-4 mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Doctor Appointments & Consultations</h1>
          <p className='text-sm text-gray-500'>Conduct patient visits, record vitals, dictate notes, issue prescriptions & video calls.</p>
        </div>

        {/* Filters */}
        <div className='flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl text-xs font-semibold'>
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition ${activeFilter === 'all' ? 'bg-white text-primary shadow-sm' : 'text-gray-600'}`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter('today')}
            className={`px-3 py-1.5 rounded-lg transition ${activeFilter === 'today' ? 'bg-white text-primary shadow-sm' : 'text-gray-600'}`}
          >
            Today's Visits
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-3 py-1.5 rounded-lg transition ${activeFilter === 'completed' ? 'bg-white text-primary shadow-sm' : 'text-gray-600'}`}
          >
            Completed
          </button>
          <button
            onClick={() => setActiveFilter('cancelled')}
            className={`px-3 py-1.5 rounded-lg transition ${activeFilter === 'cancelled' ? 'bg-white text-primary shadow-sm' : 'text-gray-600'}`}
          >
            Cancelled
          </button>
        </div>
      </div>

      {/* Appointments Table */}
      <div className='bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm'>
        <table className='min-w-full divide-y divide-gray-200 text-left text-sm'>
          <thead className='bg-gray-50 text-gray-500 font-semibold'>
            <tr>
              <th className='py-3.5 px-4'>Patient Name</th>
              <th className='py-3.5 px-4'>Date & Time</th>
              <th className='py-3.5 px-4'>Type</th>
              <th className='py-3.5 px-4'>Payment</th>
              <th className='py-3.5 px-4'>Chief Complaint</th>
              <th className='py-3.5 px-4'>Status</th>
              <th className='py-3.5 px-4 text-right'>Action</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={7} className='py-8 text-center text-gray-400'>
                  No appointments found for selected filter.
                </td>
              </tr>
            ) : (
              appointments.map((item) => (
                <tr key={item._id} className='hover:bg-gray-50 transition'>
                  <td className='py-4 px-4 flex items-center gap-2.5'>
                    <img src={item.userData?.image} className='w-9 h-9 rounded-full object-cover border' alt="" />
                    <div>
                      <p className='font-bold text-gray-900'>{item.userData?.name}</p>
                      <p className='text-xs text-gray-400'>Age: {calculateAge(item.userData?.dob)} • Token #{item.queueToken || 1}</p>
                    </div>
                  </td>
                  <td className='py-4 px-4 text-xs'>
                    <p className='font-semibold text-gray-800'>{slotDateFormat(item.slotDate)}</p>
                    <p className='text-gray-500'>{item.slotTime}</p>
                  </td>
                  <td className='py-4 px-4'>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${item.type === 'telemedicine' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {item.type === 'telemedicine' ? <Video className='w-3 h-3' /> : null}
                      {item.type === 'telemedicine' ? 'Telemedicine' : 'In-Person'}
                    </span>
                  </td>
                  <td className='py-4 px-4'>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.payment ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                      {item.payment ? 'PAID' : 'CASH'}
                    </span>
                  </td>
                  <td className='py-4 px-4 text-xs text-gray-600 max-w-xs truncate'>
                    {item.symptoms || 'General Checkup'}
                  </td>
                  <td className='py-4 px-4'>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      item.cancelled ? 'bg-red-100 text-red-700' :
                      item.isCompleted ? 'bg-emerald-100 text-emerald-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {item.cancelled ? 'Cancelled' : item.isCompleted ? 'Completed' : 'Confirmed'}
                    </span>
                  </td>
                  <td className='py-4 px-4 text-right space-x-2'>
                    {!item.cancelled && !item.isCompleted && (
                      <button
                        onClick={() => handleOpenConsultation(item)}
                        className='inline-flex items-center gap-1 bg-primary text-white hover:bg-primary/90 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm'
                      >
                        <Stethoscope className='w-3.5 h-3.5' /> Consult
                      </button>
                    )}
                    {!item.cancelled && !item.isCompleted && (
                      <button
                        onClick={() => cancelAppointment(item._id)}
                        className='text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1'
                      >
                        Cancel
                      </button>
                    )}
                    {item.isCompleted && (
                      <button
                        onClick={() => handleOpenConsultation(item)}
                        className='text-xs text-primary hover:underline font-semibold'
                      >
                        View Rx
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Full Doctor Consultation & Digital Prescription Modal */}
      {selectedConsultation && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto'>
          <div className='bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-gray-100 my-8 max-h-[90vh] overflow-y-auto'>
            {/* Modal Header */}
            <div className='flex items-center justify-between pb-4 border-b'>
              <div className='flex items-center gap-3'>
                <img
                  src={selectedConsultation.userData?.image}
                  className='w-12 h-12 rounded-full object-cover border'
                  alt=""
                />
                <div>
                  <h2 className='text-lg font-bold text-gray-900'>
                    Consultation: {selectedConsultation.userData?.name}
                  </h2>
                  <p className='text-xs text-gray-500'>
                    Age: {calculateAge(selectedConsultation.userData?.dob)} • Blood: {selectedConsultation.userData?.bloodGroup || 'Not Specified'} • Phone: {selectedConsultation.userData?.phone}
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                {selectedConsultation.type === 'telemedicine' && (
                  <button
                    onClick={() => setVideoModalOpen(true)}
                    className='inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm'
                  >
                    <Video className='w-4 h-4' /> Start Video Call
                  </button>
                )}
                <button
                  onClick={() => setSelectedConsultation(null)}
                  className='text-gray-400 hover:text-gray-600 font-bold text-lg px-2'
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Medical History & Allergies Banner */}
            {patientHistory?.patient?.medicalHistory && (
              <div className='bg-amber-50 border border-amber-200 rounded-xl p-3 my-4 text-xs text-amber-900 flex items-start gap-2'>
                <AlertCircle className='w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5' />
                <div className='space-y-1'>
                  <p><strong>Known Allergies:</strong> {patientHistory.patient.medicalHistory.allergies?.join(', ') || 'None recorded'}</p>
                  <p><strong>Chronic Conditions:</strong> {patientHistory.patient.medicalHistory.chronicConditions?.join(', ') || 'None'}</p>
                  <p><strong>Past Surgeries:</strong> {patientHistory.patient.medicalHistory.pastSurgeries?.join(', ') || 'None'}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleCompletePrescription} className='space-y-5'>
              {/* Vitals Row */}
              <div className='bg-gray-50 p-3.5 rounded-xl border border-gray-200'>
                <h3 className='text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-1'>
                  <Activity className='w-3.5 h-3.5 text-primary' /> Patient Vitals
                </h3>
                <div className='grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs'>
                  <div>
                    <label className='text-gray-500'>BP (mmHg)</label>
                    <input
                      type='text'
                      value={vitals.bloodPressure}
                      onChange={(e) => setVitals({ ...vitals, bloodPressure: e.target.value })}
                      placeholder='120/80'
                      className='w-full border rounded p-1.5 bg-white'
                    />
                  </div>
                  <div>
                    <label className='text-gray-500'>Pulse (bpm)</label>
                    <input
                      type='number'
                      value={vitals.pulse}
                      onChange={(e) => setVitals({ ...vitals, pulse: Number(e.target.value) })}
                      placeholder='72'
                      className='w-full border rounded p-1.5 bg-white'
                    />
                  </div>
                  <div>
                    <label className='text-gray-500'>Temp (°F)</label>
                    <input
                      type='number'
                      step='0.1'
                      value={vitals.temperature}
                      onChange={(e) => setVitals({ ...vitals, temperature: Number(e.target.value) })}
                      placeholder='98.6'
                      className='w-full border rounded p-1.5 bg-white'
                    />
                  </div>
                  <div>
                    <label className='text-gray-500'>SpO2 (%)</label>
                    <input
                      type='number'
                      value={vitals.spo2}
                      onChange={(e) => setVitals({ ...vitals, spo2: Number(e.target.value) })}
                      placeholder='99'
                      className='w-full border rounded p-1.5 bg-white'
                    />
                  </div>
                  <div>
                    <label className='text-gray-500'>Weight (kg)</label>
                    <input
                      type='number'
                      value={vitals.weight}
                      onChange={(e) => setVitals({ ...vitals, weight: Number(e.target.value) })}
                      placeholder='65'
                      className='w-full border rounded p-1.5 bg-white'
                    />
                  </div>
                </div>
              </div>

              {/* Diagnosis and Voice Notes */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Clinical Diagnosis *</label>
                  <input
                    type='text'
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder='e.g. Acute Upper Respiratory Tract Infection'
                    required
                    className='w-full border border-gray-300 rounded-lg p-2 text-sm'
                  />
                </div>

                <div>
                  <div className='flex justify-between items-center mb-1'>
                    <label className='text-xs font-semibold text-gray-700 uppercase'>Clinical Notes & Voice Dictation</label>
                    <div className='flex items-center gap-2'>
                      <button
                        type='button'
                        onClick={toggleVoiceRecording}
                        className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded font-bold transition ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        {isRecording ? <MicOff className='w-3 h-3' /> : <Mic className='w-3 h-3' />}
                        {isRecording ? 'Listening...' : 'Dictate'}
                      </button>
                      <button
                        type='button'
                        onClick={handleAIFormat}
                        disabled={isAiFormatting}
                        className='inline-flex items-center gap-1 text-[11px] bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-2 py-0.5 rounded font-bold'
                        title="AI structuring of dictated clinical notes into prescription"
                      >
                        <BrainCircuit className='w-3 h-3' />
                        {isAiFormatting ? 'Formatting...' : 'AI Rx Format'}
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    placeholder='Doctor clinical examination notes, symptoms, treatment plan...'
                    className='w-full border border-gray-300 rounded-lg p-2 text-sm'
                  />
                </div>
              </div>

              {/* Medicines / Prescription Table */}
              <div>
                <div className='flex justify-between items-center mb-2'>
                  <h3 className='text-xs font-bold text-gray-700 uppercase flex items-center gap-1'>
                    <FileText className='w-3.5 h-3.5 text-primary' /> Prescribed Medicines
                  </h3>

                  {/* Medicine Search Autocomplete */}
                  <div className='relative'>
                    <input
                      type='text'
                      placeholder='Search pharmacy medicine...'
                      value={medicineSearch}
                      onChange={(e) => {
                        setMedicineSearch(e.target.value)
                        getMedicines(e.target.value)
                      }}
                      className='border border-gray-300 rounded-lg px-2.5 py-1 text-xs w-56'
                    />
                    {medicineSearch && medicinesCatalog.length > 0 && (
                      <div className='absolute right-0 top-7 z-20 bg-white border border-gray-200 rounded-lg shadow-lg w-64 max-h-48 overflow-y-auto text-xs'>
                        {medicinesCatalog.map((med) => (
                          <div
                            key={med._id}
                            onClick={() => handleAddMedicine(med)}
                            className='p-2 hover:bg-primary/10 cursor-pointer border-b flex justify-between'
                          >
                            <div>
                              <p className='font-bold text-gray-800'>{med.name}</p>
                              <p className='text-[10px] text-gray-400'>{med.genericName} • {med.dosageForm}</p>
                            </div>
                            <span className='text-primary font-bold'>+ Add</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className='space-y-2'>
                  {medicines.map((med, idx) => (
                    <div key={idx} className='flex items-center gap-2 bg-gray-50 p-2 rounded-lg border text-xs'>
                      <input
                        type='text'
                        value={med.name}
                        onChange={(e) => handleUpdateMedicine(idx, 'name', e.target.value)}
                        placeholder='Medicine Name'
                        className='flex-1 border rounded p-1.5 bg-white font-medium'
                        required
                      />
                      <input
                        type='text'
                        value={med.dosage}
                        onChange={(e) => handleUpdateMedicine(idx, 'dosage', e.target.value)}
                        placeholder='Dosage'
                        className='w-24 border rounded p-1.5 bg-white'
                      />
                      <input
                        type='text'
                        value={med.frequency}
                        onChange={(e) => handleUpdateMedicine(idx, 'frequency', e.target.value)}
                        placeholder='1-0-1'
                        className='w-28 border rounded p-1.5 bg-white'
                      />
                      <input
                        type='text'
                        value={med.duration}
                        onChange={(e) => handleUpdateMedicine(idx, 'duration', e.target.value)}
                        placeholder='5 days'
                        className='w-24 border rounded p-1.5 bg-white'
                      />
                      <input
                        type='text'
                        value={med.instructions}
                        onChange={(e) => handleUpdateMedicine(idx, 'instructions', e.target.value)}
                        placeholder='After meals'
                        className='w-28 border rounded p-1.5 bg-white'
                      />
                      <button
                        type='button'
                        onClick={() => handleRemoveMedicine(idx)}
                        className='text-red-500 hover:text-red-700 p-1'
                      >
                        <Trash2 className='w-4 h-4' />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advice and Follow-Up */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Dietary & Lifestyle Advice</label>
                  <input
                    type='text'
                    value={advice}
                    onChange={(e) => setAdvice(e.target.value)}
                    placeholder='Rest, hydration, avoid cold foods...'
                    className='w-full border border-gray-300 rounded-lg p-2 text-sm'
                  />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Follow-Up Recommendation</label>
                  <input
                    type='text'
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    placeholder='e.g. Review in 5-7 days if needed'
                    className='w-full border border-gray-300 rounded-lg p-2 text-sm'
                  />
                </div>
              </div>

              <div className='flex justify-end gap-3 pt-4 border-t'>
                <button
                  type='button'
                  onClick={() => setSelectedConsultation(null)}
                  className='px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={submittingPrescription}
                  className='inline-flex items-center gap-1.5 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg shadow-sm transition'
                >
                  <CheckCircle className='w-4 h-4' />
                  {submittingPrescription ? 'Saving...' : 'Approve & Issue Digital Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Call Modal */}
      {videoModalOpen && selectedConsultation && (
        <VideoConsultationModal
          roomId={selectedConsultation.videoRoomId || `appointy-${selectedConsultation._id}`}
          userName="Doctor"
          role="Doctor"
          onClose={() => setVideoModalOpen(false)}
        />
      )}
    </div>
  )
}

export default DoctorAppointments

import React, { useContext, useEffect, useState } from 'react'
import { ReceptionistContext } from '../../context/ReceptionistContext'
import { useLocation, useNavigate } from 'react-router-dom'
import { User } from 'lucide-react'

const ReceptionAppointments = () => {
  const { doctors, getDoctors, bookWalkinAppointment, patients, searchPatients } = useContext(ReceptionistContext)
  const location = useLocation()
  const navigate = useNavigate()

  const prefilledPatient = location.state?.prefilledPatient

  const [selectedPatientId, setSelectedPatientId] = useState(prefilledPatient?._id || '')
  const [selectedDocId, setSelectedDocId] = useState('')
  const [slotDate, setSlotDate] = useState('')
  const [slotTime, setSlotTime] = useState('11:00 AM')
  const [symptoms, setSymptoms] = useState('Routine consultation')
  const [paymentMode, setPaymentMode] = useState('Cash')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getDoctors()
    searchPatients('')
    // Default today's date
    const now = new Date()
    setSlotDate(`${now.getDate()}_${now.getMonth() + 1}_${now.getFullYear()}`)
  }, [getDoctors, searchPatients])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedPatientId || !selectedDocId) {
      alert("Please select both a patient and a doctor.")
      return
    }

    setSubmitting(true)
    const res = await bookWalkinAppointment({
      userId: selectedPatientId,
      docId: selectedDocId,
      slotDate,
      slotTime,
      symptoms,
      paymentMode
    })
    setSubmitting(false)

    if (res) {
      navigate('/reception-queue')
    }
  }

  const times = [
    "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "02:00 PM", "02:30 PM", "03:00 PM",
    "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM"
  ]

  return (
    <div className='p-6 w-full max-w-4xl mx-auto'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Book Walk-in / Phone Appointment</h1>
        <p className='text-sm text-gray-500'>Schedule an immediate walk-in consultation or phone reservation.</p>
      </div>

      <form onSubmit={handleSubmit} className='bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6'>
        {/* Patient Selection */}
        <div>
          <label className='block text-xs font-semibold text-gray-700 uppercase mb-1.5 flex items-center gap-1.5'>
            <User className='w-4 h-4 text-primary' /> Select Patient *
          </label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            required
            className='w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none bg-white'
          >
            <option value=''>-- Select Patient from Directory --</option>
            {patients.map((p) => (
              <option key={p._id} value={p._id}>{p.name} ({p.phone || p.email})</option>
            ))}
          </select>
          <p className='text-xs text-gray-400 mt-1'>
            Patient not listed? <span onClick={() => navigate('/reception-register')} className='text-primary underline cursor-pointer font-medium'>Register new patient here</span>
          </p>
        </div>

        {/* Doctor Selection */}
        <div>
          <label className='block text-xs font-semibold text-gray-700 uppercase mb-1.5'>
            Select Doctor & Department *
          </label>
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            required
            className='w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none bg-white'
          >
            <option value=''>-- Choose Doctor --</option>
            {doctors && doctors.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name} — {d.speciality} (Fees: ₹{d.fees})
              </option>
            ))}
          </select>
        </div>

        {/* Date and Time */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div>
            <label className='block text-xs font-semibold text-gray-700 uppercase mb-1.5'>Appointment Date</label>
            <input
              type='text'
              value={slotDate}
              onChange={(e) => setSlotDate(e.target.value)}
              placeholder='e.g. 11_11_2026'
              className='w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none'
              required
            />
            <p className='text-[11px] text-gray-400 mt-1'>Format: DD_MM_YYYY</p>
          </div>

          <div>
            <label className='block text-xs font-semibold text-gray-700 uppercase mb-1.5'>Time Slot</label>
            <select
              value={slotTime}
              onChange={(e) => setSlotTime(e.target.value)}
              className='w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none bg-white'
            >
              {times.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Reason / Symptoms */}
        <div>
          <label className='block text-xs font-semibold text-gray-700 uppercase mb-1.5'>Chief Complaint / Symptoms</label>
          <textarea
            rows={2}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder='e.g. High fever, acute throat pain for 2 days'
            className='w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none'
          />
        </div>

        {/* Payment Mode */}
        <div>
          <label className='block text-xs font-semibold text-gray-700 uppercase mb-1.5'>Payment Mode</label>
          <div className='flex gap-4'>
            <label className='flex items-center gap-2 cursor-pointer text-sm'>
              <input
                type='radio'
                name='paymentMode'
                value='Cash'
                checked={paymentMode === 'Cash'}
                onChange={() => setPaymentMode('Cash')}
                className='text-primary focus:ring-primary'
              />
              Cash at Reception
            </label>
            <label className='flex items-center gap-2 cursor-pointer text-sm'>
              <input
                type='radio'
                name='paymentMode'
                value='Online'
                checked={paymentMode === 'Online'}
                onChange={() => setPaymentMode('Online')}
                className='text-primary focus:ring-primary'
              />
              Online / UPI / Card
            </label>
          </div>
        </div>

        <div className='flex justify-end pt-4 border-t'>
          <button
            type='submit'
            disabled={submitting}
            className='bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-2.5 rounded-lg shadow-sm transition'
          >
            {submitting ? 'Booking...' : 'Confirm Walk-in & Add to Queue'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ReceptionAppointments

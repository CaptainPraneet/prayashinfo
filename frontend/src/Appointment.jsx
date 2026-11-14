import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from './context/AppContext'
import { assets } from './assets/assets'
import RelatedDoctors from './components/RelatedDoctors'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Star, Video, UserCheck, MessageSquare } from 'lucide-react'

const Appointment = () => {
  const { docId } = useParams()
  const navigate = useNavigate()
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } = useContext(AppContext)
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  const [docInfo, setDocInfo] = useState(null)
  const [docSlots, setDocSlots] = useState([])
  const [slotIndex, setSlotIndex] = useState(0)
  const [slotTime, setSlotTime] = useState('')
  const [appointmentType, setAppointmentType] = useState('in-person')
  const [symptoms, setSymptoms] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)

  const fetchDocInfo = async () => {
    const doc = doctors.find((doc) => doc._id === docId)
    if (doc) {
      setDocInfo({ ...doc, slots_booked: doc.slots_booked || {} })
    }
  }

  const getAvailableSlots = () => {
    if (!docInfo) return
    setDocSlots([])

    const today = new Date()

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today)
      currentDate.setDate(today.getDate() + i)

      const endTime = new Date(currentDate)
      endTime.setHours(21, 0, 0, 0)

      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10)
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0)
      } else {
        currentDate.setHours(10)
        currentDate.setMinutes(0)
      }

      const timeSlots = []

      while (currentDate < endTime) {
        const formattedTime = currentDate.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })

        const day = currentDate.getDate()
        const month = currentDate.getMonth() + 1
        const year = currentDate.getFullYear()
        const slotDate = `${day}_${month}_${year}`
        const slotTime = formattedTime

        const isSlotAvailable =
          !docInfo?.slots_booked?.[slotDate] ||
          !docInfo.slots_booked[slotDate].includes(slotTime)

        if (isSlotAvailable) {
          timeSlots.push({
            datetime: new Date(currentDate),
            time: formattedTime
          })
        }

        currentDate.setMinutes(currentDate.getMinutes() + 30)
      }

      setDocSlots((prev) => [...prev, timeSlots])
    }
  }

  const bookAppointment = async () => {
    if (!token) {
      toast.warning('Please log in to book an appointment')
      return navigate('/login')
    }

    if (!slotTime) {
      toast.warning('Please select a time slot')
      return
    }

    if (!docSlots[slotIndex] || !docSlots[slotIndex][0]) {
      toast.warning('No available slot on this date')
      return
    }

    const date = docSlots[slotIndex][0].datetime
    let day = date.getDate()
    let month = date.getMonth() + 1
    let year = date.getFullYear()
    const slotDate = day + "_" + month + "_" + year

    try {
      setBookingLoading(true)
      const { data } = await axios.post(
        backendUrl + '/api/user/book-appointment',
        { 
          docId, 
          slotDate, 
          slotTime,
          type: appointmentType,
          symptoms: symptoms.trim() || 'General Consultation'
        },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        getDoctorsData()
        navigate('/my-appointments')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error(error.message)
    } finally {
      setBookingLoading(false)
    }
  }

  useEffect(() => {
    if (doctors.length > 0) {
      fetchDocInfo()
    }
  }, [doctors, docId])

  useEffect(() => {
    if (docInfo) {
      getAvailableSlots()
    }
  }, [docInfo])

  return (
    docInfo && (
      <div className='py-6'>
        {/* Doctor details */}
        <div className='flex flex-col sm:flex-row gap-6'>
          <div>
            <img className='bg-primary w-full sm:max-w-72 rounded-2xl object-cover shadow-sm' src={docInfo.image} alt="" />
          </div>

          <div className='flex-1 border border-gray-200 rounded-2xl p-6 sm:p-8 bg-white shadow-sm space-y-4'>
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <div className='flex items-center gap-2 text-2xl sm:text-3xl font-bold text-gray-800'>
                {docInfo.name} <img className='w-5' src={assets.verified_icon} alt="" />
              </div>

              {/* Rating Badge */}
              <div className='inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 px-3 py-1 rounded-full text-xs font-bold border border-amber-200'>
                <Star className='w-4 h-4 fill-amber-400 text-amber-400' />
                <span>{docInfo.rating || 4.9}</span>
                <span className='text-gray-400'>({docInfo.ratingCount || 1} reviews)</span>
              </div>
            </div>

            <div className='flex flex-wrap items-center gap-2 text-sm text-gray-600'>
              <p className='font-medium'>{docInfo.degree} - {docInfo.speciality}</p>
              <span className='py-0.5 px-3 border border-gray-200 bg-gray-50 text-xs rounded-full font-semibold text-gray-700'>
                {docInfo.experience}
              </span>
              <span className='text-xs text-gray-400'>• {docInfo.branchName || 'Main Hospital'}</span>
            </div>

            <div>
              <p className='flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500 mb-1'>
                About Doctor <img className='w-3.5' src={assets.info_icon} alt="" />
              </p>
              <p className='text-sm text-gray-600 leading-relaxed'>{docInfo.about}</p>
            </div>

            <div className='pt-2 border-t flex items-center justify-between'>
              <p className='text-sm text-gray-600 font-medium'>
                Consultation Fee: <span className='text-lg font-bold text-gray-900'>{currencySymbol} {docInfo.fees}</span>
              </p>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${docInfo.available ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {docInfo.available ? 'Available for Booking' : 'Currently Away'}
              </span>
            </div>
          </div>
        </div>

        {/* Consultation Mode Selection */}
        <div className='sm:ml-72 sm:pl-6 mt-8 space-y-6'>
          <div>
            <h3 className='text-sm font-bold uppercase text-gray-700 tracking-wider mb-2'>
              Select Consultation Mode
            </h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg'>
              <label
                onClick={() => setAppointmentType('in-person')}
                className={`p-4 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition ${
                  appointmentType === 'in-person'
                    ? 'border-primary bg-primary/5 text-primary shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <input type='radio' name='mode' checked={appointmentType === 'in-person'} onChange={() => {}} className='hidden' />
                <UserCheck className='w-5 h-5 flex-shrink-0' />
                <div>
                  <p className='font-bold text-sm'>In-Person Clinic Visit</p>
                  <p className='text-xs text-gray-500'>Meet the doctor at hospital reception</p>
                </div>
              </label>

              <label
                onClick={() => setAppointmentType('telemedicine')}
                className={`p-4 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition ${
                  appointmentType === 'telemedicine'
                    ? 'border-primary bg-primary/5 text-primary shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <input type='radio' name='mode' checked={appointmentType === 'telemedicine'} onChange={() => {}} className='hidden' />
                <Video className='w-5 h-5 flex-shrink-0 text-purple-600' />
                <div>
                  <p className='font-bold text-sm'>Online Video Consultation</p>
                  <p className='text-xs text-gray-500'>Secure WebRTC telemedicine call</p>
                </div>
              </label>
            </div>
          </div>

          {/* Reason / Symptoms Input */}
          <div className='max-w-lg'>
            <label className='block text-xs font-bold uppercase text-gray-700 tracking-wider mb-1'>
              Reason for Consultation / Symptoms (Optional)
            </label>
            <input
              type='text'
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder='e.g. Mild headache and fever since 2 days'
              className='w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none'
            />
          </div>

          {/* Booking Slots */}
          <div>
            <h3 className='text-sm font-bold uppercase text-gray-700 tracking-wider mb-2'>
              Select Appointment Date & Time
            </h3>

            {/* Days Scroll */}
            <div className='flex gap-3 items-center w-full overflow-x-auto py-2'>
              {docSlots.length > 0 &&
                docSlots.map((item, index) => (
                  <div
                    onClick={() => { setSlotIndex(index); setSlotTime(''); }}
                    key={index}
                    className={`text-center py-4 px-5 min-w-16 rounded-2xl cursor-pointer transition shadow-sm ${
                      slotIndex === index ? 'bg-primary text-white shadow-md' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <p className='text-xs font-semibold uppercase'>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                    <p className='text-lg font-extrabold mt-0.5'>{item[0] && item[0].datetime.getDate()}</p>
                  </div>
                ))}
            </div>

            {/* Time Slots Scroll */}
            <div className='flex flex-wrap gap-2.5 mt-4'>
              {docSlots.length > 0 &&
                docSlots[slotIndex] &&
                docSlots[slotIndex].map((item, index) => (
                  <p
                    onClick={() => setSlotTime(item.time)}
                    key={index}
                    className={`text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer transition ${
                      item.time === slotTime
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-primary'
                    }`}
                  >
                    {item.time}
                  </p>
                ))}
            </div>

            {/* Book Button */}
            <div className='mt-8'>
              <button
                onClick={bookAppointment}
                disabled={bookingLoading}
                className='bg-primary hover:bg-primary/90 text-white font-bold text-sm px-12 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200'
              >
                {bookingLoading ? 'Securing Slot...' : 'Confirm Appointment Booking'}
              </button>
            </div>
          </div>

          {/* Doctor Patient Reviews */}
          {docInfo.reviews && docInfo.reviews.length > 0 && (
            <div className='max-w-2xl pt-6 border-t mt-8'>
              <h3 className='text-base font-bold text-gray-800 mb-4 flex items-center gap-2'>
                <MessageSquare className='w-4 h-4 text-primary' /> Verified Patient Feedback & Ratings
              </h3>
              <div className='space-y-3'>
                {docInfo.reviews.slice(0, 4).map((rev, idx) => (
                  <div key={idx} className='bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-xs'>
                    <div className='flex items-center justify-between mb-1'>
                      <span className='font-bold text-gray-900'>{rev.userName}</span>
                      <div className='flex text-amber-400'>
                        {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                          <Star key={i} className='w-3 h-3 fill-amber-400' />
                        ))}
                      </div>
                    </div>
                    <p className='text-gray-600'>{rev.comment || 'Great consultation and attentive care.'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Related Doctors */}
        <div className='mt-16'>
          <RelatedDoctors speciality={docInfo.speciality} docId={docId} />
        </div>
      </div>
    )
  )
}

export default Appointment

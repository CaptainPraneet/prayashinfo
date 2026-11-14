import React, { useContext, useState } from 'react'
import { ReceptionistContext } from '../../context/ReceptionistContext'
import { useNavigate } from 'react-router-dom'
import { UserPlus, CheckCircle, ArrowRight } from 'lucide-react'

const PatientRegistration = () => {
  const { registerWalkinPatient } = useContext(ReceptionistContext)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    gender: 'Male',
    dob: '',
    bloodGroup: 'B+',
    addressLine1: '',
    addressLine2: '',
    city: 'Bangalore'
  })

  const [registeredPatient, setRegisteredPatient] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const payload = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      gender: formData.gender,
      dob: formData.dob,
      bloodGroup: formData.bloodGroup,
      address: {
        line1: formData.addressLine1,
        line2: `${formData.addressLine2}, ${formData.city}`
      }
    }

    const patient = await registerWalkinPatient(payload)
    setSubmitting(false)
    if (patient) {
      setRegisteredPatient(patient)
    }
  }

  return (
    <div className='p-6 w-full max-w-4xl mx-auto'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Patient Registration</h1>
        <p className='text-sm text-gray-500'>Register walk-in or newly admitted patients into the hospital database.</p>
      </div>

      {registeredPatient ? (
        <div className='bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center'>
          <CheckCircle className='w-14 h-14 text-emerald-600 mx-auto mb-4' />
          <h2 className='text-xl font-bold text-emerald-900'>Patient Registered Successfully!</h2>
          <p className='text-sm text-emerald-700 mt-1'>
            <strong>{registeredPatient.name}</strong> has been added to the system.
          </p>
          <div className='mt-6 flex flex-wrap gap-3 justify-center'>
            <button
              onClick={() => {
                setRegisteredPatient(null)
                setFormData({
                  name: '', phone: '', email: '', gender: 'Male', dob: '', bloodGroup: 'B+', addressLine1: '', addressLine2: '', city: 'Bangalore'
                })
              }}
              className='bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50'
            >
              Register Another Patient
            </button>
            <button
              onClick={() => navigate('/reception-appointments', { state: { prefilledPatient: registeredPatient } })}
              className='bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 flex items-center gap-2'
            >
              Schedule Appointment <ArrowRight className='w-4 h-4' />
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className='bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6'>
          <h2 className='text-base font-bold text-gray-800 border-b pb-3 flex items-center gap-2'>
            <UserPlus className='w-5 h-5 text-primary' /> Basic Demographic Details
          </h2>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Full Name *</label>
              <input
                type='text'
                name='name'
                value={formData.name}
                onChange={handleChange}
                placeholder='e.g. Rahul Sharma'
                required
                className='w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none'
              />
            </div>

            <div>
              <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Phone Number *</label>
              <input
                type='tel'
                name='phone'
                value={formData.phone}
                onChange={handleChange}
                placeholder='e.g. +91 98765 43210'
                required
                className='w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none'
              />
            </div>

            <div>
              <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Email (Optional)</label>
              <input
                type='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                placeholder='patient@example.com'
                className='w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none'
              />
            </div>

            <div className='grid grid-cols-2 gap-2'>
              <div>
                <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Gender</label>
                <select
                  name='gender'
                  value={formData.gender}
                  onChange={handleChange}
                  className='w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none bg-white'
                >
                  <option value='Male'>Male</option>
                  <option value='Female'>Female</option>
                  <option value='Other'>Other</option>
                </select>
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Blood Group</label>
                <select
                  name='bloodGroup'
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className='w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none bg-white'
                >
                  <option value='A+'>A+</option>
                  <option value='A-'>A-</option>
                  <option value='B+'>B+</option>
                  <option value='B-'>B-</option>
                  <option value='O+'>O+</option>
                  <option value='O-'>O-</option>
                  <option value='AB+'>AB+</option>
                  <option value='AB-'>AB-</option>
                </select>
              </div>
            </div>

            <div>
              <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Date of Birth</label>
              <input
                type='date'
                name='dob'
                value={formData.dob}
                onChange={handleChange}
                className='w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none'
              />
            </div>

            <div>
              <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>City</label>
              <input
                type='text'
                name='city'
                value={formData.city}
                onChange={handleChange}
                placeholder='Bangalore'
                className='w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none'
              />
            </div>
          </div>

          <div>
            <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Street Address</label>
            <input
              type='text'
              name='addressLine1'
              value={formData.addressLine1}
              onChange={handleChange}
              placeholder='Apartment, House number, street'
              className='w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none'
            />
          </div>

          <div className='flex justify-end pt-4 border-t'>
            <button
              type='submit'
              disabled={submitting}
              className='bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-2.5 rounded-lg shadow-sm transition'
            >
              {submitting ? 'Registering...' : 'Save Patient Record'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default PatientRegistration

import React, { useContext, useEffect, useState } from 'react'
import { ReceptionistContext } from '../../context/ReceptionistContext'
import { useNavigate } from 'react-router-dom'
import { Search, User, Phone, Mail, Calendar, Receipt, Droplet } from 'lucide-react'

const PatientSearch = () => {
  const { patients, searchPatients } = useContext(ReceptionistContext)
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    searchPatients('')
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    searchPatients(searchTerm)
  }

  return (
    <div className='p-6 w-full max-w-7xl mx-auto'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Patient Directory & Search</h1>
        <p className='text-sm text-gray-500'>Find registered patient records by name, phone number or email.</p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className='flex gap-3 mb-6'>
        <div className='relative flex-1'>
          <Search className='w-5 h-5 text-gray-400 absolute left-3.5 top-3' />
          <input
            type='text'
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              searchPatients(e.target.value)
            }}
            placeholder='Search by patient name, phone number (e.g. 98765...), or email...'
            className='w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm'
          />
        </div>
        <button
          type='submit'
          className='bg-primary text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-primary/90 transition shadow-sm'
        >
          Search
        </button>
      </form>

      {/* Patients Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {patients.length === 0 ? (
          <div className='col-span-full py-16 text-center bg-white rounded-xl border border-gray-200'>
            <User className='w-12 h-12 text-gray-300 mx-auto mb-2' />
            <p className='text-gray-500 font-medium'>No patient records found matching your query.</p>
          </div>
        ) : (
          patients.map((p) => (
            <div key={p._id} className='bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between'>
              <div>
                <div className='flex items-start justify-between mb-3'>
                  <div className='flex items-center gap-3'>
                    <img
                      src={p.image || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                      alt={p.name}
                      className='w-12 h-12 rounded-full object-cover border border-gray-200'
                    />
                    <div>
                      <h3 className='font-bold text-gray-900'>{p.name}</h3>
                      <p className='text-xs text-gray-500'>Gender: {p.gender} • DOB: {p.dob || 'N/A'}</p>
                    </div>
                  </div>
                  {p.bloodGroup && (
                    <span className='inline-flex items-center gap-1 bg-red-50 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full border border-red-200'>
                      <Droplet className='w-3 h-3 text-red-500' /> {p.bloodGroup}
                    </span>
                  )}
                </div>

                <div className='space-y-1.5 text-xs text-gray-600 border-t pt-3'>
                  <p className='flex items-center gap-2'>
                    <Phone className='w-3.5 h-3.5 text-gray-400' /> {p.phone || 'No phone'}
                  </p>
                  <p className='flex items-center gap-2'>
                    <Mail className='w-3.5 h-3.5 text-gray-400' /> {p.email}
                  </p>
                </div>
              </div>

              <div className='flex gap-2 pt-4 mt-3 border-t'>
                <button
                  onClick={() => navigate('/reception-appointments', { state: { prefilledPatient: p } })}
                  className='flex-1 inline-flex items-center justify-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 py-1.5 px-3 rounded-lg text-xs font-semibold transition'
                >
                  <Calendar className='w-3.5 h-3.5' /> Book Visit
                </button>
                <button
                  onClick={() => navigate('/reception-billing', { state: { prefilledPatient: p } })}
                  className='flex-1 inline-flex items-center justify-center gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 py-1.5 px-3 rounded-lg text-xs font-semibold transition'
                >
                  <Receipt className='w-3.5 h-3.5' /> Bill POS
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default PatientSearch

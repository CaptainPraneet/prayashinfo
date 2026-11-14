import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { Building2, Plus, Phone, Mail, MapPin } from 'lucide-react'

const BranchManagement = () => {
  const { branches, getBranches, addBranch } = useContext(AdminContext)
  const [showModal, setShowModal] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    city: 'Bangalore',
    address: '',
    phone: '',
    email: ''
  })

  useEffect(() => {
    getBranches()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const success = await addBranch(formData)
    if (success) {
      setShowModal(false)
      setFormData({ name: '', city: 'Bangalore', address: '', phone: '', email: '' })
    }
  }

  return (
    <div className='p-6 w-full max-w-7xl mx-auto'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Multiple Clinic Branches</h1>
          <p className='text-sm text-gray-500'>Manage hospital locations, clinic branches, and regional healthcare centres.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className='inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition shadow-sm'
        >
          <Plus className='w-4 h-4' /> Add New Branch
        </button>
      </div>

      {/* Branches Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {branches.length === 0 ? (
          <div className='col-span-full py-12 text-center text-gray-400 bg-white rounded-xl border border-gray-200'>
            No branches registered.
          </div>
        ) : (
          branches.map((b) => (
            <div key={b._id} className='bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between'>
              <div>
                <div className='flex items-start justify-between mb-4'>
                  <div className='flex items-center gap-3'>
                    <div className='w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold'>
                      <Building2 className='w-6 h-6' />
                    </div>
                    <div>
                      <h3 className='font-bold text-gray-900 text-base'>{b.name}</h3>
                      <p className='text-xs text-gray-500'>{b.city}</p>
                    </div>
                  </div>
                  <span className='px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800'>
                    Active
                  </span>
                </div>

                <div className='space-y-2 text-xs text-gray-600 border-t pt-4'>
                  <p className='flex items-start gap-2'>
                    <MapPin className='w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5' />
                    <span>{b.address}</span>
                  </p>
                  <p className='flex items-center gap-2'>
                    <Phone className='w-4 h-4 text-gray-400 flex-shrink-0' />
                    <span>{b.phone}</span>
                  </p>
                  <p className='flex items-center gap-2'>
                    <Mail className='w-4 h-4 text-gray-400 flex-shrink-0' />
                    <span>{b.email}</span>
                  </p>
                </div>
              </div>

              <div className='mt-6 pt-4 border-t flex justify-between items-center text-xs text-gray-500'>
                <span>Doctors: <strong>{b.totalDoctors || 4} Active</strong></span>
                <span className='text-primary font-medium hover:underline cursor-pointer'>View Details</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Branch Modal */}
      {showModal && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100'>
            <div className='flex justify-between items-center mb-4 pb-2 border-b'>
              <h3 className='font-bold text-gray-900 flex items-center gap-2'>
                <Building2 className='w-5 h-5 text-primary' /> Add Clinic Branch
              </h3>
              <button onClick={() => setShowModal(false)} className='text-gray-400 hover:text-gray-600 font-bold'>✕</button>
            </div>

            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Branch Name *</label>
                <input
                  type='text'
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder='e.g. PrayashCare Whitefield Clinic'
                  required
                  className='w-full border border-gray-300 rounded-lg p-2.5 text-sm'
                />
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>City *</label>
                <input
                  type='text'
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder='Bangalore'
                  required
                  className='w-full border border-gray-300 rounded-lg p-2.5 text-sm'
                />
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Full Address *</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder='Premises address with pin code'
                  required
                  className='w-full border border-gray-300 rounded-lg p-2.5 text-sm'
                />
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Phone *</label>
                  <input
                    type='tel'
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder='+91 80 1234 5678'
                    required
                    className='w-full border border-gray-300 rounded-lg p-2.5 text-sm'
                  />
                </div>

                <div>
                  <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Email *</label>
                  <input
                    type='email'
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder='branch@example.com'
                    required
                    className='w-full border border-gray-300 rounded-lg p-2.5 text-sm'
                  />
                </div>
              </div>

              <div className='flex justify-end gap-3 pt-4 border-t'>
                <button
                  type='button'
                  onClick={() => setShowModal(false)}
                  className='px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg font-medium'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='px-6 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90'
                >
                  Save Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default BranchManagement

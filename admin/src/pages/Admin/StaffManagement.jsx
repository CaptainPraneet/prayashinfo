import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { UserCheck, UserPlus, Shield, ToggleLeft, ToggleRight } from 'lucide-react'

const StaffManagement = () => {
  const { staffList, getStaff, addStaff, toggleStaffStatus } = useContext(AdminContext)
  const [showModal, setShowModal] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'receptionist',
    phone: '',
    branchName: 'PrayashCare Main Hospital - Bangalore Central'
  })

  useEffect(() => {
    getStaff()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const success = await addStaff(formData)
    if (success) {
      setShowModal(false)
      setFormData({
        name: '', email: '', password: '', role: 'receptionist', phone: '', branchName: 'PrayashCare Main Hospital - Bangalore Central'
      })
    }
  }

  return (
    <div className='p-6 w-full max-w-7xl mx-auto'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Staff & Role-Based Access Control</h1>
          <p className='text-sm text-gray-500'>Manage clinic staff members: receptionists, pharmacists, and lab technicians.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className='inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition shadow-sm'
        >
          <UserPlus className='w-4 h-4' /> Add Staff Member
        </button>
      </div>

      {/* Staff Table */}
      <div className='bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm'>
        <table className='min-w-full divide-y divide-gray-200 text-left text-sm'>
          <thead className='bg-gray-50 text-gray-500 font-semibold'>
            <tr>
              <th className='py-3.5 px-4'>Staff Name</th>
              <th className='py-3.5 px-4'>Role</th>
              <th className='py-3.5 px-4'>Email & Phone</th>
              <th className='py-3.5 px-4'>Assigned Branch</th>
              <th className='py-3.5 px-4'>Status</th>
              <th className='py-3.5 px-4 text-right'>Action</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>
            {staffList.length === 0 ? (
              <tr>
                <td colSpan={6} className='py-8 text-center text-gray-400'>
                  No staff members registered.
                </td>
              </tr>
            ) : (
              staffList.map((staff) => (
                <tr key={staff._id} className='hover:bg-gray-50 transition'>
                  <td className='py-4 px-4 font-semibold text-gray-900 flex items-center gap-2.5'>
                    <div className='w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold'>
                      {staff.name.charAt(0)}
                    </div>
                    {staff.name}
                  </td>
                  <td className='py-4 px-4'>
                    <span className='capitalize inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border'>
                      {staff.role}
                    </span>
                  </td>
                  <td className='py-4 px-4 text-xs text-gray-600'>
                    <p className='font-medium text-gray-800'>{staff.email}</p>
                    <p>{staff.phone || 'No phone'}</p>
                  </td>
                  <td className='py-4 px-4 text-gray-600'>{staff.branchName || 'Main Hospital'}</td>
                  <td className='py-4 px-4'>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${staff.active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                      {staff.active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className='py-4 px-4 text-right'>
                    <button
                      onClick={() => toggleStaffStatus(staff._id)}
                      className='inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 font-medium'
                    >
                      {staff.active ? (
                        <>
                          <ToggleRight className='w-5 h-5 text-emerald-600' /> Deactivate
                        </>
                      ) : (
                        <>
                          <ToggleLeft className='w-5 h-5 text-gray-400' /> Activate
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Staff Modal */}
      {showModal && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100'>
            <div className='flex justify-between items-center mb-4 pb-2 border-b'>
              <h3 className='font-bold text-gray-900 flex items-center gap-2'>
                <UserPlus className='w-5 h-5 text-primary' /> Add Clinic Staff
              </h3>
              <button onClick={() => setShowModal(false)} className='text-gray-400 hover:text-gray-600 font-bold'>✕</button>
            </div>

            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Full Name *</label>
                <input
                  type='text'
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder='e.g. Ananya Sharma'
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
                  placeholder='staff@example.com'
                  required
                  className='w-full border border-gray-300 rounded-lg p-2.5 text-sm'
                />
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Password *</label>
                <input
                  type='password'
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder='Secure password'
                  required
                  className='w-full border border-gray-300 rounded-lg p-2.5 text-sm'
                />
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className='w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white'
                  >
                    <option value='receptionist'>Receptionist</option>
                    <option value='pharmacist'>Pharmacist</option>
                    <option value='lab_tech'>Lab Technician</option>
                    <option value='nurse'>Nurse</option>
                    <option value='admin'>Admin</option>
                  </select>
                </div>

                <div>
                  <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Phone</label>
                  <input
                    type='tel'
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder='+91 98765 43210'
                    className='w-full border border-gray-300 rounded-lg p-2.5 text-sm'
                  />
                </div>
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Clinic Branch</label>
                <input
                  type='text'
                  value={formData.branchName}
                  onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                  className='w-full border border-gray-300 rounded-lg p-2.5 text-sm'
                />
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
                  Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default StaffManagement

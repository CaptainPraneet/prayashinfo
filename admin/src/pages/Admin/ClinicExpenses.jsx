import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { DollarSign, Plus, FileText, Calendar } from 'lucide-react'

const ClinicExpenses = () => {
  const { expenses, totalExpenses, getExpenses, addExpense } = useContext(AdminContext)
  const [showModal, setShowModal] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    category: 'Medical Supplies',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    branchName: 'PrayashCare Main Hospital - Bangalore Central'
  })

  useEffect(() => {
    getExpenses()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const success = await addExpense(formData)
    if (success) {
      setShowModal(false)
      setFormData({
        title: '',
        category: 'Medical Supplies',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        branchName: 'PrayashCare Main Hospital - Bangalore Central'
      })
    }
  }

  return (
    <div className='p-6 w-full max-w-7xl mx-auto'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Clinic Expenses & Operational Costs</h1>
          <p className='text-sm text-gray-500'>Track hospital overhead, staff salaries, rent, utilities, and pharmaceutical procurement.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className='inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition shadow-sm'
        >
          <Plus className='w-4 h-4' /> Record Expense
        </button>
      </div>

      {/* Expense Summary Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
        <div className='bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4'>
          <div className='p-3 bg-red-100 text-red-700 rounded-xl'>
            <DollarSign className='w-6 h-6' />
          </div>
          <div>
            <p className='text-xs font-semibold text-gray-500 uppercase'>Total Expenses</p>
            <p className='text-2xl font-extrabold text-gray-900 mt-1'>₹{totalExpenses.toLocaleString()}</p>
          </div>
        </div>

        <div className='bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4'>
          <div className='p-3 bg-blue-100 text-blue-700 rounded-xl'>
            <FileText className='w-6 h-6' />
          </div>
          <div>
            <p className='text-xs font-semibold text-gray-500 uppercase'>Expense Entries</p>
            <p className='text-2xl font-extrabold text-gray-900 mt-1'>{expenses.length}</p>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className='bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm'>
        <table className='min-w-full divide-y divide-gray-200 text-left text-sm'>
          <thead className='bg-gray-50 text-gray-500 font-semibold'>
            <tr>
              <th className='py-3.5 px-4'>Expense Title</th>
              <th className='py-3.5 px-4'>Category</th>
              <th className='py-3.5 px-4'>Date</th>
              <th className='py-3.5 px-4'>Branch</th>
              <th className='py-3.5 px-4'>Notes</th>
              <th className='py-3.5 px-4 text-right'>Amount</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={6} className='py-8 text-center text-gray-400'>
                  No expense records logged yet.
                </td>
              </tr>
            ) : (
              expenses.map((exp) => (
                <tr key={exp._id} className='hover:bg-gray-50 transition'>
                  <td className='py-4 px-4 font-bold text-gray-900'>{exp.title}</td>
                  <td className='py-4 px-4'>
                    <span className='inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border'>
                      {exp.category}
                    </span>
                  </td>
                  <td className='py-4 px-4 text-xs text-gray-600'>{exp.date}</td>
                  <td className='py-4 px-4 text-xs text-gray-600'>{exp.branchName}</td>
                  <td className='py-4 px-4 text-xs text-gray-500'>{exp.notes || '—'}</td>
                  <td className='py-4 px-4 text-right font-bold text-red-600'>₹{exp.amount.toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Record Expense Modal */}
      {showModal && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100'>
            <div className='flex justify-between items-center mb-4 pb-2 border-b'>
              <h3 className='font-bold text-gray-900 flex items-center gap-2'>
                <DollarSign className='w-5 h-5 text-primary' /> Record Clinic Expense
              </h3>
              <button onClick={() => setShowModal(false)} className='text-gray-400 hover:text-gray-600 font-bold'>✕</button>
            </div>

            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Expense Title *</label>
                <input
                  type='text'
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder='e.g. Monthly Electricity Bill'
                  required
                  className='w-full border border-gray-300 rounded-lg p-2.5 text-sm'
                />
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className='w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white'
                  >
                    <option value='Rent'>Rent</option>
                    <option value='Salaries'>Salaries</option>
                    <option value='Utilities'>Utilities</option>
                    <option value='Medical Supplies'>Medical Supplies</option>
                    <option value='Equipment'>Equipment</option>
                    <option value='Maintenance'>Maintenance</option>
                    <option value='Marketing'>Marketing</option>
                    <option value='Other'>Other</option>
                  </select>
                </div>

                <div>
                  <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Amount (₹) *</label>
                  <input
                    type='number'
                    min='0'
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    className='w-full border border-gray-300 rounded-lg p-2.5 text-sm'
                  />
                </div>
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Date</label>
                <input
                  type='date'
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className='w-full border border-gray-300 rounded-lg p-2.5 text-sm'
                />
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Remarks / Bill Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder='Vendor, invoice number, check details...'
                  className='w-full border border-gray-300 rounded-lg p-2.5 text-sm'
                />
              </div>

              <div className='flex justify-end gap-3 pt-3 border-t'>
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
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClinicExpenses

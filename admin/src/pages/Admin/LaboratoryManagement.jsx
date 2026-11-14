import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { FlaskConical, CheckCircle2, Clock, FileText, ArrowRight } from 'lucide-react'

const LaboratoryManagement = () => {
  const { labReports, getLabReports, updateLabStatus } = useContext(AdminContext)
  const [selectedReport, setSelectedReport] = useState(null)
  const [newStatus, setNewStatus] = useState('Sample Collected')
  const [reportNotes, setReportNotes] = useState('')

  useEffect(() => {
    getLabReports()
  }, [])

  const handleStatusUpdate = async (e) => {
    e.preventDefault()
    if (!selectedReport) return
    await updateLabStatus(selectedReport._id, newStatus, null, reportNotes)
    setSelectedReport(null)
    setReportNotes('')
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Requested':
        return <span className='bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-semibold'>Requested</span>
      case 'Sample Collected':
        return <span className='bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full text-xs font-semibold'>Sample Collected</span>
      case 'Processing':
        return <span className='bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-semibold animate-pulse'>Processing</span>
      case 'Completed':
        return <span className='bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-semibold'>Completed</span>
      default:
        return <span className='bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-xs font-semibold'>{status}</span>
    }
  }

  return (
    <div className='p-6 w-full max-w-7xl mx-auto'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Laboratory & Diagnostic Management</h1>
          <p className='text-sm text-gray-500'>Manage diagnostic test requests, sample tracking workflows, and report releases.</p>
        </div>
      </div>

      {/* Lab Requests Table */}
      <div className='bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm'>
        <table className='min-w-full divide-y divide-gray-200 text-left text-sm'>
          <thead className='bg-gray-50 text-gray-500 font-semibold'>
            <tr>
              <th className='py-3.5 px-4'>Test Name & Category</th>
              <th className='py-3.5 px-4'>Patient Name</th>
              <th className='py-3.5 px-4'>Referring Doctor</th>
              <th className='py-3.5 px-4'>Requested Date</th>
              <th className='py-3.5 px-4'>Sample Status</th>
              <th className='py-3.5 px-4 text-right'>Action</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>
            {labReports.length === 0 ? (
              <tr>
                <td colSpan={6} className='py-8 text-center text-gray-400'>
                  No diagnostic laboratory requests logged.
                </td>
              </tr>
            ) : (
              labReports.map((report) => (
                <tr key={report._id} className='hover:bg-gray-50 transition'>
                  <td className='py-4 px-4'>
                    <p className='font-bold text-gray-900 flex items-center gap-1.5'>
                      <FlaskConical className='w-4 h-4 text-primary' />
                      {report.testName}
                    </p>
                    <p className='text-xs text-gray-500'>{report.category}</p>
                  </td>
                  <td className='py-4 px-4 font-semibold text-gray-800'>{report.patientName}</td>
                  <td className='py-4 px-4 text-xs text-gray-600'>{report.doctorName || 'General Referral'}</td>
                  <td className='py-4 px-4 text-xs text-gray-500'>{new Date(report.requestedDate).toLocaleDateString()}</td>
                  <td className='py-4 px-4'>{getStatusBadge(report.sampleStatus)}</td>
                  <td className='py-4 px-4 text-right'>
                    <button
                      onClick={() => {
                        setSelectedReport(report)
                        setNewStatus(report.sampleStatus)
                        setReportNotes(report.notes || '')
                      }}
                      className='inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition'
                    >
                      Update Sample Status
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Update Sample Status Modal */}
      {selectedReport && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100'>
            <div className='flex justify-between items-center mb-4 pb-2 border-b'>
              <h3 className='font-bold text-gray-900 flex items-center gap-2'>
                <FlaskConical className='w-5 h-5 text-primary' /> Update Lab Sample Workflow
              </h3>
              <button onClick={() => setSelectedReport(null)} className='text-gray-400 hover:text-gray-600 font-bold'>✕</button>
            </div>

            <form onSubmit={handleStatusUpdate} className='space-y-4'>
              <div>
                <p className='text-xs text-gray-500'>Test: <strong>{selectedReport.testName}</strong></p>
                <p className='text-xs text-gray-500'>Patient: <strong>{selectedReport.patientName}</strong></p>
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Sample Stage</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className='w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white'
                >
                  <option value='Requested'>Requested</option>
                  <option value='Sample Collected'>Sample Collected</option>
                  <option value='Processing'>Processing in Lab</option>
                  <option value='Completed'>Completed & Released</option>
                </select>
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Technician Remarks / Findings</label>
                <textarea
                  rows={3}
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  placeholder='Clinical observation, sample quality, reference ranges...'
                  className='w-full border border-gray-300 rounded-lg p-2.5 text-sm'
                />
              </div>

              <div className='flex justify-end gap-2 pt-2'>
                <button
                  type='button'
                  onClick={() => setSelectedReport(null)}
                  className='px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='px-5 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90'
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default LaboratoryManagement

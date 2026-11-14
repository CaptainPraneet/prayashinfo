import React, { useContext, useEffect, useState } from 'react'
import { ReceptionistContext } from '../../context/ReceptionistContext'
import { CheckCircle2, Clock, ArrowRight, UserCheck, RefreshCw } from 'lucide-react'

const QueueManagement = () => {
  const { queue, getTodayQueue, updateQueueStatus, loading, doctors, doctorsLoading, doctorsError, getDoctors } = useContext(ReceptionistContext)
  const [selectedDoctor, setSelectedDoctor] = useState('')

  useEffect(() => {
    getTodayQueue(selectedDoctor)
  }, [getTodayQueue, selectedDoctor])

  useEffect(() => {
    getDoctors()
  }, [getDoctors])

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Checked In':
        return <span className='bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-xs font-semibold'>Checked In</span>
      case 'In Consultation':
        return <span className='bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full text-xs font-semibold animate-pulse'>In Consultation</span>
      case 'Completed':
        return <span className='bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-xs font-semibold'>Completed</span>
      case 'Cancelled':
        return <span className='bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full text-xs font-semibold'>Cancelled</span>
      default:
        return <span className='bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-full text-xs font-semibold'>Scheduled</span>
    }
  }

  return (
    <div className='p-6 w-full max-w-7xl mx-auto'>
      <div className='flex flex-wrap items-center justify-between gap-4 mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Live Queue Management</h1>
          <p className='text-sm text-gray-500'>Monitor patient token flow, consultation queue and waiting times.</p>
        </div>

        <div className='flex items-center gap-3'>
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className='border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary'
          >
            <option value=''>All Doctors</option>
            {doctors.map((doc) => (
              <option key={doc._id} value={doc._id}>{doc.name}</option>
            ))}
          </select>

          <button
            onClick={() => getTodayQueue(selectedDoctor)}
            className='flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition'
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
      {doctorsLoading && <p className='text-sm text-gray-500 mb-4' role='status'>Loading doctors...</p>}
      {!doctorsLoading && doctorsError && <p className='text-sm text-red-600 mb-4' role='alert'>{doctorsError}</p>}
      {!doctorsLoading && !doctorsError && doctors.length === 0 && (
        <p className='text-sm text-gray-500 mb-4' role='status'>No registered doctors found.</p>
      )}

      {/* Queue Summary Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6'>
        <div className='bg-white p-4 rounded-xl border border-gray-200 shadow-sm'>
          <p className='text-xs font-medium text-gray-500 uppercase'>Total in Queue</p>
          <p className='text-2xl font-bold text-gray-900 mt-1'>{queue.length}</p>
        </div>
        <div className='bg-blue-50 p-4 rounded-xl border border-blue-200 shadow-sm'>
          <p className='text-xs font-medium text-blue-600 uppercase'>Waiting / Checked In</p>
          <p className='text-2xl font-bold text-blue-700 mt-1'>
            {queue.filter(q => q.status === 'Checked In' || q.status === 'Confirmed').length}
          </p>
        </div>
        <div className='bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-sm'>
          <p className='text-xs font-medium text-amber-600 uppercase'>In Consultation</p>
          <p className='text-2xl font-bold text-amber-700 mt-1'>
            {queue.filter(q => q.status === 'In Consultation').length}
          </p>
        </div>
        <div className='bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-sm'>
          <p className='text-xs font-medium text-emerald-600 uppercase'>Completed</p>
          <p className='text-2xl font-bold text-emerald-700 mt-1'>
            {queue.filter(q => q.status === 'Completed').length}
          </p>
        </div>
      </div>

      {/* Queue Table */}
      <div className='bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200 text-left text-sm'>
            <thead className='bg-gray-50 text-gray-500 font-semibold'>
              <tr>
                <th className='py-3.5 px-4'>Token #</th>
                <th className='py-3.5 px-4'>Patient Name</th>
                <th className='py-3.5 px-4'>Doctor & Dept</th>
                <th className='py-3.5 px-4'>Scheduled Time</th>
                <th className='py-3.5 px-4'>Status</th>
                <th className='py-3.5 px-4'>AI No-Show Risk</th>
                <th className='py-3.5 px-4 text-right'>Queue Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {queue.length === 0 ? (
                <tr>
                  <td colSpan={7} className='text-center py-10 text-gray-400'>
                    No appointments scheduled in today's queue.
                  </td>
                </tr>
              ) : (
                queue.map((item) => (
                  <tr key={item._id} className='hover:bg-gray-50 transition'>
                    <td className='py-4 px-4 font-bold text-primary'>
                      <span className='inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary'>
                        #{item.queueToken || 1}
                      </span>
                    </td>
                    <td className='py-4 px-4'>
                      <p className='font-semibold text-gray-900'>{item.userData?.name || 'Walk-in'}</p>
                      <p className='text-xs text-gray-500'>{item.userData?.phone || 'No phone'}</p>
                    </td>
                    <td className='py-4 px-4'>
                      <p className='font-medium text-gray-800'>{item.docData?.name}</p>
                      <p className='text-xs text-gray-500'>{item.docData?.speciality}</p>
                    </td>
                    <td className='py-4 px-4'>
                      <span className='inline-flex items-center gap-1 text-gray-700 font-medium'>
                        <Clock className='w-3.5 h-3.5 text-gray-400' />
                        {item.slotTime}
                      </span>
                    </td>
                    <td className='py-4 px-4'>
                      {getStatusBadge(item.status)}
                    </td>
                    <td className='py-4 px-4'>
                      <div className='flex items-center gap-1.5'>
                        <span className={`inline-block w-2.5 h-2.5 rounded-full ${item.noShowRiskScore >= 50 ? 'bg-red-500' : item.noShowRiskScore >= 25 ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                        <span className='text-xs font-medium text-gray-600'>
                          {item.noShowRiskScore || 15}% ({item.noShowRiskScore >= 50 ? 'High' : item.noShowRiskScore >= 25 ? 'Med' : 'Low'})
                        </span>
                      </div>
                    </td>
                    <td className='py-4 px-4 text-right space-x-2'>
                      {item.status !== 'Checked In' && item.status !== 'In Consultation' && item.status !== 'Completed' && (
                        <button
                          onClick={() => updateQueueStatus(item._id, 'Checked In', selectedDoctor)}
                          className='inline-flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition'
                        >
                          <UserCheck className='w-3.5 h-3.5' /> Check In
                        </button>
                      )}

                      {item.status === 'Checked In' && (
                        <button
                          onClick={() => updateQueueStatus(item._id, 'In Consultation', selectedDoctor)}
                          className='inline-flex items-center gap-1 bg-amber-500 text-white hover:bg-amber-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition'
                        >
                          Call Doctor <ArrowRight className='w-3.5 h-3.5' />
                        </button>
                      )}

                      {item.status === 'In Consultation' && (
                        <button
                          onClick={() => updateQueueStatus(item._id, 'Completed', selectedDoctor)}
                          className='inline-flex items-center gap-1 bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition'
                        >
                          <CheckCircle2 className='w-3.5 h-3.5' /> Done
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default QueueManagement

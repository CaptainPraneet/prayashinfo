import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { ShieldAlert, Clock, User, FileText } from 'lucide-react'

const AuditLogs = () => {
  const { auditLogs, getAuditLogs } = useContext(AdminContext)

  useEffect(() => {
    getAuditLogs()
  }, [])

  return (
    <div className='p-6 w-full max-w-7xl mx-auto'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Security & Clinical Audit Logs</h1>
        <p className='text-sm text-gray-500'>Immutable activity log for regulatory compliance, data protection, and administrative auditing.</p>
      </div>

      <div className='bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm'>
        <table className='min-w-full divide-y divide-gray-200 text-left text-sm'>
          <thead className='bg-gray-50 text-gray-500 font-semibold'>
            <tr>
              <th className='py-3.5 px-4'>Timestamp</th>
              <th className='py-3.5 px-4'>Action Triggered</th>
              <th className='py-3.5 px-4'>Performed By</th>
              <th className='py-3.5 px-4'>Target Entity</th>
              <th className='py-3.5 px-4'>Details</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>
            {auditLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className='py-8 text-center text-gray-400'>
                  No audit trail records logged yet.
                </td>
              </tr>
            ) : (
              auditLogs.map((log) => (
                <tr key={log._id} className='hover:bg-gray-50 transition'>
                  <td className='py-3.5 px-4 text-xs text-gray-500 flex items-center gap-1.5'>
                    <Clock className='w-3.5 h-3.5 text-gray-400' />
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className='py-3.5 px-4'>
                    <span className='font-mono font-bold text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded border'>
                      {log.action}
                    </span>
                  </td>
                  <td className='py-3.5 px-4 text-xs'>
                    <span className='font-semibold text-gray-800'>{log.performedBy?.name || log.performedBy?.role || 'System'}</span>
                    <span className='text-gray-400 block'>({log.performedBy?.role || 'system'})</span>
                  </td>
                  <td className='py-3.5 px-4 text-xs font-medium text-gray-600'>
                    {log.targetType} {log.targetId ? `(${log.targetId.slice(-6)})` : ''}
                  </td>
                  <td className='py-3.5 px-4 text-xs text-gray-500 font-mono'>
                    {log.details ? JSON.stringify(log.details) : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AuditLogs

import React, { useContext, useEffect } from 'react'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Users, 
  Building2, 
  BrainCircuit, 
  AlertCircle, 
  CheckCircle,
  CreditCard
} from 'lucide-react'

const Dashboard = () => {
  const { aToken, getDashData, cancelAppointment, dashData } = useContext(AdminContext)
  const { slotDateFormat } = useContext(AppContext)

  useEffect(() => {
    if (aToken) {
      getDashData()
    }
  }, [aToken])

  if (!dashData) return null

  return (
    <div className='p-6 w-full max-w-7xl mx-auto space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Super Admin Executive Dashboard</h1>
        <p className='text-sm text-gray-500'>Hospital performance metrics, financial analytics, and AI operational recommendations.</p>
      </div>

      {/* Main KPI Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <div className='bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md transition'>
          <div className='p-3 bg-blue-100 text-blue-700 rounded-xl'>
            <img className='w-8 h-8' src={assets.doctor_icon} alt="" />
          </div>
          <div>
            <p className='text-2xl font-bold text-gray-900'>{dashData.doctors}</p>
            <p className='text-xs font-semibold text-gray-500 uppercase mt-0.5'>Active Doctors</p>
          </div>
        </div>

        <div className='bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md transition'>
          <div className='p-3 bg-purple-100 text-purple-700 rounded-xl'>
            <img className='w-8 h-8' src={assets.patients_icon} alt="" />
          </div>
          <div>
            <p className='text-2xl font-bold text-gray-900'>{dashData.patients}</p>
            <p className='text-xs font-semibold text-gray-500 uppercase mt-0.5'>Total Patients</p>
          </div>
        </div>

        <div className='bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md transition'>
          <div className='p-3 bg-emerald-100 text-emerald-700 rounded-xl'>
            <img className='w-8 h-8' src={assets.appointments_icon} alt="" />
          </div>
          <div>
            <p className='text-2xl font-bold text-gray-900'>{dashData.appointments}</p>
            <p className='text-xs font-semibold text-gray-500 uppercase mt-0.5'>Total Bookings</p>
          </div>
        </div>

        <div className='bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md transition'>
          <div className='p-3 bg-amber-100 text-amber-700 rounded-xl'>
            <Building2 className='w-8 h-8' />
          </div>
          <div>
            <p className='text-2xl font-bold text-gray-900'>{dashData.branchesCount || 3}</p>
            <p className='text-xs font-semibold text-gray-500 uppercase mt-0.5'>Clinic Branches</p>
          </div>
        </div>
      </div>

      {/* Financial Analytics & Appointment Velocity */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Revenue Breakdown */}
        <div className='bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4'>
          <h2 className='text-base font-bold text-gray-900 flex items-center gap-2'>
            <DollarSign className='w-5 h-5 text-emerald-600' /> Financial Performance
          </h2>

          <div className='space-y-3'>
            <div className='flex justify-between items-center p-3 bg-emerald-50 rounded-xl border border-emerald-100'>
              <span className='text-xs font-semibold text-emerald-800 uppercase'>Total Revenue</span>
              <span className='text-lg font-bold text-emerald-900'>₹{(dashData.totalRevenue || 0).toLocaleString()}</span>
            </div>

            <div className='flex justify-between items-center p-3 bg-red-50 rounded-xl border border-red-100'>
              <span className='text-xs font-semibold text-red-800 uppercase'>Clinic Expenses</span>
              <span className='text-lg font-bold text-red-900'>₹{(dashData.totalExpenses || 0).toLocaleString()}</span>
            </div>

            <div className='flex justify-between items-center p-3 bg-blue-50 rounded-xl border border-blue-100'>
              <span className='text-xs font-semibold text-blue-800 uppercase'>Net Operating Profit</span>
              <span className='text-lg font-bold text-blue-900'>₹{(dashData.netProfit || 0).toLocaleString()}</span>
            </div>
          </div>

          <div className='pt-2 border-t text-xs text-gray-500 flex justify-between'>
            <span>Razorpay Online: <strong>₹{(dashData.onlineRevenue || 0).toLocaleString()}</strong></span>
            <span>Cash at Reception: <strong>₹{(dashData.cashRevenue || 0).toLocaleString()}</strong></span>
          </div>
        </div>

        {/* Appointment Velocity (Daily, Weekly, Monthly) */}
        <div className='bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4'>
          <h2 className='text-base font-bold text-gray-900 flex items-center gap-2'>
            <Calendar className='w-5 h-5 text-primary' /> Appointment Velocity
          </h2>

          <div className='grid grid-cols-3 gap-3 text-center'>
            <div className='p-4 bg-gray-50 rounded-xl border border-gray-100'>
              <p className='text-2xl font-bold text-gray-900'>{dashData.dailyAppointments || 0}</p>
              <p className='text-xs font-medium text-gray-500 mt-1 uppercase'>Today</p>
            </div>
            <div className='p-4 bg-gray-50 rounded-xl border border-gray-100'>
              <p className='text-2xl font-bold text-gray-900'>{dashData.weeklyAppointments || 0}</p>
              <p className='text-xs font-medium text-gray-500 mt-1 uppercase'>Past 7 Days</p>
            </div>
            <div className='p-4 bg-gray-50 rounded-xl border border-gray-100'>
              <p className='text-2xl font-bold text-gray-900'>{dashData.monthlyAppointments || 0}</p>
              <p className='text-xs font-medium text-gray-500 mt-1 uppercase'>Past 30 Days</p>
            </div>
          </div>

          <div className='bg-blue-50 p-3.5 rounded-xl border border-blue-100 text-xs text-blue-800 space-y-1'>
            <p className='font-bold flex items-center gap-1.5'>
              <TrendingUp className='w-4 h-4' /> Patient Footfall Trends
            </p>
            <p>Average weekly load: ~{Math.round((dashData.weeklyAppointments || 1) / 7)} patients/day. Schedule distribution remains balanced across departments.</p>
          </div>
        </div>

        {/* AI Operational Insights */}
        <div className='bg-gradient-to-br from-indigo-900 to-primary text-white p-6 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between'>
          <div>
            <div className='flex items-center justify-between mb-3'>
              <h2 className='text-base font-bold flex items-center gap-2'>
                <BrainCircuit className='w-5 h-5 text-indigo-300' /> AI Operational Insights
              </h2>
              <span className='text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider'>
                Live Engine
              </span>
            </div>

            {dashData.aiInsights && (
              <div className='space-y-2.5 text-xs text-indigo-100'>
                <p>• Peak congestion slot: <strong className='text-white'>{dashData.aiInsights.peakCongestionSlot}</strong></p>
                <p>• Predicted tomorrow's footfall: <strong className='text-white'>{dashData.aiInsights.predictedFootfallTomorrow} patients</strong></p>
                <p>• Completion rate: <strong className='text-white'>{dashData.aiInsights.completionRate}</strong></p>
                {dashData.aiInsights.inventoryAlertsCount > 0 && (
                  <p className='text-amber-300 font-semibold'>
                    • ⚠ {dashData.aiInsights.inventoryAlertsCount} medicine(s) near reorder threshold.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className='pt-3 border-t border-white/10 text-[11px] text-indigo-200'>
            <p>Clinical AI Guardrail Active: All medical decisions and diagnosis require physician verification.</p>
          </div>
        </div>
      </div>

      {/* Latest Bookings List */}
      <div className='bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden'>
        <div className='flex items-center gap-2.5 px-6 py-4 border-b bg-gray-50/50'>
          <img src={assets.list_icon} alt="" className='w-5 h-5' />
          <h2 className='font-bold text-gray-900 text-sm'>Recent Appointment Bookings</h2>
        </div>

        <div className='divide-y divide-gray-100'>
          {dashData.latestAppointments.slice(0, 6).map((item, index) => (
            <div className='flex items-center px-6 py-3.5 gap-4 hover:bg-gray-50 transition' key={index}>
              <img className='rounded-full w-10 h-10 object-cover border' src={item.docData?.image} alt="" />
              <div className='flex-1 text-sm'>
                <p className='text-gray-900 font-semibold'>{item.docData?.name}</p>
                <p className='text-xs text-gray-500'>
                  Patient: {item.userData?.name} • Booking on {slotDateFormat(item.slotDate)}, {item.slotTime}
                </p>
              </div>

              <div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  item.cancelled ? 'bg-red-100 text-red-700' :
                  item.isCompleted ? 'bg-emerald-100 text-emerald-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {item.cancelled ? 'Cancelled' : item.isCompleted ? 'Completed' : 'Confirmed'}
                </span>
              </div>

              {!item.cancelled && !item.isCompleted && (
                <button
                  onClick={() => cancelAppointment(item._id)}
                  className='text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1'
                >
                  Cancel
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard

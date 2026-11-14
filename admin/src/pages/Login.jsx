import axios from 'axios'
import React, { useContext, useState } from 'react'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { ReceptionistContext } from '../context/ReceptionistContext'
import { toast } from 'react-toastify'
import { Shield, Stethoscope, UserCheck } from 'lucide-react'
import { assets } from '../assets/assets'

const Login = () => {
  const [state, setState] = useState('Admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000"

  const { setDToken } = useContext(DoctorContext)
  const { setAToken } = useContext(AdminContext)
  const { setRToken, setReceptionistUser } = useContext(ReceptionistContext)

  const quickFill = (role) => {
    setState(role)
    if (role === 'Admin') {
      setEmail('admin@appointy.com')
      setPassword('qwerty123')
    } else if (role === 'Doctor') {
      setEmail('richard@appointy.com')
      setPassword('doctor123')
    } else if (role === 'Receptionist') {
      setEmail('receptionist@appointy.com')
      setPassword('receptionist123')
    }
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault()

    try {
      if (state === 'Admin') {
        const { data } = await axios.post(backendUrl + '/api/admin/login', { email, password })
        if (data.success) {
          setAToken(data.token)
          localStorage.setItem('aToken', data.token)
          toast.success("Welcome Super Admin")
        } else {
          toast.error(data.message)
        }
      } else if (state === 'Doctor') {
        const { data } = await axios.post(backendUrl + '/api/doctor/login', { email, password })
        if (data.success) {
          setDToken(data.token)
          localStorage.setItem('dToken', data.token)
          toast.success("Welcome Doctor")
        } else {
          toast.error(data.message)
        }
      } else if (state === 'Receptionist') {
        const { data } = await axios.post(backendUrl + '/api/receptionist/login', { email, password })
        if (data.success) {
          setRToken(data.token)
          setReceptionistUser(data.user)
          localStorage.setItem('rToken', data.token)
          localStorage.setItem('receptionistUser', JSON.stringify(data.user))
          toast.success("Welcome Receptionist")
        } else {
          toast.error(data.message)
        }
      }
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || error.message)
    }
  }

  return (
    <div className='min-h-[85vh] flex flex-col justify-center items-center py-8 px-4'>
      <div className='bg-white shadow-xl border border-gray-100 rounded-2xl p-8 max-w-md w-full'>
        {/* Role Selector Tabs */}
        <div className='flex justify-center bg-gray-100 p-1 rounded-xl mb-6'>
          <button
            type="button"
            onClick={() => { setState('Admin'); setEmail(''); setPassword(''); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${state === 'Admin' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <Shield className='w-3.5 h-3.5' /> Admin
          </button>
          <button
            type="button"
            onClick={() => { setState('Doctor'); setEmail(''); setPassword(''); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${state === 'Doctor' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <Stethoscope className='w-3.5 h-3.5' /> Doctor
          </button>
          <button
            type="button"
            onClick={() => { setState('Receptionist'); setEmail(''); setPassword(''); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${state === 'Receptionist' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <UserCheck className='w-3.5 h-3.5' /> Receptionist
          </button>
        </div>

        <div className='text-center mb-6'>
          <img src={assets.admin_logo} alt='PrayashCare' className='w-48 h-auto mx-auto mb-4' />
          <h2 className='text-2xl font-bold text-gray-800 tracking-tight'>
            <span className='text-primary'>{state}</span> Portal
          </h2>
          <p className='text-xs text-gray-500 mt-1'>
            Hospital & Clinic Management System
          </p>
        </div>

        <form onSubmit={onSubmitHandler} className='space-y-4'>
          <div>
            <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Email Address</label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className='w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition'
              type="email"
              placeholder={`Enter ${state.toLowerCase()} email`}
              required
            />
          </div>

          <div>
            <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Password</label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className='w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition'
              type="password"
              placeholder="Enter password"
              required
            />
          </div>

          <button
            type="submit"
            className='w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-lg shadow-sm hover:shadow transition duration-150 text-sm'
          >
            Sign In to {state} Panel
          </button>
        </form>

        {/* Quick Fill Demo Credentials */}
        <div className='mt-6 pt-4 border-t border-gray-100 text-center'>
          <p className='text-xs text-gray-400 mb-2 font-medium'>Demo Credentials (Click to prefill):</p>
          <div className='flex flex-wrap gap-2 justify-center'>
            <button
              type="button"
              onClick={() => quickFill('Admin')}
              className='text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded border border-blue-200 hover:bg-blue-100 transition'
            >
              Admin Demo
            </button>
            <button
              type="button"
              onClick={() => quickFill('Doctor')}
              className='text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded border border-emerald-200 hover:bg-emerald-100 transition'
            >
              Doctor Demo
            </button>
            <button
              type="button"
              onClick={() => quickFill('Receptionist')}
              className='text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded border border-purple-200 hover:bg-purple-100 transition'
            >
              Receptionist Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

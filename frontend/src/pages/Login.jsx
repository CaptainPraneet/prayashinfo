import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Phone } from 'lucide-react'
import { assets } from '../assets/assets'

const Login = () => {
  const { backendUrl, token, setToken } = useContext(AppContext)
  const [state, setState] = useState('Login')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const quickFillPatient = () => {
    setState('Login')
    setEmail('aarav@example.com')
    setPassword('Password123')
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      if (state === 'Sign Up') {
        const { data } = await axios.post(backendUrl + '/api/user/register', { name, email, password, phone })

        if (data.success) {
          localStorage.setItem('token', data.token)
          setToken(data.token)
          toast.success("Account created successfully!")
        } else {
          toast.error(data.message)
        }
      } else {
        const { data } = await axios.post(backendUrl + '/api/user/login', { email, password })

        if (data.success) {
          localStorage.setItem('token', data.token)
          setToken(data.token)
          toast.success("Welcome back!")
        } else {
          toast.error(data.message)
        }
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      navigate('/my-appointments')
    }
  }, [token])

  return (
    <div className='min-h-[80vh] flex flex-col justify-center items-center py-10'>
      <div className='flex flex-col gap-4 items-start p-8 min-w-[340px] sm:min-w-96 border border-gray-200 rounded-3xl text-gray-700 text-sm shadow-xl bg-white'>
        <div className='w-full text-center mb-2'>
          <img src={assets.logo} alt="PrayashCare" className='w-48 h-auto mx-auto mb-4' />
          <h2 className='text-2xl font-bold text-gray-900'>{state === 'Sign Up' ? 'Create Patient Account' : 'Patient Sign In'}</h2>
          <p className='text-xs text-gray-500 mt-1'>
            {state === 'Sign Up' ? 'Register to book doctors, manage medical records, and download prescriptions.' : 'Log in to view your appointments and healthcare records.'}
          </p>
        </div>

        <form onSubmit={onSubmitHandler} className='w-full space-y-3'>
          {state === 'Sign Up' && (
            <div>
              <label className='block text-xs font-semibold uppercase text-gray-600 mb-1'>Full Name</label>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                className='border border-gray-300 rounded-xl w-full p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none'
                type="text"
                placeholder='Rahul Sharma'
                required
              />
            </div>
          )}

          {state === 'Sign Up' && (
            <div>
              <label className='block text-xs font-semibold uppercase text-gray-600 mb-1'>Phone Number</label>
              <input
                onChange={(e) => setPhone(e.target.value)}
                value={phone}
                className='border border-gray-300 rounded-xl w-full p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none'
                type="tel"
                placeholder='+91 98765 43210'
                required
              />
            </div>
          )}

          <div>
            <label className='block text-xs font-semibold uppercase text-gray-600 mb-1'>Email Address</label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className='border border-gray-300 rounded-xl w-full p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none'
              type="email"
              placeholder='patient@example.com'
              required
            />
          </div>

          <div>
            <label className='block text-xs font-semibold uppercase text-gray-600 mb-1'>Password</label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className='border border-gray-300 rounded-xl w-full p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none'
              type="password"
              placeholder='At least 8 characters'
              required
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            className='bg-primary hover:bg-primary/90 text-white w-full py-3 rounded-xl font-bold text-sm shadow-sm transition mt-2'
          >
            {loading ? 'Please wait...' : state === 'Sign Up' ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className='w-full text-center pt-2 text-xs'>
          {state === 'Sign Up' ? (
            <p>Already have an account? <span onClick={() => setState('Login')} className='text-primary underline cursor-pointer font-bold'>Log in here</span></p>
          ) : (
            <p>Don't have an account yet? <span onClick={() => setState('Sign Up')} className='text-primary underline cursor-pointer font-bold'>Register now</span></p>
          )}
        </div>

        {/* Demo Account Button */}
        <div className='w-full text-center pt-3 border-t border-gray-100'>
          <button
            type='button'
            onClick={quickFillPatient}
            className='text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 transition font-medium'
          >
            Prefill Demo Patient Credentials
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login

import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { ReceptionistContext } from '../context/ReceptionistContext'
import { useNavigate } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'

const Navbar = () => {
  const { dToken, setDToken } = useContext(DoctorContext)
  const { aToken, setAToken } = useContext(AdminContext)
  const { rToken, setRToken, setReceptionistUser } = useContext(ReceptionistContext)
  const navigate = useNavigate()
  const logout = () => {
    navigate('/')
    if (dToken) {
      setDToken('')
      localStorage.removeItem('dToken')
    }
    if (aToken) {
      setAToken('')
      localStorage.removeItem('aToken')
    }
    if (rToken) {
      setRToken('')
      setReceptionistUser(null)
      localStorage.removeItem('rToken')
      localStorage.removeItem('receptionistUser')
    }
  }

  const roleName = aToken ? 'Super Admin' : dToken ? 'Doctor' : rToken ? 'Receptionist' : 'Staff'

  return (
    <div className='flex justify-between items-center px-4 sm:px-8 py-3 border-b bg-white shadow-sm sticky top-0 z-40'>
      <div className='flex items-center gap-3 text-xs'>
        <img
          onClick={() => navigate('/')}
          className='w-32 sm:w-36 cursor-pointer'
          src={assets.admin_logo}
          alt="PrayashCare"
        />

        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20'>
          {roleName}
        </span>

        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noreferrer"
          className='hidden md:inline-flex items-center gap-1 text-xs text-gray-500 hover:text-primary transition font-medium px-2 py-1 rounded hover:bg-gray-50'
        >
          <span>Patient Portal</span>
          <ExternalLink className='w-3 h-3' />
        </a>
      </div>

      <div className='flex items-center gap-4'>
        <button
          onClick={logout}
          className='bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-medium px-6 sm:px-8 py-1.5 sm:py-2 rounded-full transition shadow-sm'
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default Navbar

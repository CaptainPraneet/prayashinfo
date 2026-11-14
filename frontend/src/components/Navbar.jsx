import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { NavLink, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { Sparkles, Shield, User, Calendar, FileText, ExternalLink } from 'lucide-react'
import AIAssistantModal from './AIAssistantModal'

const Navbar = () => {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const { token, setToken, userData } = useContext(AppContext)

  const logout = () => {
    localStorage.removeItem('token')
    setToken(false)
    navigate('/login')
  }

  return (
    <div className='flex items-center justify-between text-sm pt-2 pb-2 border-b border-gray-200 sticky top-0 bg-white/95 backdrop-blur-sm z-40'>
      <div className="w-24 sm:w-28 overflow-hidden cursor-pointer" onClick={() => navigate('/')}>
        <img
          src={assets.logo || '/fallback-logo.png'}
          alt="PrayashCare"
          className="w-full object-contain"
        />
      </div>

      <ul className='hidden md:flex items-center gap-6 font-semibold text-gray-700 text-xs uppercase tracking-wider'>
        <li>
          <NavLink to='/' className={({ isActive }) => isActive ? 'text-primary border-b-2 border-primary pb-1' : 'hover:text-primary transition'}>HOME</NavLink>
        </li>
        <li>
          <NavLink to='/doctors' className={({ isActive }) => isActive ? 'text-primary border-b-2 border-primary pb-1' : 'hover:text-primary transition'}>ALL DOCTORS</NavLink>
        </li>
        <li>
          <NavLink to='/about' className={({ isActive }) => isActive ? 'text-primary border-b-2 border-primary pb-1' : 'hover:text-primary transition'}>ABOUT</NavLink>
        </li>
        <li>
          <NavLink to='/contact' className={({ isActive }) => isActive ? 'text-primary border-b-2 border-primary pb-1' : 'hover:text-primary transition'}>CONTACT</NavLink>
        </li>
        {token && (
          <li>
            <NavLink to='/my-appointments' className={({ isActive }) => isActive ? 'text-primary border-b-2 border-primary pb-1' : 'hover:text-primary transition'}>MY HEALTH PORTAL</NavLink>
          </li>
        )}
      </ul>

      <div className='flex items-center gap-3'>
        {/* AI Assistant Button */}
        <button
          onClick={() => setAiModalOpen(true)}
          className='inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-full shadow-sm hover:shadow transition-all'
        >
          <Sparkles className='w-3.5 h-3.5 text-amber-300' />
          <span>AI Health Assistant</span>
        </button>

        {/* Provider Portal Shortcut */}
        <a
          href='http://localhost:5174'
          target='_blank'
          rel='noreferrer'
          className='hidden lg:inline-flex items-center gap-1 border border-gray-300 hover:border-gray-400 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-gray-50 transition'
          title='Doctor & Receptionist Portal'
        >
          <Shield className='w-3 h-3 text-primary' />
          <span>Staff Portal</span>
          <ExternalLink className='w-2.5 h-2.5 text-gray-400' />
        </a>

        {token && userData ? (
          <div className='flex items-center gap-2 cursor-pointer group relative'>
            <img className='w-10 h-10 rounded-full object-cover border-2 border-primary' src={userData.image || '/fallback-user.png'} alt="profile" />
            <img className='w-2.5' src={assets.dropdown_icon || '/fallback-icon.png'} alt="dropdown" />
            <div className='absolute top-0 right-0 pt-12 text-sm font-medium text-gray-700 z-50 hidden group-hover:block'>
              <div className='min-w-56 bg-white border border-gray-200 rounded-2xl shadow-xl flex flex-col p-2 space-y-1 animate-in fade-in'>
                <div className='p-2 border-b text-xs'>
                  <p className='font-bold text-gray-900'>{userData.name}</p>
                  <p className='text-gray-500 truncate'>{userData.email}</p>
                </div>
                <p onClick={() => navigate('/my-appointments')} className='hover:bg-primary/10 hover:text-primary px-3 py-2 rounded-xl cursor-pointer flex items-center gap-2'>
                  <Calendar className='w-4 h-4' /> Health Portal & Rx
                </p>
                <p onClick={() => navigate('/my-profile')} className='hover:bg-primary/10 hover:text-primary px-3 py-2 rounded-xl cursor-pointer flex items-center gap-2'>
                  <User className='w-4 h-4' /> My Profile & EMR
                </p>
                <p onClick={logout} className='hover:bg-red-50 text-red-600 px-3 py-2 rounded-xl cursor-pointer'>
                  Logout
                </p>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className='bg-primary text-white text-xs px-6 py-2 rounded-full font-semibold hover:bg-primary/90 transition shadow-sm hidden md:block'
          >
            Sign In / Register
          </button>
        )}

        <img onClick={() => setShowMenu(true)} className='w-6 md:hidden cursor-pointer' src={assets.menu_icon} alt="" />

        {/* Mobile Menu */}
        <div className={`md:hidden ${showMenu ? 'fixed w-full' : 'h-0 w-0'} right-0 top-0 bottom-0 z-50 overflow-hidden bg-white transition-all`}>
          <div className='flex items-center justify-between px-5 py-6 border-b'>
            <img src={assets.logo} className='w-28' alt="PrayashCare" />
            <img onClick={() => setShowMenu(false)} src={assets.cross_icon} className='w-6 cursor-pointer' alt="" />
          </div>
          <ul className='flex flex-col items-center gap-4 mt-6 px-5 text-base font-semibold'>
            <NavLink onClick={() => setShowMenu(false)} to='/'><p className='px-4 py-2 rounded-full'>HOME</p></NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/doctors'><p className='px-4 py-2 rounded-full'>ALL DOCTORS</p></NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/about'><p className='px-4 py-2 rounded-full'>ABOUT</p></NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/contact'><p className='px-4 py-2 rounded-full'>CONTACT</p></NavLink>
            {token ? (
              <>
                <NavLink onClick={() => setShowMenu(false)} to='/my-appointments'><p className='px-4 py-2 text-primary'>MY HEALTH PORTAL</p></NavLink>
                <NavLink onClick={() => setShowMenu(false)} to='/my-profile'><p className='px-4 py-2'>MY PROFILE</p></NavLink>
                <button onClick={logout} className='text-red-500 pt-2'>LOGOUT</button>
              </>
            ) : (
              <NavLink onClick={() => setShowMenu(false)} to='/login'><p className='px-6 py-2 bg-primary text-white rounded-full'>SIGN IN</p></NavLink>
            )}
          </ul>
        </div>
      </div>

      {/* AI Assistant Modal */}
      <AIAssistantModal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} />
    </div>
  )
}

export default Navbar

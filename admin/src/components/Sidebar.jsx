import React, { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { ReceptionistContext } from '../context/ReceptionistContext'
import { 
  LayoutDashboard, 
  Calendar, 
  UserPlus, 
  Users, 
  Building2, 
  Pill, 
  FlaskConical, 
  Receipt, 
  DollarSign, 
  FileText, 
  ShieldAlert, 
  UserCheck, 
  Search, 
  ClipboardList 
} from 'lucide-react'

const Sidebar = () => {
  const { dToken } = useContext(DoctorContext)
  const { aToken } = useContext(AdminContext)
  const { rToken } = useContext(ReceptionistContext)

  const navItemClass = ({ isActive }) => 
    `flex items-center gap-3 py-3 px-4 md:px-6 cursor-pointer text-sm font-medium transition-colors ${
      isActive 
        ? 'bg-[#F2F3FF] text-primary border-r-4 border-primary font-semibold' 
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`

  return (
    <div className='min-h-[calc(100vh-65px)] bg-white border-r w-16 md:w-64 flex-shrink-0 select-none'>
      <div className='flex justify-center border-b border-gray-100 py-4'>
        <NavLink to={aToken ? '/admin-dashboard' : dToken ? '/doctor-dashboard' : '/reception-queue'} aria-label='PrayashCare home'>
          <img src='/brand/logo-icon.svg' alt='PrayashCare' className='w-9 h-9 object-contain' />
        </NavLink>
      </div>
      {/* Super Admin Links */}
      {aToken && (
        <ul className='py-4 space-y-1'>
          <NavLink to={'/admin-dashboard'} className={navItemClass}>
            <LayoutDashboard className='w-5 h-5 flex-shrink-0' />
            <span className='hidden md:inline'>Dashboard</span>
          </NavLink>
          <NavLink to={'/all-appointments'} className={navItemClass}>
            <Calendar className='w-5 h-5 flex-shrink-0' />
            <span className='hidden md:inline'>Appointments</span>
          </NavLink>
          <NavLink to={'/doctor-list'} className={navItemClass}>
            <Users className='w-5 h-5 flex-shrink-0' />
            <span className='hidden md:inline'>Doctors</span>
          </NavLink>
          <NavLink to={'/add-doctor'} className={navItemClass}>
            <UserPlus className='w-5 h-5 flex-shrink-0' />
            <span className='hidden md:inline'>Add Doctor</span>
          </NavLink>
          <NavLink to={'/staff-management'} className={navItemClass}>
            <UserCheck className='w-5 h-5 flex-shrink-0' />
            <span className='hidden md:inline'>Staff & Roles</span>
          </NavLink>
          <NavLink to={'/branch-management'} className={navItemClass}>
            <Building2 className='w-5 h-5 flex-shrink-0' />
            <span className='hidden md:inline'>Clinic Branches</span>
          </NavLink>
          <NavLink to={'/pharmacy-inventory'} className={navItemClass}>
            <Pill className='w-5 h-5 flex-shrink-0' />
            <span className='hidden md:inline'>Pharmacy Stock</span>
          </NavLink>
          <NavLink to={'/laboratory-management'} className={navItemClass}>
            <FlaskConical className='w-5 h-5 flex-shrink-0' />
            <span className='hidden md:inline'>Laboratory</span>
          </NavLink>
          <NavLink to={'/billing-invoices'} className={navItemClass}>
            <Receipt className='w-5 h-5 flex-shrink-0' />
            <span className='hidden md:inline'>Billing & Invoices</span>
          </NavLink>
          <NavLink to={'/clinic-expenses'} className={navItemClass}>
            <DollarSign className='w-5 h-5 flex-shrink-0' />
            <span className='hidden md:inline'>Expenses</span>
          </NavLink>
          <NavLink to={'/audit-logs'} className={navItemClass}>
            <ShieldAlert className='w-5 h-5 flex-shrink-0' />
            <span className='hidden md:inline'>Audit Logs</span>
          </NavLink>
        </ul>
      )}

      {/* Doctor Links */}
      {dToken && (
        <ul className='py-4 space-y-1'>
          <NavLink to={'/doctor-dashboard'} className={navItemClass}>
            <LayoutDashboard className='w-5 h-5 flex-shrink-0' />
            <span className='hidden md:inline'>Dashboard</span>
          </NavLink>
          <NavLink to={'/doctor-appointments'} className={navItemClass}>
            <Calendar className='w-5 h-5 flex-shrink-0' />
            <span className='hidden md:inline'>Appointments & EMR</span>
          </NavLink>
          <NavLink to={'/doctor-profile'} className={navItemClass}>
            <Users className='w-5 h-5 flex-shrink-0' />
            <span className='hidden md:inline'>Availability & Profile</span>
          </NavLink>
        </ul>
      )}

      {/* Receptionist Links */}
      {rToken && (
        <ul className='py-4 space-y-1'>
          <NavLink to={'/reception-queue'} className={navItemClass}>
            <ClipboardList className='w-5 h-5 flex-shrink-0' />
            <span className='hidden md:inline'>Queue Management</span>
          </NavLink>
          <NavLink to={'/reception-register'} className={navItemClass}>
            <UserPlus className='w-5 h-5 flex-shrink-0' />
            <span className='hidden md:inline'>Patient Registration</span>
          </NavLink>
          <NavLink to={'/reception-search'} className={navItemClass}>
            <Search className='w-5 h-5 flex-shrink-0' />
            <span className='hidden md:inline'>Patient Search</span>
          </NavLink>
          <NavLink to={'/reception-appointments'} className={navItemClass}>
            <Calendar className='w-5 h-5 flex-shrink-0' />
            <span className='hidden md:inline'>Book Walk-in</span>
          </NavLink>
          <NavLink to={'/reception-billing'} className={navItemClass}>
            <Receipt className='w-5 h-5 flex-shrink-0' />
            <span className='hidden md:inline'>Billing & POS</span>
          </NavLink>
        </ul>
      )}
    </div>
  )
}

export default Sidebar

import React, { useContext, useEffect } from 'react'
import { DoctorContext } from './context/DoctorContext'
import { AdminContext } from './context/AdminContext'
import { ReceptionistContext } from './context/ReceptionistContext'
import { Route, Routes, Navigate, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'

// Admin Pages
import Dashboard from './pages/Admin/Dashboard'
import AllAppointments from './pages/Admin/AllAppointments'
import AddDoctor from './pages/Admin/AddDoctor'
import DoctorsList from './pages/Admin/DoctorsList'
import StaffManagement from './pages/Admin/StaffManagement'
import BranchManagement from './pages/Admin/BranchManagement'
import PharmacyInventory from './pages/Admin/PharmacyInventory'
import LaboratoryManagement from './pages/Admin/LaboratoryManagement'
import BillingInvoices from './pages/Admin/BillingInvoices'
import ClinicExpenses from './pages/Admin/ClinicExpenses'
import AuditLogs from './pages/Admin/AuditLogs'

// Doctor Pages
import DoctorAppointments from './pages/Doctor/DoctorAppointments'
import DoctorDashboard from './pages/Doctor/DoctorDashboard'
import DoctorProfile from './pages/Doctor/DoctorProfile'

// Receptionist Pages
import QueueManagement from './pages/Receptionist/QueueManagement'
import PatientRegistration from './pages/Receptionist/PatientRegistration'
import PatientSearch from './pages/Receptionist/PatientSearch'
import ReceptionAppointments from './pages/Receptionist/ReceptionAppointments'
import ReceptionBilling from './pages/Receptionist/ReceptionBilling'

import Login from './pages/Login'

const App = () => {
  const { dToken } = useContext(DoctorContext)
  const { aToken } = useContext(AdminContext)
  const { rToken } = useContext(ReceptionistContext)
  const location = useLocation()

  useEffect(() => {
    const title = location.pathname.startsWith('/doctor')
      ? 'Doctor Portal'
      : location.pathname.startsWith('/reception')
        ? 'Receptionist Dashboard'
        : location.pathname.startsWith('/admin')
          ? 'Admin Dashboard'
          : 'Staff Portal'
    document.title = `PrayashCare | ${title}`
  }, [location.pathname])

  // Redirect "/" to the proper dashboard
  if (location.pathname === '/') {
    if (aToken) return <Navigate to="/admin-dashboard" replace />
    if (dToken) return <Navigate to="/doctor-dashboard" replace />
    if (rToken) return <Navigate to="/reception-queue" replace />
  }

  // Super Admin layout and routes
  if (aToken) {
    return (
      <div className='bg-[#F8F9FD] min-h-screen'>
        <ToastContainer position="top-right" autoClose={3000} />
        <Navbar />
        <div className='flex items-start'>
          <Sidebar />
          <div className='flex-1 overflow-x-hidden min-h-[calc(100vh-65px)]'>
            <Routes>
              <Route path="/admin-dashboard" element={<Dashboard />} />
              <Route path="/all-appointments" element={<AllAppointments />} />
              <Route path="/add-doctor" element={<AddDoctor />} />
              <Route path="/doctor-list" element={<DoctorsList />} />
              <Route path="/staff-management" element={<StaffManagement />} />
              <Route path="/branch-management" element={<BranchManagement />} />
              <Route path="/pharmacy-inventory" element={<PharmacyInventory />} />
              <Route path="/laboratory-management" element={<LaboratoryManagement />} />
              <Route path="/billing-invoices" element={<BillingInvoices />} />
              <Route path="/clinic-expenses" element={<ClinicExpenses />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
              <Route path="*" element={<Navigate to="/admin-dashboard" />} />
            </Routes>
          </div>
        </div>
      </div>
    )
  }

  // Doctor layout and routes
  if (dToken) {
    return (
      <div className='bg-[#F8F9FD] min-h-screen'>
        <ToastContainer position="top-right" autoClose={3000} />
        <Navbar />
        <div className='flex items-start'>
          <Sidebar />
          <div className='flex-1 overflow-x-hidden min-h-[calc(100vh-65px)]'>
            <Routes>
              <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor-appointments" element={<DoctorAppointments />} />
              <Route path="/doctor-profile" element={<DoctorProfile />} />
              <Route path="*" element={<Navigate to="/doctor-dashboard" />} />
            </Routes>
          </div>
        </div>
      </div>
    )
  }

  // Receptionist layout and routes
  if (rToken) {
    return (
      <div className='bg-[#F8F9FD] min-h-screen'>
        <ToastContainer position="top-right" autoClose={3000} />
        <Navbar />
        <div className='flex items-start'>
          <Sidebar />
          <div className='flex-1 overflow-x-hidden min-h-[calc(100vh-65px)]'>
            <Routes>
              <Route path="/reception-queue" element={<QueueManagement />} />
              <Route path="/reception-register" element={<PatientRegistration />} />
              <Route path="/reception-search" element={<PatientSearch />} />
              <Route path="/reception-appointments" element={<ReceptionAppointments />} />
              <Route path="/reception-billing" element={<ReceptionBilling />} />
              <Route path="*" element={<Navigate to="/reception-queue" />} />
            </Routes>
          </div>
        </div>
      </div>
    )
  }

  // No one logged in
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}

export default App

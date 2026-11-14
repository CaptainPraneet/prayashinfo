import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { Receipt, Printer, DollarSign, Download, CreditCard } from 'lucide-react'
import { jsPDF } from 'jspdf'

const BillingInvoices = () => {
  const { allInvoices, getAllInvoices } = useContext(AdminContext)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    getAllInvoices()
  }, [])

  const printPDF = (inv) => {
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.setTextColor(37, 99, 235)
    doc.text("PRAYASHCARE", 20, 20)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text("Tax Invoice & Billing Statement", 20, 28)
    doc.text("GSTIN: 29AAAAA0000A1Z5 | HSN/SAC: 999312", 20, 34)

    doc.setDrawColor(200)
    doc.line(20, 38, 190, 38)

    doc.setFontSize(11)
    doc.setTextColor(50)
    doc.text(`Invoice No: ${inv.invoiceNumber}`, 20, 48)
    doc.text(`Date: ${new Date(inv.date || Date.now()).toLocaleDateString()}`, 130, 48)
    doc.text(`Patient: ${inv.patientName}`, 20, 56)
    doc.text(`Doctor: ${inv.doctorName || 'General Consultation'}`, 130, 56)
    doc.text(`Payment Method: ${inv.paymentMethod} (PAID)`, 20, 64)

    doc.line(20, 70, 190, 70)
    doc.setFontSize(10)
    doc.setFont(undefined, 'bold')
    doc.text("Item Description", 22, 76)
    doc.text("Qty", 120, 76)
    doc.text("Unit Price", 140, 76)
    doc.text("Total", 170, 76)
    doc.setFont(undefined, 'normal')

    let y = 86
    inv.items.forEach((item) => {
      doc.text(item.description, 22, y)
      doc.text(String(item.quantity), 122, y)
      doc.text(`₹${item.unitPrice}`, 142, y)
      doc.text(`₹${item.quantity * item.unitPrice}`, 172, y)
      y += 8
    })

    doc.line(20, y + 2, 190, y + 2)
    y += 10
    doc.text(`Subtotal: ₹${inv.subtotal}`, 140, y)
    y += 8
    doc.text(`GST (18%): ₹${inv.gstAmount}`, 140, y)
    y += 8
    doc.setFont(undefined, 'bold')
    doc.text(`Grand Total: ₹${inv.grandTotal}`, 140, y)

    doc.setFontSize(9)
    doc.setFont(undefined, 'normal')
    doc.text("Thank you for choosing PrayashCare. Official Hospital Invoice.", 20, y + 20)

    doc.save(`${inv.invoiceNumber}.pdf`)
  }

  const totalRevenue = allInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0)
  const totalGST = allInvoices.reduce((sum, inv) => sum + (inv.gstAmount || 0), 0)

  const filteredInvoices = allInvoices.filter(inv => 
    inv.invoiceNumber.toLowerCase().includes(filter.toLowerCase()) ||
    inv.patientName.toLowerCase().includes(filter.toLowerCase()) ||
    inv.paymentMethod.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div className='p-6 w-full max-w-7xl mx-auto'>
      <div className='flex flex-wrap items-center justify-between gap-4 mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Billing, Invoices & GST Tracking</h1>
          <p className='text-sm text-gray-500'>Complete financial audit of patient bills, GST collections, and payment gateways.</p>
        </div>

        <input
          type='text'
          placeholder='Filter invoices...'
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className='border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white'
        />
      </div>

      {/* Financial Summary KPI Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
        <div className='bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4'>
          <div className='p-3 bg-emerald-100 text-emerald-700 rounded-xl'>
            <DollarSign className='w-6 h-6' />
          </div>
          <div>
            <p className='text-xs font-semibold text-gray-500 uppercase'>Gross Billed Revenue</p>
            <p className='text-2xl font-extrabold text-gray-900 mt-1'>₹{totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        <div className='bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4'>
          <div className='p-3 bg-blue-100 text-blue-700 rounded-xl'>
            <Receipt className='w-6 h-6' />
          </div>
          <div>
            <p className='text-xs font-semibold text-gray-500 uppercase'>Total GST Collected (18%)</p>
            <p className='text-2xl font-extrabold text-gray-900 mt-1'>₹{totalGST.toLocaleString()}</p>
          </div>
        </div>

        <div className='bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4'>
          <div className='p-3 bg-purple-100 text-purple-700 rounded-xl'>
            <CreditCard className='w-6 h-6' />
          </div>
          <div>
            <p className='text-xs font-semibold text-gray-500 uppercase'>Total Invoices</p>
            <p className='text-2xl font-extrabold text-gray-900 mt-1'>{allInvoices.length}</p>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className='bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm'>
        <table className='min-w-full divide-y divide-gray-200 text-left text-sm'>
          <thead className='bg-gray-50 text-gray-500 font-semibold'>
            <tr>
              <th className='py-3.5 px-4'>Invoice Number</th>
              <th className='py-3.5 px-4'>Patient</th>
              <th className='py-3.5 px-4'>Date</th>
              <th className='py-3.5 px-4'>Method</th>
              <th className='py-3.5 px-4'>Subtotal</th>
              <th className='py-3.5 px-4'>GST (18%)</th>
              <th className='py-3.5 px-4'>Grand Total</th>
              <th className='py-3.5 px-4 text-right'>Receipt</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={8} className='py-8 text-center text-gray-400'>
                  No invoices found.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => (
                <tr key={inv._id} className='hover:bg-gray-50 transition'>
                  <td className='py-4 px-4 font-mono font-bold text-primary'>{inv.invoiceNumber}</td>
                  <td className='py-4 px-4'>
                    <p className='font-semibold text-gray-900'>{inv.patientName}</p>
                    <p className='text-xs text-gray-500'>{inv.doctorName}</p>
                  </td>
                  <td className='py-4 px-4 text-xs text-gray-600'>{new Date(inv.date).toLocaleDateString()}</td>
                  <td className='py-4 px-4'>
                    <span className='inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border'>
                      {inv.paymentMethod}
                    </span>
                  </td>
                  <td className='py-4 px-4 text-gray-600'>₹{inv.subtotal}</td>
                  <td className='py-4 px-4 text-gray-600'>₹{inv.gstAmount}</td>
                  <td className='py-4 px-4 font-bold text-gray-900'>₹{inv.grandTotal}</td>
                  <td className='py-4 px-4 text-right'>
                    <button
                      onClick={() => printPDF(inv)}
                      className='inline-flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-semibold transition'
                    >
                      <Printer className='w-3.5 h-3.5' /> PDF
                    </button>
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

export default BillingInvoices

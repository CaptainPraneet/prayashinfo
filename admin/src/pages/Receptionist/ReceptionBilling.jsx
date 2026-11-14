import React, { useContext, useEffect, useState } from 'react'
import { ReceptionistContext } from '../../context/ReceptionistContext'
import { useLocation } from 'react-router-dom'
import { Receipt, Plus, Trash2, Printer, CheckCircle } from 'lucide-react'
import { jsPDF } from 'jspdf'

const ReceptionBilling = () => {
  const { generateBill, invoices, getInvoices, patients, searchPatients } = useContext(ReceptionistContext)
  const location = useLocation()
  const prefilledPatient = location.state?.prefilledPatient

  const [patientId, setPatientId] = useState(prefilledPatient?._id || '')
  const [patientName, setPatientName] = useState(prefilledPatient?.name || '')
  const [doctorName, setDoctorName] = useState('Dr. Richard James')
  const [paymentMethod, setPaymentMethod] = useState('Cash')

  const [items, setItems] = useState([
    { description: 'OPD Doctor Consultation Fee', type: 'Consultation', quantity: 1, unitPrice: 500 }
  ])

  const [generatedInvoice, setGeneratedInvoice] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getInvoices()
    searchPatients('')
  }, [])

  const handlePatientSelect = (e) => {
    const id = e.target.value
    setPatientId(id)
    const selected = patients.find(p => p._id === id)
    if (selected) setPatientName(selected.name)
  }

  const addItem = () => {
    setItems([...items, { description: 'Generic Medicine / Service', type: 'Medicine', quantity: 1, unitPrice: 100 }])
  }

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index, field, value) => {
    const newItems = [...items]
    newItems[index][field] = field === 'quantity' || field === 'unitPrice' ? Number(value) : value
    setItems(newItems)
  }

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  const gstRate = 18
  const gstAmount = Math.round((subtotal * gstRate) / 100)
  const grandTotal = subtotal + gstAmount

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!patientName) {
      alert("Please enter or select a patient.")
      return
    }

    setSubmitting(true)
    const formattedItems = items.map(item => ({
      ...item,
      total: item.quantity * item.unitPrice
    }))

    const bill = await generateBill({
      patientId: patientId || 'Walk-in',
      patientName,
      doctorName,
      items: formattedItems,
      paymentMethod
    })
    setSubmitting(false)

    if (bill) {
      setGeneratedInvoice(bill)
    }
  }

  const printPDF = (inv) => {
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.setTextColor(37, 99, 235)
    doc.text("PRAYASHCARE", 20, 20)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text("Official Tax Invoice & Payment Receipt", 20, 28)
    doc.text("GSTIN: 29AAAAA0000A1Z5 | HSN/SAC: 999312", 20, 34)

    doc.setDrawColor(200)
    doc.line(20, 38, 190, 38)

    doc.setFontSize(11)
    doc.setTextColor(50)
    doc.text(`Invoice No: ${inv.invoiceNumber}`, 20, 48)
    doc.text(`Date: ${new Date(inv.date || Date.now()).toLocaleDateString()}`, 130, 48)
    doc.text(`Patient: ${inv.patientName}`, 20, 56)
    doc.text(`Doctor: ${inv.doctorName || 'General Consultation'}`, 130, 56)
    doc.text(`Payment Mode: ${inv.paymentMethod} (PAID)`, 20, 64)

    doc.line(20, 70, 190, 70)
    doc.setFontSize(10)
    doc.setFont(undefined, 'bold')
    doc.text("Item Description", 22, 76)
    doc.text("Qty", 120, 76)
    doc.text("Rate", 140, 76)
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
    doc.text("Thank you for choosing PrayashCare Clinic. Computer generated invoice.", 20, y + 20)

    doc.save(`${inv.invoiceNumber}.pdf`)
  }

  return (
    <div className='p-6 w-full max-w-7xl mx-auto'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Reception Billing & Point of Sale</h1>
        <p className='text-sm text-gray-500'>Generate instant GST invoices, collect fees, and print official receipts.</p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Form Panel */}
        <div className='lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm'>
          <h2 className='text-base font-bold text-gray-800 mb-4 pb-2 border-b flex items-center gap-2'>
            <Receipt className='w-5 h-5 text-primary' /> Create Invoice
          </h2>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Select Patient</label>
                <select
                  value={patientId}
                  onChange={handlePatientSelect}
                  className='w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white'
                >
                  <option value=''>-- Choose Existing Patient --</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>{p.name} ({p.phone})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Or Walk-in Patient Name</label>
                <input
                  type='text'
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder='Patient Name'
                  required
                  className='w-full border border-gray-300 rounded-lg p-2.5 text-sm'
                />
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Attending Doctor / Department</label>
                <input
                  type='text'
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className='w-full border border-gray-300 rounded-lg p-2.5 text-sm'
                />
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className='w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white'
                >
                  <option value='Cash'>Cash</option>
                  <option value='Razorpay'>Razorpay / UPI</option>
                  <option value='Card'>Credit / Debit Card</option>
                  <option value='Insurance'>Insurance Claim</option>
                </select>
              </div>
            </div>

            {/* Bill Line Items */}
            <div className='pt-4 border-t'>
              <div className='flex justify-between items-center mb-3'>
                <h3 className='text-sm font-bold text-gray-700 uppercase'>Invoice Items</h3>
                <button
                  type='button'
                  onClick={addItem}
                  className='text-xs text-primary hover:text-primary/80 font-bold flex items-center gap-1'
                >
                  <Plus className='w-4 h-4' /> Add Item
                </button>
              </div>

              <div className='space-y-2'>
                {items.map((item, idx) => (
                  <div key={idx} className='flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200'>
                    <input
                      type='text'
                      value={item.description}
                      onChange={(e) => updateItem(idx, 'description', e.target.value)}
                      placeholder='Description'
                      className='flex-1 border border-gray-300 rounded px-2.5 py-1 text-sm bg-white'
                      required
                    />
                    <select
                      value={item.type}
                      onChange={(e) => updateItem(idx, 'type', e.target.value)}
                      className='border border-gray-300 rounded px-2 py-1 text-xs bg-white'
                    >
                      <option value='Consultation'>Consultation</option>
                      <option value='Medicine'>Medicine</option>
                      <option value='Lab Test'>Lab Test</option>
                      <option value='Procedure'>Procedure</option>
                    </select>
                    <input
                      type='number'
                      min='1'
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                      className='w-16 border border-gray-300 rounded px-2 py-1 text-sm bg-white text-center'
                    />
                    <input
                      type='number'
                      min='0'
                      value={item.unitPrice}
                      onChange={(e) => updateItem(idx, 'unitPrice', e.target.value)}
                      className='w-24 border border-gray-300 rounded px-2 py-1 text-sm bg-white text-right'
                    />
                    {items.length > 1 && (
                      <button type='button' onClick={() => removeItem(idx)} className='text-red-500 hover:text-red-700 p-1'>
                        <Trash2 className='w-4 h-4' />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations Summary */}
            <div className='pt-4 border-t space-y-1.5 text-sm text-right'>
              <p className='text-gray-500'>Subtotal: <span className='font-bold text-gray-800'>₹{subtotal}</span></p>
              <p className='text-gray-500'>GST (18%): <span className='font-bold text-gray-800'>₹{gstAmount}</span></p>
              <p className='text-lg font-extrabold text-primary'>Grand Total: ₹{grandTotal}</p>
            </div>

            <div className='flex justify-end pt-3 border-t'>
              <button
                type='submit'
                disabled={submitting}
                className='bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-2.5 rounded-lg shadow-sm transition'
              >
                {submitting ? 'Processing...' : 'Complete Payment & Issue Invoice'}
              </button>
            </div>
          </form>

          {/* Quick Print Banner if invoice just created */}
          {generatedInvoice && (
            <div className='mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <CheckCircle className='w-6 h-6 text-emerald-600' />
                <div>
                  <p className='font-bold text-emerald-900'>Invoice {generatedInvoice.invoiceNumber} Generated</p>
                  <p className='text-xs text-emerald-700'>Payment of ₹{generatedInvoice.grandTotal} recorded via {generatedInvoice.paymentMethod}</p>
                </div>
              </div>
              <button
                onClick={() => printPDF(generatedInvoice)}
                className='inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm'
              >
                <Printer className='w-4 h-4' /> Print PDF Receipt
              </button>
            </div>
          )}
        </div>

        {/* Recent Invoices Panel */}
        <div className='bg-white border border-gray-200 rounded-2xl p-6 shadow-sm'>
          <h2 className='text-base font-bold text-gray-800 mb-4 pb-2 border-b'>Recent Invoices</h2>
          <div className='space-y-3 max-h-[500px] overflow-y-auto pr-1'>
            {invoices.length === 0 ? (
              <p className='text-gray-400 text-center py-6 text-sm'>No invoices generated yet.</p>
            ) : (
              invoices.map((inv) => (
                <div key={inv._id} className='p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition flex items-center justify-between'>
                  <div>
                    <p className='font-bold text-gray-900 text-sm'>{inv.invoiceNumber}</p>
                    <p className='text-xs text-gray-500'>{inv.patientName}</p>
                    <p className='text-[11px] text-gray-400'>{new Date(inv.date).toLocaleDateString()} • {inv.paymentMethod}</p>
                  </div>
                  <div className='text-right'>
                    <p className='font-bold text-primary text-sm'>₹{inv.grandTotal}</p>
                    <button
                      onClick={() => printPDF(inv)}
                      className='inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-primary mt-1 font-medium'
                    >
                      <Printer className='w-3 h-3' /> PDF
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReceptionBilling

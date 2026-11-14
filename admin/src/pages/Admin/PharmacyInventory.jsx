import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { Pill, AlertTriangle, Plus, ArrowUpRight, ArrowDownRight, Package } from 'lucide-react'

const PharmacyInventory = () => {
  const { 
    inventoryItems, 
    lowStockItems, 
    expiredItems, 
    getInventory, 
    addInventoryItem, 
    updateInventoryStock 
  } = useContext(AdminContext)

  const [showModal, setShowModal] = useState(false)
  const [stockModal, setStockModal] = useState({ show: false, item: null, type: 'add' })
  const [adjustmentQty, setAdjustmentQty] = useState(10)

  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    category: 'Antibiotics',
    batchNumber: '',
    manufacturer: '',
    stockQuantity: 100,
    reorderLevel: 25,
    unitPrice: 50,
    costPrice: 35,
    expiryDate: '2027-12-31',
    dosageForm: 'Tablet',
    strength: '500mg'
  })

  useEffect(() => {
    getInventory()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const success = await addInventoryItem(formData)
    if (success) {
      setShowModal(false)
      setFormData({
        name: '', genericName: '', category: 'Antibiotics', batchNumber: '', manufacturer: '',
        stockQuantity: 100, reorderLevel: 25, unitPrice: 50, costPrice: 35, expiryDate: '2027-12-31',
        dosageForm: 'Tablet', strength: '500mg'
      })
    }
  }

  const handleStockAdjust = async (e) => {
    e.preventDefault()
    if (!stockModal.item) return
    await updateInventoryStock(stockModal.item._id, adjustmentQty, stockModal.type)
    setStockModal({ show: false, item: null, type: 'add' })
    setAdjustmentQty(10)
  }

  return (
    <div className='p-6 w-full max-w-7xl mx-auto'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Pharmacy & Medicine Inventory</h1>
          <p className='text-sm text-gray-500'>Track pharmaceutical stock, manage purchase orders, batch expiry, and low-stock alerts.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className='inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition shadow-sm'
        >
          <Plus className='w-4 h-4' /> Add New Medicine
        </button>
      </div>

      {/* Alert Banners */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
        <div className='bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3'>
          <div className='p-3 bg-blue-100 text-blue-700 rounded-xl'>
            <Package className='w-6 h-6' />
          </div>
          <div>
            <p className='text-xs font-medium text-gray-500 uppercase'>Total Medicines</p>
            <p className='text-2xl font-bold text-gray-900'>{inventoryItems.length}</p>
          </div>
        </div>

        <div className='bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-sm flex items-center gap-3'>
          <div className='p-3 bg-amber-100 text-amber-700 rounded-xl'>
            <AlertTriangle className='w-6 h-6' />
          </div>
          <div>
            <p className='text-xs font-medium text-amber-700 uppercase'>Low Stock Warnings</p>
            <p className='text-2xl font-bold text-amber-900'>{lowStockItems.length}</p>
          </div>
        </div>

        <div className='bg-red-50 p-4 rounded-xl border border-red-200 shadow-sm flex items-center gap-3'>
          <div className='p-3 bg-red-100 text-red-700 rounded-xl'>
            <Pill className='w-6 h-6' />
          </div>
          <div>
            <p className='text-xs font-medium text-red-700 uppercase'>Expired / Near Expiry</p>
            <p className='text-2xl font-bold text-red-900'>{expiredItems.length}</p>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className='bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm'>
        <table className='min-w-full divide-y divide-gray-200 text-left text-sm'>
          <thead className='bg-gray-50 text-gray-500 font-semibold'>
            <tr>
              <th className='py-3.5 px-4'>Medicine & Generic</th>
              <th className='py-3.5 px-4'>Category</th>
              <th className='py-3.5 px-4'>Batch #</th>
              <th className='py-3.5 px-4'>In Stock</th>
              <th className='py-3.5 px-4'>Unit Price</th>
              <th className='py-3.5 px-4'>Expiry Date</th>
              <th className='py-3.5 px-4 text-right'>Stock Actions</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>
            {inventoryItems.length === 0 ? (
              <tr>
                <td colSpan={7} className='py-8 text-center text-gray-400'>
                  No medicines found in pharmacy inventory.
                </td>
              </tr>
            ) : (
              inventoryItems.map((item) => (
                <tr key={item._id} className='hover:bg-gray-50 transition'>
                  <td className='py-4 px-4'>
                    <p className='font-bold text-gray-900'>{item.name}</p>
                    <p className='text-xs text-gray-500'>{item.genericName || 'Generic'} • {item.dosageForm} ({item.strength})</p>
                  </td>
                  <td className='py-4 px-4'>
                    <span className='inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border'>
                      {item.category}
                    </span>
                  </td>
                  <td className='py-4 px-4 font-mono text-xs text-gray-600'>{item.batchNumber}</td>
                  <td className='py-4 px-4'>
                    <span className={`font-bold ${item.stockQuantity <= item.reorderLevel ? 'text-red-600' : 'text-emerald-700'}`}>
                      {item.stockQuantity} units
                    </span>
                    {item.stockQuantity <= item.reorderLevel && (
                      <span className='block text-[10px] text-red-500 font-semibold'>Reorder soon</span>
                    )}
                  </td>
                  <td className='py-4 px-4 font-semibold text-gray-800'>₹{item.unitPrice}</td>
                  <td className='py-4 px-4 text-xs text-gray-600'>{item.expiryDate}</td>
                  <td className='py-4 px-4 text-right space-x-1.5'>
                    <button
                      onClick={() => setStockModal({ show: true, item, type: 'add' })}
                      className='inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2.5 py-1 rounded-lg text-xs font-semibold'
                    >
                      <ArrowUpRight className='w-3.5 h-3.5' /> In
                    </button>
                    <button
                      onClick={() => setStockModal({ show: true, item, type: 'subtract' })}
                      className='inline-flex items-center gap-0.5 bg-amber-50 text-amber-700 hover:bg-amber-100 px-2.5 py-1 rounded-lg text-xs font-semibold'
                    >
                      <ArrowDownRight className='w-3.5 h-3.5' /> Out
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Medicine Modal */}
      {showModal && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100'>
            <div className='flex justify-between items-center mb-4 pb-2 border-b'>
              <h3 className='font-bold text-gray-900 flex items-center gap-2'>
                <Pill className='w-5 h-5 text-primary' /> Add Pharmacy Medicine
              </h3>
              <button onClick={() => setShowModal(false)} className='text-gray-400 hover:text-gray-600 font-bold'>✕</button>
            </div>

            <form onSubmit={handleSubmit} className='space-y-3.5'>
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Brand Name *</label>
                  <input
                    type='text'
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder='e.g. Paracetamol 650'
                    required
                    className='w-full border border-gray-300 rounded-lg p-2 text-sm'
                  />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Generic Name</label>
                  <input
                    type='text'
                    value={formData.genericName}
                    onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                    placeholder='e.g. Acetaminophen'
                    className='w-full border border-gray-300 rounded-lg p-2 text-sm'
                  />
                </div>
              </div>

              <div className='grid grid-cols-3 gap-2'>
                <div>
                  <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Category</label>
                  <input
                    type='text'
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className='w-full border border-gray-300 rounded-lg p-2 text-sm'
                  />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Dosage Form</label>
                  <select
                    value={formData.dosageForm}
                    onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
                    className='w-full border border-gray-300 rounded-lg p-2 text-sm bg-white'
                  >
                    <option value='Tablet'>Tablet</option>
                    <option value='Capsule'>Capsule</option>
                    <option value='Syrup'>Syrup</option>
                    <option value='Injection'>Injection</option>
                    <option value='Ointment'>Ointment</option>
                  </select>
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Strength</label>
                  <input
                    type='text'
                    value={formData.strength}
                    onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                    placeholder='500mg'
                    className='w-full border border-gray-300 rounded-lg p-2 text-sm'
                  />
                </div>
              </div>

              <div className='grid grid-cols-3 gap-2'>
                <div>
                  <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Batch # *</label>
                  <input
                    type='text'
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                    placeholder='BAT-01'
                    required
                    className='w-full border border-gray-300 rounded-lg p-2 text-sm'
                  />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Stock Qty *</label>
                  <input
                    type='number'
                    min='0'
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                    required
                    className='w-full border border-gray-300 rounded-lg p-2 text-sm'
                  />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Reorder Level</label>
                  <input
                    type='number'
                    min='0'
                    value={formData.reorderLevel}
                    onChange={(e) => setFormData({ ...formData, reorderLevel: Number(e.target.value) })}
                    className='w-full border border-gray-300 rounded-lg p-2 text-sm'
                  />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Unit Price (₹) *</label>
                  <input
                    type='number'
                    min='0'
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                    required
                    className='w-full border border-gray-300 rounded-lg p-2 text-sm'
                  />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Expiry Date *</label>
                  <input
                    type='date'
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    required
                    className='w-full border border-gray-300 rounded-lg p-2 text-sm'
                  />
                </div>
              </div>

              <div className='flex justify-end gap-3 pt-3 border-t'>
                <button
                  type='button'
                  onClick={() => setShowModal(false)}
                  className='px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg font-medium'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='px-6 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90'
                >
                  Add Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {stockModal.show && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-100'>
            <h3 className='font-bold text-gray-900 mb-2'>
              {stockModal.type === 'add' ? 'Stock In (+)' : 'Dispense Stock (-)'}
            </h3>
            <p className='text-xs text-gray-500 mb-4'>
              Medicine: <strong>{stockModal.item?.name}</strong> (Current: {stockModal.item?.stockQuantity} units)
            </p>

            <form onSubmit={handleStockAdjust} className='space-y-4'>
              <div>
                <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>Quantity to adjust</label>
                <input
                  type='number'
                  min='1'
                  value={adjustmentQty}
                  onChange={(e) => setAdjustmentQty(Number(e.target.value))}
                  required
                  className='w-full border border-gray-300 rounded-lg p-2.5 text-sm text-center font-bold text-lg'
                />
              </div>

              <div className='flex justify-end gap-2 pt-2'>
                <button
                  type='button'
                  onClick={() => setStockModal({ show: false, item: null, type: 'add' })}
                  className='px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='px-5 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90'
                >
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PharmacyInventory

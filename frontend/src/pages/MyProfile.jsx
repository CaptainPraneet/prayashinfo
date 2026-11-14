import React, { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import { User, Phone, Shield, Activity, AlertCircle } from 'lucide-react'

const MyProfile = () => {
    const [isEdit, setIsEdit] = useState(false)
    const [image, setImage] = useState(false)

    const { token, backendUrl, userData, setUserData, loadUserProfileData } = useContext(AppContext)

    const updateUserProfileData = async () => {
        try {
            const formData = new FormData()
            formData.append('name', userData.name)
            formData.append('phone', userData.phone)
            formData.append('address', JSON.stringify(userData.address))
            formData.append('gender', userData.gender)
            formData.append('dob', userData.dob)
            formData.append('bloodGroup', userData.bloodGroup || 'Not Specified')
            formData.append('emergencyContact', JSON.stringify(userData.emergencyContact || {}))
            formData.append('medicalHistory', JSON.stringify(userData.medicalHistory || {}))
            formData.append('insurance', JSON.stringify(userData.insurance || {}))

            if (image) {
                formData.append('image', image)
            }

            const { data } = await axios.post(
                backendUrl + '/api/user/update-profile',
                formData,
                { headers: { token } }
            )

            if (data.success) {
                toast.success(data.message)
                await loadUserProfileData()
                setIsEdit(false)
                setImage(false)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error(error)
            toast.error(error.message)
        }
    }

    return userData ? (
        <div className='max-w-2xl py-8 space-y-6'>
            <div>
                <h1 className='text-2xl font-bold text-gray-900'>Patient Profile & Medical History</h1>
                <p className='text-xs text-gray-500'>Keep your contact, emergency, and clinical information up to date.</p>
            </div>

            {/* Profile Avatar & Name */}
            <div className='flex items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm'>
                {isEdit ? (
                    <label htmlFor='image' className='cursor-pointer relative'>
                        <img 
                            className='w-24 h-24 rounded-full object-cover border-2 border-primary' 
                            src={image ? URL.createObjectURL(image) : userData.image} 
                            alt="" 
                        />
                        <span className='absolute bottom-0 right-0 bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold'>
                            Change
                        </span>
                        <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden />
                    </label>
                ) : (
                    <img className='w-24 h-24 rounded-full object-cover border border-gray-200' src={userData.image} alt="" />
                )}

                <div className='space-y-1 flex-1'>
                    {isEdit ? (
                        <input
                            className='border border-gray-300 rounded-lg px-3 py-1.5 text-lg font-bold w-full'
                            type="text"
                            onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                            value={userData.name}
                        />
                    ) : (
                        <h2 className='text-xl font-bold text-gray-900'>{userData.name}</h2>
                    )}
                    <p className='text-xs text-gray-500'>{userData.email}</p>
                    <span className='inline-block bg-primary/10 text-primary text-[11px] font-bold px-2.5 py-0.5 rounded-full'>
                        Registered Patient
                    </span>
                </div>
            </div>

            {/* Contact & Demographics */}
            <div className='bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4'>
                <h3 className='text-xs font-bold text-gray-700 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5'>
                    <User className='w-4 h-4 text-primary' /> Basic Demographics & Contact
                </h3>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs'>
                    <div>
                        <label className='font-semibold text-gray-500 uppercase'>Phone Number</label>
                        {isEdit ? (
                            <input
                                className='w-full border rounded-lg p-2 mt-1'
                                type="text"
                                onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))}
                                value={userData.phone}
                            />
                        ) : (
                            <p className='text-gray-900 font-semibold mt-1'>{userData.phone}</p>
                        )}
                    </div>

                    <div>
                        <label className='font-semibold text-gray-500 uppercase'>Blood Group</label>
                        {isEdit ? (
                            <select
                                className='w-full border rounded-lg p-2 mt-1 bg-white'
                                value={userData.bloodGroup || 'Not Specified'}
                                onChange={(e) => setUserData(prev => ({ ...prev, bloodGroup: e.target.value }))}
                            >
                                <option value="Not Specified">Not Specified</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                            </select>
                        ) : (
                            <p className='text-gray-900 font-semibold mt-1'>{userData.bloodGroup || 'Not Specified'}</p>
                        )}
                    </div>

                    <div>
                        <label className='font-semibold text-gray-500 uppercase'>Gender</label>
                        {isEdit ? (
                            <select
                                className='w-full border rounded-lg p-2 mt-1 bg-white'
                                onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))}
                                value={userData.gender}
                            >
                                <option value="Not Selected">Not Selected</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        ) : (
                            <p className='text-gray-900 font-semibold mt-1'>{userData.gender}</p>
                        )}
                    </div>

                    <div>
                        <label className='font-semibold text-gray-500 uppercase'>Date of Birth</label>
                        {isEdit ? (
                            <input
                                className='w-full border rounded-lg p-2 mt-1'
                                type='date'
                                onChange={(e) => setUserData(prev => ({ ...prev, dob: e.target.value }))}
                                value={userData.dob}
                            />
                        ) : (
                            <p className='text-gray-900 font-semibold mt-1'>{userData.dob || 'Not Selected'}</p>
                        )}
                    </div>
                </div>

                <div>
                    <label className='font-semibold text-gray-500 uppercase text-xs'>Address</label>
                    {isEdit ? (
                        <div className='space-y-1.5 mt-1'>
                            <input
                                className='w-full border rounded-lg p-2 text-xs'
                                type="text"
                                placeholder='Address Line 1'
                                onChange={(e) => setUserData(prev => ({
                                    ...prev,
                                    address: { ...(prev.address || {}), line1: e.target.value }
                                }))}
                                value={userData.address?.line1 || ''}
                            />
                            <input
                                className='w-full border rounded-lg p-2 text-xs'
                                type="text"
                                placeholder='Address Line 2 (City, Pincode)'
                                onChange={(e) => setUserData(prev => ({
                                    ...prev,
                                    address: { ...(prev.address || {}), line2: e.target.value }
                                }))}
                                value={userData.address?.line2 || ''}
                            />
                        </div>
                    ) : (
                        <p className='text-gray-900 font-medium text-xs mt-1'>
                            {userData.address?.line1 || 'No address set'} {userData.address?.line2 && `, ${userData.address?.line2}`}
                        </p>
                    )}
                </div>
            </div>

            {/* Emergency Contact & Insurance */}
            <div className='bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4'>
                <h3 className='text-xs font-bold text-gray-700 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5'>
                    <Phone className='w-4 h-4 text-primary' /> Emergency Contact & Insurance
                </h3>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs'>
                    <div>
                        <label className='font-semibold text-gray-500 uppercase'>Emergency Contact Name</label>
                        {isEdit ? (
                            <input
                                className='w-full border rounded-lg p-2 mt-1'
                                type="text"
                                placeholder='Relative / Guardian name'
                                onChange={(e) => setUserData(prev => ({
                                    ...prev,
                                    emergencyContact: { ...(prev.emergencyContact || {}), name: e.target.value }
                                }))}
                                value={userData.emergencyContact?.name || ''}
                            />
                        ) : (
                            <p className='text-gray-900 font-semibold mt-1'>{userData.emergencyContact?.name || 'None'}</p>
                        )}
                    </div>

                    <div>
                        <label className='font-semibold text-gray-500 uppercase'>Emergency Phone</label>
                        {isEdit ? (
                            <input
                                className='w-full border rounded-lg p-2 mt-1'
                                type="tel"
                                placeholder='+91...'
                                onChange={(e) => setUserData(prev => ({
                                    ...prev,
                                    emergencyContact: { ...(prev.emergencyContact || {}), phone: e.target.value }
                                }))}
                                value={userData.emergencyContact?.phone || ''}
                            />
                        ) : (
                            <p className='text-gray-900 font-semibold mt-1'>{userData.emergencyContact?.phone || 'None'}</p>
                        )}
                    </div>

                    <div>
                        <label className='font-semibold text-gray-500 uppercase'>Insurance Provider</label>
                        {isEdit ? (
                            <input
                                className='w-full border rounded-lg p-2 mt-1'
                                type="text"
                                placeholder='e.g. Star Health / Max Bupa'
                                onChange={(e) => setUserData(prev => ({
                                    ...prev,
                                    insurance: { ...(prev.insurance || {}), provider: e.target.value }
                                }))}
                                value={userData.insurance?.provider || ''}
                            />
                        ) : (
                            <p className='text-gray-900 font-semibold mt-1'>{userData.insurance?.provider || 'None'}</p>
                        )}
                    </div>

                    <div>
                        <label className='font-semibold text-gray-500 uppercase'>Policy Number</label>
                        {isEdit ? (
                            <input
                                className='w-full border rounded-lg p-2 mt-1'
                                type="text"
                                placeholder='e.g. POL-992384'
                                onChange={(e) => setUserData(prev => ({
                                    ...prev,
                                    insurance: { ...(prev.insurance || {}), policyNumber: e.target.value }
                                }))}
                                value={userData.insurance?.policyNumber || ''}
                            />
                        ) : (
                            <p className='text-gray-900 font-semibold mt-1'>{userData.insurance?.policyNumber || 'None'}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Medical History */}
            <div className='bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4'>
                <h3 className='text-xs font-bold text-gray-700 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5'>
                    <Activity className='w-4 h-4 text-primary' /> Medical History & Allergies
                </h3>

                <div className='space-y-3 text-xs'>
                    <div>
                        <label className='font-semibold text-gray-500 uppercase'>Allergies (comma separated)</label>
                        {isEdit ? (
                            <input
                                className='w-full border rounded-lg p-2 mt-1'
                                type="text"
                                placeholder='e.g. Penicillin, Peanuts, Dust'
                                onChange={(e) => setUserData(prev => ({
                                    ...prev,
                                    medicalHistory: {
                                        ...(prev.medicalHistory || {}),
                                        allergies: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                    }
                                }))}
                                value={userData.medicalHistory?.allergies?.join(', ') || ''}
                            />
                        ) : (
                            <p className='text-gray-800 mt-1 font-medium'>
                                {userData.medicalHistory?.allergies?.length > 0 ? userData.medicalHistory.allergies.join(', ') : 'None reported'}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className='font-semibold text-gray-500 uppercase'>Chronic Conditions (comma separated)</label>
                        {isEdit ? (
                            <input
                                className='w-full border rounded-lg p-2 mt-1'
                                type="text"
                                placeholder='e.g. Type 2 Diabetes, Hypertension'
                                onChange={(e) => setUserData(prev => ({
                                    ...prev,
                                    medicalHistory: {
                                        ...(prev.medicalHistory || {}),
                                        chronicConditions: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                    }
                                }))}
                                value={userData.medicalHistory?.chronicConditions?.join(', ') || ''}
                            />
                        ) : (
                            <p className='text-gray-800 mt-1 font-medium'>
                                {userData.medicalHistory?.chronicConditions?.length > 0 ? userData.medicalHistory.chronicConditions.join(', ') : 'None reported'}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Save / Edit Buttons */}
            <div>
                {isEdit ? (
                    <div className='flex gap-3'>
                        <button
                            onClick={updateUserProfileData}
                            className='bg-primary text-white font-bold px-8 py-2.5 rounded-xl hover:bg-primary/90 transition shadow-sm'
                        >
                            Save Profile & Medical Records
                        </button>
                        <button
                            onClick={() => setIsEdit(false)}
                            className='border border-gray-300 text-gray-700 font-medium px-6 py-2.5 rounded-xl hover:bg-gray-50 transition'
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsEdit(true)}
                        className='bg-primary text-white font-bold px-8 py-2.5 rounded-xl hover:bg-primary/90 transition shadow-sm'
                    >
                        Edit Profile
                    </button>
                )}
            </div>
        </div>
    ) : null
}

export default MyProfile

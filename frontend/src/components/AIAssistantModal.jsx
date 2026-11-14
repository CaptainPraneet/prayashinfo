import React, { useState, useContext, useEffect } from 'react'
import { createPortal } from 'react-dom'
import axios from 'axios'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { BrainCircuit, AlertTriangle, ArrowRight, Sparkles, X } from 'lucide-react'

const AIAssistantModal = ({ isOpen, onClose }) => {
  const { backendUrl } = useContext(AppContext)
  const navigate = useNavigate()

  const [symptoms, setSymptoms] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (!isOpen) return undefined

    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleAnalyze = async (e) => {
    e.preventDefault()
    if (!symptoms.trim()) return

    setLoading(true)
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/ai-symptom-check`, { symptoms })
      if (data.success) {
        setResult(data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectDoctor = (docId) => {
    onClose()
    navigate(`/appointment/${docId}`)
  }

  return createPortal(
    <div
      className='fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-3 sm:p-4'
      onClick={onClose}
    >
      <div
        role='dialog'
        aria-modal='true'
        aria-labelledby='ai-assistant-title'
        onClick={(event) => event.stopPropagation()}
        className='bg-white rounded-3xl w-full max-w-[760px] shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden'
        style={{ maxHeight: '90dvh' }}
      >
        {/* Header */}
        <div className='flex items-center justify-between gap-3 p-4 sm:p-6 border-b border-gray-100 flex-shrink-0'>
          <div className='flex items-center gap-2 min-w-0'>
            <div className='p-2 bg-primary/10 text-primary rounded-xl'>
              <Sparkles className='w-5 h-5 text-primary' />
            </div>
            <div className='min-w-0'>
              <h2 id='ai-assistant-title' className='text-lg font-bold text-gray-900'>AI Health Assistant</h2>
              <p className='text-xs text-gray-500'>Symptom Analysis & Specialist Matching</p>
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            aria-label='Close AI Health Assistant'
            className='w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
          >
            <X className='w-5 h-5' aria-hidden='true' />
          </button>
        </div>

        <div className='min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6'>
          {/* Input Form */}
          <form onSubmit={handleAnalyze} className='space-y-3 mb-4'>
            <div>
              <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>
                Describe your symptoms or discomfort
              </label>
              <textarea
                rows={3}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder='e.g. Sharp pain in lower abdomen after eating, along with mild nausea since yesterday...'
                className='w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none'
                required
              />
            </div>

            <div className='flex flex-wrap items-center justify-between gap-3'>
              <span className='flex-1 min-w-[180px] text-[11px] text-gray-400'>
                AI assists with triage; doctor verification is always required.
              </span>
              <button
                type='submit'
                disabled={loading}
                className='inline-flex flex-shrink-0 items-center gap-1.5 bg-primary hover:bg-primary/90 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition'
              >
                <BrainCircuit className='w-4 h-4' />
                {loading ? 'Analyzing...' : 'Find Specialist'}
              </button>
            </div>
          </form>

          {/* Results Card */}
          {result && (
            <div className='space-y-4 pt-3 border-t'>
              <div className='bg-blue-50 border border-blue-200 rounded-2xl p-4'>
                <div className='flex flex-wrap items-center justify-between gap-2 mb-2'>
                  <span className='text-xs font-bold uppercase tracking-wider text-blue-700'>
                    Recommended Specialty
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    result.urgency === 'Urgent' ? 'bg-red-100 text-red-700 border border-red-200' :
                    result.urgency === 'Medium' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                    'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}>
                    Triage: {result.urgency}
                  </span>
                </div>
                <h3 className='text-xl font-bold text-gray-900 break-words'>{result.speciality}</h3>
                <p className='text-xs text-gray-600 mt-1 break-words'>{result.clinicalReasoning}</p>
              </div>

              {/* Warning / Advice */}
              <div className='flex items-start gap-2 bg-amber-50 text-amber-800 text-xs p-3 rounded-xl border border-amber-200'>
                <AlertTriangle className='w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5' />
                <p className='break-words'>{result.triageAdvice}</p>
              </div>

              {/* Matching Doctors */}
              {result.recommendedDoctors && result.recommendedDoctors.length > 0 && (
                <div>
                  <h4 className='text-xs font-bold uppercase text-gray-700 mb-2'>
                    Available {result.speciality} Doctors
                  </h4>
                  <div className='space-y-2'>
                    {result.recommendedDoctors.map((doc) => (
                      <button
                        type='button'
                        key={doc._id}
                        onClick={() => handleSelectDoctor(doc._id)}
                        className='w-full p-3 border border-gray-200 rounded-xl hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer transition flex items-center justify-between gap-3 text-left'
                      >
                        <div className='flex min-w-0 items-center gap-3'>
                          <img src={doc.image} className='w-10 h-10 flex-shrink-0 rounded-full object-cover border' alt="" />
                          <div className='min-w-0'>
                            <p className='font-bold text-gray-900 text-sm break-words'>{doc.name}</p>
                            <p className='text-xs text-gray-500 break-words'>{doc.degree} • Experience: {doc.experience}</p>
                          </div>
                        </div>
                        <span className='inline-flex flex-shrink-0 items-center gap-1 text-xs text-primary font-bold'>
                          Book Now <ArrowRight className='w-3 h-3' />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default AIAssistantModal

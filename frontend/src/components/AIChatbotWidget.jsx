import React, { useState, useContext, useRef, useEffect } from 'react'
import axios from 'axios'
import { AppContext } from '../context/AppContext'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'

const AIChatbotWidget = () => {
  const { backendUrl } = useContext(AppContext)
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am your PrayashCare Healthcare Assistant. How can I help you today with clinic timings, appointments, lab test preparation, or doctor specialties?'
    }
  ])

  const chatEndRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }])
    setLoading(true)

    try {
      const { data } = await axios.post(`${backendUrl}/api/user/ai-chat`, { message: userMsg })
      if (data.success) {
        setMessages((prev) => [...prev, { sender: 'bot', text: data.reply }])
      } else {
        setMessages((prev) => [...prev, { sender: 'bot', text: 'Sorry, I encountered an issue. Please try again.' }])
      }
    } catch {
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Unable to reach healthcare assistant right now.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='fixed bottom-6 right-6 z-50'>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className='bg-primary hover:bg-primary/90 text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110'
          title='Chat with PrayashCare AI'
        >
          <MessageCircle className='w-6 h-6' />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className='bg-white rounded-3xl shadow-2xl border border-gray-200 w-80 sm:w-96 flex flex-col h-[480px] overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200'>
          {/* Header */}
          <div className='bg-primary text-white p-4 flex items-center justify-between'>
            <div className='flex items-center gap-2.5'>
              <div className='p-1.5 bg-white/20 rounded-xl'>
                <Bot className='w-5 h-5' />
              </div>
              <div>
                <h3 className='font-bold text-sm'>PrayashCare AI Assistant</h3>
                <p className='text-[10px] text-white/80'>24/7 Patient Helpdesk</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className='text-white/80 hover:text-white p-1'
            >
              <X className='w-5 h-5' />
            </button>
          </div>

          {/* Messages Area */}
          <div className='flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/50 text-xs'>
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className='w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5'>
                    <Bot className='w-3.5 h-3.5' />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl max-w-[80%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-primary text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className='flex gap-2 items-center text-gray-400 text-xs'>
                <Bot className='w-4 h-4 text-primary animate-bounce' />
                <span>Typing...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick FAQ Suggestion Pills */}
          <div className='px-3 py-2 bg-white border-t flex gap-1.5 overflow-x-auto text-[10px]'>
            <button
              onClick={() => setInput('What are your clinic hours?')}
              className='bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-full whitespace-nowrap text-gray-700'
            >
              Clinic hours
            </button>
            <button
              onClick={() => setInput('Do I need to fast before a blood test?')}
              className='bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-full whitespace-nowrap text-gray-700'
            >
              Blood test fasting
            </button>
            <button
              onClick={() => setInput('How does video consultation work?')}
              className='bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-full whitespace-nowrap text-gray-700'
            >
              Video call info
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className='p-2.5 bg-white border-t flex items-center gap-2'>
            <input
              type='text'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Ask a healthcare question...'
              className='flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary'
            />
            <button
              type='submit'
              disabled={loading}
              className='bg-primary text-white p-2 rounded-xl hover:bg-primary/90 transition shadow-sm'
            >
              <Send className='w-4 h-4' />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default AIChatbotWidget

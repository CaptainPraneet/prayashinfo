import React, { useEffect, useRef, useState } from 'react'
import io from 'socket.io-client'
import { Video, VideoOff, Mic, MicOff, PhoneOff } from 'lucide-react'

const VideoConsultationModal = ({ roomId, userName, role, onClose }) => {
  const [localStream, setLocalStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [micEnabled, setMicEnabled] = useState(true)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [callStatus, setCallStatus] = useState('Connecting to signaling server...')

  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const peerConnectionRef = useRef(null)
  const socketRef = useRef(null)

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

  useEffect(() => {
    let streamInstance = null

    const initCall = async () => {
      try {
        socketRef.current = io(backendUrl)

        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        })
        peerConnectionRef.current = pc

        // Get User Media
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          streamInstance = stream
          setLocalStream(stream)
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream
          }
          stream.getTracks().forEach((track) => pc.addTrack(track, stream))
        } catch (mediaErr) {
          console.warn("Media devices error (permissions/virtual display):", mediaErr.message)
          setCallStatus("Connected (Camera/Mic simulated or not permitted)")
        }

        // On Remote Stream
        pc.ontrack = (event) => {
          if (event.streams && event.streams[0]) {
            setRemoteStream(event.streams[0])
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = event.streams[0]
            }
          }
        }

        // On ICE Candidate
        pc.onicecandidate = (event) => {
          if (event.candidate && socketRef.current) {
            socketRef.current.emit('signal', {
              roomId,
              signalData: { candidate: event.candidate }
            })
          }
        }

        // Socket Events
        socketRef.current.on('connect', () => {
          setCallStatus('Connected to consultation room. Waiting for participant...')
          socketRef.current.emit('join-room', { roomId, userName, role })
        })

        socketRef.current.on('user-connected', async ({ userName: peerName }) => {
          setCallStatus(`Connected with ${peerName || 'Patient'}`)
          // Create WebRTC Offer
          try {
            const offer = await pc.createOffer()
            await pc.setLocalDescription(offer)
            socketRef.current.emit('signal', {
              roomId,
              signalData: { sdp: pc.localDescription }
            })
          } catch (e) {
            console.error(e)
          }
        })

        socketRef.current.on('signal', async ({ signalData }) => {
          try {
            if (signalData.sdp) {
              await pc.setRemoteDescription(new RTCSessionDescription(signalData.sdp))
              if (signalData.sdp.type === 'offer') {
                const answer = await pc.createAnswer()
                await pc.setLocalDescription(answer)
                socketRef.current.emit('signal', {
                  roomId,
                  signalData: { sdp: pc.localDescription }
                })
              }
            } else if (signalData.candidate) {
              await pc.addIceCandidate(new RTCIceCandidate(signalData.candidate))
            }
          } catch (e) {
            console.error(e)
          }
        })

        socketRef.current.on('user-disconnected', () => {
          setCallStatus('Remote participant disconnected.')
          setRemoteStream(null)
        })

      } catch (err) {
        console.error("WebRTC init error:", err)
        setCallStatus(`Call error: ${err.message}`)
      }
    }

    initCall()

    return () => {
      if (streamInstance) {
        streamInstance.getTracks().forEach((track) => track.stop())
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
      }
      if (socketRef.current) {
        socketRef.current.emit('leave-room', { roomId, userName })
        socketRef.current.disconnect()
      }
    }
  }, [roomId])

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !micEnabled
      })
      setMicEnabled(!micEnabled)
    }
  }

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !videoEnabled
      })
      setVideoEnabled(!videoEnabled)
    }
  }

  return (
    <div className='fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4'>
      <div className='bg-gray-900 border border-gray-800 rounded-3xl max-w-4xl w-full p-6 text-white shadow-2xl flex flex-col space-y-4'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-gray-800 pb-3'>
          <div>
            <h2 className='text-lg font-bold flex items-center gap-2'>
              <span className='w-3 h-3 rounded-full bg-emerald-500 animate-ping' />
              Telemedicine Video Consultation
            </h2>
            <p className='text-xs text-gray-400'>Room ID: {roomId} • Status: {callStatus}</p>
          </div>
          <button
            onClick={onClose}
            className='bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-lg text-xs font-semibold'
          >
            Close
          </button>
        </div>

        {/* Video Stage */}
        <div className='relative w-full h-80 sm:h-96 bg-black rounded-2xl overflow-hidden flex items-center justify-center border border-gray-800'>
          {/* Remote Video (Main Feed) */}
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className='w-full h-full object-cover'
            />
          ) : (
            <div className='text-center space-y-2 p-6'>
              <div className='w-16 h-16 rounded-full bg-gray-800 text-gray-400 flex items-center justify-center mx-auto text-xl font-bold'>
                {userName.charAt(0)}
              </div>
              <p className='text-sm font-medium text-gray-300'>Waiting for remote participant to join...</p>
              <p className='text-xs text-gray-500'>Share room ID: <span className='font-mono text-primary'>{roomId}</span></p>
            </div>
          )}

          {/* Local Video (Floating Picture-in-Picture) */}
          <div className='absolute bottom-4 right-4 w-32 sm:w-44 h-24 sm:h-32 bg-gray-800 rounded-xl overflow-hidden border-2 border-primary shadow-lg'>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className='w-full h-full object-cover'
            />
            <span className='absolute bottom-1 left-2 text-[10px] bg-black/60 px-1.5 py-0.5 rounded text-white'>
              You ({role})
            </span>
          </div>
        </div>

        {/* Controls Bar */}
        <div className='flex items-center justify-center gap-4 pt-2'>
          <button
            onClick={toggleMic}
            className={`p-3.5 rounded-full transition shadow-md ${micEnabled ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-500 text-white'}`}
            title={micEnabled ? 'Mute Mic' : 'Unmute Mic'}
          >
            {micEnabled ? <Mic className='w-5 h-5' /> : <MicOff className='w-5 h-5' />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-3.5 rounded-full transition shadow-md ${videoEnabled ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-500 text-white'}`}
            title={videoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            {videoEnabled ? <Video className='w-5 h-5' /> : <VideoOff className='w-5 h-5' />}
          </button>

          <button
            onClick={onClose}
            className='bg-red-600 hover:bg-red-700 text-white p-3.5 rounded-full shadow-lg transition flex items-center gap-2 px-6 font-bold text-xs'
          >
            <PhoneOff className='w-5 h-5' /> End Call
          </button>
        </div>
      </div>
    </div>
  )
}

export default VideoConsultationModal

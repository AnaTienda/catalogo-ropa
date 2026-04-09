import React, { useRef, useState, useEffect, useCallback } from 'react'
import { Camera, X, ZapIcon, RotateCcw } from 'lucide-react'

export default function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [active, setActive] = useState(false)
  const [error, setError] = useState(null)
  const [facingMode, setFacingMode] = useState('environment')
  const [flash, setFlash] = useState(false)

  const startCamera = useCallback(async (facing = facingMode) => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setActive(true)
      setError(null)
    } catch (err) {
      setError('No se pudo acceder a la cámara. Verificá los permisos del navegador.')
      console.error(err)
    }
  }, [facingMode])

  useEffect(() => {
    startCamera()
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    }
  }, [])

  const capture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    setFlash(true)
    setTimeout(() => setFlash(false), 200)
    onCapture(dataUrl)
    onClose()
  }, [onCapture, onClose])

  const flipCamera = useCallback(() => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(newMode)
    startCamera(newMode)
  }, [facingMode, startCamera])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay animate-fade-in">
      <div className="relative w-full max-w-md mx-4">
        {/* Flash effect */}
        {flash && (
          <div className="absolute inset-0 bg-white z-50 rounded-3xl animate-fade-in" style={{ opacity: 0.8 }} />
        )}

        <div className="glass rounded-3xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/40">
            <div className="flex items-center gap-2">
              <Camera size={18} className="text-amber-600" />
              <span className="font-display font-semibold text-stone-700">Cámara</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full glass flex items-center justify-center hover:bg-white/60 transition-colors"
            >
              <X size={16} className="text-stone-500" />
            </button>
          </div>

          {/* Video */}
          <div className="relative bg-stone-900 aspect-[4/3] overflow-hidden camera-viewfinder">
            {!active && !error && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white/60 text-center">
                  <Camera size={40} className="mx-auto mb-2 animate-pulse-soft" />
                  <p className="text-sm">Iniciando cámara...</p>
                </div>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="text-white/80 text-center">
                  <p className="text-sm">{error}</p>
                  <button onClick={() => startCamera()} className="mt-3 btn-ghost text-sm">
                    Reintentar
                  </button>
                </div>
              </div>
            )}
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
              style={{ display: active ? 'block' : 'none' }}
            />
            {/* Viewfinder guides */}
            {active && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-300/70 rounded-tl-lg" />
                <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-300/70 rounded-tr-lg" />
                <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-300/70 rounded-bl-lg" />
                <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-300/70 rounded-br-lg" />
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />

          {/* Controls */}
          <div className="flex items-center justify-between px-6 py-5">
            <button
              onClick={flipCamera}
              className="w-11 h-11 rounded-full glass flex items-center justify-center hover:bg-white/70 transition-all hover:scale-105"
              title="Cambiar cámara"
            >
              <RotateCcw size={18} className="text-stone-600" />
            </button>

            {/* Shutter */}
            <button
              onClick={capture}
              disabled={!active}
              className="w-16 h-16 rounded-full flex items-center justify-center transition-all disabled:opacity-40"
              style={{
                background: 'linear-gradient(135deg, #d4a853, #c49040)',
                boxShadow: '0 4px 20px rgba(212,168,83,0.45), 0 0 0 4px rgba(212,168,83,0.15)',
              }}
              title="Capturar"
            >
              <ZapIcon size={24} className="text-white" fill="white" />
            </button>

            <div className="w-11 h-11" />
          </div>
        </div>
      </div>
    </div>
  )
}

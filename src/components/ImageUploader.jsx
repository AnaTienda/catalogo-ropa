import React, { useRef, useState, useCallback } from 'react'
import { Upload, Camera, Image, X } from 'lucide-react'
import CameraCapture from './CameraCapture'

export default function ImageUploader({ preview, onImageSelected, onClear }) {
  const inputRef = useRef(null)
  const [showCamera, setShowCamera] = useState(false)
  const [dragging, setDragging] = useState(false)

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => onImageSelected(e.target.result)
    reader.readAsDataURL(file)
  }, [onImageSelected])

  const handleInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const handleDragLeave = () => setDragging(false)

  if (preview) {
    return (
      <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-stone-100">
        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        <button
          type="button"
          onClick={onClear}
          className="absolute top-2 right-2 w-7 h-7 rounded-full glass flex items-center justify-center shadow-md hover:bg-white/80 transition-all"
        >
          <X size={14} className="text-stone-600" />
        </button>
        <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute bottom-2 left-3 flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-white/90 text-xs font-medium bg-black/30 backdrop-blur-sm px-2 py-1 rounded-lg hover:bg-black/50 transition-colors"
          >
            Cambiar
          </button>
          <button
            type="button"
            onClick={() => setShowCamera(true)}
            className="text-white/90 text-xs font-medium bg-black/30 backdrop-blur-sm px-2 py-1 rounded-lg hover:bg-black/50 transition-colors"
          >
            Cámara
          </button>
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleInputChange} />
        {showCamera && (
          <CameraCapture
            onCapture={onImageSelected}
            onClose={() => setShowCamera(false)}
          />
        )}
      </div>
    )
  }

  return (
    <>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`rounded-2xl border-2 border-dashed transition-all aspect-[4/3] flex flex-col items-center justify-center gap-3 cursor-pointer
          ${dragging
            ? 'border-amber-400 bg-amber-50/60 scale-[1.01]'
            : 'border-amber-200/60 bg-white/30 hover:border-amber-300 hover:bg-white/50'
          }`}
        onClick={() => inputRef.current?.click()}
      >
        <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center shadow-sm">
          <Image size={22} className="text-amber-600" />
        </div>
        <div className="text-center px-4">
          <p className="text-sm font-semibold text-stone-600">Arrastrá una imagen o</p>
          <p className="text-xs text-stone-400 mt-0.5">hacé clic para seleccionar</p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl hover:bg-amber-100 transition-colors"
          >
            <Upload size={13} />
            Archivo
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setShowCamera(true) }}
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 bg-white/60 border border-stone-200 px-3 py-1.5 rounded-xl hover:bg-white/90 transition-colors"
          >
            <Camera size={13} />
            Cámara
          </button>
        </div>
      </div>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleInputChange} />

      {showCamera && (
        <CameraCapture
          onCapture={onImageSelected}
          onClose={() => setShowCamera(false)}
        />
      )}
    </>
  )
}

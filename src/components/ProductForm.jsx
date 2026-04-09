import React, { useState, useEffect } from 'react'
import { X, Tag, DollarSign, CreditCard, Hash } from 'lucide-react'
import ImageUploader from './ImageUploader'

export default function ProductForm({ product, onSubmit, onClose }) {
  const isEditing = !!product
  const [name, setName] = useState(product?.name || '')
  const [price, setPrice] = useState(product?.price ? String(product.price) : '')
  const [imageDataUrl, setImageDataUrl] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(product?.imageUrl || product?.imageLocal || null)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const priceNum = parseFloat(price) || 0
  const priceCard = priceNum > 0 ? (priceNum * 1.2).toFixed(2) : '—'

  useEffect(() => {
    // Prevent body scroll when modal open
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleImageSelected = (dataUrl) => {
    setImageDataUrl(dataUrl)
    setPreviewUrl(dataUrl)
  }

  const handleClearImage = () => {
    setImageDataUrl(null)
    setPreviewUrl(null)
  }

  const validate = () => {
    const errs = {}
    if (!name.trim()) errs.name = 'El nombre es obligatorio'
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0)
      errs.price = 'Ingresá un precio válido'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    try {
      await onSubmit({
        ...(isEditing ? { id: product.id } : {}),
        name: name.trim(),
        price: parseFloat(price),
        imageDataUrl: imageDataUrl || null,
      })
      onClose()
    } catch (err) {
      console.error(err)
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center modal-overlay animate-fade-in px-4">
      <div className="w-full max-w-md glass-dark rounded-3xl shadow-2xl animate-slide-up modal-scroll">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/40">
          <div>
            <h2 className="font-display text-xl font-semibold text-stone-800">
              {isEditing ? 'Editar producto' : 'Nuevo producto'}
            </h2>
            {isEditing && (
              <p className="text-xs text-amber-600 font-semibold mt-0.5 font-mono">{product.code}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-white/70 transition-all"
          >
            <X size={17} className="text-stone-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Image */}
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
              Imagen
            </label>
            <ImageUploader
              preview={previewUrl}
              onImageSelected={handleImageSelected}
              onClear={handleClearImage}
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
              Nombre del producto
            </label>
            <div className="relative">
              <Tag size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none" />
              <input
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); setErrors(v => ({ ...v, name: '' })) }}
                placeholder="Ej. Camisa Oxford Blanca"
                className={`glass-input w-full rounded-2xl pl-10 pr-4 py-3 text-stone-700 font-medium placeholder:text-stone-300 placeholder:font-normal
                  ${errors.name ? 'border-red-300 bg-red-50/30' : ''}`}
              />
            </div>
            {errors.name && <p className="text-red-400 text-xs mt-1 ml-1">{errors.name}</p>}
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
              Precio base
            </label>
            <div className="relative">
              <DollarSign size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none" />
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={e => { setPrice(e.target.value); setErrors(v => ({ ...v, price: '' })) }}
                placeholder="0.00"
                className={`glass-input w-full rounded-2xl pl-10 pr-4 py-3 text-stone-700 font-medium placeholder:text-stone-300
                  ${errors.price ? 'border-red-300 bg-red-50/30' : ''}`}
              />
            </div>
            {errors.price && <p className="text-red-400 text-xs mt-1 ml-1">{errors.price}</p>}
          </div>

          {/* Price card preview */}
          {priceNum > 0 && (
            <div className="glass rounded-2xl p-4 flex items-center justify-between animate-scale-in">
              <div className="flex items-center gap-2 text-stone-500 text-sm">
                <CreditCard size={15} className="text-amber-500" />
                <span className="font-medium">Precio con tarjeta (+20%)</span>
              </div>
              <span className="font-display font-semibold text-amber-700 text-lg">
                ${priceCard}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost flex-1 py-3 text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-[2] py-3 text-sm flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                isEditing ? 'Guardar cambios' : 'Agregar producto'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import { Pencil, Trash2, RefreshCw, Cloud, Loader } from 'lucide-react'

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f5e6c8'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='50' fill='%23d4a853' opacity='.4'%3E👔%3C/text%3E%3C/svg%3E"

export default function ProductListItem({ product, onEdit, onDelete, onRetry }) {
  const [imgError, setImgError] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const imgSrc = !imgError
    ? (product.imageUrl || product.imageLocal || PLACEHOLDER)
    : PLACEHOLDER

  return (
    <div className="glass-card rounded-2xl overflow-hidden card-hover shadow-sm animate-fade-in">
      <div className="flex items-center gap-4 p-3">
        {/* Image */}
        <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-cream-100 to-warm-200">
          <img
            src={imgSrc}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
          {product.uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <Loader size={14} className="text-white animate-spin" />
            </div>
          )}
          {product.imageUrl && !product.uploading && (
            <div className="absolute bottom-1 right-1 w-4 h-4 flex items-center justify-center bg-emerald-500/80 rounded-full">
              <Cloud size={9} className="text-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              <span className="text-[10px] font-bold font-mono text-amber-600 tracking-wide">{product.code}</span>
              <h3 className="font-semibold text-stone-800 text-sm leading-snug truncate">{product.name}</h3>
            </div>
            {product.uploadError && (
              <button
                onClick={() => onRetry(product.id)}
                className="flex-shrink-0 text-[10px] font-semibold text-red-500 border border-red-200 px-1.5 py-0.5 rounded-lg hover:bg-red-50 flex items-center gap-1 transition-colors"
              >
                <RefreshCw size={9} />
                Reintentar
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div>
              <span className="text-xs text-stone-400">Base </span>
              <span className="font-semibold text-stone-700 text-sm">${product.price.toFixed(2)}</span>
            </div>
            <span className="badge-card text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              Tarjeta ${product.priceCard.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => onEdit(product)}
            className="w-8 h-8 rounded-xl glass flex items-center justify-center hover:bg-amber-50 hover:border-amber-200 transition-all border border-white/60"
            title="Editar"
          >
            <Pencil size={13} className="text-stone-500" />
          </button>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-8 h-8 rounded-xl glass flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-all border border-white/60"
              title="Eliminar"
            >
              <Trash2 size={13} className="text-stone-400" />
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-1 rounded-lg text-xs font-semibold text-stone-500 bg-stone-100 hover:bg-stone-200 transition-colors"
              >
                No
              </button>
              <button
                onClick={() => onDelete(product.id)}
                className="px-2 py-1 rounded-lg text-xs font-semibold text-white bg-red-400 hover:bg-red-500 transition-colors"
              >
                Sí
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

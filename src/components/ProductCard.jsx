import React, { useState } from 'react'
import { Pencil, Trash2, RefreshCw, Cloud, CloudOff, Loader } from 'lucide-react'

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f5e6c8'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='80' fill='%23d4a853' opacity='.4'%3E👔%3C/text%3E%3C/svg%3E"

export default function ProductCard({ product, onEdit, onDelete, onRetry }) {
  const [imgError, setImgError] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  const imgSrc = !imgError
    ? (product.imageUrl || product.imageLocal || PLACEHOLDER)
    : PLACEHOLDER

  return (
    <div className="glass-card rounded-3xl overflow-hidden card-hover shadow-md animate-slide-up group">
      {/* Image */}
      <div className="relative aspect-[3/4] bg-gradient-to-br from-cream-100 to-warm-200 overflow-hidden">
        <img
          src={imgSrc}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          onError={() => setImgError(true)}
        />

        {/* Upload status */}
        {product.uploading && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
            <Loader size={10} className="animate-spin" />
            Subiendo...
          </div>
        )}
        {product.uploadError && (
          <button
            onClick={() => onRetry(product.id)}
            className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-red-500/80 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full hover:bg-red-600/90 transition-colors"
          >
            <RefreshCw size={10} />
            Reintentar
          </button>
        )}
        {product.imageUrl && !product.uploading && !product.uploadError && (
          <div className="absolute top-2.5 left-2.5 w-6 h-6 flex items-center justify-center bg-emerald-500/80 backdrop-blur-sm rounded-full">
            <Cloud size={11} className="text-white" />
          </div>
        )}

        {/* Code badge */}
        <div className="absolute top-2.5 right-2.5 bg-white/75 backdrop-blur-sm text-stone-600 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full tracking-wide border border-white/80 shadow-sm">
          {product.code}
        </div>

        {/* Hover actions */}
        <div className="absolute inset-x-0 bottom-0 flex gap-2 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/50 via-black/20 to-transparent">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 flex items-center justify-center gap-1.5 text-white text-xs font-semibold bg-white/20 backdrop-blur-sm border border-white/30 py-2 rounded-xl hover:bg-white/35 transition-colors"
          >
            <Pencil size={12} />
            Editar
          </button>
          {!showDelete ? (
            <button
              onClick={() => setShowDelete(true)}
              className="w-9 flex items-center justify-center bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-red-500/40 transition-colors"
            >
              <Trash2 size={13} className="text-white" />
            </button>
          ) : (
            <div className="flex gap-1">
              <button
                onClick={() => setShowDelete(false)}
                className="px-2 text-white text-xs font-semibold bg-white/20 backdrop-blur-sm border border-white/30 py-2 rounded-xl hover:bg-white/35 transition-colors"
              >
                No
              </button>
              <button
                onClick={() => onDelete(product.id)}
                className="px-2 text-white text-xs font-semibold bg-red-500/60 backdrop-blur-sm border border-red-400/40 py-2 rounded-xl hover:bg-red-600/70 transition-colors"
              >
                Sí
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-stone-800 text-sm leading-tight line-clamp-2 mb-3">
          {product.name}
        </h3>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-stone-400 font-medium">Precio base</p>
            <p className="font-display font-semibold text-stone-700 text-lg leading-none mt-0.5">
              ${product.price.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <span className="badge-card text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
              Tarjeta ${product.priceCard.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'catalogo_productos'
const COUNTER_KEY = 'catalogo_counter'

// ─── Cloudinary config ────────────────────────────────────────────────────────
// ⚠️  Reemplazá estos valores con los de tu cuenta Cloudinary gratuita:
//    https://cloudinary.com/  →  Dashboard → Cloud name + unsigned upload preset
const CLOUDINARY_CLOUD_NAME = 'dmuwjxtys'          // ← tu cloud name
const CLOUDINARY_UPLOAD_PRESET = 'Catalogo_ropa' // ← nombre del preset (unsigned)

async function uploadToCloudinary(base64DataUrl) {
  const formData = new FormData()
  // Convertir base64 a blob
  const res = await fetch(base64DataUrl)
  const blob = await res.blob()
  formData.append('file', blob)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  )

  if (!response.ok) throw new Error(`Cloudinary error: ${response.status}`)
  const data = await response.json()
  return data.secure_url
}

function generateCode(counter) {
  return `PRD-${String(counter).padStart(4, '0')}`
}

export function useProducts() {
  const [products, setProducts] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch { return [] }
  })

  const [counter, setCounter] = useState(() => {
    try {
      const stored = localStorage.getItem(COUNTER_KEY)
      return stored ? parseInt(stored, 10) : 1
    } catch { return 1 }
  })

  // Persistir en localStorage
  useEffect(() => {
    try {
      // Guardamos sin imageLocal para ahorrar espacio (puede ser grande en base64)
      const toStore = products.map(p => ({ ...p, imageLocal: null }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
    } catch (e) {
      // Si excede la cuota, intentamos guardar sin imágenes locales
      console.warn('localStorage quota exceeded, saving without local images')
    }
  }, [products])

  useEffect(() => {
    localStorage.setItem(COUNTER_KEY, String(counter))
  }, [counter])

  const addProduct = useCallback(async ({ name, price, imageDataUrl }) => {
    const code = generateCode(counter)
    const priceNum = parseFloat(price) || 0

    const newProduct = {
      id: Date.now().toString(),
      code,
      name,
      price: priceNum,
      priceCard: +(priceNum * 1.2).toFixed(2),
      imageLocal: imageDataUrl || null,
      imageUrl: null,
      uploading: !!imageDataUrl,
      uploadError: false,
      createdAt: new Date().toISOString(),
    }

    setProducts(prev => [newProduct, ...prev])
    setCounter(c => c + 1)

    // Subida en background
    if (imageDataUrl) {
      try {
        const url = await uploadToCloudinary(imageDataUrl)
        setProducts(prev =>
          prev.map(p =>
            p.id === newProduct.id
              ? { ...p, imageUrl: url, imageLocal: null, uploading: false, uploadError: false }
              : p
          )
        )
      } catch (err) {
        console.error('Upload failed:', err)
        setProducts(prev =>
          prev.map(p =>
            p.id === newProduct.id
              ? { ...p, uploading: false, uploadError: true }
              : p
          )
        )
      }
    }

    return newProduct
  }, [counter])

  const updateProduct = useCallback(async ({ id, name, price, imageDataUrl }) => {
    const priceNum = parseFloat(price) || 0

    setProducts(prev =>
      prev.map(p => {
        if (p.id !== id) return p
        const updated = {
          ...p,
          name,
          price: priceNum,
          priceCard: +(priceNum * 1.2).toFixed(2),
          uploading: !!imageDataUrl,
          uploadError: false,
        }
        if (imageDataUrl) {
          updated.imageLocal = imageDataUrl
          updated.imageUrl = null
        }
        return updated
      })
    )

    if (imageDataUrl) {
      try {
        const url = await uploadToCloudinary(imageDataUrl)
        setProducts(prev =>
          prev.map(p =>
            p.id === id
              ? { ...p, imageUrl: url, imageLocal: null, uploading: false, uploadError: false }
              : p
          )
        )
      } catch (err) {
        console.error('Upload failed:', err)
        setProducts(prev =>
          prev.map(p =>
            p.id === id
              ? { ...p, uploading: false, uploadError: true }
              : p
          )
        )
      }
    }
  }, [])

  const retryUpload = useCallback(async (id) => {
    const product = products.find(p => p.id === id)
    if (!product?.imageLocal) return

    setProducts(prev =>
      prev.map(p => p.id === id ? { ...p, uploading: true, uploadError: false } : p)
    )

    try {
      const url = await uploadToCloudinary(product.imageLocal)
      setProducts(prev =>
        prev.map(p =>
          p.id === id
            ? { ...p, imageUrl: url, imageLocal: null, uploading: false, uploadError: false }
            : p
        )
      )
    } catch (err) {
      setProducts(prev =>
        prev.map(p =>
          p.id === id ? { ...p, uploading: false, uploadError: true } : p
        )
      )
    }
  }, [products])

  const deleteProduct = useCallback((id) => {
    setProducts(prev => prev.filter(p => p.id !== id))
  }, [])

  return { products, addProduct, updateProduct, deleteProduct, retryUpload }
}

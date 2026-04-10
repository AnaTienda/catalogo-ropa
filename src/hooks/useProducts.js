/**
 * useProducts.js — REESCRITO
 *
 * ✅ Todo persiste en Supabase (sin localStorage)
 * ✅ Sincronización entre dispositivos en tiempo real (Supabase Realtime)
 * ✅ Imágenes subidas a Cloudinary como File/Blob (funciona en mobile)
 * ✅ Códigos PRD-XXXX incrementales persistentes (basados en COUNT de Supabase)
 * ✅ Nombres de columnas correctos: code, name, price, price_card, image_url, created_at
 *
 * ─── Tabla requerida en Supabase ──────────────────────────────────────────────
 * CREATE TABLE products (
 *   id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   code       TEXT NOT NULL UNIQUE,
 *   name       TEXT NOT NULL,
 *   price      NUMERIC(10,2) NOT NULL DEFAULT 0,
 *   price_card NUMERIC(10,2) NOT NULL DEFAULT 0,
 *   image_url  TEXT,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * -- RLS: habilitar y agregar policy para permitir todas las operaciones
 * ALTER TABLE products ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Allow all" ON products FOR ALL USING (true) WITH CHECK (true);
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { uploadToCloudinary } from '../lib/cloudinary'

const TABLE = 'products'

// Genera el próximo código PRD-XXXX basado en cuántos productos existen
async function getNextCode() {
  const { count, error } = await supabase
    .from(TABLE)
    .select('*', { count: 'exact', head: true })

  if (error) throw error
  const next = (count ?? 0) + 1
  return `PRD-${String(next).padStart(4, '0')}`
}

// Mapea una fila de Supabase al formato interno del componente
function mapRow(row) {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    price: Number(row.price),
    priceCard: Number(row.price_card),
    imageUrl: row.image_url || null,
    createdAt: row.created_at,
    // Flags UI (nunca persisten en DB)
    uploading: false,
    uploadError: false,
    imageLocal: null,
  }
}

export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ─── Carga inicial ──────────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true

    async function fetchProducts() {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from(TABLE)
          .select('*')
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError
        if (isMounted) {
          setProducts((data || []).map(mapRow))
        }
      } catch (err) {
        console.error('Error cargando productos:', err)
        if (isMounted) setError(err.message)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchProducts()
    return () => { isMounted = false }
  }, [])

  // ─── Realtime — sincronización entre dispositivos ───────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE },
        (payload) => {
          const { eventType, new: newRow, old: oldRow } = payload

          if (eventType === 'INSERT') {
            setProducts(prev => {
              // Evitar duplicados (por si el insert ya lo agregamos optimísticamente)
              if (prev.find(p => p.id === newRow.id)) return prev
              return [mapRow(newRow), ...prev]
            })
          } else if (eventType === 'UPDATE') {
            setProducts(prev =>
              prev.map(p => p.id === newRow.id ? { ...mapRow(newRow), uploading: p.uploading, uploadError: p.uploadError } : p)
            )
          } else if (eventType === 'DELETE') {
            setProducts(prev => prev.filter(p => p.id !== oldRow.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // ─── Crear producto ─────────────────────────────────────────────────────────
  const addProduct = useCallback(async ({ name, price, imageFile, imageDataUrl }) => {
    const priceNum = parseFloat(price) || 0

    // Código único basado en DB
    const code = await getNextCode()

    // Placeholder optimístico
    const tempId = `temp-${Date.now()}`
    const optimistic = {
      id: tempId,
      code,
      name,
      price: priceNum,
      priceCard: +(priceNum * 1.2).toFixed(2),
      imageUrl: null,
      imageLocal: imageDataUrl || null,
      createdAt: new Date().toISOString(),
      uploading: !!(imageFile || imageDataUrl),
      uploadError: false,
    }
    setProducts(prev => [optimistic, ...prev])

    try {
      // 1. Subir imagen a Cloudinary si existe
      let imageUrl = null
      if (imageFile || imageDataUrl) {
        try {
          imageUrl = await uploadToCloudinary(imageFile || imageDataUrl)
        } catch (uploadErr) {
          console.error('Error subiendo imagen:', uploadErr)
          setProducts(prev =>
            prev.map(p => p.id === tempId ? { ...p, uploading: false, uploadError: true } : p)
          )
          // Continuamos sin imagen
        }
      }

      // 2. Insertar en Supabase
      const { data, error: insertError } = await supabase
        .from(TABLE)
        .insert({
          code,
          name,
          price: priceNum,
          price_card: +(priceNum * 1.2).toFixed(2),
          image_url: imageUrl,
        })
        .select()
        .single()

      if (insertError) throw insertError

      // 3. Reemplazar placeholder con dato real
      setProducts(prev =>
        prev.map(p => p.id === tempId ? mapRow(data) : p)
      )

      return mapRow(data)
    } catch (err) {
      console.error('Error creando producto:', err)
      // Eliminar placeholder en caso de error total
      setProducts(prev => prev.filter(p => p.id !== tempId))
      throw err
    }
  }, [])

  // ─── Actualizar producto ────────────────────────────────────────────────────
  const updateProduct = useCallback(async ({ id, name, price, imageFile, imageDataUrl }) => {
    const priceNum = parseFloat(price) || 0

    // Actualización optimística en UI
    setProducts(prev =>
      prev.map(p => {
        if (p.id !== id) return p
        return {
          ...p,
          name,
          price: priceNum,
          priceCard: +(priceNum * 1.2).toFixed(2),
          uploading: !!(imageFile || imageDataUrl),
          uploadError: false,
          imageLocal: imageDataUrl || p.imageLocal,
        }
      })
    )

    try {
      let imageUrl = undefined // undefined = no cambiar en DB

      if (imageFile || imageDataUrl) {
        try {
          imageUrl = await uploadToCloudinary(imageFile || imageDataUrl)
        } catch (uploadErr) {
          console.error('Error subiendo imagen:', uploadErr)
          setProducts(prev =>
            prev.map(p => p.id === id ? { ...p, uploading: false, uploadError: true } : p)
          )
        }
      }

      const updatePayload = {
        name,
        price: priceNum,
        price_card: +(priceNum * 1.2).toFixed(2),
      }
      if (imageUrl !== undefined) {
        updatePayload.image_url = imageUrl
      }

      const { data, error: updateError } = await supabase
        .from(TABLE)
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      setProducts(prev =>
        prev.map(p => p.id === id ? mapRow(data) : p)
      )
    } catch (err) {
      console.error('Error actualizando producto:', err)
      throw err
    }
  }, [])

  // ─── Eliminar producto ──────────────────────────────────────────────────────
  const deleteProduct = useCallback(async (id) => {
    // Eliminar optimísticamente de UI
    setProducts(prev => prev.filter(p => p.id !== id))

    const { error: deleteError } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error eliminando producto:', deleteError)
      // Recargar para recuperar estado
      const { data } = await supabase.from(TABLE).select('*').order('created_at', { ascending: false })
      if (data) setProducts(data.map(mapRow))
    }
  }, [])

  // ─── Reintentar subida de imagen ────────────────────────────────────────────
  const retryUpload = useCallback(async (id) => {
    const product = products.find(p => p.id === id)
    if (!product?.imageLocal) return

    setProducts(prev =>
      prev.map(p => p.id === id ? { ...p, uploading: true, uploadError: false } : p)
    )

    try {
      const url = await uploadToCloudinary(product.imageLocal)

      const { data, error: updateError } = await supabase
        .from(TABLE)
        .update({ image_url: url })
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      setProducts(prev =>
        prev.map(p => p.id === id ? mapRow(data) : p)
      )
    } catch (err) {
      console.error('Retry upload failed:', err)
      setProducts(prev =>
        prev.map(p => p.id === id ? { ...p, uploading: false, uploadError: true } : p)
      )
    }
  }, [products])

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    retryUpload,
  }
}

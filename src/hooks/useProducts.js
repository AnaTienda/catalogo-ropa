import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

function generateCode(counter) {
  return `PRD-${String(counter).padStart(4, '0')}`
}

export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // ─── CARGAR PRODUCTOS ─────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error cargando productos:', error)
    } else {
      setProducts(data)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // ─── AGREGAR PRODUCTO ─────────────────────────────
  const addProduct = useCallback(async ({ name, price, imageDataUrl }) => {
    // Obtener último producto para generar código incremental
    const { data: last } = await supabase
      .from('products')
      .select('code')
      .order('created_at', { ascending: false })
      .limit(1)

    let nextNumber = 1
    if (last && last.length > 0) {
      const lastCode = last[0].code
      const num = parseInt(lastCode.split('-')[1])
      nextNumber = num + 1
    }

    const code = generateCode(nextNumber)

    const newProduct = {
      code,
      name,
      price,
      price_card: +(price * 1.2).toFixed(2),
      image_url: imageDataUrl || null,
    }

    const { error } = await supabase
      .from('products')
      .insert([newProduct])

    if (error) {
      console.error('Error agregando producto:', error)
      return
    }

    fetchProducts()
  }, [fetchProducts])

  // ─── EDITAR PRODUCTO ─────────────────────────────
  const updateProduct = useCallback(async ({ id, name, price, imageDataUrl }) => {
    const updates = {
      name,
      price,
      price_card: +(price * 1.2).toFixed(2),
    }

    if (imageDataUrl) {
      updates.image_url = imageDataUrl
    }

    const { error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.error('Error actualizando:', error)
      return
    }

    fetchProducts()
  }, [fetchProducts])

  // ─── ELIMINAR ─────────────────────────────
  const deleteProduct = useCallback(async (id) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error eliminando:', error)
      return
    }

    fetchProducts()
  }, [fetchProducts])

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct
  }
}
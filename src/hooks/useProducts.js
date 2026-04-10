import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

function generateCode(counter) {
  return `PRD-${String(counter).padStart(4, '0')}`
}

export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // ─── CARGAR PRODUCTOS INICIALES ─────────────────────────────
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

  // ─── SUSCRIPCIÓN REALTIME Y MONTAJE ─────────────────────────
  useEffect(() => {
    fetchProducts()

    // Creamos el canal para escuchar cambios en la tabla 'products'
    const channel = supabase
      .channel('public:products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          setProducts((currentProducts) => {
            switch (payload.eventType) {
              case 'INSERT':
                // Evitamos duplicados en caso de carrera de estados
                if (currentProducts.some(p => p.id === payload.new.id)) return currentProducts
                // Insertamos al principio para mantener el orden DESC de created_at
                return [payload.new, ...currentProducts]
                
              case 'UPDATE':
                return currentProducts.map(p =>
                  p.id === payload.new.id ? payload.new : p
                )
                
              case 'DELETE':
                return currentProducts.filter(p => p.id !== payload.old.id)
                
              default:
                return currentProducts
            }
          })
        }
      )
      .subscribe()

    // Cleanup de la suscripción al desmontar
    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchProducts])

  // ─── AGREGAR PRODUCTO ─────────────────────────────
  const addProduct = useCallback(async ({ name, price, imageDataUrl }) => {
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
    }
    // NOTA: Ya no llamamos a fetchProducts() aquí. 
    // La suscripción Realtime detectará el INSERT y actualizará el estado automáticamente.
  }, [])

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
    }
  }, [])

  // ─── ELIMINAR ─────────────────────────────
  const deleteProduct = useCallback(async (id) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error eliminando:', error)
    }
  }, [])

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct
  }
}
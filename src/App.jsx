import React, { useState, useMemo, useCallback } from 'react'
import {
  Plus, Search, Grid2X2, List, ArrowUpDown, ShoppingBag,
  SortAsc, X, Shirt
} from 'lucide-react'
import { useProducts } from './hooks/useProducts'
import ProductCard from './components/ProductCard'
import ProductListItem from './components/ProductListItem'
import ProductForm from './components/ProductForm'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Más recientes' },
  { value: 'price_asc', label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
  { value: 'name', label: 'Nombre A-Z' },
  { value: 'code', label: 'Código' },
]

export default function App() {
  const { products, addProduct, updateProduct, deleteProduct, retryUpload } = useProducts()
  const [view, setView] = useState('grid')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [showSort, setShowSort] = useState(false)

  const filtered = useMemo(() => {
    let list = [...products]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q)
      )
    }
    switch (sort) {
      case 'price_asc':  list.sort((a, b) => a.price - b.price); break
      case 'price_desc': list.sort((a, b) => b.price - a.price); break
      case 'name':       list.sort((a, b) => a.name.localeCompare(b.name)); break
      case 'code':       list.sort((a, b) => a.code.localeCompare(b.code)); break
      default:           list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }
    return list
  }, [products, search, sort])

  const handleAdd = useCallback(async (data) => {
    await addProduct(data)
  }, [addProduct])

  const handleUpdate = useCallback(async (data) => {
    await updateProduct(data)
    setEditingProduct(null)
  }, [updateProduct])

  const handleEdit = useCallback((product) => {
    setEditingProduct(product)
    setShowForm(true)
  }, [])

  const handleCloseForm = useCallback(() => {
    setShowForm(false)
    setEditingProduct(null)
  }, [])

  const currentSortLabel = SORT_OPTIONS.find(o => o.value === sort)?.label

  const stats = useMemo(() => ({
    total: products.length,
    uploading: products.filter(p => p.uploading).length,
    errors: products.filter(p => p.uploadError).length,
  }), [products])

  return (
    <div className="bg-mesh min-h-screen noise-overlay">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 glass border-b border-white/50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-sm"
                style={{ background: 'linear-gradient(135deg, #d4a853, #c49040)' }}>
                <Shirt size={18} className="text-white" />
              </div>
              <div>
                <h1 className="font-display text-lg font-semibold text-stone-800 leading-none">
                  Catálogo
                </h1>
                <p className="text-[10px] text-stone-400 font-medium leading-none mt-0.5">
                  {stats.total} {stats.total === 1 ? 'producto' : 'productos'}
                  {stats.uploading > 0 && (
                    <span className="ml-1 text-amber-500">· {stats.uploading} subiendo</span>
                  )}
                  {stats.errors > 0 && (
                    <span className="ml-1 text-red-400">· {stats.errors} error</span>
                  )}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative hidden sm:block">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar por nombre o código..."
                  className="glass-input w-56 rounded-2xl pl-9 pr-8 py-2 text-sm text-stone-700 placeholder:text-stone-300"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* View toggle */}
              <div className="flex glass rounded-xl p-0.5 border border-white/60">
                <button
                  onClick={() => setView('grid')}
                  className={`p-1.5 rounded-lg transition-all ${view === 'grid' ? 'bg-white shadow-sm text-amber-600' : 'text-stone-400 hover:text-stone-600'}`}
                >
                  <Grid2X2 size={15} />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-1.5 rounded-lg transition-all ${view === 'list' ? 'bg-white shadow-sm text-amber-600' : 'text-stone-400 hover:text-stone-600'}`}
                >
                  <List size={15} />
                </button>
              </div>

              {/* Sort */}
              <div className="relative">
                <button
                  onClick={() => setShowSort(v => !v)}
                  className="btn-ghost flex items-center gap-1.5 py-2 px-3 text-xs"
                >
                  <ArrowUpDown size={13} />
                  <span className="hidden sm:inline">{currentSortLabel}</span>
                </button>
                {showSort && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setShowSort(false)} />
                    <div className="absolute right-0 top-full mt-2 z-30 glass-dark rounded-2xl shadow-xl border border-white/60 py-1.5 min-w-[160px] animate-scale-in">
                      {SORT_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => { setSort(opt.value); setShowSort(false) }}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors rounded-lg mx-1 ${
                            sort === opt.value
                              ? 'font-semibold text-amber-700 bg-amber-50/60'
                              : 'text-stone-600 hover:bg-white/50'
                          }`}
                          style={{ width: 'calc(100% - 8px)' }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Add button */}
              <button
                onClick={() => { setEditingProduct(null); setShowForm(true) }}
                className="btn-primary flex items-center gap-1.5 py-2 px-3 text-sm"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Agregar</span>
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <div className="sm:hidden mt-2.5 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre o código..."
              className="glass-input w-full rounded-2xl pl-9 pr-8 py-2.5 text-sm text-stone-700 placeholder:text-stone-300"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Empty state */}
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
            <div className="w-24 h-24 rounded-3xl glass flex items-center justify-center mb-5 shadow-lg">
              <ShoppingBag size={40} className="text-amber-400" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-stone-700 mb-2">
              Tu catálogo está vacío
            </h2>
            <p className="text-stone-400 text-sm mb-6 text-center max-w-xs">
              Agregá tu primer producto y comenzá a construir tu catálogo profesional
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary flex items-center gap-2 py-3 px-6"
            >
              <Plus size={18} />
              Agregar primer producto
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <Search size={36} className="text-stone-300 mb-3" />
            <p className="text-stone-500 font-medium">Sin resultados para "{search}"</p>
            <button onClick={() => setSearch('')} className="mt-2 text-amber-600 text-sm font-semibold hover:underline">
              Limpiar búsqueda
            </button>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filtered.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onEdit={handleEdit}
                onDelete={deleteProduct}
                onRetry={retryUpload}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(p => (
              <ProductListItem
                key={p.id}
                product={p}
                onEdit={handleEdit}
                onDelete={deleteProduct}
                onRetry={retryUpload}
              />
            ))}
          </div>
        )}

        {/* Count */}
        {filtered.length > 0 && (
          <p className="text-center text-xs text-stone-400 mt-8 font-medium">
            {filtered.length} de {products.length} productos
          </p>
        )}
      </main>

      {/* ── FAB mobile ── */}
      <button
        onClick={() => { setEditingProduct(null); setShowForm(true) }}
        className="fixed bottom-6 right-6 sm:hidden w-14 h-14 rounded-full flex items-center justify-center shadow-xl z-20 transition-transform active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #d4a853, #c49040)',
          boxShadow: '0 6px 24px rgba(212,168,83,0.45)',
        }}
      >
        <Plus size={24} className="text-white" />
      </button>

      {/* ── Form Modal ── */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onSubmit={editingProduct ? handleUpdate : handleAdd}
          onClose={handleCloseForm}
        />
      )}
    </div>
  )
}

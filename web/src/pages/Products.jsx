import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Star, Copy, Eye, ToggleLeft, ToggleRight } from 'lucide-react'
import { formatCurrency } from '../lib/utils'
import { useToast } from '../context/ToastContext'
import { api } from '../lib/api'

function ProductFlower({ product, onToggleAvailable, onToggleFeatured, onDuplicate }) {
  const navigate = useNavigate()
  const occasions = product.occasions?.length
    ? product.occasions
    : [product.category].filter(Boolean)
  const sizes = product.sizes?.length ? product.sizes : []
  const fromPrice = sizes.length ? Math.min(...sizes.map((s) => s.price)) : 0

  return (
    <div className="card" style={{ overflow: 'visible' }}>
      {/* Hero image / placeholder */}
      <div
        style={{
          height: 160,
          background: product.primary_image_url
            ? `url(${product.primary_image_url}) center/cover no-repeat`
            : 'linear-gradient(135deg, #fdf0f3 0%, #f4e8ef 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3.5rem',
          position: 'relative',
          borderRadius: '16px 16px 0 0',
        }}
      >
        {!product.primary_image_url && '🌸'}

        {product.is_featured && (
          <span
            style={{
              position: 'absolute', top: 10, left: 10,
              background: '#f59e0b', color: '#fff',
              fontSize: '0.65rem', fontWeight: 700,
              padding: '0.2rem 0.5rem', borderRadius: 999,
              display: 'flex', alignItems: 'center', gap: 3,
            }}
          >
            <Star size={10} fill="white" /> FEATURED
          </span>
        )}

        <span
          style={{
            position: 'absolute', top: 10, right: 10,
            background: product.is_available ? '#d1fae5' : '#fee2e2',
            color: product.is_available ? '#065f46' : '#991b1b',
            fontSize: '0.65rem', fontWeight: 700,
            padding: '0.2rem 0.5rem', borderRadius: 999,
          }}
        >
          {product.is_available ? '● Available' : '○ Unavailable'}
        </span>
      </div>

      <div style={{ padding: '1rem 1.25rem' }}>
        <h3 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: 700 }}>
          {product.name}
        </h3>
        <p style={{ margin: '0 0 0.75rem', fontSize: '0.78rem', color: 'var(--color-muted)', lineHeight: 1.5 }}>
          {product.description}
        </p>

        {/* Occasion tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.75rem' }}>
          {occasions.slice(0, 2).map((occ) => (
            <span
              key={occ}
              style={{
                fontSize: '0.65rem',
                background: 'var(--color-blush)',
                color: 'var(--color-rose-dark)',
                padding: '0.15rem 0.5rem',
                borderRadius: 999,
                fontWeight: 600,
              }}
            >
              {occ}
            </span>
          ))}
          {occasions.length > 2 && (
            <span style={{ fontSize: '0.65rem', color: 'var(--color-muted)' }}>
              +{occasions.length - 2}
            </span>
          )}
        </div>

        {/* Price / Orders */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-muted)', textTransform: 'uppercase', fontWeight: 600 }}>From</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-rose-dark)' }}>
              {formatCurrency(fromPrice)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Orders</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{product.orders ?? 0}</div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn-primary btn-sm"
            style={{ flex: 1 }}
            onClick={() => navigate(`/products/${product.id}`)}
          >
            <Eye size={14} /> View
          </button>
          <button
            className="btn btn-secondary btn-sm"
            title="Duplicate"
            onClick={() => onDuplicate(product)}
          >
            <Copy size={14} />
          </button>
          <button
            className="btn btn-secondary btn-sm"
            title={product.is_featured ? 'Unfeature' : 'Feature'}
            onClick={() => onToggleFeatured(product)}
          >
            <Star size={14} fill={product.is_featured ? '#f59e0b' : 'none'} stroke={product.is_featured ? '#f59e0b' : 'currentColor'} />
          </button>
          <button
            className="btn btn-secondary btn-sm"
            title={product.is_available ? 'Mark Unavailable' : 'Mark Available'}
            onClick={() => onToggleAvailable(product)}
          >
            {product.is_available ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Products() {
  const navigate = useNavigate()
  const toast = useToast()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [view, setView] = useState('grid')

  function fetchProducts() {
    setLoading(true)
    api
      .products()
      .then((res) => setProducts(res.data || []))
      .catch((e) => toast.error(e.message || 'Failed to load products'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  async function handleToggleAvailable(product) {
    try {
      const res = await api.updateProduct(product.id, { is_available: !product.is_available })
      setProducts((prev) => prev.map((p) => (p.id === product.id ? res.data : p)))
      toast.success(res.data.is_available ? 'Marked as available' : 'Marked as unavailable')
    } catch (e) {
      toast.error(e.message || 'Failed to update availability')
    }
  }

  async function handleToggleFeatured(product) {
    try {
      const res = await api.updateProduct(product.id, { is_featured: !product.is_featured })
      setProducts((prev) => prev.map((p) => (p.id === product.id ? res.data : p)))
      toast.success(res.data.is_featured ? 'Added to featured' : 'Removed from featured')
    } catch (e) {
      toast.error(e.message || 'Failed to update featured status')
    }
  }

  async function handleDuplicate(product) {
    try {
      const res = await api.duplicateProduct(product.id)
      setProducts((prev) => [...prev, res.data])
      toast.success(`Duplicated "${product.name}"`)
    } catch (e) {
      toast.error(e.message || 'Failed to duplicate product')
    }
  }

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    if (filter === 'available') return matchSearch && p.is_available
    if (filter === 'unavailable') return matchSearch && !p.is_available
    if (filter === 'featured') return matchSearch && p.is_featured
    return matchSearch
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Products &amp; Arrangements</h1>
          <p className="page-subtitle">
            {loading ? 'Loading…' : `${products.length} arrangements`} • Synced from database
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/products/new')}>
          <Plus size={16} /> Add Arrangement
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="filters-bar">
          <div className="search-wrapper">
            <Search className="search-icon" />
            <input
              type="text"
              className="form-input search-input"
              placeholder="Search arrangements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Products</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
            <option value="featured">Featured</option>
          </select>
          <div className="flex gap-1" style={{ marginLeft: 'auto' }}>
            <button
              className={`btn btn-sm ${view === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setView('grid')}
            >
              Grid
            </button>
            <button
              className={`btn btn-sm ${view === 'list' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setView('list')}
            >
              List
            </button>
          </div>
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: '1rem' }}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="card" style={{ height: 280, background: 'var(--color-bg)', animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : view === 'grid' ? (
          <div
            style={{
              padding: '1.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1rem',
            }}
          >
            {filtered.map((p) => (
              <ProductFlower
                key={p.id}
                product={p}
                onToggleAvailable={handleToggleAvailable}
                onToggleFeatured={handleToggleFeatured}
                onDuplicate={handleDuplicate}
              />
            ))}
            {filtered.length === 0 && (
              <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                <div className="empty-state-icon">🌺</div>
                <h3>No arrangements found</h3>
                <p>Adjust your filters or add a new arrangement.</p>
                <button className="btn btn-primary" onClick={() => navigate('/products/new')}>
                  <Plus size={16} /> Add Arrangement
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Sizes / Prices</th>
                  <th>Orders</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/products/${p.id}`)}
                  >
                    <td><span className="font-semibold">{p.name}</span></td>
                    <td><span className="text-xs text-muted">{p.category}</span></td>
                    <td>
                      <div className="flex gap-1 flex-wrap">
                        {(p.sizes || []).map((s) => (
                          <span
                            key={s.id || s.label}
                            style={{ fontSize: '0.7rem', background: 'var(--color-bg)', padding: '0.15rem 0.45rem', borderRadius: 6, fontWeight: 600 }}
                          >
                            {s.label}: {formatCurrency(s.price)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="font-semibold">{p.orders ?? 0}</td>
                    <td>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: p.is_available ? '#065f46' : '#991b1b' }}>
                        {p.is_available ? '● Available' : '○ Unavailable'}
                      </span>
                    </td>
                    <td>
                      {p.is_featured
                        ? <Star size={16} fill="#f59e0b" stroke="#f59e0b" />
                        : <span className="text-muted">—</span>}
                    </td>
                    <td>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/products/${p.id}`)}>Edit</button>
                        <button className="btn btn-secondary btn-sm" title="Duplicate" onClick={() => handleDuplicate(p)}><Copy size={14} /></button>
                        <button className="btn btn-secondary btn-sm" title={p.is_featured ? 'Unfeature' : 'Feature'} onClick={() => handleToggleFeatured(p)}>
                          <Star size={14} fill={p.is_featured ? '#f59e0b' : 'none'} stroke={p.is_featured ? '#f59e0b' : 'currentColor'} />
                        </button>
                        <button className="btn btn-secondary btn-sm" title={p.is_available ? 'Mark Unavailable' : 'Mark Available'} onClick={() => handleToggleAvailable(p)}>
                          {p.is_available ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty-state">
                        <div className="empty-state-icon">🌺</div>
                        <h3>No arrangements found</h3>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

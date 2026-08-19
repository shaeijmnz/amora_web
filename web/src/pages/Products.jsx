import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Star, Copy, Eye } from 'lucide-react'
import { formatCurrency } from '../lib/utils'
import { useToast } from '../context/ToastContext'
import { api, mediaUrl } from '../lib/api'

function ProductFlower({ product }) {
  const navigate = useNavigate()
  const toast = useToast()
  const occasions = product.occasions?.length ? product.occasions : [product.category].filter(Boolean)
  const sizes = product.sizes?.length ? product.sizes : []
  const fromPrice = sizes.length ? Math.min(...sizes.map((s) => s.price)) : 0
  const imageSrc = mediaUrl(product.primary_image_url || product.images?.[0])

  return (
    <div className="card" style={{ overflow: 'visible' }}>
      <div style={{
        height: 160,
        background: imageSrc
          ? `center / cover no-repeat url("${imageSrc}")`
          : 'linear-gradient(135deg, #fdf0f3 0%, #f4e8ef 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '3.5rem',
        position: 'relative',
        borderRadius: '16px 16px 0 0',
      }}>
        {!imageSrc && '🌸'}
        {product.is_featured && (
          <span style={{
            position: 'absolute', top: 10, left: 10,
            background: '#f59e0b', color: '#fff',
            fontSize: '0.65rem', fontWeight: 700,
            padding: '0.2rem 0.5rem', borderRadius: 999,
            display: 'flex', alignItems: 'center', gap: 3,
          }}>
            <Star size={10} fill="white" /> FEATURED
          </span>
        )}
      </div>

      <div style={{ padding: '1rem 1.25rem' }}>
        <h3 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: 700 }}>{product.name}</h3>
        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-muted)', lineHeight: 1.5 }}>{product.description}</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', margin: '0.75rem 0' }}>
          {occasions.slice(0, 2).map((occ) => (
            <span key={occ} style={{ fontSize: '0.65rem', background: 'var(--color-blush)', color: 'var(--color-rose-dark)', padding: '0.15rem 0.5rem', borderRadius: 999, fontWeight: 600 }}>{occ}</span>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-muted)', textTransform: 'uppercase', fontWeight: 600 }}>From</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-rose-dark)' }}>{formatCurrency(fromPrice)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Orders</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{product.orders ?? 0}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => navigate(`/products/${product.id}`)}>
            <Eye size={14} /> View
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => toast.info('Coming soon')}><Copy size={14} /></button>
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

  useEffect(() => {
    api.products()
      .then((res) => setProducts(res.data || []))
      .catch((e) => toast.error(e.message || 'Failed to load products'))
      .finally(() => setLoading(false))
  }, [])

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
          <h1 className="page-title">Products & Arrangements</h1>
          <p className="page-subtitle">{products.length} arrangements • Synced from Laravel / customer shop</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/products/new')}>
          <Plus size={16} /> Add Arrangement
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="filters-bar">
          <div className="search-wrapper">
            <Search className="search-icon" />
            <input type="text" className="form-input search-input" placeholder="Search arrangements..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="form-select" style={{ width: 'auto' }} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Products</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
            <option value="featured">Featured</option>
          </select>
          <div className="flex gap-1" style={{ marginLeft: 'auto' }}>
            <button className={`btn btn-sm ${view === 'grid' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('grid')}>Grid</button>
            <button className={`btn btn-sm ${view === 'list' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('list')}>List</button>
          </div>
        </div>

        {loading ? (
          <div className="empty-state"><h3>Loading products…</h3></div>
        ) : view === 'grid' ? (
          <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: '1rem' }}>
            {filtered.map((p) => <ProductFlower key={p.id} product={p} />)}
            {filtered.length === 0 && (
              <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                <div className="empty-state-icon">🌺</div>
                <h3>No products yet</h3>
                <p>Add products in Laravel or here — they appear in the customer app.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Sizes / Prices</th>
                  <th>Orders</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/products/${p.id}`)}>
                    <td className="font-semibold">{p.name}</td>
                    <td className="text-xs text-muted">{p.category}</td>
                    <td>
                      {(p.sizes || []).map((s) => (
                        <span key={s.id || s.label} style={{ fontSize: '0.7rem', marginRight: 6 }}>{s.label}: {formatCurrency(s.price)}</span>
                      ))}
                    </td>
                    <td>{p.orders ?? 0}</td>
                    <td>{p.is_available ? 'Available' : 'Unavailable'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Star, Archive, Copy, Eye, ToggleLeft, ToggleRight } from 'lucide-react'
import { formatCurrency, formatDate } from '../lib/utils'
import { useToast } from '../context/ToastContext'
import { Modal } from '../components/Modal'

const MOCK_PRODUCTS = [
  { id: '1', name: 'Classic Red Bouquet', description: 'A timeless arrangement of fresh red roses', primary_image_url: null, preparation_time_minutes: 60, is_available: true, is_featured: true, orders: 42, sizes: [{ label: 'Small', price: 850 }, { label: 'Medium', price: 1400 }, { label: 'Large', price: 2100 }], occasions: ['Valentine\'s Day', 'Anniversary', 'Birthday'], created_at: '2026-01-15' },
  { id: '2', name: 'Sunflower Sunshine', description: 'Bright sunflowers to brighten anyone\'s day', primary_image_url: null, preparation_time_minutes: 45, is_available: true, is_featured: false, orders: 31, sizes: [{ label: 'Small', price: 650 }, { label: 'Medium', price: 1200 }], occasions: ['Birthday', 'Congratulations', 'Thank You'], created_at: '2026-02-01' },
  { id: '3', name: 'Pastel Dream Mix', description: 'A soft mix of pastel blooms for special moments', primary_image_url: null, preparation_time_minutes: 90, is_available: true, is_featured: true, orders: 28, sizes: [{ label: 'Medium', price: 1800 }, { label: 'Large', price: 2800 }], occasions: ['Wedding', 'Anniversary', 'Mother\'s Day'], created_at: '2026-02-14' },
  { id: '4', name: 'White Elegance', description: 'Pure white arrangements for solemn occasions', primary_image_url: null, preparation_time_minutes: 75, is_available: true, is_featured: false, orders: 21, sizes: [{ label: 'Small', price: 1200 }, { label: 'Large', price: 2400 }], occasions: ['Sympathy', 'Wedding'], created_at: '2026-03-01' },
  { id: '5', name: 'Purple Garden Rose', description: 'Rich purple tones for a regal statement', primary_image_url: null, preparation_time_minutes: 60, is_available: false, is_featured: false, orders: 18, sizes: [{ label: 'Medium', price: 1600 }], occasions: ['Birthday', 'Anniversary'], created_at: '2026-03-10' },
  { id: '6', name: 'Get Well Basket', description: 'Cheerful mix with chocolates and balloons', primary_image_url: null, preparation_time_minutes: 30, is_available: true, is_featured: false, orders: 15, sizes: [{ label: 'Standard', price: 1950 }], occasions: ['Get Well Soon'], created_at: '2026-04-01' },
]

const OCCASIONS = ['Birthday', 'Anniversary', 'Wedding', 'Graduation', "Valentine's Day", "Mother's Day", 'Sympathy', 'Congratulations', 'Get Well Soon', 'Thank You', 'Other']

function ProductFlower({ product }) {
  const navigate = useNavigate()
  const toast = useToast()

  return (
    <div className="card" style={{ overflow: 'visible' }}>
      {/* Image */}
      <div style={{
        height: 160,
        background: 'linear-gradient(135deg, #fdf0f3 0%, #f4e8ef 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '3.5rem',
        position: 'relative',
        borderRadius: '16px 16px 0 0',
      }}>
        🌸
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
        <span style={{
          position: 'absolute', top: 10, right: 10,
          background: product.is_available ? '#d1fae5' : '#fee2e2',
          color: product.is_available ? '#065f46' : '#991b1b',
          fontSize: '0.65rem', fontWeight: 700,
          padding: '0.2rem 0.5rem', borderRadius: 999,
        }}>
          {product.is_available ? '● Available' : '○ Unavailable'}
        </span>
      </div>

      <div style={{ padding: '1rem 1.25rem' }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <h3 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: 700 }}>{product.name}</h3>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-muted)', lineHeight: 1.5 }}>{product.description}</p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.75rem' }}>
          {product.occasions.slice(0, 2).map((occ) => (
            <span key={occ} style={{ fontSize: '0.65rem', background: 'var(--color-blush)', color: 'var(--color-rose-dark)', padding: '0.15rem 0.5rem', borderRadius: 999, fontWeight: 600 }}>{occ}</span>
          ))}
          {product.occasions.length > 2 && <span style={{ fontSize: '0.65rem', color: 'var(--color-muted)' }}>+{product.occasions.length - 2}</span>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-muted)', textTransform: 'uppercase', fontWeight: 600 }}>From</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-rose-dark)' }}>
              {formatCurrency(Math.min(...product.sizes.map((s) => s.price)))}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Orders</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{product.orders}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => navigate(`/products/${product.id}`)}>
            <Eye size={14} /> View
          </button>
          <button className="btn btn-secondary btn-sm" title="Duplicate" onClick={() => toast.info('Duplicated arrangement')}><Copy size={14} /></button>
          <button className="btn btn-secondary btn-sm" title={product.is_featured ? 'Unfeature' : 'Feature'} onClick={() => toast.success(product.is_featured ? 'Removed from featured' : 'Added to featured')}>
            <Star size={14} fill={product.is_featured ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Products() {
  const navigate = useNavigate()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [view, setView] = useState('grid')

  const filtered = MOCK_PRODUCTS.filter((p) => {
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
          <p className="page-subtitle">{MOCK_PRODUCTS.length} arrangements • Manage your floral collection</p>
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

        {view === 'grid' ? (
          <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: '1rem' }}>
            {filtered.map((p) => <ProductFlower key={p.id} product={p} />)}
            {filtered.length === 0 && (
              <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                <div className="empty-state-icon">🌺</div>
                <h3>No arrangements found</h3>
                <p>Try adjusting your filters or add a new arrangement.</p>
                <button className="btn btn-primary" onClick={() => navigate('/products/new')}><Plus size={16} /> Add Arrangement</button>
              </div>
            )}
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Occasions</th>
                  <th>Sizes / Prices</th>
                  <th>Orders</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/products/${p.id}`)}>
                    <td><span className="font-semibold">{p.name}</span></td>
                    <td><span className="text-xs text-muted">{p.occasions.join(', ')}</span></td>
                    <td>
                      <div className="flex gap-1 flex-wrap">
                        {p.sizes.map((s) => (
                          <span key={s.label} style={{ fontSize: '0.7rem', background: 'var(--color-bg)', padding: '0.15rem 0.45rem', borderRadius: 6, fontWeight: 600 }}>
                            {s.label}: {formatCurrency(s.price)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="font-semibold">{p.orders}</td>
                    <td>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: p.is_available ? '#065f46' : '#991b1b' }}>
                        {p.is_available ? '● Available' : '○ Unavailable'}
                      </span>
                    </td>
                    <td>{p.is_featured ? <Star size={16} fill="#f59e0b" stroke="#f59e0b" /> : <span className="text-muted">—</span>}</td>
                    <td>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/products/${p.id}`)}>Edit</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => toast.info('Duplicated')}><Copy size={14} /></button>
                      </div>
                    </td>
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

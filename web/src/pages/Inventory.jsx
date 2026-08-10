import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { Badge } from '../components/Badge'
import { useToast } from '../context/ToastContext'
import { api } from '../lib/api'

export default function Inventory() {
  const toast = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  useEffect(() => {
    api.inventory()
      .then((res) => setItems(res.data || []))
      .catch((e) => toast.error(e.message || 'Failed to load inventory'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = items.filter((item) => {
    const match = item.name.toLowerCase().includes(search.toLowerCase())
    if (status === 'all') return match
    return match && item.status === status
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">{items.length} items • Synced from Laravel</p>
        </div>
      </div>

      <div className="card">
        <div className="filters-bar">
          <div className="search-wrapper">
            <Search className="search-icon" />
            <input className="form-input search-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search stock…" />
          </div>
          <select className="form-select" style={{ width: 'auto' }} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="in_stock">In stock</option>
            <option value="low_stock">Low stock</option>
            <option value="out_of_stock">Out of stock</option>
          </select>
        </div>

        <div className="table-wrapper" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Qty</th>
                <th>Min</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={5}><div className="empty-state"><h3>Loading inventory…</h3></div></td></tr>}
              {!loading && filtered.map((item) => (
                <tr key={item.id}>
                  <td className="font-semibold">{item.name}</td>
                  <td className="text-sm text-muted">{item.category}</td>
                  <td>{item.quantity_on_hand} {item.unit}</td>
                  <td>{item.min_stock_level}</td>
                  <td><Badge value={item.status} /></td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={5}><div className="empty-state"><h3>No inventory items</h3></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

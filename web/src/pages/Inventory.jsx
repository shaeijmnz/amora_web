import { useCallback, useEffect, useState } from 'react'
import { Search, SlidersHorizontal, RefreshCw } from 'lucide-react'
import { Badge } from '../components/Badge'
import { Modal } from '../components/Modal'
import { useToast } from '../context/ToastContext'
import { useNotifications } from '../context/NotificationContext'
import { api } from '../lib/api'

const MOVEMENT_TYPES = [
  { value: 'stock_in', label: 'Stock in (restock)' },
  { value: 'adjustment', label: 'Adjustment (recount)' },
  { value: 'damaged', label: 'Damaged' },
  { value: 'spoiled', label: 'Spoiled' },
  { value: 'reserved_release', label: 'Reserved release' },
]

function AdjustModal({ item, onClose, onSaved }) {
  const toast = useToast()
  const [qty, setQty] = useState('')
  const [min, setMin] = useState('')
  const [type, setType] = useState('adjustment')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!item) return
    setQty(String(item.quantity_on_hand ?? ''))
    setMin(String(item.min_stock_level ?? 5))
    setType('adjustment')
    setReason('')
  }, [item])

  if (!item) return null

  const nextQty = Number(qty)
  const nextMin = Number(min)
  const preview = Number.isNaN(nextQty) || Number.isNaN(nextMin)
    ? null
    : nextQty <= 0 ? 'out_of_stock' : nextQty <= nextMin ? 'low_stock' : 'in_stock'

  const save = async () => {
    if (Number.isNaN(nextQty) || nextQty < 0) return toast.error('Enter a valid quantity')
    setSaving(true)
    try {
      await api.updateInventory(item.id, {
        quantity_on_hand: nextQty,
        min_stock_level: nextMin,
        type,
        reason: reason.trim() || null,
      })
      toast.success(`${item.name} updated`)
      onSaved?.()
      onClose()
    } catch (e) {
      toast.error(e.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={!!item} onClose={onClose} title={`Adjust stock — ${item.name}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Quantity on hand</label>
            <input type="number" min={0} className="form-input" value={qty} onChange={(e) => setQty(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Low stock at</label>
            <input type="number" min={0} className="form-input" value={min} onChange={(e) => setMin(e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Movement type</label>
          <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
            {MOVEMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Reason</label>
          <input className="form-input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Delivery from supplier" />
        </div>

        {preview && (
          <div style={{ background: '#fdf2f4', borderRadius: 10, padding: '0.75rem 0.875rem', fontSize: '0.85rem' }}>
            Will be saved as <Badge value={preview} />
            <div className="text-xs text-muted" style={{ marginTop: '0.35rem' }}>
              An item counts as low stock once it reaches {nextMin || 0} or fewer.
            </div>
          </div>
        )}

        <button className="btn btn-primary w-full" disabled={saving} onClick={save}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </Modal>
  )
}

export default function Inventory() {
  const toast = useToast()
  const { refresh: refreshBadge } = useNotifications()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [adjusting, setAdjusting] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    api.inventory()
      .then((res) => setItems(res.data || []))
      .catch((e) => toast.error(e.message || 'Failed to load inventory'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = items.filter((item) => {
    const match = item.name.toLowerCase().includes(search.toLowerCase())
    if (status === 'all') return match
    return match && item.status === status
  })

  const lowCount = items.filter((i) => i.status === 'low_stock').length
  const outCount = items.filter((i) => i.status === 'out_of_stock').length
  const threshold = items[0]?.min_stock_level ?? 5

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">
            {items.length} items • Flagged as low stock once a bloom reaches {threshold} or fewer
          </p>
        </div>
        <button className="btn btn-secondary" onClick={load} disabled={loading}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="stat-card"><div className="stat-label">Tracked Items</div><div className="stat-value">{items.length}</div></div>
        <div className="stat-card"><div className="stat-label">Low Stock</div><div className="stat-value" style={{ color: lowCount ? '#f59e0b' : undefined }}>{lowCount}</div></div>
        <div className="stat-card"><div className="stat-label">Out of Stock</div><div className="stat-value" style={{ color: outCount ? '#dc2626' : undefined }}>{outCount}</div></div>
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
                <th>Low stock at</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6}><div className="empty-state"><h3>Loading inventory…</h3></div></td></tr>}
              {!loading && filtered.map((item) => (
                <tr key={item.id}>
                  <td className="font-semibold">{item.name}</td>
                  <td className="text-sm text-muted">{item.category}</td>
                  <td className="font-semibold">{item.quantity_on_hand} {item.unit}</td>
                  <td className="text-muted">{item.min_stock_level}</td>
                  <td><Badge value={item.status} /></td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => setAdjusting(item)}>
                      <SlidersHorizontal size={14} /> Adjust
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6}><div className="empty-state"><h3>No inventory items</h3></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdjustModal
        item={adjusting}
        onClose={() => setAdjusting(null)}
        onSaved={() => { load(); refreshBadge() }}
      />
    </div>
  )
}

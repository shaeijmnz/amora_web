import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Filter, ArrowUpDown, Archive, Edit2, AlertTriangle, Minus, RotateCcw } from 'lucide-react'
import { Badge } from '../components/Badge'
import { Modal } from '../components/Modal'
import { formatDate, formatDateTime, capitalize, badgeClass } from '../lib/utils'
import { useToast } from '../context/ToastContext'

const MOCK_ITEMS = [
  { id: '1', name: 'Red Roses', category: 'Flowers', unit: 'stem', quantity_on_hand: 8, min_stock_level: 20, status: 'low_stock', expiration_date: '2026-07-30', last_updated_at: new Date().toISOString() },
  { id: '2', name: 'White Lilies', category: 'Flowers', unit: 'stem', quantity_on_hand: 3, min_stock_level: 15, status: 'low_stock', expiration_date: '2026-07-29', last_updated_at: new Date().toISOString() },
  { id: '3', name: 'Sunflowers', category: 'Flowers', unit: 'stem', quantity_on_hand: 0, min_stock_level: 10, status: 'out_of_stock', expiration_date: '2026-07-31', last_updated_at: new Date().toISOString() },
  { id: '4', name: 'Pink Carnations', category: 'Flowers', unit: 'stem', quantity_on_hand: 45, min_stock_level: 12, status: 'in_stock', expiration_date: '2026-08-05', last_updated_at: new Date().toISOString() },
  { id: '5', name: 'Purple Orchids', category: 'Flowers', unit: 'stem', quantity_on_hand: 22, min_stock_level: 10, status: 'in_stock', expiration_date: '2026-08-10', last_updated_at: new Date().toISOString() },
  { id: '6', name: 'Floral Wire', category: 'Materials', unit: 'roll', quantity_on_hand: 15, min_stock_level: 5, status: 'in_stock', expiration_date: null, last_updated_at: new Date().toISOString() },
  { id: '7', name: 'Ribbon (Pink)', category: 'Materials', unit: 'meter', quantity_on_hand: 200, min_stock_level: 50, status: 'in_stock', expiration_date: null, last_updated_at: new Date().toISOString() },
  { id: '8', name: 'Chocolate Box', category: 'Add-ons', unit: 'piece', quantity_on_hand: 2, min_stock_level: 10, status: 'low_stock', expiration_date: '2026-08-01', last_updated_at: new Date().toISOString() },
  { id: '9', name: 'Balloon (Heart)', category: 'Add-ons', unit: 'piece', quantity_on_hand: 30, min_stock_level: 20, status: 'in_stock', expiration_date: null, last_updated_at: new Date().toISOString() },
  { id: '10', name: 'Baby\'s Breath', category: 'Flowers', unit: 'bunch', quantity_on_hand: 1, min_stock_level: 8, status: 'damaged', expiration_date: '2026-07-28', last_updated_at: new Date().toISOString() },
]

const STOCK_STATUSES = ['all', 'in_stock', 'low_stock', 'out_of_stock', 'reserved', 'damaged', 'spoiled']
const CATEGORIES = ['all', 'Flowers', 'Materials', 'Add-ons']

function StockModal({ isOpen, onClose, item, mode }) {
  const [qty, setQty] = useState('')
  const [reason, setReason] = useState('')
  const toast = useToast()

  const titles = {
    add: '➕ Add Stock',
    deduct: '➖ Deduct Stock',
    adjust: '🔧 Adjust Quantity',
    damaged: '⚠️ Mark as Damaged',
    spoiled: '🚫 Mark as Spoiled',
  }

  function handleSubmit() {
    if (!qty && mode !== 'damaged' && mode !== 'spoiled') return toast.error('Enter quantity')
    toast.success(`Successfully recorded ${mode} for ${item?.name}`)
    onClose()
    setQty('')
    setReason('')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={titles[mode] || 'Stock Action'}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Save</button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label">Item</label>
          <div className="form-input" style={{ background: 'var(--color-bg)', cursor: 'default' }}>
            {item?.name}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">Current Quantity</label>
            <div className="form-input" style={{ background: 'var(--color-bg)', cursor: 'default' }}>
              {item?.quantity_on_hand} {item?.unit}
            </div>
          </div>
          {(mode === 'add' || mode === 'deduct' || mode === 'adjust') && (
            <div className="form-group">
              <label className="form-label">{mode === 'adjust' ? 'New Quantity' : 'Quantity'} <span className="required">*</span></label>
              <input type="number" className="form-input" value={qty} onChange={(e) => setQty(e.target.value)} min="0" placeholder="0" />
            </div>
          )}
        </div>
        <div className="form-group">
          <label className="form-label">Reason / Notes</label>
          <textarea className="form-textarea" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Optional note..." rows={3} />
        </div>
      </div>
    </Modal>
  )
}

export default function Inventory() {
  const navigate = useNavigate()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [stockModal, setStockModal] = useState({ open: false, item: null, mode: null })
  const [addItemModal, setAddItemModal] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', category: 'Flowers', unit: 'stem', quantity_on_hand: '', min_stock_level: '', expiration_date: '' })

  const filtered = MOCK_ITEMS.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.category.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || item.status === statusFilter
    const matchCat = categoryFilter === 'all' || item.category === categoryFilter
    return matchSearch && matchStatus && matchCat
  })

  const openStockModal = (item, mode) => setStockModal({ open: true, item, mode })

  function handleAddItem() {
    if (!newItem.name) return toast.error('Item name is required')
    toast.success(`${newItem.name} added to inventory`)
    setAddItemModal(false)
    setNewItem({ name: '', category: 'Flowers', unit: 'stem', quantity_on_hand: '', min_stock_level: '', expiration_date: '' })
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory Management</h1>
          <p className="page-subtitle">{filtered.length} items • Track flowers, materials, and add-ons</p>
        </div>
        <button className="btn btn-primary" onClick={() => setAddItemModal(true)}>
          <Plus size={16} /> Add Item
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="filters-bar">
          <div className="search-wrapper">
            <Search className="search-icon" />
            <input
              type="text"
              className="form-input search-input"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="form-select" style={{ width: 'auto' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {STOCK_STATUSES.map((s) => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : capitalize(s)}</option>)}
          </select>
          <select className="form-select" style={{ width: 'auto' }} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
          </select>
        </div>

        <div className="table-wrapper" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Min Level</th>
                <th>Status</th>
                <th>Expiry Date</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <div className="empty-state-icon">🌿</div>
                      <h3>No items found</h3>
                      <p>Try adjusting your search or filters.</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span className="font-semibold">{item.name}</span>
                  </td>
                  <td><span className="text-sm text-muted">{item.category}</span></td>
                  <td>
                    <span className={`font-semibold ${item.quantity_on_hand === 0 ? 'text-rose' : item.quantity_on_hand < item.min_stock_level ? '' : 'text-sage'}`}>
                      {item.quantity_on_hand} <span className="text-muted font-bold" style={{ fontWeight: 400, fontSize: '0.75rem' }}>{item.unit}</span>
                    </span>
                  </td>
                  <td className="text-muted text-sm">{item.min_stock_level} {item.unit}</td>
                  <td><Badge value={item.status} /></td>
                  <td className="text-sm">
                    {item.expiration_date ? (
                      <span style={{ color: new Date(item.expiration_date) < new Date(Date.now() + 3 * 86400000) ? '#ef4444' : 'inherit' }}>
                        {formatDate(item.expiration_date)}
                      </span>
                    ) : <span className="text-muted">—</span>}
                  </td>
                  <td className="text-xs text-muted">{formatDateTime(item.last_updated_at)}</td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn btn-secondary btn-sm" title="Add Stock" onClick={() => openStockModal(item, 'add')}><Plus size={14} /></button>
                      <button className="btn btn-secondary btn-sm" title="Deduct Stock" onClick={() => openStockModal(item, 'deduct')}><Minus size={14} /></button>
                      <button className="btn btn-secondary btn-sm" title="Adjust Quantity" onClick={() => openStockModal(item, 'adjust')}><RotateCcw size={14} /></button>
                      <button className="btn btn-danger btn-sm" title="Mark Damaged/Spoiled" onClick={() => openStockModal(item, 'damaged')}><AlertTriangle size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Action Modal */}
      <StockModal
        isOpen={stockModal.open}
        onClose={() => setStockModal({ open: false, item: null, mode: null })}
        item={stockModal.item}
        mode={stockModal.mode}
      />

      {/* Add Item Modal */}
      <Modal
        isOpen={addItemModal}
        onClose={() => setAddItemModal(false)}
        title="Add Inventory Item"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setAddItemModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddItem}>Add Item</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Item Name <span className="required">*</span></label>
            <input className="form-input" placeholder="e.g. Red Roses" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}>
                {['Flowers', 'Materials', 'Add-ons'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Unit</label>
              <select className="form-select" value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}>
                {['stem', 'bunch', 'piece', 'roll', 'meter', 'box', 'pack'].map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Initial Quantity</label>
              <input type="number" className="form-input" min="0" placeholder="0" value={newItem.quantity_on_hand} onChange={(e) => setNewItem({ ...newItem, quantity_on_hand: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Min Stock Level</label>
              <input type="number" className="form-input" min="0" placeholder="0" value={newItem.min_stock_level} onChange={(e) => setNewItem({ ...newItem, min_stock_level: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Expiration Date</label>
            <input type="date" className="form-input" value={newItem.expiration_date} onChange={(e) => setNewItem({ ...newItem, expiration_date: e.target.value })} />
          </div>
        </div>
      </Modal>
    </div>
  )
}

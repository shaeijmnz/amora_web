import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Eye, ShoppingBag, MapPin } from 'lucide-react'
import { formatDate, formatCurrency, getInitials } from '../lib/utils'

const MOCK_CUSTOMERS = [
  { id: '1', name: 'Maria Santos', email: 'maria@email.com', phone: '09171234567', total_orders: 12, total_spent: 24500, last_order_date: '2026-07-27', account_status: 'active', joined: '2025-06-01' },
  { id: '2', name: 'Jose Reyes', email: 'jose@email.com', phone: '09181234567', total_orders: 8, total_spent: 16800, last_order_date: '2026-07-26', account_status: 'active', joined: '2025-08-15' },
  { id: '3', name: 'Ana Cruz', email: 'ana@email.com', phone: '09191234567', total_orders: 3, total_spent: 4200, last_order_date: '2026-07-25', account_status: 'active', joined: '2026-01-10' },
  { id: '4', name: 'Pedro Lim', email: 'pedro@email.com', phone: '09201234567', total_orders: 21, total_spent: 58000, last_order_date: '2026-07-24', account_status: 'active', joined: '2025-02-20' },
  { id: '5', name: 'Rosa Dela Cruz', email: 'rosa@email.com', phone: '09211234567', total_orders: 1, total_spent: 2250, last_order_date: '2026-07-20', account_status: 'inactive', joined: '2026-06-01' },
  { id: '6', name: 'Lita Garcia', email: 'lita@email.com', phone: '09221234567', total_orders: 0, total_spent: 0, last_order_date: null, account_status: 'blocked', joined: '2026-07-01' },
]

const MOCK_CUSTOMER_DETAIL = {
  orders: [
    { order_number: 'ORD-0241', total: 2000, status: 'being_prepared', date: '2026-07-27' },
    { order_number: 'ORD-0230', total: 1850, status: 'completed', date: '2026-07-15' },
    { order_number: 'ORD-0210', total: 3200, status: 'completed', date: '2026-06-20' },
  ],
  addresses: [
    { label: 'Home', address: 'Unit 4B, Serendra Condo, BGC, Taguig City' },
    { label: 'Office', address: '25F One Ayala, Makati City' },
  ],
  notes: [
    { id: '1', note: 'VIP customer — prefers pink and white arrangements', created_by: 'Admin', created_at: '2026-06-01' },
  ],
}

function CustomerProfileModal({ isOpen, onClose, customer }) {
  const [tab, setTab] = useState('orders')
  const [note, setNote] = useState('')
  const detail = MOCK_CUSTOMER_DETAIL

  if (!customer) return null

  const tabs = [
    { id: 'orders', label: '📦 Orders' },
    { id: 'addresses', label: '📍 Addresses' },
    { id: 'notes', label: '📝 Notes' },
  ]

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg" role="dialog">
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="avatar" style={{ width: 44, height: 44, fontSize: '1rem' }}>{getInitials(customer.name)}</div>
            <div>
              <div className="modal-title">{customer.name}</div>
              <div className="text-xs text-muted">{customer.email} · {customer.phone}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Summary row */}
          <div style={{ display: 'flex', gap: '1.5rem', padding: '0.75rem 0', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
            {[
              { label: 'Total Orders', value: customer.total_orders },
              { label: 'Total Spent', value: formatCurrency(customer.total_spent) },
              { label: 'Last Order', value: customer.last_order_date ? formatDate(customer.last_order_date) : '—' },
              { label: 'Member Since', value: formatDate(customer.joined) },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-xs text-muted">{label}</div>
                <div className="font-semibold text-sm">{value}</div>
              </div>
            ))}
            <div style={{ marginLeft: 'auto' }}>
              <div className="text-xs text-muted">Account Status</div>
              <span className={`badge ${customer.account_status === 'active' ? 'badge-in_stock' : customer.account_status === 'blocked' ? 'badge-cancelled' : 'badge-pending'}`}>
                {customer.account_status}
              </span>
            </div>
          </div>

          <div className="tabs" style={{ marginBottom: '1.25rem' }}>
            {tabs.map((t) => (
              <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
            ))}
          </div>

          {tab === 'orders' && (
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {detail.orders.map((o) => (
                  <tr key={o.order_number}>
                    <td className="font-semibold text-rose">{o.order_number}</td>
                    <td className="font-semibold">{formatCurrency(o.total)}</td>
                    <td>
                      <span className={`badge badge-${o.status}`}>{o.status.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="text-sm text-muted">{formatDate(o.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === 'addresses' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {detail.addresses.map((addr, i) => (
                <div key={i} style={{ padding: '0.875rem', background: 'var(--color-bg)', borderRadius: 12, display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <MapPin size={18} style={{ color: 'var(--color-rose)', marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div className="font-semibold text-sm">{addr.label}</div>
                    <div className="text-sm text-muted" style={{ marginTop: 2 }}>{addr.address}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'notes' && (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                {detail.notes.map((n) => (
                  <div key={n.id} style={{ padding: '0.875rem', background: '#fffbeb', borderRadius: 12, borderLeft: '3px solid #f59e0b' }}>
                    <div className="text-sm">{n.note}</div>
                    <div className="text-xs text-muted" style={{ marginTop: '0.35rem' }}>By {n.created_by} · {formatDate(n.created_at)}</div>
                  </div>
                ))}
              </div>
              <div className="form-group">
                <label className="form-label">Add Note</label>
                <textarea className="form-textarea" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note about this customer..." />
              </div>
              <button className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem' }}>Add Note</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Customers() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  const filtered = MOCK_CUSTOMERS.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || c.account_status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">{MOCK_CUSTOMERS.length} registered customers</p>
        </div>
      </div>

      <div className="card">
        <div className="filters-bar">
          <div className="search-wrapper">
            <Search className="search-icon" />
            <input type="text" className="form-input search-input" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="form-select" style={{ width: 'auto' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Accounts</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        <div className="table-wrapper" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Total Orders</th>
                <th>Total Spent</th>
                <th>Last Order</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="avatar">{getInitials(c.name)}</div>
                      <div>
                        <div className="font-semibold">{c.name}</div>
                        <div className="text-xs text-muted">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-sm">{c.phone}</td>
                  <td className="font-semibold">{c.total_orders}</td>
                  <td className="font-semibold">{formatCurrency(c.total_spent)}</td>
                  <td className="text-sm text-muted">{c.last_order_date ? formatDate(c.last_order_date) : '—'}</td>
                  <td className="text-sm text-muted">{formatDate(c.joined)}</td>
                  <td>
                    <span className={`badge ${c.account_status === 'active' ? 'badge-in_stock' : c.account_status === 'blocked' ? 'badge-cancelled' : 'badge-pending'}`}>
                      {c.account_status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => setSelected(c)}>
                      <Eye size={14} /> Profile
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <div className="empty-state-icon">👥</div>
                      <h3>No customers found</h3>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CustomerProfileModal isOpen={!!selected} onClose={() => setSelected(null)} customer={selected} />
    </div>
  )
}

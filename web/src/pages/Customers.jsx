import { useEffect, useState } from 'react'
import { Search, Eye } from 'lucide-react'
import { formatDate, formatCurrency, getInitials } from '../lib/utils'
import { useToast } from '../context/ToastContext'
import { api } from '../lib/api'

export default function Customers() {
  const toast = useToast()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    api.customers()
      .then((res) => setCustomers(res.data || []))
      .catch((e) => toast.error(e.message || 'Failed to load customers'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase()
    const match = c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    if (statusFilter === 'all') return match
    return match && c.account_status === statusFilter
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">{customers.length} registered customers • From mobile signups</p>
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
            <option value="active">Active (verified)</option>
            <option value="inactive">Inactive (unverified)</option>
          </select>
        </div>

        <div className="table-wrapper" style={{ border: 'none' }}>
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
              {loading && (
                <tr><td colSpan={8}><div className="empty-state"><h3>Loading customers…</h3></div></td></tr>
              )}
              {!loading && filtered.map((c) => (
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
                  <td className="text-sm">{c.phone || '—'}</td>
                  <td className="font-semibold">{c.total_orders}</td>
                  <td className="font-semibold">{formatCurrency(c.total_spent)}</td>
                  <td className="text-sm text-muted">{c.last_order_date ? formatDate(c.last_order_date) : '—'}</td>
                  <td className="text-sm text-muted">{c.joined ? formatDate(c.joined) : '—'}</td>
                  <td>
                    <span className={`badge ${c.account_status === 'active' ? 'badge-in_stock' : 'badge-pending'}`}>
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
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <div className="empty-state-icon">👥</div>
                      <h3>No customers yet</h3>
                      <p>When someone signs up on the mobile app, they appear here.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{selected.name}</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p><strong>Email:</strong> {selected.email}</p>
              <p><strong>Phone:</strong> {selected.phone || '—'}</p>
              <p><strong>Orders:</strong> {selected.total_orders}</p>
              <p><strong>Spent:</strong> {formatCurrency(selected.total_spent)}</p>
              <p><strong>Status:</strong> {selected.account_status}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

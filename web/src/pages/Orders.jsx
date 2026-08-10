import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { Badge } from '../components/Badge'
import { formatCurrency, formatDateTime } from '../lib/utils'
import { useToast } from '../context/ToastContext'
import { api } from '../lib/api'

const ORDER_STATUSES = ['all', 'pending', 'confirmed', 'being_prepared', 'ready_for_delivery', 'dispatched', 'delivered', 'completed', 'cancelled', 'refunded']

export default function Orders() {
  const toast = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  useEffect(() => {
    api.orders(status !== 'all' ? { status } : {})
      .then((res) => setOrders(res.data || []))
      .catch((e) => toast.error(e.message || 'Failed to load orders'))
      .finally(() => setLoading(false))
  }, [status])

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase()
    return (
      o.order_number?.toLowerCase().includes(q) ||
      o.customer_name?.toLowerCase().includes(q) ||
      o.customer_email?.toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">{orders.length} total orders • From customer checkout</p>
        </div>
      </div>

      <div className="card">
        <div className="filters-bar">
          <div className="search-wrapper">
            <Search className="search-icon" />
            <input className="form-input search-input" placeholder="Search order # or customer..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="form-select" style={{ width: 'auto' }} value={status} onChange={(e) => { setLoading(true); setStatus(e.target.value) }}>
            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s === 'all' ? 'All statuses' : s.replace(/_/g, ' ')}</option>)}
          </select>
        </div>

        <div className="table-wrapper" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6}><div className="empty-state"><h3>Loading orders…</h3></div></td></tr>}
              {!loading && filtered.map((o) => (
                <tr key={o.id}>
                  <td className="font-semibold text-rose">{o.order_number}</td>
                  <td>
                    <div className="font-semibold">{o.customer_name || '—'}</div>
                    <div className="text-xs text-muted">{o.customer_email}</div>
                  </td>
                  <td className="font-semibold">{formatCurrency(o.total)}</td>
                  <td><Badge value={o.payment_status} /></td>
                  <td><Badge value={o.status} /></td>
                  <td className="text-sm text-muted">{o.created_at ? formatDateTime(o.created_at) : '—'}</td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <div className="empty-state-icon">🧾</div>
                      <h3>No orders yet</h3>
                      <p>Orders placed on mobile will show up here.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

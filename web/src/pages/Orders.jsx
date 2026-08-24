import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { Badge } from '../components/Badge'
import { formatCurrency, formatDateTime } from '../lib/utils'
import { useToast } from '../context/ToastContext'
import { api } from '../lib/api'

const ORDER_STATUSES = ['all', 'confirmed', 'being_prepared', 'ready_for_delivery', 'dispatched', 'delivered', 'completed', 'cancelled', 'refunded']

export default function Orders() {
  const toast = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [updatingId, setUpdatingId] = useState(null)

  const load = () => {
    setLoading(true)
    const params = { payment_status: 'paid' }
    if (status !== 'all') params.status = status
    api.orders(params)
      .then((res) => setOrders(res.data || []))
      .catch((e) => toast.error(e.message || 'Failed to load orders'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [status])

  const updateStatus = async (orderId, nextStatus) => {
    setUpdatingId(orderId)
    try {
      await api.updateOrder(orderId, { status: nextStatus })
      toast.success('Order updated')
      load()
    } catch (e) {
      toast.error(e.message || 'Update failed')
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase()
    return (
      o.order_number?.toLowerCase().includes(q) ||
      o.customer_name?.toLowerCase().includes(q) ||
      o.customer_email?.toLowerCase().includes(q) ||
      o.recipient_name?.toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">{orders.length} paid orders • Unpaid checkouts stay hidden until PayMongo confirms</p>
        </div>
      </div>

      <div className="card">
        <div className="filters-bar">
          <div className="search-wrapper">
            <Search className="search-icon" />
            <input className="form-input search-input" placeholder="Search order # or customer..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="form-select" style={{ width: 'auto' }} value={status} onChange={(e) => setStatus(e.target.value)}>
            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s === 'all' ? 'All statuses' : s.replace(/_/g, ' ')}</option>)}
          </select>
        </div>

        <div className="table-wrapper" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Recipient</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Paid</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8}><div className="empty-state"><h3>Loading orders…</h3></div></td></tr>}
              {!loading && filtered.map((o) => (
                <tr key={o.id}>
                  <td className="font-semibold text-rose">{o.order_number}</td>
                  <td>
                    <div className="font-semibold">{o.customer_name || '—'}</div>
                    <div className="text-xs text-muted">{o.customer_email}</div>
                  </td>
                  <td>
                    <div className="font-semibold">{o.recipient_name || '—'}</div>
                    <div className="text-xs text-muted truncate" style={{ maxWidth: 160 }}>{o.delivery_address}</div>
                  </td>
                  <td className="font-semibold">{formatCurrency(o.total)}</td>
                  <td><Badge value={o.payment_status} /></td>
                  <td><Badge value={o.status} /></td>
                  <td className="text-sm text-muted">{o.paid_at ? formatDateTime(o.paid_at) : '—'}</td>
                  <td>
                    <select
                      className="form-select"
                      style={{ width: 'auto', minWidth: 140 }}
                      value={o.status}
                      disabled={updatingId === o.id}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                    >
                      {ORDER_STATUSES.filter((s) => s !== 'all').map((s) => (
                        <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <div className="empty-state-icon">🧾</div>
                      <h3>No paid orders yet</h3>
                      <p>Orders appear here after PayMongo payment succeeds.</p>
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

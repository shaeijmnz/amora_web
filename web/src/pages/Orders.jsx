import { useEffect, useState } from 'react'
import { Search, PackageCheck } from 'lucide-react'
import { Badge } from '../components/Badge'
import { Modal } from '../components/Modal'
import { formatCurrency, formatDate, formatDateTime, capitalize } from '../lib/utils'
import { useToast } from '../context/ToastContext'
import { api } from '../lib/api'

const ORDER_STATUSES = ['all', 'confirmed', 'being_prepared', 'ready_for_delivery', 'dispatched', 'delivered', 'completed', 'cancelled', 'refunded']

const PARCEL_STATUSES = ['unscheduled', 'scheduled', 'assigned', 'preparing_for_dispatch', 'dispatched', 'out_for_delivery', 'delivered', 'delivery_failed', 'rescheduled']

const RIDERS = ['Rider A', 'Rider B', 'Rider C']

const formatTimeSlot = (raw) => {
  if (!raw) return ''
  const [h, m = '00'] = String(raw).split(':')
  const hour = Number(h)
  if (Number.isNaN(hour)) return raw
  const suffix = hour >= 12 ? 'PM' : 'AM'
  return `${hour % 12 === 0 ? 12 : hour % 12}:${String(m).padStart(2, '0')} ${suffix}`
}

/// The slot is chosen by the customer at checkout, so admin only displays it.
const formatSlot = (o) => {
  const date = o?.requested_delivery_date || o?.scheduled_date
  const time = o?.requested_delivery_time || o?.scheduled_time
  if (!date) return 'No slot chosen'
  return `${formatDate(date)}${time ? ` · ${formatTimeSlot(time)}` : ''}`
}

function ParcelModal({ order, onClose, onSaved }) {
  const toast = useToast()
  const [parcelStatus, setParcelStatus] = useState('')
  const [rider, setRider] = useState('')
  const [failedReason, setFailedReason] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!order) return
    setParcelStatus(order.delivery_status || 'unscheduled')
    setRider(order.assigned_rider || '')
    setFailedReason(order.failed_reason || '')
  }, [order])

  if (!order) return null

  const save = async () => {
    if (parcelStatus === 'delivery_failed' && !failedReason.trim()) {
      return toast.error('Enter a failed reason')
    }
    setSaving(true)
    try {
      await api.updateOrder(order.id, {
        delivery_status: parcelStatus,
        assigned_rider: rider || null,
        failed_reason: failedReason.trim() || null,
      })
      toast.success('Parcel updated')
      onSaved?.()
      onClose()
    } catch (e) {
      toast.error(e.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={!!order} onClose={onClose} title={`Parcel — ${order.order_number}`} size="modal-lg">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <div className="text-xs text-muted font-semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Order</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <div className="flex gap-2">
                <span className="text-muted" style={{ minWidth: 110 }}>Customer:</span>
                <span className="font-semibold">{order.customer_name || '—'}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted" style={{ minWidth: 110 }}>Recipient:</span>
                <span className="font-semibold">{order.recipient_name || '—'}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted" style={{ minWidth: 110 }}>Contact:</span>
                <span className="font-semibold">{order.recipient_contact || '—'}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted" style={{ minWidth: 110 }}>Address:</span>
                <span>{order.delivery_address || '—'}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted" style={{ minWidth: 110 }}>Notes:</span>
                <span>{order.delivery_notes || '—'}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted" style={{ minWidth: 110 }}>Total:</span>
                <span className="font-semibold">{formatCurrency(order.total)}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted" style={{ minWidth: 110 }}>Paid:</span>
                <span>{order.paid_at ? formatDateTime(order.paid_at) : '—'}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs text-muted font-semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Customer's Chosen Schedule</div>
            <div style={{ background: '#fdf2f4', borderRadius: 10, padding: '0.75rem 0.875rem' }}>
              <div className="font-semibold" style={{ fontSize: '0.95rem' }}>{formatSlot(order)}</div>
              <div className="text-xs text-muted" style={{ marginTop: '0.3rem' }}>
                Picked by the customer at checkout — not editable here.
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs text-muted font-semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Blooms</div>
            {(order.items || []).map((it) => (
              <div key={it.id} className="text-sm" style={{ marginBottom: '0.3rem' }}>
                {it.quantity}× {it.product_name}
                {it.size_label ? <span className="text-muted"> ({it.size_label})</span> : null}
              </div>
            ))}
            {(order.items || []).length === 0 && <div className="text-sm text-muted">No items</div>}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="text-xs text-muted font-semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>What You Manage</div>

          <div className="form-group">
            <label className="form-label">Assign Rider</label>
            <select className="form-select" value={rider} onChange={(e) => setRider(e.target.value)}>
              <option value="">— Unassigned —</option>
              {RIDERS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Flower / Parcel Status</label>
            <select className="form-select" value={parcelStatus} onChange={(e) => setParcelStatus(e.target.value)}>
              {PARCEL_STATUSES.map((s) => <option key={s} value={s}>{capitalize(s)}</option>)}
            </select>
            <div className="text-xs text-muted" style={{ marginTop: '0.4rem' }}>
              The buyer sees this progress in the mobile app right away.
            </div>
          </div>

          {parcelStatus === 'delivery_failed' && (
            <div className="form-group">
              <label className="form-label">Failed Reason <span className="required">*</span></label>
              <textarea className="form-textarea" rows={2} value={failedReason} onChange={(e) => setFailedReason(e.target.value)} placeholder="e.g. No one home, wrong address..." />
            </div>
          )}

          <button className="btn btn-primary w-full" disabled={saving} onClick={save}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default function Orders() {
  const toast = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [updatingId, setUpdatingId] = useState(null)
  const [managing, setManaging] = useState(null)

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

  const updateParcel = async (order, nextStatus) => {
    // A failed delivery needs a reason, so send the owner to the full form.
    if (nextStatus === 'delivery_failed') {
      setManaging({ ...order, delivery_status: nextStatus })
      return
    }
    const orderId = order.id
    setUpdatingId(orderId)
    try {
      await api.updateOrder(orderId, { delivery_status: nextStatus })
      toast.success('Parcel updated')
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

  const unassigned = orders.filter((o) => !o.assigned_rider).length

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">
            {orders.length} paid orders • {unassigned} awaiting a rider • Customers pick their own date and time
          </p>
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
                <th>Customer Slot</th>
                <th>Rider</th>
                <th>Total</th>
                <th>Parcel Status</th>
                <th>Move Parcel</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={9}><div className="empty-state"><h3>Loading orders…</h3></div></td></tr>}
              {!loading && filtered.map((o) => (
                <tr key={o.id}>
                  <td className="font-semibold text-rose" style={{ whiteSpace: 'nowrap' }}>{o.order_number}</td>
                  <td>
                    <div className="font-semibold">{o.customer_name || '—'}</div>
                    <div className="text-xs text-muted">{o.customer_email}</div>
                  </td>
                  <td>
                    <div className="font-semibold">{o.recipient_name || '—'}</div>
                    <div className="text-xs text-muted truncate" style={{ maxWidth: 160 }}>{o.delivery_address}</div>
                  </td>
                  <td className="text-sm" style={{ whiteSpace: 'nowrap' }}>{formatSlot(o)}</td>
                  <td>
                    {o.assigned_rider
                      ? <span className="text-sm font-semibold">{o.assigned_rider}</span>
                      : <span className="text-xs" style={{ color: '#f59e0b', fontWeight: 600 }}>Unassigned</span>
                    }
                  </td>
                  <td className="font-semibold">{formatCurrency(o.total)}</td>
                  <td style={{ whiteSpace: 'nowrap' }}><Badge value={o.delivery_status || o.status} /></td>
                  <td>
                    <select
                      className="form-select"
                      style={{ width: 'auto', minWidth: 150 }}
                      value={o.delivery_status || 'unscheduled'}
                      disabled={updatingId === o.id}
                      onChange={(e) => updateParcel(o, e.target.value)}
                    >
                      {PARCEL_STATUSES.map((s) => (
                        <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => setManaging(o)}>
                      <PackageCheck size={14} /> Manage
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={9}>
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

      <ParcelModal
        order={managing}
        onClose={() => setManaging(null)}
        onSaved={load}
      />
    </div>
  )
}

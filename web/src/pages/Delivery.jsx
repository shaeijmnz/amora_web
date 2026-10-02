import { useEffect, useState } from 'react'
import { Search, Eye } from 'lucide-react'
import { Badge } from '../components/Badge'
import { Modal } from '../components/Modal'
import { formatCurrency, formatDate, formatDateTime, capitalize } from '../lib/utils'
import { useToast } from '../context/ToastContext'
import { api } from '../lib/api'

const DELIVERY_STATUSES = ['all', 'unscheduled', 'scheduled', 'assigned', 'preparing_for_dispatch', 'dispatched', 'out_for_delivery', 'delivered', 'delivery_failed', 'rescheduled']

const RIDERS = ['Rider A', 'Rider B', 'Rider C']

const STATUS_GROUPS = {
  'Unscheduled': ['unscheduled'],
  'Scheduled': ['scheduled'],
  'In Progress': ['assigned', 'preparing_for_dispatch', 'dispatched', 'out_for_delivery'],
  'Completed': ['delivered'],
  'Issues': ['delivery_failed', 'rescheduled'],
}

const formatTimeSlot = (raw) => {
  if (!raw) return ''
  const [h, m = '00'] = String(raw).split(':')
  const hour = Number(h)
  if (Number.isNaN(hour)) return raw
  const suffix = hour >= 12 ? 'PM' : 'AM'
  return `${hour % 12 === 0 ? 12 : hour % 12}:${String(m).padStart(2, '0')} ${suffix}`
}

/// The customer picks the slot at checkout; fall back to the delivery row for
/// legacy orders created before scheduling moved to the mobile form.
const formatSlot = (d) => {
  const date = d?.requested_date || d?.scheduled_date
  const time = d?.requested_time || d?.scheduled_time
  if (!date) return 'No slot chosen'
  return `${formatDate(date)}${time ? ` · ${formatTimeSlot(time)}` : ''}`
}

function DeliveryDetailModal({ isOpen, onClose, delivery, onSaved }) {
  const toast = useToast()
  const [status, setStatus] = useState(delivery?.status || '')
  const [rider, setRider] = useState(delivery?.assigned_rider || '')
  const [failedReason, setFailedReason] = useState(delivery?.failed_reason || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!delivery) return
    setStatus(delivery.status || '')
    setRider(delivery.assigned_rider || '')
    setFailedReason(delivery.failed_reason || '')
  }, [delivery])

  if (!delivery) return null

  const save = async () => {
    if (status === 'delivery_failed' && !failedReason) return toast.error('Enter a failed reason')
    setSaving(true)
    try {
      await api.updateDelivery(delivery.id, {
        status,
        assigned_rider: rider || null,
        failed_reason: failedReason || null,
      })
      toast.success('Delivery updated')
      onSaved?.()
      onClose()
    } catch (e) {
      toast.error(e.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Delivery — ${delivery.order_number}`} size="modal-lg">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <div className="text-xs text-muted font-semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Delivery Info</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <div className="flex gap-2">
                <span className="text-muted" style={{ minWidth: 110 }}>Recipient:</span>
                <span className="font-semibold">{delivery.recipient}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted" style={{ minWidth: 110 }}>Contact:</span>
                <span className="font-semibold">{delivery.recipient_contact || '—'}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted" style={{ minWidth: 110 }}>Address:</span>
                <span className="font-semibold">{delivery.address}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted" style={{ minWidth: 110 }}>Instructions:</span>
                <span>{delivery.delivery_instructions || '—'}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted" style={{ minWidth: 110 }}>Delivery Fee:</span>
                <span className="font-semibold">{formatCurrency(delivery.delivery_fee)}</span>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-muted" style={{ minWidth: 110 }}>Status:</span>
                <Badge value={delivery.status} />
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs text-muted font-semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Customer's Chosen Schedule</div>
            <div style={{ background: '#fdf2f4', borderRadius: 10, padding: '0.75rem 0.875rem' }}>
              <div className="font-semibold" style={{ fontSize: '0.95rem' }}>{formatSlot(delivery)}</div>
              <div className="text-xs text-muted" style={{ marginTop: '0.3rem' }}>
                Picked by the customer at checkout — not editable here.
              </div>
            </div>
          </div>

          {(delivery.attempts || []).length > 0 && (
            <div>
              <div className="text-xs text-muted font-semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Delivery Attempts</div>
              {delivery.attempts.map((a) => (
                <div key={`${a.number}-${a.attempted_at}`} style={{ background: a.status === 'failed' ? '#fee2e2' : '#d1fae5', borderRadius: 10, padding: '0.65rem 0.875rem', fontSize: '0.8rem', marginBottom: 8 }}>
                  <div className="font-semibold">Attempt #{a.number} — {a.status}</div>
                  {a.failed_reason && <div style={{ marginTop: '0.25rem', color: '#991b1b' }}>Reason: {a.failed_reason}</div>}
                  <div className="text-muted" style={{ marginTop: '0.2rem' }}>{a.attempted_at ? formatDateTime(a.attempted_at) : ''}</div>
                </div>
              ))}
            </div>
          )}
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
            <label className="form-label">Update Delivery Status</label>
            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              {DELIVERY_STATUSES.filter((s) => s !== 'all').map((s) => <option key={s} value={s}>{capitalize(s)}</option>)}
            </select>
          </div>

          {status === 'delivery_failed' && (
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

export default function Delivery() {
  const toast = useToast()
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [activeGroup, setActiveGroup] = useState('Unscheduled')

  const load = () => {
    setLoading(true)
    api.deliveries()
      .then((res) => setDeliveries(res.data || []))
      .catch((e) => toast.error(e.message || 'Failed to load deliveries'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = deliveries.filter((d) => {
    const matchSearch =
      (d.order_number || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.recipient || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || d.status === statusFilter
    return matchSearch && matchStatus
  })

  const counts = Object.fromEntries(
    Object.entries(STATUS_GROUPS).map(([group, statuses]) => [
      group,
      deliveries.filter((d) => statuses.includes(d.status)).length,
    ])
  )

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Delivery Management</h1>
          <p className="page-subtitle">{deliveries.length} deliveries from paid orders • Customers pick the slot, you assign the rider and move the status</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {Object.entries(STATUS_GROUPS).map(([group, statuses]) => (
          <div
            key={group}
            className="stat-card"
            style={{ flex: '1 1 140px', cursor: 'pointer', border: activeGroup === group ? '2px solid var(--color-rose)' : undefined }}
            onClick={() => { setActiveGroup(group); setStatusFilter(statuses[0]) }}
          >
            <div className="stat-label">{group}</div>
            <div className="stat-value">{counts[group]}</div>
          </div>
        ))}
        <div className="stat-card" style={{ flex: '1 1 140px', cursor: 'pointer', border: statusFilter === 'all' ? '2px solid var(--color-rose)' : undefined }} onClick={() => { setStatusFilter('all'); setActiveGroup('') }}>
          <div className="stat-label">All</div>
          <div className="stat-value">{deliveries.length}</div>
        </div>
      </div>

      <div className="card">
        <div className="filters-bar">
          <div className="search-wrapper">
            <Search className="search-icon" />
            <input type="text" className="form-input search-input" placeholder="Search by order or recipient..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="form-select" style={{ width: 'auto' }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setActiveGroup('') }}>
            {DELIVERY_STATUSES.map((s) => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : capitalize(s)}</option>)}
          </select>
        </div>

        <div className="table-wrapper" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Recipient</th>
                <th>Address</th>
                <th>Rider</th>
                <th>Customer Slot</th>
                <th>Status</th>
                <th>Attempts</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={8}><div className="empty-state"><h3>Loading deliveries…</h3></div></td></tr>
              )}
              {!loading && filtered.map((d) => (
                <tr key={d.id}>
                  <td><span className="font-semibold text-rose">{d.order_number}</span></td>
                  <td className="font-semibold">{d.recipient}</td>
                  <td className="text-sm text-muted truncate" style={{ maxWidth: 160 }}>{d.address}</td>
                  <td>
                    {d.assigned_rider
                      ? <span className="text-sm font-semibold">{d.assigned_rider}</span>
                      : <span className="text-xs" style={{ color: '#f59e0b', fontWeight: 600 }}>Unassigned</span>
                    }
                  </td>
                  <td className="text-sm">{formatSlot(d)}</td>
                  <td><Badge value={d.status} /></td>
                  <td className="text-sm text-center">{(d.attempts || []).length || '—'}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => setSelected(d)}>
                      <Eye size={14} /> Manage
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <div className="empty-state-icon">🚚</div>
                      <h3>No deliveries found</h3>
                      <p>Paid mobile orders create a delivery row automatically.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DeliveryDetailModal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        delivery={selected}
        onSaved={load}
      />
    </div>
  )
}

import { useState } from 'react'
import { Search, Eye, UserCheck, MapPin, Clock, AlertTriangle } from 'lucide-react'
import { Badge } from '../components/Badge'
import { Modal } from '../components/Modal'
import { formatCurrency, formatDate, formatDateTime, capitalize } from '../lib/utils'
import { useToast } from '../context/ToastContext'

const DELIVERY_STATUSES = ['all', 'unscheduled', 'scheduled', 'assigned', 'preparing_for_dispatch', 'dispatched', 'out_for_delivery', 'delivered', 'delivery_failed', 'rescheduled']

const RIDERS = []

const DELIVERIES = []

const STATUS_GROUPS = {
  'Unscheduled': ['unscheduled'],
  'Scheduled': ['scheduled'],
  'In Progress': ['assigned', 'preparing_for_dispatch', 'dispatched', 'out_for_delivery'],
  'Completed': ['delivered'],
  'Issues': ['delivery_failed', 'rescheduled'],
}

function DeliveryDetailModal({ isOpen, onClose, delivery }) {
  const toast = useToast()
  const [status, setStatus] = useState(delivery?.status || '')
  const [rider, setRider] = useState(delivery?.assigned_rider || '')
  const [failedReason, setFailedReason] = useState('')
  const [schedDate, setSchedDate] = useState(delivery?.scheduled_date || '')
  const [schedTime, setSchedTime] = useState(delivery?.scheduled_time || '')

  if (!delivery) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Delivery — ${delivery.order_number}`} size="modal-lg">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <div className="text-xs text-muted font-semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Delivery Info</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <div className="flex gap-2">
                <span className="text-muted" style={{ minWidth: 110 }}>Recipient:</span>
                <span className="font-semibold">{delivery.recipient}</span>
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

          {/* Schedule */}
          <div>
            <div className="text-xs text-muted font-semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Schedule</div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" className="form-input" value={schedDate} onChange={(e) => setSchedDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Time</label>
                <input type="time" className="form-input" value={schedTime} onChange={(e) => setSchedTime(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Delivery Attempts */}
          {delivery.attempts.length > 0 && (
            <div>
              <div className="text-xs text-muted font-semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Delivery Attempts</div>
              {delivery.attempts.map((a) => (
                <div key={a.number} style={{ background: a.status === 'failed' ? '#fee2e2' : '#d1fae5', borderRadius: 10, padding: '0.65rem 0.875rem', fontSize: '0.8rem' }}>
                  <div className="font-semibold">Attempt #{a.number} — {a.status}</div>
                  {a.failed_reason && <div style={{ marginTop: '0.25rem', color: '#991b1b' }}>Reason: {a.failed_reason}</div>}
                  <div className="text-muted" style={{ marginTop: '0.2rem' }}>{formatDateTime(a.attempted_at)}</div>
                </div>
              ))}
            </div>
          )}

          {delivery.proof_of_delivery_url && (
            <div>
              <div className="text-xs text-muted font-semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Proof of Delivery</div>
              <a href={delivery.proof_of_delivery_url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">View Photo</a>
            </div>
          )}
        </div>

        {/* Right — Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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

          <button className="btn btn-primary w-full" onClick={() => {
            if (status === 'delivery_failed' && !failedReason) return toast.error('Enter a failed reason')
            toast.success('Delivery updated')
            onClose()
          }}>
            Save Changes
          </button>

          {status === 'delivery_failed' && (
            <button className="btn btn-secondary w-full" onClick={() => { setStatus('rescheduled'); toast.info('Marked for rescheduling') }}>
              Reschedule Delivery
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default function Delivery() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [activeGroup, setActiveGroup] = useState('In Progress')

  const filtered = DELIVERIES.filter((d) => {
    const matchSearch = d.order_number.toLowerCase().includes(search.toLowerCase()) || d.recipient.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || d.status === statusFilter
    return matchSearch && matchStatus
  })

  const counts = Object.fromEntries(
    Object.entries(STATUS_GROUPS).map(([group, statuses]) => [
      group,
      DELIVERIES.filter((d) => statuses.includes(d.status)).length,
    ])
  )

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Delivery Management</h1>
          <p className="page-subtitle">{DELIVERIES.length} total deliveries today</p>
        </div>
      </div>

      {/* Group Summary Cards */}
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
          <div className="stat-value">{DELIVERIES.length}</div>
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
                <th>Scheduled</th>
                <th>Status</th>
                <th>Attempts</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id}>
                  <td><span className="font-semibold text-rose">{d.order_number}</span></td>
                  <td className="font-semibold">{d.recipient}</td>
                  <td className="text-sm text-muted truncate" style={{ maxWidth: 160 }}>{d.address}</td>
                  <td>
                    {d.assigned_rider
                      ? <span className="text-sm font-semibold">{d.assigned_rider}</span>
                      : <span className="text-xs" style={{ color: '#f59e0b', fontWeight: 600 }}>⚠ Unassigned</span>
                    }
                  </td>
                  <td className="text-sm">
                    {d.scheduled_date ? `${formatDate(d.scheduled_date)} ${d.scheduled_time}` : '—'}
                  </td>
                  <td><Badge value={d.status} /></td>
                  <td className="text-sm text-center">{d.attempts.length || '—'}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => setSelected(d)}>
                      <Eye size={14} /> Manage
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <div className="empty-state-icon">🚚</div>
                      <h3>No deliveries found</h3>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DeliveryDetailModal isOpen={!!selected} onClose={() => setSelected(null)} delivery={selected} />
    </div>
  )
}

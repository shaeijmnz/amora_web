import { useCallback, useEffect, useState } from 'react'
import { Search, Eye, CheckCircle, XCircle, RefreshCw, ImageIcon } from 'lucide-react'
import { Badge } from '../components/Badge'
import { formatDate, formatCurrency, capitalize } from '../lib/utils'
import { useToast } from '../context/ToastContext'
import { useNotifications } from '../context/NotificationContext'
import { Modal } from '../components/Modal'
import { api } from '../lib/api'

const REQUEST_STATUSES = ['all', 'new', 'under_review', 'awaiting_customer_approval', 'approved', 'in_preparation', 'completed', 'rejected', 'cancelled']

const OPEN_STATUSES = ['new', 'under_review', 'awaiting_customer_approval']

function RequestDetailModal({ request, onClose, onSaved }) {
  const toast = useToast()
  const [estimatedPrice, setEstimatedPrice] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [status, setStatus] = useState('new')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!request) return
    setEstimatedPrice(request.estimated_price ?? '')
    setAdminNotes(request.admin_notes ?? '')
    setStatus(request.status ?? 'new')
  }, [request])

  if (!request) return null

  const save = async (nextStatus) => {
    const target = nextStatus ?? status
    if (target === 'approved' && !estimatedPrice) {
      return toast.error('Set an estimated price before approving')
    }
    setSaving(true)
    try {
      await api.updateCustomRequest(request.id, {
        status: target,
        estimated_price: estimatedPrice === '' ? null : Number(estimatedPrice),
        admin_notes: adminNotes.trim() || null,
      })
      toast.success(`${request.request_number} updated`)
      onSaved?.()
      onClose()
    } catch (e) {
      toast.error(e.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={!!request} onClose={onClose} title={`${request.request_number} — ${request.customer}`} size="modal-lg">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <div className="text-xs text-muted font-semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Customer Request</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { label: 'Customer', value: request.customer },
                { label: 'Email', value: request.customer_email },
                { label: 'Occasion', value: request.occasion },
                { label: 'Preferred Flowers', value: request.preferred_flowers },
                { label: 'Preferred Colors', value: request.preferred_colors },
                { label: 'Bouquet Size', value: request.bouquet_size },
                { label: 'Budget', value: formatCurrency(request.budget) },
                {
                  label: 'Requested Delivery',
                  value: request.requested_delivery_date
                    ? `${formatDate(request.requested_delivery_date)}${request.requested_delivery_time ? ` · ${request.requested_delivery_time}` : ''}`
                    : '—',
                },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--color-muted)', minWidth: 130 }}>{label}:</span>
                  <span className="font-semibold">{value || '—'}</span>
                </div>
              ))}
            </div>
          </div>

          {request.personalized_message && (
            <div style={{ background: 'var(--color-blush)', borderRadius: 12, padding: '0.875rem' }}>
              <div className="text-xs text-muted font-semibold" style={{ marginBottom: '0.35rem' }}>Message</div>
              <div style={{ fontSize: '0.875rem', fontStyle: 'italic' }}>"{request.personalized_message}"</div>
            </div>
          )}

          {request.reference_image_url ? (
            <img
              src={request.reference_image_url}
              alt="Customer reference"
              style={{ width: '100%', borderRadius: 12, objectFit: 'cover', maxHeight: 220 }}
            />
          ) : (
            <div style={{ background: 'var(--color-bg)', borderRadius: 12, padding: '1.5rem', textAlign: 'center', border: '2px dashed var(--color-border)' }}>
              <ImageIcon size={32} style={{ color: 'var(--color-border)', margin: '0 auto 0.5rem' }} />
              <div className="text-xs text-muted">No reference image uploaded</div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="text-sm font-semibold">Status:</span>
            <Badge value={request.status} />
          </div>

          <div className="form-group">
            <label className="form-label">Estimated Price (PHP)</label>
            <input type="number" min={0} className="form-input" placeholder="0.00" value={estimatedPrice} onChange={(e) => setEstimatedPrice(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Admin Notes / Suggestions</label>
            <textarea className="form-textarea" rows={4} placeholder="Alternative flowers, substitutions, notes..." value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Move to status</label>
            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              {REQUEST_STATUSES.filter((s) => s !== 'all').map((s) => (
                <option key={s} value={s}>{capitalize(s)}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button className="btn btn-secondary w-full" disabled={saving} onClick={() => save()}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            {OPEN_STATUSES.includes(request.status) && (
              <>
                <button className="btn btn-primary w-full" disabled={saving} onClick={() => save('approved')}>
                  <CheckCircle size={16} /> Approve Request
                </button>
                <button className="btn btn-danger w-full" disabled={saving} onClick={() => save('rejected')}>
                  <XCircle size={16} /> Reject Request
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default function CustomRequests() {
  const toast = useToast()
  const { refresh: refreshBadge } = useNotifications()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    api.customRequests()
      .then((res) => setRequests(res.data || []))
      .catch((e) => toast.error(e.message || 'Failed to load custom requests'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = requests.filter((r) => {
    const q = search.toLowerCase()
    const matchSearch =
      (r.customer || '').toLowerCase().includes(q) ||
      (r.request_number || '').toLowerCase().includes(q) ||
      (r.occasion || '').toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const openCount = requests.filter((r) => OPEN_STATUSES.includes(r.status)).length

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Custom Arrangement Requests</h1>
          <p className="page-subtitle">
            {loading ? 'Loading…' : `${requests.length} total requests • ${openCount} waiting on you`}
          </p>
        </div>
        <button className="btn btn-secondary" onClick={load} disabled={loading}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="card">
        <div className="filters-bar">
          <div className="search-wrapper">
            <Search className="search-icon" />
            <input type="text" className="form-input search-input" placeholder="Search by customer, request # or occasion..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="form-select" style={{ width: 'auto' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {REQUEST_STATUSES.map((s) => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : capitalize(s)}</option>)}
          </select>
        </div>

        <div className="table-wrapper" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Request #</th>
                <th>Customer</th>
                <th>Occasion</th>
                <th>Bouquet Size</th>
                <th>Budget</th>
                <th>Quoted</th>
                <th>Delivery Date</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={10}><div className="empty-state"><h3>Loading requests…</h3></div></td></tr>}
              {!loading && filtered.map((r) => (
                <tr key={r.id}>
                  <td><span className="font-semibold text-rose">{r.request_number}</span></td>
                  <td className="font-semibold">{r.customer}</td>
                  <td className="text-sm">{r.occasion}</td>
                  <td className="text-sm">{r.bouquet_size || '—'}</td>
                  <td className="font-semibold">{formatCurrency(r.budget)}</td>
                  <td className="text-sm">{r.estimated_price != null ? formatCurrency(r.estimated_price) : '—'}</td>
                  <td className="text-sm">{r.requested_delivery_date ? formatDate(r.requested_delivery_date) : '—'}</td>
                  <td><Badge value={r.status} /></td>
                  <td className="text-xs text-muted">{formatDate(r.created_at)}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => setSelected(r)}>
                      <Eye size={14} /> Review
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={10}>
                    <div className="empty-state">
                      <div className="empty-state-icon">✨</div>
                      <h3>No requests found</h3>
                      <p>Custom arrangement requests from the mobile app appear here.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RequestDetailModal
        request={selected}
        onClose={() => setSelected(null)}
        onSaved={() => { load(); refreshBadge() }}
      />
    </div>
  )
}

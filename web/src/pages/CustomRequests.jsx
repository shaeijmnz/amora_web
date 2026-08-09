import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Eye, CheckCircle, XCircle, ArrowUpRight, ImageIcon } from 'lucide-react'
import { Badge } from '../components/Badge'
import { formatDate, formatCurrency, capitalize } from '../lib/utils'
import { useToast } from '../context/ToastContext'
import { Modal } from '../components/Modal'

const MOCK_REQUESTS = [
  {
    id: '1', request_number: 'REQ-001', customer: 'Maria Santos', occasion: "Valentine's Day",
    preferred_flowers: 'Red roses, Baby\'s breath', preferred_colors: 'Red, White',
    bouquet_size: 'Large', budget: 3000, personalized_message: 'Happy Valentines my love!',
    requested_delivery_date: '2026-02-14', status: 'awaiting_customer_approval',
    estimated_price: 2800, admin_notes: 'Can use white chrysanthemums as filler', created_at: '2026-07-25',
  },
  {
    id: '2', request_number: 'REQ-002', customer: 'Jose Reyes', occasion: 'Wedding',
    preferred_flowers: 'White lilies, Orchids', preferred_colors: 'White, Ivory',
    bouquet_size: 'Extra Large', budget: 8000, personalized_message: '',
    requested_delivery_date: '2026-09-20', status: 'under_review',
    estimated_price: null, admin_notes: '', created_at: '2026-07-24',
  },
  {
    id: '3', request_number: 'REQ-003', customer: 'Ana Cruz', occasion: 'Birthday',
    preferred_flowers: 'Sunflowers, Daisies', preferred_colors: 'Yellow, Orange',
    bouquet_size: 'Medium', budget: 1500, personalized_message: 'Happy 18th Birthday!',
    requested_delivery_date: '2026-08-05', status: 'new',
    estimated_price: null, admin_notes: '', created_at: '2026-07-26',
  },
  {
    id: '4', request_number: 'REQ-004', customer: 'Pedro Lim', occasion: 'Anniversary',
    preferred_flowers: 'Pink roses, Peonies', preferred_colors: 'Pink, Blush',
    bouquet_size: 'Medium', budget: 2500, personalized_message: '10 years of love!',
    requested_delivery_date: '2026-07-30', status: 'approved',
    estimated_price: 2200, admin_notes: 'Peonies unavailable — using garden roses instead', created_at: '2026-07-22',
  },
  {
    id: '5', request_number: 'REQ-005', customer: 'Rosa Dela Cruz', occasion: 'Sympathy',
    preferred_flowers: 'White chrysanthemums', preferred_colors: 'White',
    bouquet_size: 'Large', budget: 3500, personalized_message: 'With deepest condolences',
    requested_delivery_date: '2026-07-28', status: 'in_preparation',
    estimated_price: 3200, admin_notes: '', created_at: '2026-07-20',
  },
  {
    id: '6', request_number: 'REQ-006', customer: 'Lita Garcia', occasion: 'Graduation',
    preferred_flowers: 'Mixed seasonal', preferred_colors: 'Colorful',
    bouquet_size: 'Small', budget: 1000, personalized_message: 'Congratulations Dr. Lita!',
    requested_delivery_date: '2026-08-10', status: 'rejected',
    estimated_price: null, admin_notes: 'Budget too low for requested arrangement', created_at: '2026-07-18',
  },
]

const REQUEST_STATUSES = ['all', 'new', 'under_review', 'awaiting_customer_approval', 'approved', 'in_preparation', 'completed', 'rejected', 'cancelled']

function RequestDetailModal({ isOpen, onClose, request }) {
  const toast = useToast()
  const [estimatedPrice, setEstimatedPrice] = useState(request?.estimated_price || '')
  const [adminNotes, setAdminNotes] = useState(request?.admin_notes || '')

  if (!request) return null

  function handleApprove() {
    if (!estimatedPrice) return toast.error('Set an estimated price before approving')
    toast.success(`Request ${request.request_number} approved`)
    onClose()
  }

  function handleReject() {
    toast.success(`Request ${request.request_number} rejected`)
    onClose()
  }

  function handleConvert() {
    toast.success(`Request ${request.request_number} converted to order`)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${request.request_number} — ${request.customer}`} size="modal-lg">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <div className="text-xs text-muted font-semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Customer Request</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { label: 'Occasion', value: request.occasion },
                { label: 'Preferred Flowers', value: request.preferred_flowers },
                { label: 'Preferred Colors', value: request.preferred_colors },
                { label: 'Bouquet Size', value: request.bouquet_size },
                { label: 'Budget', value: formatCurrency(request.budget) },
                { label: 'Requested Delivery', value: formatDate(request.requested_delivery_date) },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--color-muted)', minWidth: 130 }}>{label}:</span>
                  <span className="font-semibold">{value}</span>
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

          {/* Reference image placeholder */}
          <div style={{ background: 'var(--color-bg)', borderRadius: 12, padding: '1.5rem', textAlign: 'center', border: '2px dashed var(--color-border)' }}>
            <ImageIcon size={32} style={{ color: 'var(--color-border)', margin: '0 auto 0.5rem' }} />
            <div className="text-xs text-muted">No reference image uploaded</div>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="text-sm font-semibold">Status:</span>
            <Badge value={request.status} />
          </div>

          <div className="form-group">
            <label className="form-label">Estimated Price (PHP)</label>
            <input type="number" className="form-input" placeholder="0.00" value={estimatedPrice} onChange={(e) => setEstimatedPrice(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Admin Notes / Suggestions</label>
            <textarea className="form-textarea" rows={4} placeholder="Alternative flowers, substitutions, notes..." value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {['new', 'under_review', 'awaiting_customer_approval'].includes(request.status) && (
              <>
                <button className="btn btn-primary w-full" onClick={handleApprove}>
                  <CheckCircle size={16} /> Approve Request
                </button>
                <button className="btn btn-danger w-full" onClick={handleReject}>
                  <XCircle size={16} /> Reject Request
                </button>
              </>
            )}
            {request.status === 'approved' && (
              <button className="btn btn-primary w-full" onClick={handleConvert}>
                <ArrowUpRight size={16} /> Convert to Order
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default function CustomRequests() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const toast = useToast()

  const filtered = MOCK_REQUESTS.filter((r) => {
    const matchSearch = r.customer.toLowerCase().includes(search.toLowerCase()) || r.request_number.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Custom Arrangement Requests</h1>
          <p className="page-subtitle">{MOCK_REQUESTS.length} total requests</p>
        </div>
      </div>

      <div className="card">
        <div className="filters-bar">
          <div className="search-wrapper">
            <Search className="search-icon" />
            <input type="text" className="form-input search-input" placeholder="Search by customer or request #..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
                <th>Delivery Date</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td><span className="font-semibold text-rose">{r.request_number}</span></td>
                  <td className="font-semibold">{r.customer}</td>
                  <td className="text-sm">{r.occasion}</td>
                  <td className="text-sm">{r.bouquet_size}</td>
                  <td className="font-semibold">{formatCurrency(r.budget)}</td>
                  <td className="text-sm">{formatDate(r.requested_delivery_date)}</td>
                  <td><Badge value={r.status} /></td>
                  <td className="text-xs text-muted">{formatDate(r.created_at)}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => setSelected(r)}>
                      <Eye size={14} /> Review
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state">
                      <div className="empty-state-icon">✨</div>
                      <h3>No requests found</h3>
                      <p>Custom arrangement requests from customers will appear here.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RequestDetailModal isOpen={!!selected} onClose={() => setSelected(null)} request={selected} />
    </div>
  )
}

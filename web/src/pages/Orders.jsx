import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Eye, Phone, FileText, Printer, CheckCircle, XCircle, ChevronDown } from 'lucide-react'
import { Badge } from '../components/Badge'
import { Modal } from '../components/Modal'
import { formatCurrency, formatDateTime, formatDate, capitalize } from '../lib/utils'
import { useToast } from '../context/ToastContext'

const ORDER_STATUSES = ['all', 'pending', 'confirmed', 'being_prepared', 'ready_for_delivery', 'dispatched', 'delivered', 'completed', 'cancelled', 'refunded']
const PAYMENT_STATUSES = ['all', 'unpaid', 'partially_paid', 'paid', 'refunded']

const MOCK_ORDERS = [
  {
    id: '1', order_number: 'ORD-0241', order_type: 'standard',
    customer: { name: 'Maria Santos', email: 'maria@email.com', phone: '09171234567' },
    status: 'being_prepared', payment_status: 'paid', payment_method: 'GCash',
    subtotal: 1850, addon_cost: 0, customization_fee: 0, delivery_fee: 150, discount: 0, total: 2000,
    recipient_name: 'Maria Santos', recipient_contact: '09171234567',
    admin_notes: '', created_at: new Date().toISOString(), confirmed_at: new Date().toISOString(),
    items: [{ name: 'Classic Red Bouquet', size: 'Medium', qty: 1, price: 1400, color: 'Red' }, { name: 'Chocolate Box', size: null, qty: 1, price: 450, color: null }],
    delivery: { address: 'BGC, Taguig City', date: '2026-07-28', status: 'unscheduled' },
  },
  {
    id: '2', order_number: 'ORD-0240', order_type: 'standard',
    customer: { name: 'Jose Reyes', email: 'jose@email.com', phone: '09181234567' },
    status: 'confirmed', payment_status: 'paid', payment_method: 'Bank Transfer',
    subtotal: 3200, addon_cost: 0, customization_fee: 0, delivery_fee: 150, discount: 0, total: 3350,
    recipient_name: 'Anna Reyes', recipient_contact: '09181234568',
    admin_notes: 'Anniversary bouquet — add extra ribbon', created_at: new Date(Date.now() - 3600000).toISOString(), confirmed_at: new Date(Date.now() - 3000000).toISOString(),
    items: [{ name: 'Pastel Dream Mix', size: 'Large', qty: 1, price: 2800, color: 'Pink' }],
    delivery: { address: 'Makati CBD', date: '2026-07-29', status: 'unscheduled' },
  },
  {
    id: '3', order_number: 'ORD-0239', order_type: 'custom',
    customer: { name: 'Ana Cruz', email: 'ana@email.com', phone: '09191234567' },
    status: 'dispatched', payment_status: 'paid', payment_method: 'Cash',
    subtotal: 950, addon_cost: 0, customization_fee: 200, delivery_fee: 150, discount: 100, total: 1200,
    recipient_name: 'Ana Cruz', recipient_contact: '09191234567',
    admin_notes: '', created_at: new Date(Date.now() - 7200000).toISOString(), confirmed_at: new Date(Date.now() - 7000000).toISOString(),
    items: [{ name: 'Sunflower Sunshine', size: 'Small', qty: 1, price: 650, color: 'Yellow' }],
    delivery: { address: 'Mandaluyong City', date: '2026-07-27', status: 'out_for_delivery' },
  },
  {
    id: '4', order_number: 'ORD-0238', order_type: 'standard',
    customer: { name: 'Pedro Lim', email: 'pedro@email.com', phone: '09201234567' },
    status: 'delivered', payment_status: 'paid', payment_method: 'GCash',
    subtotal: 4500, addon_cost: 0, customization_fee: 0, delivery_fee: 200, discount: 0, total: 4700,
    recipient_name: 'Pedro Lim', recipient_contact: '09201234567',
    admin_notes: '', created_at: new Date(Date.now() - 86400000).toISOString(), confirmed_at: new Date(Date.now() - 85000000).toISOString(),
    items: [{ name: 'White Elegance', size: 'Large', qty: 1, price: 2400 }, { name: 'Purple Garden Rose', size: 'Medium', qty: 1, price: 1600 }],
    delivery: { address: 'Quezon City', date: '2026-07-26', status: 'delivered' },
  },
  {
    id: '5', order_number: 'ORD-0237', order_type: 'standard',
    customer: { name: 'Rosa Dela Cruz', email: 'rosa@email.com', phone: '09211234567' },
    status: 'cancelled', payment_status: 'refunded', payment_method: 'GCash',
    subtotal: 2100, addon_cost: 0, customization_fee: 0, delivery_fee: 150, discount: 0, total: 2250,
    recipient_name: 'Rosa Dela Cruz', recipient_contact: '09211234567',
    admin_notes: 'Customer requested cancellation', created_at: new Date(Date.now() - 172800000).toISOString(), confirmed_at: null,
    items: [{ name: 'Pastel Dream Mix', size: 'Medium', qty: 1, price: 1800 }],
    delivery: null,
  },
]

function OrderDetailModal({ isOpen, onClose, order }) {
  const toast = useToast()
  const [tab, setTab] = useState('customer')
  const [adminNotes, setAdminNotes] = useState(order?.admin_notes || '')
  const [newStatus, setNewStatus] = useState(order?.status || '')
  const [newPayStatus, setNewPayStatus] = useState(order?.payment_status || '')

  if (!order) return null

  const tabs = [
    { id: 'customer', label: '👤 Customer' },
    { id: 'products', label: '🌸 Products' },
    { id: 'payment', label: '💳 Payment' },
    { id: 'delivery', label: '🚚 Delivery' },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Order ${order.order_number}`} size="modal-xl">
      <div>
        {/* Status bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 0', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
          <Badge value={order.status} />
          <Badge value={order.payment_status} />
          <span className="text-xs text-muted">{formatDateTime(order.created_at)}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
            {order.status === 'pending' && <button className="btn btn-primary btn-sm" onClick={() => toast.success('Order confirmed')}><CheckCircle size={14} /> Confirm</button>}
            {!['cancelled', 'completed', 'refunded'].includes(order.status) && (
              <button className="btn btn-danger btn-sm" onClick={() => toast.success('Order cancelled')}><XCircle size={14} /> Cancel</button>
            )}
            <button className="btn btn-secondary btn-sm" onClick={() => toast.info('Printing...')}><Printer size={14} /> Print</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: '1.25rem' }}>
          {tabs.map((t) => (
            <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>

        {tab === 'customer' && (
          <div className="grid-2">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="text-xs text-muted font-semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Customer (Sender)</div>
              {[
                { label: 'Name', value: order.customer.name },
                { label: 'Email', value: order.customer.email },
                { label: 'Phone', value: order.customer.phone },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <span className="text-muted" style={{ minWidth: 80 }}>{label}:</span>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
              <button className="btn btn-secondary btn-sm" style={{ width: 'fit-content' }}>
                <Phone size={14} /> Contact Customer
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="text-xs text-muted font-semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Recipient</div>
              {[
                { label: 'Name', value: order.recipient_name },
                { label: 'Phone', value: order.recipient_contact },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <span className="text-muted" style={{ minWidth: 80 }}>{label}:</span>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'products' && (
          <div>
            <table style={{ marginBottom: '1rem' }}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Size / Color</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => (
                  <tr key={i}>
                    <td className="font-semibold">{item.name}</td>
                    <td className="text-sm text-muted">{[item.size, item.color].filter(Boolean).join(' · ')}</td>
                    <td>{item.qty}</td>
                    <td>{formatCurrency(item.price)}</td>
                    <td className="font-semibold">{formatCurrency(item.price * item.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="form-group">
              <label className="form-label">Admin Notes</label>
              <textarea className="form-textarea" rows={3} value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="Internal notes..." />
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => toast.success('Notes saved')} style={{ marginTop: '0.5rem' }}>Save Notes</button>
          </div>
        )}

        {tab === 'payment' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Order Status</label>
                <select className="form-select" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                  {ORDER_STATUSES.filter((s) => s !== 'all').map((s) => <option key={s} value={s}>{capitalize(s)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Payment Status</label>
                <select className="form-select" value={newPayStatus} onChange={(e) => setNewPayStatus(e.target.value)}>
                  {PAYMENT_STATUSES.filter((s) => s !== 'all').map((s) => <option key={s} value={s}>{capitalize(s)}</option>)}
                </select>
              </div>
            </div>
            <button className="btn btn-primary btn-sm" style={{ width: 'fit-content' }} onClick={() => toast.success('Status updated')}>Update Status</button>
            <div className="divider" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              {[
                { label: 'Subtotal', value: order.subtotal },
                { label: 'Delivery Fee', value: order.delivery_fee },
                { label: 'Customization Fee', value: order.customization_fee },
                { label: 'Discount', value: -order.discount },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-muted">{label}</span>
                  <span>{formatCurrency(Math.abs(value))}{value < 0 ? ' off' : ''}</span>
                </div>
              ))}
              <div className="divider" />
              <div className="flex justify-between">
                <span className="font-bold">Total</span>
                <span className="font-bold" style={{ fontSize: '1.05rem', color: 'var(--color-rose-dark)' }}>{formatCurrency(order.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Payment Method</span>
                <span className="font-semibold">{order.payment_method}</span>
              </div>
            </div>
          </div>
        )}

        {tab === 'delivery' && (
          <div>
            {order.delivery ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { label: 'Delivery Address', value: order.delivery.address },
                  { label: 'Scheduled Date', value: formatDate(order.delivery.date) },
                  { label: 'Delivery Status', value: <Badge value={order.delivery.status} /> },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem', alignItems: 'center' }}>
                    <span className="text-muted" style={{ minWidth: 130 }}>{label}:</span>
                    <span className="font-semibold">{value}</span>
                  </div>
                ))}
                <button className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem', width: 'fit-content' }} onClick={() => toast.success('Rider assigned')}>Assign Delivery Person</button>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">🚚</div>
                <h3>No delivery assigned</h3>
                <p>This order has no delivery record yet.</p>
                <button className="btn btn-primary" onClick={() => toast.success('Delivery created')}>Create Delivery</button>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}

export default function Orders() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  const filtered = MOCK_ORDERS.filter((o) => {
    const matchSearch = o.order_number.toLowerCase().includes(search.toLowerCase()) || o.customer.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    const matchPayment = paymentFilter === 'all' || o.payment_status === paymentFilter
    return matchSearch && matchStatus && matchPayment
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Order Management</h1>
          <p className="page-subtitle">{MOCK_ORDERS.length} total orders</p>
        </div>
      </div>

      <div className="card">
        <div className="filters-bar">
          <div className="search-wrapper">
            <Search className="search-icon" />
            <input type="text" className="form-input search-input" placeholder="Search by order # or customer..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="form-select" style={{ width: 'auto' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : capitalize(s)}</option>)}
          </select>
          <select className="form-select" style={{ width: 'auto' }} value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
            {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s === 'all' ? 'All Payments' : capitalize(s)}</option>)}
          </select>
        </div>

        <div className="table-wrapper" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Type</th>
                <th>Customer</th>
                <th>Recipient</th>
                <th>Total</th>
                <th>Order Status</th>
                <th>Payment</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td><span className="font-semibold text-rose">{o.order_number}</span></td>
                  <td>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 999,
                      background: o.order_type === 'custom' ? '#ede9fe' : '#f3f4f6',
                      color: o.order_type === 'custom' ? '#5b21b6' : '#374151',
                    }}>
                      {o.order_type.toUpperCase()}
                    </span>
                  </td>
                  <td className="font-semibold">{o.customer.name}</td>
                  <td className="text-sm text-muted">{o.recipient_name !== o.customer.name ? o.recipient_name : '—'}</td>
                  <td className="font-semibold">{formatCurrency(o.total)}</td>
                  <td><Badge value={o.status} /></td>
                  <td><Badge value={o.payment_status} /></td>
                  <td className="text-xs text-muted">{formatDateTime(o.created_at)}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => setSelected(o)}>
                      <Eye size={14} /> View
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state">
                      <div className="empty-state-icon">📦</div>
                      <h3>No orders found</h3>
                      <p>Try adjusting your filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OrderDetailModal isOpen={!!selected} onClose={() => setSelected(null)} order={selected} />
    </div>
  )
}

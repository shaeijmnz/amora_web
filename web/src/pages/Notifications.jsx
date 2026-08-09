import { useState } from 'react'
import { Bell, Flower2, ShoppingBag, Truck, Settings, CheckCheck, X } from 'lucide-react'
import { formatDateTime, capitalize } from '../lib/utils'

const CATEGORIES = ['all', 'inventory', 'orders', 'custom_requests', 'deliveries', 'system']

const MOCK_NOTIFICATIONS = [
  { id: '1', category: 'inventory', title: 'Low Stock Alert', body: 'Red Roses has dropped below the minimum stock level (8 / 20 stems).', is_read: false, created_at: new Date().toISOString(), related_type: 'inventory_item', related_id: '1' },
  { id: '2', category: 'inventory', title: 'Item Out of Stock', body: 'Sunflowers is now out of stock (0 stems).', is_read: false, created_at: new Date(Date.now() - 1800000).toISOString(), related_type: 'inventory_item', related_id: '3' },
  { id: '3', category: 'orders', title: 'New Order Received', body: 'Order ORD-0241 from Maria Santos — ₱2,000.00', is_read: false, created_at: new Date(Date.now() - 3600000).toISOString(), related_type: 'order', related_id: '1' },
  { id: '4', category: 'orders', title: 'Order Cancelled', body: 'Order ORD-0237 was cancelled by the customer.', is_read: true, created_at: new Date(Date.now() - 7200000).toISOString(), related_type: 'order', related_id: '5' },
  { id: '5', category: 'custom_requests', title: 'New Custom Request', body: 'Ana Cruz submitted a custom arrangement request (REQ-003) for a Birthday bouquet.', is_read: false, created_at: new Date(Date.now() - 10800000).toISOString(), related_type: 'custom_request', related_id: '3' },
  { id: '6', category: 'deliveries', title: 'Unassigned Delivery', body: 'Order ORD-0239 has a scheduled delivery but no assigned rider.', is_read: true, created_at: new Date(Date.now() - 14400000).toISOString(), related_type: 'delivery', related_id: '3' },
  { id: '7', category: 'deliveries', title: 'Delivery Failed', body: 'Delivery for ORD-0235 failed — No one home. Consider rescheduling.', is_read: true, created_at: new Date(Date.now() - 86400000).toISOString(), related_type: 'delivery', related_id: '5' },
  { id: '8', category: 'inventory', title: 'Nearing Expiration', body: 'White Lilies expire on Jul 29 — 2 days remaining.', is_read: false, created_at: new Date(Date.now() - 18000000).toISOString(), related_type: 'inventory_item', related_id: '2' },
  { id: '9', category: 'system', title: 'System Update', body: 'Dashboard reports are now updated in real-time.', is_read: true, created_at: new Date(Date.now() - 172800000).toISOString(), related_type: null, related_id: null },
]

const CAT_ICONS = {
  inventory: Flower2,
  orders: ShoppingBag,
  custom_requests: Bell,
  deliveries: Truck,
  system: Settings,
}

const CAT_COLORS = {
  inventory: '#7aab8a',
  orders: '#8b5cf6',
  custom_requests: '#e8627a',
  deliveries: '#3b82f6',
  system: '#6b7280',
}

export default function Notifications() {
  const [filter, setFilter] = useState('all')
  const [notifs, setNotifs] = useState(MOCK_NOTIFICATIONS)

  const filtered = notifs.filter((n) => filter === 'all' || n.category === filter)
  const unreadCount = notifs.filter((n) => !n.is_read).length

  function markRead(id) {
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n))
  }

  function markAllRead() {
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  function dismiss(id) {
    setNotifs((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-secondary" onClick={markAllRead}>
            <CheckCheck size={16} /> Mark all as read
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="tabs" style={{ marginBottom: '1.5rem' }}>
        {CATEGORIES.map((cat) => {
          const count = cat === 'all' ? notifs.filter((n) => !n.is_read).length : notifs.filter((n) => n.category === cat && !n.is_read).length
          return (
            <button key={cat} className={`tab ${filter === cat ? 'active' : ''}`} onClick={() => setFilter(cat)}>
              {cat === 'all' ? 'All' : capitalize(cat).replace('_', ' ')}
              {count > 0 && <span className="nav-badge" style={{ marginLeft: 6 }}>{count}</span>}
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filtered.length === 0 && (
          <div className="empty-state card" style={{ padding: '4rem 2rem' }}>
            <div className="empty-state-icon"><Bell size={40} /></div>
            <h3>No notifications</h3>
            <p>You're all caught up in this category.</p>
          </div>
        )}

        {filtered.map((notif) => {
          const Icon = CAT_ICONS[notif.category] || Bell
          const color = CAT_COLORS[notif.category] || '#6b7280'

          return (
            <div
              key={notif.id}
              className="card"
              style={{
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                cursor: 'pointer',
                opacity: notif.is_read ? 0.7 : 1,
                borderLeft: notif.is_read ? undefined : `4px solid ${color}`,
              }}
              onClick={() => markRead(notif.id)}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: `${color}18`, color, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={20} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span className="font-semibold" style={{ fontSize: '0.9rem' }}>{notif.title}</span>
                  {!notif.is_read && (
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  )}
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.45rem', borderRadius: 999,
                    background: `${color}18`, color, marginLeft: 'auto',
                  }}>
                    {capitalize(notif.category.replace('_', ' '))}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-muted)', lineHeight: 1.5 }}>{notif.body}</p>
                <div className="text-xs text-muted" style={{ marginTop: '0.4rem' }}>{formatDateTime(notif.created_at)}</div>
              </div>

              <button
                className="btn btn-ghost btn-icon btn-sm"
                style={{ flexShrink: 0 }}
                onClick={(e) => { e.stopPropagation(); dismiss(notif.id) }}
                title="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

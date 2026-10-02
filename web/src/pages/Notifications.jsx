import { useCallback, useEffect, useState } from 'react'
import { Bell, Flower2, ShoppingBag, Truck, Settings, CheckCheck, X, RefreshCw } from 'lucide-react'
import { formatDateTime, capitalize } from '../lib/utils'
import { useToast } from '../context/ToastContext'
import { useNotifications } from '../context/NotificationContext'
import { api } from '../lib/api'

const CATEGORIES = ['all', 'inventory', 'orders', 'custom_requests', 'deliveries', 'system']

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
  const toast = useToast()
  const { refresh: refreshBadge } = useNotifications()
  const [filter, setFilter] = useState('all')
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.notifications('all')
      setNotifs(res.data || [])
      refreshBadge()
    } catch (e) {
      toast.error(e.message || 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [refreshBadge, toast])

  useEffect(() => {
    load()
    // New orders can land while the owner is staring at this page.
    const id = setInterval(load, 20000)
    return () => clearInterval(id)
  }, [])

  const filtered = notifs.filter((n) => filter === 'all' || n.category === filter)
  const unreadCount = notifs.filter((n) => !n.is_read).length

  async function markRead(notif) {
    if (notif.is_read) return
    setNotifs((prev) => prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n)))
    try {
      await api.markNotificationRead(notif.id)
      refreshBadge()
    } catch (e) {
      toast.error(e.message || 'Could not mark as read')
      load()
    }
  }

  async function markAllRead() {
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })))
    try {
      await api.markAllNotificationsRead()
      refreshBadge()
      toast.success('All caught up')
    } catch (e) {
      toast.error(e.message || 'Could not mark all as read')
      load()
    }
  }

  async function dismiss(id) {
    setNotifs((prev) => prev.filter((n) => n.id !== id))
    try {
      await api.dismissNotification(id)
      refreshBadge()
    } catch (e) {
      toast.error(e.message || 'Could not dismiss')
      load()
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">
            {loading && notifs.length === 0
              ? 'Loading…'
              : unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
                : 'All caught up!'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={load} disabled={loading}>
            <RefreshCw size={16} /> Refresh
          </button>
          {unreadCount > 0 && (
            <button className="btn btn-secondary" onClick={markAllRead}>
              <CheckCheck size={16} /> Mark all as read
            </button>
          )}
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: '1.5rem' }}>
        {CATEGORIES.map((cat) => {
          const count = notifs.filter((n) => !n.is_read && (cat === 'all' || n.category === cat)).length
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
            <h3>{loading ? 'Loading notifications…' : 'No notifications'}</h3>
            <p>
              {loading
                ? 'Checking for new activity.'
                : 'New paid orders, parcel updates, and low stock alerts show up here.'}
            </p>
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
                cursor: notif.is_read ? 'default' : 'pointer',
                opacity: notif.is_read ? 0.7 : 1,
                borderLeft: notif.is_read ? undefined : `4px solid ${color}`,
              }}
              onClick={() => markRead(notif)}
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

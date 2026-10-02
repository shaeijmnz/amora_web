import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingBag,
  Truck, Users, BarChart2, Bell, Flower2, LogOut,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import { useToast } from '../context/ToastContext'
import { getInitials } from '../lib/utils'

const NAV = [
  {
    label: 'Main',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/inventory', icon: Flower2, label: 'Inventory' },
      { to: '/products', icon: Package, label: 'Products' },
      { to: '/custom-requests', icon: Sparkles, label: 'Custom Requests' },
      { to: '/orders', icon: ShoppingBag, label: 'Orders' },
      { to: '/delivery', icon: Truck, label: 'Delivery' },
    ],
  },
  {
    label: 'People',
    items: [
      { to: '/customers', icon: Users, label: 'Customers' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: '/reports', icon: BarChart2, label: 'Reports' },
      { to: '/notifications', icon: Bell, label: 'Notifications', badgeKey: 'unread' },
    ],
  },
]

export default function Sidebar() {
  const { user, profile, signOut } = useAuth()
  const { unread } = useNotifications()
  const toast = useToast()

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email || 'Admin'
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url
  const initials = getInitials(displayName)

  async function handleSignOut() {
    try { await signOut() } catch { toast.error('Sign out failed') }
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🌸</div>
        <div>
          <div className="sidebar-logo-text">Amora</div>
          <div className="sidebar-logo-sub">Florals Admin</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV.map((section) => (
          <div key={section.label}>
            <div className="nav-section-label">{section.label}</div>
            {section.items.map(({ to, icon: Icon, label, badgeKey }) => {
              const badge = badgeKey === 'unread' ? unread : null
              return (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon className="nav-icon" size={17} />
                  {label}
                  {badge > 0 && <span className="nav-badge">{badge}</span>}
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0.6rem 0.5rem',
          marginBottom: '0.375rem',
          borderRadius: 10,
          background: 'rgba(252,232,236,0.6)',
          border: '1px solid rgba(255,255,255,0.7)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow: '0 2px 8px rgba(192,96,112,0.07)',
        }}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <div style={{
              width: 32, height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #e8a0ae, #c06070)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.7rem', fontWeight: 700, color: '#fff',
              flexShrink: 0,
            }}>
              {initials}
            </div>
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontSize: '0.78rem', fontWeight: 600,
              color: 'var(--color-ink)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {displayName}
            </div>
            <div style={{
              fontSize: '0.62rem',
              color: 'var(--color-rose)',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {profile?.role || 'admin'}
            </div>
          </div>
        </div>

        <button
          className="nav-item"
          style={{ fontSize: '0.82rem' }}
          onClick={handleSignOut}
        >
          <LogOut size={15} style={{ opacity: 0.5 }} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}

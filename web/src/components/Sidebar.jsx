import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingBag, ClipboardList,
  Truck, Users, BarChart2, Bell, Flower2, LogOut, Settings,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
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
      { to: '/notifications', icon: Bell, label: 'Notifications' },
    ],
  },
]

export default function Sidebar() {
  const location = useLocation()
  const { user, profile, signOut } = useAuth()
  const toast = useToast()

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email || 'Admin'
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url
  const initials = getInitials(displayName)

  async function handleSignOut() {
    try { await signOut() } catch (e) { toast.error('Sign out failed') }
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
            {section.items.map(({ to, icon: Icon, label, badge }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon className="nav-icon" size={18} />
                {label}
                {badge && <span className="nav-badge">{badge}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {/* User info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.25rem', marginBottom: '0.5rem' }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.15)', flexShrink: 0 }} />
          ) : (
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#e8627a,#c94060)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>{initials}</div>
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.role || 'admin'}</div>
          </div>
        </div>
        <button className="nav-item" style={{ color: 'rgba(255,255,255,0.45)' }} onClick={handleSignOut}>
          <LogOut size={16} style={{ opacity: 0.6 }} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}

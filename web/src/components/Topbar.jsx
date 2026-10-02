import { Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import { getInitials } from '../lib/utils'

export default function Topbar({ title }) {
  const navigate = useNavigate()
  const { profile, user } = useAuth()
  const { unread } = useNotifications()
  const displayName = profile?.full_name || user?.name || 'Admin'
  const initials = getInitials(displayName)
  const hasTitle = Boolean(title)

  return (
    <header className={`topbar ${hasTitle ? '' : 'topbar-compact'}`}>
      {/* Top shimmer line */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 2,
        background: 'linear-gradient(90deg, transparent 0%, rgba(232,160,174,0.6) 30%, rgba(192,96,112,0.7) 50%, rgba(232,160,174,0.6) 70%, transparent 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmerSweep 3s linear infinite',
        pointerEvents: 'none',
      }} />

      {hasTitle && (
        <div className="topbar-title">
          <span>{title}</span>
        </div>
      )}

      <div className="topbar-actions">
        <button
          className="btn btn-ghost btn-icon"
          style={{ position: 'relative' }}
          onClick={() => navigate('/notifications')}
          aria-label={unread > 0 ? `${unread} unread notifications` : 'Notifications'}
          title={unread > 0 ? `${unread} unread notifications` : 'No new notifications'}
        >
          <Bell size={19} style={{ color: unread > 0 ? 'var(--color-rose)' : 'var(--color-muted)' }} />
          {unread > 0 && (
            <span className="notif-count">{unread > 99 ? '99+' : unread}</span>
          )}
        </button>

        <div className="avatar" style={{ cursor: 'pointer' }} title={displayName}>
          {initials}
        </div>
      </div>
    </header>
  )
}

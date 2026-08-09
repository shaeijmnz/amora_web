import { Bell, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getInitials } from '../lib/utils'

export default function Topbar({ title }) {
  const navigate = useNavigate()

  return (
    <header className="topbar">
      <div className="topbar-title">
        <span>{title}</span>
      </div>

      <div className="topbar-actions">
        <button
          className="btn btn-ghost btn-icon"
          style={{ position: 'relative' }}
          onClick={() => navigate('/notifications')}
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span className="notif-dot" />
        </button>

        <div
          className="avatar"
          style={{ cursor: 'pointer' }}
          title="Admin"
        >
          A
        </div>
      </div>
    </header>
  )
}

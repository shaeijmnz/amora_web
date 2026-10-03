import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LoadingSpinner } from './Skeleton'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b2e 40%, #1a1a2e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1.5rem',
      }}>
        <div style={{
          width: 56, height: 56,
          background: 'linear-gradient(135deg, #e8627a, #c94060)',
          borderRadius: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.6rem',
          boxShadow: '0 8px 24px rgba(232,98,122,0.4)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}>
          🌸
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 36, height: 36,
            border: '3px solid rgba(232,98,122,0.2)',
            borderTopColor: '#e8627a',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
            margin: '0 auto',
          }} />
        </div>
        <p style={{
          color: 'rgba(255,255,255,0.4)',
          fontSize: '0.85rem',
          fontFamily: "'Inter', sans-serif",
          margin: 0,
          letterSpacing: '0.05em',
        }}>
          Loading Amora Florals...
        </p>
        <style>{`
          @keyframes pulse {
            0%, 100% { box-shadow: 0 8px 24px rgba(232,98,122,0.4); }
            50% { box-shadow: 0 8px 40px rgba(232,98,122,0.7); }
          }
        `}</style>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/welcome" replace />
  }

  return children
}

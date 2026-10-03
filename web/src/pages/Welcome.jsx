import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const POINTS = [
  { emoji: '🌸', title: 'Fresh arrangements', text: 'Bouquets from the shop, ready for Quezon City.' },
  { emoji: '📅', title: 'Customer picks the slot', text: 'Date and time come from the order, not a guess.' },
  { emoji: '💬', title: 'Messages', text: 'Customer chats land here for the admin to answer.' },
]

export default function Welcome() {
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #fbf6f3 0%, #f5e6e4 55%, #efd6d4 100%)',
      color: '#4a3538',
    }}>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.1rem 1.25rem',
        maxWidth: 1040,
        margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'linear-gradient(135deg, #e8979e, #c97b85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '1.1rem',
          }}>🌸</div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>Amora Florals</span>
        </div>
        <button className="btn btn-primary" type="button" onClick={() => navigate('/login')}>
          Sign in
        </button>
      </header>

      <main style={{
        maxWidth: 1040,
        margin: '0 auto',
        padding: '1.5rem 1.25rem 3rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2rem',
        alignItems: 'center',
      }}>
        <div>
          <p style={{
            margin: '0 0 0.4rem',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#c97b85',
          }}>Quezon City</p>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2.6rem, 6vw, 4.4rem)',
            lineHeight: 0.95,
            margin: '0 0 0.8rem',
            color: '#c97b85',
            fontWeight: 500,
          }}>
            Amora
          </h1>
          <p style={{ margin: '0 0 0.6rem', fontSize: '1.15rem', fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>
            Florals
          </p>
          <p style={{ margin: 0, maxWidth: 420, lineHeight: 1.6, color: '#9a7f82' }}>
            Soft bouquets for delivery around the city. Customers order on the phone. The shop runs orders, stock, and messages from here.
          </p>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {POINTS.map((point) => (
              <div key={point.title} style={{
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
                background: '#fbf6f3',
                borderRadius: 16,
                padding: '0.85rem 0.9rem',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  background: '#f0c4c8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{point.emoji}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{point.title}</div>
                  <div style={{ color: '#9a7f82', fontSize: '0.82rem', lineHeight: 1.4 }}>{point.text}</div>
                </div>
              </div>
            ))}
          </div>
          <button
            className="btn btn-primary"
            type="button"
            style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}
            onClick={() => navigate('/login')}
          >
            Sign in to the dashboard
          </button>
        </div>
      </main>
    </div>
  )
}

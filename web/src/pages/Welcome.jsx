import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flower2, CalendarClock, MessageCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const POINTS = [
  { icon: Flower2, title: 'Orders', text: 'Customers choose a bouquet and a delivery slot.' },
  { icon: CalendarClock, title: 'Stock', text: 'The counter watches what is ready to sell.' },
  { icon: MessageCircle, title: 'Messages', text: 'Replies stay in one thread with the shop.' },
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
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 20px',
    }}>
      <main style={{ width: 'min(420px, 100%)', textAlign: 'center' }}>
        <div style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          margin: '0 auto',
          background: 'linear-gradient(135deg, #e8979e, #c97b85 55%, #c47a5a)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          boxShadow: '0 10px 24px rgba(201,123,133,0.28)',
        }}>
          <Flower2 size={24} />
        </div>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(3.2rem, 8vw, 4.4rem)',
          lineHeight: 0.92,
          margin: '8px 0 0',
          color: '#c97b85',
          fontWeight: 500,
        }}>
          Amora
        </h1>
        <p style={{ margin: '2px 0 0', fontSize: '1.35rem', fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>
          Florals
        </p>
        <p style={{ margin: '4px 0 0', fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: '#9a7f82' }}>
          Admin
        </p>
        <p style={{ margin: '10px 0 16px', lineHeight: 1.4, fontSize: '1rem' }}>
          A flower shop in Quezon City.
        </p>
        <div className="card" style={{ textAlign: 'left' }}>
          <div className="card-body" style={{ padding: '0.35rem 1rem' }}>
            {POINTS.map((point) => {
              const Icon = point.icon
              return (
                <div key={point.title} style={{
                  display: 'flex',
                  gap: '0.7rem',
                  alignItems: 'center',
                  padding: '0.65rem 0',
                }}>
                  <div className="stat-icon" style={{ background: '#f5e6e4', color: '#c97b85', margin: 0, width: 32, height: 32 }}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, lineHeight: 1.2 }}>{point.title}</div>
                    <div className="text-muted" style={{ fontSize: '0.8rem', lineHeight: 1.3 }}>{point.text}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <button
          className="btn btn-primary"
          type="button"
          style={{ width: '100%', marginTop: '14px', justifyContent: 'center', height: 48 }}
          onClick={() => navigate('/login')}
        >
          Sign in
        </button>
      </main>
    </div>
  )
}

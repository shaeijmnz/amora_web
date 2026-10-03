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
      flexDirection: 'column',
    }}>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        padding: '1.1rem 1.25rem',
        maxWidth: 980,
        width: '100%',
        margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', minWidth: 0 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg, #e8a0ae, #c06070)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', boxShadow: '0 4px 16px rgba(192,96,112,0.35)',
          }}>
            <Flower2 size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, lineHeight: 1.1 }}>Amora Florals</div>
            <div style={{ fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a7a82', fontWeight: 600 }}>Admin</div>
          </div>
        </div>
        <button className="btn btn-primary" type="button" onClick={() => navigate('/login')}>
          Sign in
        </button>
      </header>

      <main style={{
        flex: 1,
        width: '100%',
        maxWidth: 980,
        margin: '0 auto',
        padding: '0.5rem 1.25rem 2rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.25rem',
        alignItems: 'center',
      }}>
        <div>
          <p style={{
            margin: '0 0 0.35rem',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#c97b85',
          }}>Quezon City</p>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(3rem, 6vw, 4.4rem)',
            lineHeight: 0.92,
            margin: 0,
            color: '#c97b85',
            fontWeight: 500,
          }}>
            Amora
          </h1>
          <p style={{ margin: '0.15rem 0 0.7rem', fontSize: '1.35rem', fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>
            Florals
          </p>
          <p style={{ margin: '0 0 1rem', maxWidth: 420, lineHeight: 1.55, fontSize: '1.02rem' }}>
            Customers order bouquets, pick a delivery time, and message the shop.
          </p>
          <div className="card">
            <div className="card-body" style={{ padding: '1.05rem 1.2rem' }}>
              <h2 style={{ margin: '0 0 0.4rem', fontSize: '1.25rem' }}>What this is</h2>
              <p style={{ margin: 0, lineHeight: 1.55, color: '#4a3538' }}>
                Amora is the desk for this flower shop. People order on their phones. Here the shop runs orders, stock, and messages.
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">On the desk</h3>
          </div>
          <div className="card-body" style={{ paddingTop: '0.35rem' }}>
            {POINTS.map((point) => {
              const Icon = point.icon
              return (
                <div key={point.title} style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start',
                  padding: '0.75rem 0',
                  borderBottom: '1px solid var(--color-border)',
                }}>
                  <div className="stat-icon" style={{ background: '#f5e6e4', color: '#c97b85', margin: 0 }}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{point.title}</div>
                    <div className="text-muted" style={{ fontSize: '0.82rem', lineHeight: 1.4 }}>{point.text}</div>
                  </div>
                </div>
              )
            })}
            <button
              className="btn btn-primary"
              type="button"
              style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}
              onClick={() => navigate('/login')}
            >
              Sign in
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

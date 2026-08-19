import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const { user, signInWithEmail } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => { if (user) navigate('/') }, [user, navigate])

  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [authError, setAuthError] = useState(null)
  const [form, setForm] = useState({ email: '', password: '' })

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (authError) setAuthError(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setAuthError(null)
    try {
      await signInWithEmail(form.email, form.password)
    } catch (err) {
      setAuthError(err.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      background: '#fdf0f3',
    }}>
      {/* Left — brand panel, blush pink like the mobile app */}
      <div style={{
        background: 'linear-gradient(160deg, #fce8ec 0%, #f9d8e0 50%, #fce4ea 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-8%', left: '-8%', width: 380, height: 380, borderRadius: '50%', background: 'rgba(192,96,112,0.07)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: 420, height: 420, borderRadius: '50%', background: 'rgba(192,96,112,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '40%', right: '-4%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(232,160,174,0.12)', pointerEvents: 'none' }} />

        <FloatingPetals />

        <div style={{ position: 'relative', zIndex: 5, textAlign: 'center', maxWidth: 380 }}>
          {/* Logo */}
          <div style={{
            width: 90, height: 90,
            background: 'linear-gradient(135deg, #e8a0ae, #c06070)',
            borderRadius: 26,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.5rem',
            margin: '0 auto 2rem',
            boxShadow: '0 16px 48px rgba(192,96,112,0.35)',
            animation: 'logoFloat 4s ease-in-out infinite',
          }}>
            🌸
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '2.6rem',
            fontWeight: 800,
            color: '#2d1a20',
            margin: '0 0 0.5rem',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}>
            Amora<br />Florals
          </h1>

          <p style={{
            color: 'rgba(154,72,88,0.55)',
            fontSize: '0.78rem',
            margin: '0 0 2.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            fontWeight: 600,
          }}>
            Admin Dashboard
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', textAlign: 'left' }}>
            {[
              { emoji: '🌺', text: 'Manage inventory & flower stock' },
              { emoji: '📦', text: 'Track orders end-to-end' },
              { emoji: '🚚', text: 'Monitor deliveries in real time' },
              { emoji: '📊', text: 'View sales reports & analytics' },
            ].map(({ emoji, text }, i) => (
              <div key={text} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                animation: `slideInLeft 0.35s ease ${i * 0.07}s both`,
              }}>
                <span style={{
                  width: 36, height: 36,
                  background: 'rgba(255,255,255,0.65)',
                  borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', flexShrink: 0,
                  border: '1px solid rgba(192,96,112,0.12)',
                  boxShadow: '0 2px 8px rgba(192,96,112,0.08)',
                }}>
                  {emoji}
                </span>
                <span style={{ color: 'rgba(45,26,32,0.65)', fontSize: '0.875rem', fontWeight: 500 }}>
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — glass form panel */}
      <div style={{
        background: 'rgba(255,248,250,0.7)',
        backdropFilter: 'blur(24px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2.5rem',
        borderLeft: '1px solid rgba(255,255,255,0.7)',
      }}>
        <div style={{ width: '100%', maxWidth: 420, animation: 'slideUp 0.35s ease' }}>
          <div style={{ marginBottom: '2.25rem' }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.85rem',
              fontWeight: 700,
              color: '#2d1a20',
              margin: '0 0 0.5rem',
            }}>
              Welcome back
            </h2>
            <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Sign in to your Amora Florals admin account
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{
            display: 'flex', flexDirection: 'column', gap: '1.1rem',
            background: 'rgba(255,255,255,0.65)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.8)',
            padding: '1.5rem',
            boxShadow: '0 4px 24px rgba(192,96,112,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
          }}>
            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email Address <span className="required">*</span></label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', pointerEvents: 'none' }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="admin@amoraflorals.com"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password <span className="required">*</span></label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', pointerEvents: 'none' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)',
                    padding: 0, display: 'flex', transition: 'color 0.18s',
                  }}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {authError && (
              <div style={{
                padding: '0.75rem 1rem',
                background: '#fef2f2',
                border: '1.5px solid #fecaca',
                borderRadius: 10,
                display: 'flex', gap: '0.5rem', alignItems: 'flex-start',
                animation: 'slideUp 0.2s ease',
              }}>
                <AlertCircle size={14} style={{ color: '#dc2626', flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: '0.81rem', color: '#dc2626', fontWeight: 500, lineHeight: 1.5 }}>
                  {authError}
                </span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '0.9rem', marginTop: '0.25rem', borderRadius: 12 }}
              disabled={loading}
            >
              {loading ? (
                <span className="spinner" style={{ width: 18, height: 18 }} />
              ) : (
                <>Sign In <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <div style={{ marginTop: '1.75rem', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-muted)' }}>
              Admin access only · Contact your team for credentials
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          40% { transform: translateY(-8px) rotate(-3deg); }
          70% { transform: translateY(-4px) rotate(2deg); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-14px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes petalFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(6deg); }
        }
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

function FloatingPetals() {
  const items = [
    { emoji: '🌸', top: '7%', left: '10%', size: '2rem', op: 0.5, dur: 4.2, delay: '0s' },
    { emoji: '🌺', top: '15%', right: '8%', size: '1.6rem', op: 0.4, dur: 5, delay: '0.6s' },
    { emoji: '🌼', bottom: '20%', left: '6%', size: '1.9rem', op: 0.45, dur: 3.8, delay: '1.1s' },
    { emoji: '🌹', bottom: '10%', right: '12%', size: '1.7rem', op: 0.38, dur: 4.6, delay: '1.8s' },
    { emoji: '💐', top: '50%', left: '3%', size: '1.4rem', op: 0.3, dur: 5.5, delay: '0.4s' },
    { emoji: '🌷', top: '70%', right: '5%', size: '1.6rem', op: 0.4, dur: 4.0, delay: '1.4s' },
  ]
  return (
    <>
      {items.map((f, i) => (
        <div key={i} style={{
          position: 'absolute',
          fontSize: f.size,
          opacity: f.op,
          top: f.top, bottom: f.bottom, left: f.left, right: f.right,
          animation: `petalFloat ${f.dur}s ease-in-out infinite`,
          animationDelay: f.delay,
          pointerEvents: 'none',
          zIndex: 2,
        }}>
          {f.emoji}
        </div>
      ))}
    </>
  )
}

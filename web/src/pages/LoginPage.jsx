import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react'

export default function LoginPage() {
  const { user, signInWithEmail, signUpWithEmail, resetPassword, resendConfirmation } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  // 'login' | 'signup' | 'forgot'
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [unconfirmedEmail, setUnconfirmedEmail] = useState(null)
  const [authError, setAuthError] = useState(null)

  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', fullName: '' })

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleResend() {
    setResending(true)
    try {
      await resendConfirmation(unconfirmedEmail)
      toast.success('Confirmation email resent! Check your inbox.')
    } catch (e) {
      toast.error(e.message || 'Failed to resend. Try again.')
    } finally {
      setResending(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setUnconfirmedEmail(null)
    setAuthError(null)
    try {
      if (mode === 'login') {
        await signInWithEmail(form.email, form.password)
        // AuthContext listener handles redirect
      } else if (mode === 'signup') {
        if (form.password !== form.confirmPassword) {
          setAuthError('Passwords do not match')
          return
        }
        if (form.password.length < 6) {
          setAuthError('Password must be at least 6 characters')
          return
        }
        await signUpWithEmail(form.email, form.password, form.fullName)
        toast.success('Account created! You can now sign in.')
        setMode('login')
        setForm((prev) => ({ ...prev, email: form.email, password: '' }))
      } else if (mode === 'forgot') {
        await resetPassword(form.email)
        toast.success('Password reset link sent to your email.')
        setMode('login')
      }
    } catch (err) {
      console.error('[Amora Auth Error]', err.message, err)
      if (err.message === 'EMAIL_NOT_CONFIRMED') {
        setUnconfirmedEmail(form.email)
        setAuthError(null)
      } else {
        setAuthError(err.message || 'Sign in failed. Check your email and password.')
      }
    } finally {
      setLoading(false)
    }
  }

  const titles = {
    login: { h: 'Welcome back', sub: 'Sign in to your Amora Florals admin account' },
    signup: { h: 'Create account', sub: 'Set up your Amora Florals admin access' },
    forgot: { h: 'Reset password', sub: 'Enter your email and we\'ll send a reset link' },
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
    }}>
      {/* Left panel — brand */}
      <div style={{
        background: 'linear-gradient(160deg, #1a1a2e 0%, #2d1b2e 50%, #16213e 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow blobs */}
        <div style={{ position: 'absolute', top: '-5%', left: '-10%', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,98,122,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(122,171,138,0.14) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', right: '10%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,169,110,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Floating decorative flowers */}
        <FloatingFlowers />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 5, textAlign: 'center', maxWidth: 380 }}>
          <div style={{
            width: 88, height: 88,
            background: 'linear-gradient(135deg, #e8627a, #c94060)',
            borderRadius: 26,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.5rem',
            margin: '0 auto 2rem',
            boxShadow: '0 16px 48px rgba(232,98,122,0.5)',
            animation: 'glow 3s ease-in-out infinite',
          }}>
            🌸
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '2.6rem',
            fontWeight: 700,
            color: '#fff',
            margin: '0 0 0.75rem',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
          }}>
            Amora<br />Florals
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.45)',
            fontSize: '0.85rem',
            margin: '0 0 3rem',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            fontWeight: 600,
          }}>
            Admin Dashboard
          </p>

          {/* Feature highlights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
            {[
              { emoji: '🌺', text: 'Manage inventory & flower stock' },
              { emoji: '📦', text: 'Track orders end-to-end' },
              { emoji: '🚚', text: 'Monitor deliveries in real time' },
              { emoji: '📊', text: 'View sales reports & analytics' },
            ].map(({ emoji, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <span style={{
                  width: 36, height: 36, background: 'rgba(255,255,255,0.06)',
                  borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', flexShrink: 0,
                }}>
                  {emoji}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.875rem', fontWeight: 500 }}>
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{
        background: '#fafafa',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2.5rem',
      }}>
        <div style={{ width: '100%', maxWidth: 420, animation: 'slideUp 0.3s ease' }}>
          {/* Header */}
          <div style={{ marginBottom: '2.25rem' }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.85rem',
              fontWeight: 700,
              color: 'var(--color-ink)',
              margin: '0 0 0.5rem',
            }}>
              {titles[mode].h}
            </h2>
            <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              {titles[mode].sub}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Full name — signup only */}
            {mode === 'signup' && (
              <div className="form-group">
                <label className="form-label">Full Name <span className="required">*</span></label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="Your full name"
                    value={form.fullName}
                    onChange={(e) => set('fullName', e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email Address <span className="required">*</span></label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', pointerEvents: 'none' }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="admin@amoraflorals.com"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  required
                  autoFocus={mode !== 'signup'}
                />
              </div>
            </div>

            {/* Password — login + signup */}
            {mode !== 'forgot' && (
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Password <span className="required">*</span></label>
                  {mode === 'login' && (
                    <button type="button" onClick={() => setMode('forgot')}
                      style={{ fontSize: '0.78rem', color: 'var(--color-rose)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
                      Forgot password?
                    </button>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', pointerEvents: 'none' }} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-input"
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
                    placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
                    value={form.password}
                    onChange={(e) => set('password', e.target.value)}
                    required
                    minLength={6}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{
                    position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)',
                    padding: 0, display: 'flex',
                  }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm password — signup only */}
            {mode === 'signup' && (
              <div className="form-group">
                <label className="form-label">Confirm Password <span className="required">*</span></label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', pointerEvents: 'none' }} />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    className="form-input"
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
                    placeholder="Re-enter your password"
                    value={form.confirmPassword}
                    onChange={(e) => set('confirmPassword', e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{
                    position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)',
                    padding: 0, display: 'flex',
                  }}>
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password strength */}
                {form.password && (
                  <PasswordStrength password={form.password} />
                )}
              </div>
            )}

            {/* Email not confirmed banner */}
            {unconfirmedEmail && (
              <div style={{
                padding: '1rem',
                background: '#fff7ed',
                border: '1.5px solid #fed7aa',
                borderRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <AlertCircle size={16} style={{ color: '#c2410c', flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#c2410c' }}>Email not confirmed</div>
                    <div style={{ fontSize: '0.78rem', color: '#9a3412', marginTop: '0.2rem', lineHeight: 1.5 }}>
                      Check your inbox at <strong>{unconfirmedEmail}</strong> and click the confirmation link first.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                    padding: '0.5rem 1rem', borderRadius: 8, border: '1.5px solid #fed7aa',
                    background: '#fff', color: '#c2410c', fontSize: '0.8rem', fontWeight: 600,
                    cursor: resending ? 'not-allowed' : 'pointer', opacity: resending ? 0.7 : 1,
                  }}
                >
                  <RefreshCw size={13} style={{ animation: resending ? 'spin 0.7s linear infinite' : 'none' }} />
                  {resending ? 'Sending...' : 'Resend confirmation email'}
                </button>
                <div style={{ fontSize: '0.73rem', color: '#9a3412', fontWeight: 500 }}>
                  💡 <strong>Tip:</strong> Go to <strong>Supabase Dashboard → Authentication → Settings</strong> and disable <em>"Enable email confirmations"</em> to skip this for testing.
                </div>
              </div>
            )}

            {/* Inline auth error */}
            {authError && (
              <div style={{
                padding: '0.75rem 1rem',
                background: '#fef2f2',
                border: '1.5px solid #fecaca',
                borderRadius: 10,
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'flex-start',
              }}>
                <AlertCircle size={15} style={{ color: '#dc2626', flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: '0.82rem', color: '#dc2626', fontWeight: 500, lineHeight: 1.5 }}>
                  {authError}
                </span>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', marginTop: '0.5rem', borderRadius: 12 }}
              disabled={loading}
            >
              {loading ? (
                <span className="spinner" style={{ width: 18, height: 18 }} />
              ) : (
                <>
                  {mode === 'login' && 'Sign In'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'forgot' && 'Send Reset Link'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Mode switcher */}
          <div style={{ marginTop: '1.75rem', textAlign: 'center' }}>
            {mode === 'login' && (
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                Don't have an account?{' '}
                <button onClick={() => { setMode('signup'); setForm({ email: '', password: '', confirmPassword: '', fullName: '' }) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-rose)', fontWeight: 700, fontSize: '0.875rem', padding: 0 }}>
                  Create one
                </button>
              </p>
            )}
            {(mode === 'signup' || mode === 'forgot') && (
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                Already have an account?{' '}
                <button onClick={() => { setMode('login'); setForm({ email: '', password: '', confirmPassword: '', fullName: '' }) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-rose)', fontWeight: 700, fontSize: '0.875rem', padding: 0 }}>
                  Sign in
                </button>
              </p>
            )}
          </div>

          {/* Test credentials hint */}
          <div style={{
            marginTop: '2rem',
            padding: '0.875rem 1rem',
            background: '#fff8f0',
            borderRadius: 12,
            border: '1px solid #fde8cc',
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
              🧪 User Testing Note
            </div>
            <div style={{ fontSize: '0.78rem', color: '#b45309', lineHeight: 1.5 }}>
              Create an account above with any email and password. The first account you create will be an <strong>admin</strong> by default.
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes glow {
          0%, 100% { box-shadow: 0 16px 48px rgba(232,98,122,0.5); }
          50% { box-shadow: 0 16px 64px rgba(232,98,122,0.75); }
        }
        @media (max-width: 768px) {
          .login-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

function PasswordStrength({ password }) {
  const checks = [
    { label: 'At least 6 characters', ok: password.length >= 6 },
    { label: 'Contains a number', ok: /\d/.test(password) },
    { label: 'Contains uppercase', ok: /[A-Z]/.test(password) },
    { label: 'Contains special char', ok: /[!@#$%^&*]/.test(password) },
  ]
  const score = checks.filter((c) => c.ok).length

  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e']
  const labels = ['Weak', 'Fair', 'Good', 'Strong']

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.4rem' }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 99,
            background: i < score ? colors[score - 1] : 'var(--color-border)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
      <div style={{ fontSize: '0.72rem', color: score > 0 ? colors[score - 1] : 'var(--color-muted)', fontWeight: 600 }}>
        {score > 0 ? labels[score - 1] : 'Enter a password'}
      </div>
    </div>
  )
}

function FloatingFlowers() {
  const items = [
    { emoji: '🌸', top: '8%', left: '15%', size: '2rem', opacity: 0.12, delay: '0s' },
    { emoji: '🌺', top: '20%', right: '12%', size: '1.5rem', opacity: 0.09, delay: '0.5s' },
    { emoji: '🌼', bottom: '25%', left: '8%', size: '2.2rem', opacity: 0.1, delay: '1s' },
    { emoji: '🌹', bottom: '10%', right: '18%', size: '1.8rem', opacity: 0.08, delay: '1.5s' },
    { emoji: '💐', top: '50%', left: '5%', size: '1.4rem', opacity: 0.07, delay: '0.8s' },
    { emoji: '🌷', top: '70%', right: '8%', size: '1.6rem', opacity: 0.09, delay: '0.3s' },
  ]

  return (
    <>
      {items.map((f, i) => (
        <div key={i} style={{
          position: 'absolute',
          fontSize: f.size,
          opacity: f.opacity,
          top: f.top,
          bottom: f.bottom,
          left: f.left,
          right: f.right,
          animation: `floatAnim ${3.5 + i * 0.3}s ease-in-out infinite`,
          animationDelay: f.delay,
          pointerEvents: 'none',
          zIndex: 1,
        }}>
          {f.emoji}
        </div>
      ))}
      <style>{`
        @keyframes floatAnim {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </>
  )
}

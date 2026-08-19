import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const TITLES = {
  '/': 'Dashboard',
  '/inventory': 'Inventory Management',
  '/products': 'Products & Arrangements',
  '/custom-requests': 'Custom Arrangement Requests',
  '/orders': 'Order Management',
  '/delivery': 'Delivery Management',
  '/customers': 'Customers',
  '/reports': 'Reports & History',
  '/notifications': 'Notifications',
}

function getTitle(pathname) {
  if (TITLES[pathname]) return TITLES[pathname]
  const base = '/' + pathname.split('/')[1]
  return TITLES[base] || 'Amora Florals'
}

/* Sparkle dots — positions are fixed so they don't re-render */
const SPARKLES = [
  { size: 4,  top: '8%',  left: '22%', dur: 5.2, delay: 0 },
  { size: 3,  top: '14%', left: '68%', dur: 6.8, delay: 1.2 },
  { size: 5,  top: '28%', left: '82%', dur: 4.5, delay: 0.6 },
  { size: 3,  top: '42%', left: '12%', dur: 7.1, delay: 2.1 },
  { size: 4,  top: '55%', left: '55%', dur: 5.8, delay: 0.9 },
  { size: 3,  top: '65%', left: '35%', dur: 6.3, delay: 1.7 },
  { size: 5,  top: '76%', left: '74%', dur: 4.9, delay: 0.3 },
  { size: 3,  top: '88%', left: '20%', dur: 6.6, delay: 2.4 },
  { size: 4,  top: '20%', left: '45%', dur: 5.5, delay: 1.5 },
  { size: 3,  top: '72%', left: '90%', dur: 7.4, delay: 0.7 },
  { size: 6,  top: '35%', left: '5%',  dur: 5.0, delay: 3.0 },
  { size: 3,  top: '50%', left: '92%', dur: 6.1, delay: 1.1 },
]

export default function Layout() {
  const location = useLocation()
  const title = getTitle(location.pathname)
  const showTopbarTitle = location.pathname !== '/'

  return (
    <>
      {/* ── Animated background layer ── */}
      <div className="app-bg" aria-hidden="true">
        <div className="app-bg-orb app-bg-orb-1" />
        <div className="app-bg-orb app-bg-orb-2" />
        <div className="app-bg-orb app-bg-orb-3" />
        <div className="app-bg-orb app-bg-orb-4" />
      </div>

      {/* ── Sparkle dots ── */}
      <div className="sparkle-field" aria-hidden="true">
        {SPARKLES.map((s, i) => (
          <div
            key={i}
            className="sparkle-dot"
            style={{
              width: s.size,
              height: s.size,
              top: s.top,
              left: s.left,
              '--sp-dur': `${s.dur}s`,
              '--sp-delay': `${s.delay}s`,
              '--sp-op': 0.3,
            }}
          />
        ))}
      </div>

      {/* ── Main shell ── */}
      <div className="layout">
        <Sidebar />
        <div className="main-content">
          <Topbar title={showTopbarTitle ? title : ''} />
          <div className="page-wrapper">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  )
}

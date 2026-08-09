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

export default function Layout() {
  const location = useLocation()
  const title = getTitle(location.pathname)

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title={title} />
        <div className="page-wrapper">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

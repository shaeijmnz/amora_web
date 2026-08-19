import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Package, Flower2, AlertTriangle, XCircle, ShoppingBag,
  Truck, CheckCircle2, TrendingUp, Clock, Users,
} from 'lucide-react'
import { formatCurrency, formatDateTime } from '../lib/utils'
import { Badge } from '../components/Badge'
import { useToast } from '../context/ToastContext'
import { api } from '../lib/api'

function StatCard({ icon: Icon, label, value, color, subtext, onClick }) {
  return (
    <div className="stat-card" style={{ cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
      <div className="stat-icon" style={{ background: `${color}18`, color }}>
        <Icon size={20} />
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {subtext && <div className="text-xs text-muted">{subtext}</div>}
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const toast = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.dashboard()
      .then(setData)
      .catch((e) => toast.error(e.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  const summary = data?.summary || {
    total_products: 0,
    available_flowers: 0,
    low_stock: 0,
    out_of_stock: 0,
    damaged_spoiled: 0,
    new_orders: 0,
    being_prepared: 0,
    for_delivery: 0,
    completed_today: 0,
    todays_sales: 0,
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title page-title-shimmer">Dashboard ✦</h1>
          <p className="page-subtitle">Live from Laravel — same database as the customer app.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/orders')}>
          <ShoppingBag size={16} /> View All Orders
        </button>
      </div>

      {loading ? (
        <div className="empty-state"><h3>Loading dashboard…</h3></div>
      ) : (
        <>
          <div className="stat-grid" style={{ marginBottom: '1.5rem' }}>
            <StatCard icon={Package} label="Total Products" value={summary.total_products} color="#7aab8a" onClick={() => navigate('/products')} />
            <StatCard icon={Flower2} label="Inventory Units" value={summary.available_flowers} color="#e8627a" onClick={() => navigate('/inventory')} />
            <StatCard icon={AlertTriangle} label="Low Stock" value={summary.low_stock} color="#f59e0b" onClick={() => navigate('/inventory')} />
            <StatCard icon={XCircle} label="Out of Stock" value={summary.out_of_stock} color="#ef4444" />
            <StatCard icon={ShoppingBag} label="New Orders" value={summary.new_orders} color="#8b5cf6" onClick={() => navigate('/orders')} />
            <StatCard icon={Clock} label="Being Prepared" value={summary.being_prepared} color="#f59e0b" />
            <StatCard icon={Truck} label="For Delivery" value={summary.for_delivery} color="#3b82f6" onClick={() => navigate('/delivery')} />
            <StatCard icon={CheckCircle2} label="Completed Today" value={summary.completed_today} color="#10b981" />
            <StatCard icon={TrendingUp} label="Today's Sales" value={formatCurrency(summary.todays_sales)} color="#e8627a" />
            <StatCard icon={Users} label="Customers" value={data?.customers_count ?? 0} color="#6366f1" onClick={() => navigate('/customers')} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem' }}>
            <div className="card">
              <div className="card-header"><h3 className="card-title">Recent Orders</h3></div>
              <div className="card-body">
                {(data?.recent_orders || []).length === 0 ? (
                  <div className="empty-state"><h3>No orders yet</h3><p>Customer checkouts will appear here.</p></div>
                ) : (
                  <table>
                    <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
                    <tbody>
                      {data.recent_orders.map((o) => (
                        <tr key={o.id}>
                          <td className="font-semibold text-rose">{o.order_number}</td>
                          <td>{o.customer_name}</td>
                          <td>{formatCurrency(o.total)}</td>
                          <td><Badge value={o.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header"><h3 className="card-title">Low Stock Alerts</h3></div>
              <div className="card-body">
                {(data?.low_stock || []).length === 0 ? (
                  <div className="empty-state"><h3>Stock looks healthy</h3></div>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {data.low_stock.map((i) => (
                      <li key={i.id} style={{ padding: '0.6rem 0', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{i.name}</span>
                        <span className="text-muted">{i.quantity_on_hand} left</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

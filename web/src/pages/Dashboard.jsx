import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Package, Flower2, AlertTriangle, XCircle, ShoppingBag,
  Truck, CheckCircle2, TrendingUp, ArrowUpRight, Clock,
  Star, Activity,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatCurrency, formatDateTime, capitalize, badgeClass } from '../lib/utils'
import { Badge } from '../components/Badge'
import { SkeletonCard, LoadingSpinner } from '../components/Skeleton'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

// Mock data for demo (replaced by real Supabase calls once connected)
const MOCK_SUMMARY = {
  total_products: 48,
  available_flowers: 312,
  low_stock: 7,
  out_of_stock: 3,
  damaged_spoiled: 2,
  new_orders: 14,
  being_prepared: 6,
  for_delivery: 9,
  completed_today: 23,
  todays_sales: 18750,
}

const MOCK_RECENT_ORDERS = [
  { id: '1', order_number: 'ORD-0241', customer: 'Maria Santos', total: 1850, status: 'being_prepared', created_at: new Date().toISOString() },
  { id: '2', order_number: 'ORD-0240', customer: 'Jose Reyes', total: 3200, status: 'confirmed', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: '3', order_number: 'ORD-0239', customer: 'Ana Cruz', total: 950, status: 'dispatched', created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: '4', order_number: 'ORD-0238', customer: 'Pedro Lim', total: 4500, status: 'delivered', created_at: new Date(Date.now() - 10800000).toISOString() },
  { id: '5', order_number: 'ORD-0237', customer: 'Rosa Dela Cruz', total: 2100, status: 'completed', created_at: new Date(Date.now() - 14400000).toISOString() },
]

const MOCK_LOW_STOCK = [
  { id: '1', name: 'Red Roses', quantity_on_hand: 8, min_stock_level: 20, status: 'low_stock' },
  { id: '2', name: 'White Lilies', quantity_on_hand: 3, min_stock_level: 15, status: 'low_stock' },
  { id: '3', name: 'Sunflowers', quantity_on_hand: 0, min_stock_level: 10, status: 'out_of_stock' },
  { id: '4', name: 'Pink Carnations', quantity_on_hand: 5, min_stock_level: 12, status: 'low_stock' },
]

const MOCK_BEST_SELLERS = [
  { name: 'Classic Red Bouquet', orders: 42, revenue: 58800 },
  { name: 'Sunflower Sunshine', orders: 31, revenue: 37200 },
  { name: 'Pastel Dream Mix', orders: 28, revenue: 50400 },
  { name: 'Pink Garden Rose', orders: 25, revenue: 30000 },
  { name: 'White Elegance', orders: 21, revenue: 42000 },
]

const MOCK_SALES_CHART = [
  { day: 'Mon', sales: 12400 },
  { day: 'Tue', sales: 18200 },
  { day: 'Wed', sales: 9800 },
  { day: 'Thu', sales: 22100 },
  { day: 'Fri', sales: 31500 },
  { day: 'Sat', sales: 41200 },
  { day: 'Sun', sales: 18750 },
]

const MOCK_DELIVERIES = [
  { id: '1', order_number: 'ORD-0241', recipient: 'Maria Santos', address: 'BGC, Taguig', status: 'assigned', scheduled_time: '10:00 AM' },
  { id: '2', order_number: 'ORD-0235', recipient: 'Elena Gomez', address: 'Makati CBD', status: 'out_for_delivery', scheduled_time: '11:30 AM' },
  { id: '3', order_number: 'ORD-0229', recipient: 'Ben Torres', address: 'Mandaluyong', status: 'scheduled', scheduled_time: '2:00 PM' },
]

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
  const summary = MOCK_SUMMARY

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Good morning 🌸</h1>
          <p className="page-subtitle">Here's what's happening at Amora Florals today.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/orders')}>
          <ShoppingBag size={16} />
          View All Orders
        </button>
      </div>

      {/* Summary Cards */}
      <div className="stat-grid" style={{ marginBottom: '1.5rem' }}>
        <StatCard icon={Package} label="Total Products" value={summary.total_products} color="#7aab8a" onClick={() => navigate('/products')} />
        <StatCard icon={Flower2} label="Available Flowers" value={summary.available_flowers} color="#e8627a" subtext="units in stock" onClick={() => navigate('/inventory')} />
        <StatCard icon={AlertTriangle} label="Low Stock Items" value={summary.low_stock} color="#f59e0b" onClick={() => navigate('/inventory?status=low_stock')} />
        <StatCard icon={XCircle} label="Out of Stock" value={summary.out_of_stock} color="#ef4444" onClick={() => navigate('/inventory?status=out_of_stock')} />
        <StatCard icon={ShoppingBag} label="New Orders" value={summary.new_orders} color="#8b5cf6" onClick={() => navigate('/orders?status=pending')} />
        <StatCard icon={Clock} label="Being Prepared" value={summary.being_prepared} color="#f59e0b" onClick={() => navigate('/orders?status=being_prepared')} />
        <StatCard icon={Truck} label="For Delivery" value={summary.for_delivery} color="#3b82f6" onClick={() => navigate('/delivery')} />
        <StatCard icon={CheckCircle2} label="Completed Today" value={summary.completed_today} color="#10b981" />
        <StatCard
          icon={TrendingUp}
          label="Today's Sales"
          value={formatCurrency(summary.todays_sales)}
          color="#e8627a"
          subtext={<span className="stat-change up"><ArrowUpRight size={12} />+12% vs yesterday</span>}
        />
      </div>

      {/* Charts + Widgets Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Sales Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Sales Overview — This Week</h3>
            <span className="text-xs text-muted">PHP</span>
          </div>
          <div className="card-body" style={{ padding: '1rem 1.5rem 1.5rem' }}>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={MOCK_SALES_CHART}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e8627a" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#e8627a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₱${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => formatCurrency(v)} labelStyle={{ fontWeight: 600 }} />
                <Area type="monotone" dataKey="sales" stroke="#e8627a" strokeWidth={2.5} fill="url(#salesGradient)" dot={{ fill: '#e8627a', r: 4, strokeWidth: 2, stroke: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Best Sellers */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Best Sellers</h3>
            <Star size={16} style={{ color: '#f59e0b' }} />
          </div>
          <div style={{ padding: '0.75rem 0' }}>
            {MOCK_BEST_SELLERS.map((item, i) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1.25rem' }}>
                <span style={{
                  width: 24, height: 24,
                  background: i === 0 ? 'linear-gradient(135deg,#fbbf24,#f59e0b)' : 'var(--color-bg)',
                  color: i === 0 ? '#fff' : 'var(--color-muted)',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
                }}>{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="text-sm font-semibold truncate">{item.name}</div>
                  <div className="text-xs text-muted">{item.orders} orders</div>
                </div>
                <div className="text-xs font-semibold text-sage">{formatCurrency(item.revenue)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
        {/* Recent Orders */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <h3 className="card-title">Recent Orders</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/orders')}>
              View all <ArrowUpRight size={14} />
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_RECENT_ORDERS.map((order) => (
                  <tr key={order.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/orders/${order.id}`)}>
                    <td><span className="font-semibold text-rose">{order.order_number}</span></td>
                    <td>{order.customer}</td>
                    <td className="font-semibold">{formatCurrency(order.total)}</td>
                    <td><Badge value={order.status} /></td>
                    <td className="text-xs text-muted">{formatDateTime(order.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">⚠️ Low Stock</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/inventory')}>
              Manage <ArrowUpRight size={14} />
            </button>
          </div>
          <div style={{ padding: '0.5rem 0' }}>
            {MOCK_LOW_STOCK.map((item) => (
              <div key={item.id} style={{ padding: '0.65rem 1.25rem', borderBottom: '1px solid var(--color-border)' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: '0.3rem' }}>
                  <span className="text-sm font-semibold">{item.name}</span>
                  <Badge value={item.status} />
                </div>
                <div className="text-xs text-muted">
                  {item.quantity_on_hand} / {item.min_stock_level} units
                </div>
                <div style={{
                  marginTop: '0.35rem',
                  height: 4, borderRadius: 99,
                  background: 'var(--color-border)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${Math.min(100, (item.quantity_on_hand / item.min_stock_level) * 100)}%`,
                    height: '100%',
                    background: item.quantity_on_hand === 0 ? '#ef4444' : '#f59e0b',
                    borderRadius: 99,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today's Deliveries */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">
          <h3 className="card-title">Today's Deliveries</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/delivery')}>
            View all <ArrowUpRight size={14} />
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Recipient</th>
                <th>Address</th>
                <th>Scheduled</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {MOCK_DELIVERIES.map((d) => (
                <tr key={d.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/delivery/${d.id}`)}>
                  <td><span className="font-semibold text-rose">{d.order_number}</span></td>
                  <td>{d.recipient}</td>
                  <td className="text-muted">{d.address}</td>
                  <td className="text-sm">{d.scheduled_time}</td>
                  <td><Badge value={d.status} /></td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); navigate(`/delivery/${d.id}`) }}>
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

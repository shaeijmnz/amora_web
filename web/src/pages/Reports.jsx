import { useState } from 'react'
import { Download } from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { formatCurrency, formatDate } from '../lib/utils'

const TABS = ['Inventory', 'Sales', 'Delivery', 'Movement History']

// Inventory Reports
const INVENTORY_REPORTS = [
  { label: 'Current Stock', items: [
    { name: 'Red Roses', qty: 8, unit: 'stem', status: 'low_stock' },
    { name: 'White Lilies', qty: 3, unit: 'stem', status: 'low_stock' },
    { name: 'Pink Carnations', qty: 45, unit: 'stem', status: 'in_stock' },
    { name: 'Purple Orchids', qty: 22, unit: 'stem', status: 'in_stock' },
    { name: 'Sunflowers', qty: 0, unit: 'stem', status: 'out_of_stock' },
  ]},
]

const SALES_DAILY = [
  { date: 'Jul 21', revenue: 12400, orders: 8 },
  { date: 'Jul 22', revenue: 18200, orders: 11 },
  { date: 'Jul 23', revenue: 9800, orders: 6 },
  { date: 'Jul 24', revenue: 22100, orders: 14 },
  { date: 'Jul 25', revenue: 31500, orders: 19 },
  { date: 'Jul 26', revenue: 41200, orders: 25 },
  { date: 'Jul 27', revenue: 18750, orders: 12 },
]

const TOP_PRODUCTS = [
  { name: 'Classic Red Bouquet', orders: 42, revenue: 58800 },
  { name: 'Sunflower Sunshine', orders: 31, revenue: 37200 },
  { name: 'Pastel Dream Mix', orders: 28, revenue: 50400 },
  { name: 'Pink Garden Rose', orders: 25, revenue: 30000 },
  { name: 'White Elegance', orders: 21, revenue: 42000 },
]

const OCCASIONS_DATA = [
  { occasion: "Valentine's", orders: 45 },
  { occasion: 'Birthday', orders: 38 },
  { occasion: 'Anniversary', orders: 27 },
  { occasion: 'Wedding', orders: 18 },
  { occasion: 'Sympathy', orders: 12 },
  { occasion: 'Graduation', orders: 9 },
]

const DELIVERY_STATS = [
  { status: 'Delivered', count: 128, percent: 85 },
  { status: 'Failed', count: 12, percent: 8 },
  { status: 'Rescheduled', count: 10, percent: 7 },
]

const MOVEMENT_HISTORY = [
  { date: '2026-07-27 09:12', item: 'Red Roses', type: 'stock_in', qty: '+50', prev: 0, new: 50, reason: 'Supplier delivery', by: 'Admin', ref: null },
  { date: '2026-07-27 10:05', item: 'White Lilies', type: 'stock_out', qty: '-8', prev: 11, new: 3, reason: 'Used for ORD-0241', by: 'Admin', ref: 'ORD-0241' },
  { date: '2026-07-27 11:00', item: 'Sunflowers', type: 'damaged', qty: '-10', prev: 10, new: 0, reason: 'Damaged during delivery', by: 'Admin', ref: null },
  { date: '2026-07-26 14:30', item: 'Baby\'s Breath', type: 'spoiled', qty: '-5', prev: 6, new: 1, reason: 'Past expiration date', by: 'Admin', ref: null },
  { date: '2026-07-26 09:00', item: 'Pink Carnations', type: 'stock_in', qty: '+30', prev: 15, new: 45, reason: 'Restocked', by: 'Admin', ref: null },
]

const MOVEMENT_COLORS = {
  stock_in: '#16a34a',
  stock_out: '#dc2626',
  adjustment: '#2563eb',
  damaged: '#f59e0b',
  spoiled: '#7c3aed',
  reserved_release: '#0891b2',
}

function ExportBtn({ label }) {
  return (
    <button className="btn btn-secondary btn-sm">
      <Download size={14} /> Export {label}
    </button>
  )
}

function SectionHeader({ title, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
      <h3 style={{ margin: 0, fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '0.95rem' }}>{title}</h3>
      {children}
    </div>
  )
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState('Sales')
  const [dateRange, setDateRange] = useState('week')

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & History</h1>
          <p className="page-subtitle">Live data from your Supabase views</p>
        </div>
        <select className="form-select" style={{ width: 'auto' }} value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>

      <div className="tabs" style={{ marginBottom: '1.5rem' }}>
        {TABS.map((t) => (
          <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
        ))}
      </div>

      {/* INVENTORY TAB */}
      {activeTab === 'Inventory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <div className="card-header">
              <SectionHeader title="Current Stock Levels">
                <ExportBtn label="CSV" />
              </SectionHeader>
            </div>
            <div className="table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {INVENTORY_REPORTS[0].items.map((item) => (
                    <tr key={item.name}>
                      <td className="font-semibold">{item.name}</td>
                      <td>{item.qty}</td>
                      <td className="text-muted">{item.unit}</td>
                      <td><span className={`badge badge-${item.status}`}>{item.status.replace(/_/g, ' ')}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SALES TAB */}
      {activeTab === 'Sales' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <div className="card-header">
              <SectionHeader title="Daily Revenue & Orders">
                <ExportBtn label="CSV" />
              </SectionHeader>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={SALES_DAILY}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₱${(v/1000).toFixed(0)}k`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v, name) => name === 'revenue' ? formatCurrency(v) : v} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#e8627a" strokeWidth={2.5} dot={{ fill: '#e8627a', r: 4 }} name="Revenue (PHP)" />
                  <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#7aab8a" strokeWidth={2.5} dot={{ fill: '#7aab8a', r: 4 }} name="Orders" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="card">
              <div className="card-header">
                <SectionHeader title="Best-Selling Arrangements">
                  <ExportBtn label="CSV" />
                </SectionHeader>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr><th>Product</th><th>Orders</th><th>Revenue</th></tr>
                  </thead>
                  <tbody>
                    {TOP_PRODUCTS.map((p) => (
                      <tr key={p.name}>
                        <td className="font-semibold">{p.name}</td>
                        <td>{p.orders}</td>
                        <td className="font-semibold">{formatCurrency(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <SectionHeader title="Orders by Occasion" />
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={OCCASIONS_DATA} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="occasion" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={70} />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#e8627a" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELIVERY TAB */}
      {activeTab === 'Delivery' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {DELIVERY_STATS.map((s) => (
              <div className="stat-card" key={s.status}>
                <div className="stat-label">{s.status} Deliveries</div>
                <div className="stat-value">{s.count}</div>
                <div style={{ marginTop: '0.5rem', height: 6, background: 'var(--color-border)', borderRadius: 99 }}>
                  <div style={{ width: `${s.percent}%`, height: '100%', background: s.status === 'Delivered' ? '#16a34a' : s.status === 'Failed' ? '#dc2626' : '#f59e0b', borderRadius: 99 }} />
                </div>
                <div className="text-xs text-muted">{s.percent}%</div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-header">
              <SectionHeader title="Delivery Performance Summary">
                <ExportBtn label="CSV" />
              </SectionHeader>
            </div>
            <div className="card-body">
              <table>
                <thead>
                  <tr><th>Metric</th><th>Value</th></tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Total Deliveries', value: 150 },
                    { label: 'On-time Delivery Rate', value: '85%' },
                    { label: 'Avg. Delivery Time', value: '2.3 hrs' },
                    { label: 'Failed Deliveries', value: 12 },
                    { label: 'Rescheduled', value: 10 },
                    { label: 'Total Delivery Revenue', value: formatCurrency(21000) },
                  ].map(({ label, value }) => (
                    <tr key={label}>
                      <td className="text-muted">{label}</td>
                      <td className="font-semibold">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MOVEMENT HISTORY TAB */}
      {activeTab === 'Movement History' && (
        <div className="card">
          <div className="card-header">
            <SectionHeader title="Inventory Movement History">
              <ExportBtn label="CSV" />
            </SectionHeader>
          </div>
          <div className="table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Item</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Previous Qty</th>
                  <th>New Qty</th>
                  <th>Reason</th>
                  <th>Order Ref</th>
                  <th>By</th>
                </tr>
              </thead>
              <tbody>
                {MOVEMENT_HISTORY.map((m, i) => (
                  <tr key={i}>
                    <td className="text-xs">{m.date}</td>
                    <td className="font-semibold">{m.item}</td>
                    <td>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 999,
                        background: `${MOVEMENT_COLORS[m.type]}18`,
                        color: MOVEMENT_COLORS[m.type],
                      }}>
                        {m.type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="font-semibold" style={{ color: m.qty.startsWith('+') ? '#16a34a' : '#dc2626' }}>{m.qty}</td>
                    <td className="text-muted">{m.prev}</td>
                    <td className="font-semibold">{m.new}</td>
                    <td className="text-sm text-muted">{m.reason}</td>
                    <td>{m.ref ? <span className="text-rose font-semibold">{m.ref}</span> : '—'}</td>
                    <td className="text-xs text-muted">{m.by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

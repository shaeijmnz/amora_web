import { useEffect, useState } from 'react'
import { Download, RefreshCw } from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { formatCurrency } from '../lib/utils'
import { useToast } from '../context/ToastContext'
import { api } from '../lib/api'

const TABS = ['Inventory', 'Sales', 'Delivery', 'Movement History']

const MOVEMENT_COLORS = {
  stock_in: '#16a34a',
  stock_out: '#dc2626',
  adjustment: '#2563eb',
  damaged: '#f59e0b',
  spoiled: '#7c3aed',
  reserved_release: '#0891b2',
}

const EMPTY = {
  sales: { daily: [], top_products: [], by_category: [], totals: { orders: 0, revenue: 0, average_order: 0, items_sold: 0 } },
  inventory: { items: [], totals: { items: 0, stems_on_hand: 0, low_stock: 0, out_of_stock: 0 } },
  delivery: { stats: [], summary: {}, by_rider: [] },
  movements: [],
}

function downloadCsv(filename, rows) {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const escape = (v) => {
    const s = v === null || v === undefined ? '' : String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function ExportBtn({ filename, rows, disabled }) {
  return (
    <button
      className="btn btn-secondary btn-sm"
      disabled={disabled || !rows?.length}
      onClick={() => downloadCsv(filename, rows)}
    >
      <Download size={14} /> Export CSV
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

function NoData({ label }) {
  return (
    <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
      <h3 style={{ fontSize: '0.95rem' }}>No {label} yet</h3>
      <p>Data appears here once orders come through this period.</p>
    </div>
  )
}

export default function Reports() {
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('Sales')
  const [dateRange, setDateRange] = useState('week')
  const [report, setReport] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api.reports(dateRange)
      .then((res) => { if (!cancelled) setReport({ ...EMPTY, ...res }) })
      .catch((e) => { if (!cancelled) toast.error(e.message || 'Failed to load reports') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [dateRange, reloadKey])

  const { sales, inventory, delivery, movements } = report
  const summary = delivery.summary || {}

  const avgDelivery = summary.avg_delivery_minutes
    ? `${(summary.avg_delivery_minutes / 60).toFixed(1)} hrs`
    : '—'

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & History</h1>
          <p className="page-subtitle">
            {loading ? 'Loading live data…' : `Live data from paid orders • ${sales.totals.orders} orders, ${formatCurrency(sales.totals.revenue)}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={() => setReloadKey((k) => k + 1)} disabled={loading} title="Reload">
            <RefreshCw size={16} />
          </button>
          <select className="form-select" style={{ width: 'auto' }} value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: '1.5rem' }}>
        {TABS.map((t) => (
          <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
        ))}
      </div>

      {/* INVENTORY TAB */}
      {activeTab === 'Inventory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div className="stat-card"><div className="stat-label">Tracked Items</div><div className="stat-value">{inventory.totals.items}</div></div>
            <div className="stat-card"><div className="stat-label">Stems On Hand</div><div className="stat-value">{inventory.totals.stems_on_hand}</div></div>
            <div className="stat-card"><div className="stat-label">Low Stock</div><div className="stat-value">{inventory.totals.low_stock}</div></div>
            <div className="stat-card"><div className="stat-label">Out of Stock</div><div className="stat-value">{inventory.totals.out_of_stock}</div></div>
          </div>

          <div className="card">
            <div className="card-header">
              <SectionHeader title="Current Stock Levels">
                <ExportBtn filename="amora-stock-levels.csv" rows={inventory.items} disabled={loading} />
              </SectionHeader>
            </div>
            {inventory.items.length === 0 ? <NoData label="inventory" /> : (
              <div className="table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Category</th>
                      <th>Quantity</th>
                      <th>Unit</th>
                      <th>Min Level</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.items.map((item) => (
                      <tr key={item.id}>
                        <td className="font-semibold">{item.name}</td>
                        <td className="text-muted">{item.category}</td>
                        <td>{item.qty}</td>
                        <td className="text-muted">{item.unit}</td>
                        <td className="text-muted">{item.min_stock_level}</td>
                        <td><span className={`badge badge-${item.status}`}>{item.status.replace(/_/g, ' ')}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SALES TAB */}
      {activeTab === 'Sales' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div className="stat-card"><div className="stat-label">Paid Orders</div><div className="stat-value">{sales.totals.orders}</div></div>
            <div className="stat-card"><div className="stat-label">Revenue</div><div className="stat-value">{formatCurrency(sales.totals.revenue)}</div></div>
            <div className="stat-card"><div className="stat-label">Average Order</div><div className="stat-value">{formatCurrency(sales.totals.average_order)}</div></div>
            <div className="stat-card"><div className="stat-label">Items Sold</div><div className="stat-value">{sales.totals.items_sold}</div></div>
          </div>

          <div className="card">
            <div className="card-header">
              <SectionHeader title="Daily Revenue & Orders">
                <ExportBtn filename="amora-daily-sales.csv" rows={sales.daily} disabled={loading} />
              </SectionHeader>
            </div>
            <div className="card-body">
              {sales.daily.length === 0 ? <NoData label="sales" /> : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={sales.daily}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₱${v}`} allowDecimals={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip formatter={(v, name) => (name === 'Revenue (PHP)' ? formatCurrency(v) : v)} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#e8627a" strokeWidth={2.5} dot={{ fill: '#e8627a', r: 4 }} name="Revenue (PHP)" />
                    <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#7aab8a" strokeWidth={2.5} dot={{ fill: '#7aab8a', r: 4 }} name="Orders" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="card">
              <div className="card-header">
                <SectionHeader title="Best-Selling Arrangements">
                  <ExportBtn filename="amora-best-sellers.csv" rows={sales.top_products} disabled={loading} />
                </SectionHeader>
              </div>
              {sales.top_products.length === 0 ? <NoData label="sales" /> : (
                <div style={{ overflowX: 'auto' }}>
                  <table>
                    <thead>
                      <tr><th>Product</th><th>Sold</th><th>Revenue</th></tr>
                    </thead>
                    <tbody>
                      {sales.top_products.map((p) => (
                        <tr key={p.name}>
                          <td className="font-semibold">{p.name}</td>
                          <td>{p.orders}</td>
                          <td className="font-semibold">{formatCurrency(p.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="card">
              <div className="card-header">
                <SectionHeader title="Blooms Sold by Category" />
              </div>
              <div className="card-body">
                {sales.by_category.length === 0 ? <NoData label="sales" /> : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={sales.by_category} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={130} />
                      <Tooltip />
                      <Bar dataKey="orders" fill="#e8627a" radius={[0, 6, 6, 0]} name="Sold" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELIVERY TAB */}
      {activeTab === 'Delivery' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {delivery.stats.map((s) => (
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
                <ExportBtn
                  filename="amora-delivery-summary.csv"
                  rows={[summary]}
                  disabled={loading || !summary.total_deliveries}
                />
              </SectionHeader>
            </div>
            <div className="card-body">
              <table>
                <thead>
                  <tr><th>Metric</th><th>Value</th></tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Total Deliveries', value: summary.total_deliveries ?? 0 },
                    { label: 'On-time Delivery Rate', value: `${summary.on_time_rate ?? 0}%` },
                    { label: 'Avg. Delivery Time', value: avgDelivery },
                    { label: 'Failed Deliveries', value: summary.failed_deliveries ?? 0 },
                    { label: 'Rescheduled', value: summary.rescheduled ?? 0 },
                    { label: 'Awaiting a Rider', value: summary.unassigned ?? 0 },
                    { label: 'Total Delivery Revenue', value: formatCurrency(summary.delivery_revenue ?? 0) },
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

          <div className="card">
            <div className="card-header">
              <SectionHeader title="Rider Performance">
                <ExportBtn filename="amora-riders.csv" rows={delivery.by_rider} disabled={loading} />
              </SectionHeader>
            </div>
            {delivery.by_rider.length === 0 ? <NoData label="assigned riders" /> : (
              <div className="table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
                <table>
                  <thead>
                    <tr><th>Rider</th><th>Assigned</th><th>Delivered</th><th>Failed</th></tr>
                  </thead>
                  <tbody>
                    {delivery.by_rider.map((r) => (
                      <tr key={r.rider}>
                        <td className="font-semibold">{r.rider}</td>
                        <td>{r.assigned}</td>
                        <td style={{ color: '#16a34a', fontWeight: 600 }}>{r.delivered}</td>
                        <td style={{ color: r.failed ? '#dc2626' : undefined, fontWeight: 600 }}>{r.failed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MOVEMENT HISTORY TAB */}
      {activeTab === 'Movement History' && (
        <div className="card">
          <div className="card-header">
            <SectionHeader title="Inventory Movement History">
              <ExportBtn filename="amora-stock-movements.csv" rows={movements} disabled={loading} />
            </SectionHeader>
          </div>
          {movements.length === 0 ? <NoData label="stock movements" /> : (
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
                  {movements.map((m) => (
                    <tr key={m.id}>
                      <td className="text-xs">{m.date}</td>
                      <td className="font-semibold">{m.item}</td>
                      <td>
                        <span style={{
                          fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 999,
                          background: `${MOVEMENT_COLORS[m.type] || '#6b7280'}18`,
                          color: MOVEMENT_COLORS[m.type] || '#6b7280',
                        }}>
                          {m.type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="font-semibold" style={{ color: m.qty.startsWith('+') ? '#16a34a' : '#dc2626' }}>{m.qty}</td>
                      <td className="text-muted">{m.prev}</td>
                      <td className="font-semibold">{m.new}</td>
                      <td className="text-sm text-muted">{m.reason || '—'}</td>
                      <td>{m.ref ? <span className="text-rose font-semibold">{m.ref}</span> : '—'}</td>
                      <td className="text-xs text-muted">{m.by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

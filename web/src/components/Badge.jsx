import { capitalize, badgeClass } from '../lib/utils'

export function Badge({ value, label }) {
  return (
    <span className={`badge ${badgeClass(value)}`}>
      {label || capitalize(value)}
    </span>
  )
}

export function StatusDot({ value }) {
  const colors = {
    in_stock: '#16a34a',
    low_stock: '#ca8a04',
    out_of_stock: '#dc2626',
    pending: '#ca8a04',
    confirmed: '#2563eb',
    being_prepared: '#7c3aed',
    completed: '#16a34a',
    cancelled: '#dc2626',
    delivered: '#16a34a',
    paid: '#16a34a',
    unpaid: '#dc2626',
    active: '#16a34a',
    inactive: '#6b7280',
    blocked: '#dc2626',
  }
  return (
    <span style={{
      display: 'inline-block',
      width: 8, height: 8,
      borderRadius: '50%',
      background: colors[value] || '#6b7280',
      marginRight: 6,
      flexShrink: 0,
    }} />
  )
}

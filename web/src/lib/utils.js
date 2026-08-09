import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount || 0)
}

export function formatDate(dateStr, opts = {}) {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...opts,
  }).format(new Date(dateStr))
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

export function getInitials(name = '') {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, '_')
}

export function capitalize(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ')
}

export function badgeClass(value) {
  const map = {
    // order status
    pending: 'badge-pending',
    confirmed: 'badge-confirmed',
    being_prepared: 'badge-being_prepared',
    ready_for_delivery: 'badge-ready_for_delivery',
    dispatched: 'badge-dispatched',
    delivered: 'badge-delivered',
    completed: 'badge-completed',
    cancelled: 'badge-cancelled',
    refunded: 'badge-refunded',
    // stock
    in_stock: 'badge-in_stock',
    low_stock: 'badge-low_stock',
    out_of_stock: 'badge-out_of_stock',
    reserved: 'badge-reserved',
    damaged: 'badge-damaged',
    spoiled: 'badge-spoiled',
    // payment
    unpaid: 'badge-unpaid',
    partially_paid: 'badge-partially_paid',
    paid: 'badge-paid',
    // delivery
    unscheduled: 'badge-unscheduled',
    scheduled: 'badge-scheduled',
    assigned: 'badge-assigned',
    preparing_for_dispatch: 'badge-assigned',
    out_for_delivery: 'badge-out_for_delivery',
    delivery_failed: 'badge-delivery_failed',
    rescheduled: 'badge-rescheduled',
    // request
    new: 'badge-new',
    under_review: 'badge-under_review',
    awaiting_customer_approval: 'badge-awaiting_customer_approval',
    approved: 'badge-approved',
    in_preparation: 'badge-in_preparation',
    rejected: 'badge-rejected',
  }
  return map[value] || 'badge-pending'
}

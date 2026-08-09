import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

// ── Dashboard ────────────────────────────────────────────────
export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard_summary'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_dashboard_summary')
      if (error) throw error
      return data
    },
  })
}

// ── Inventory ─────────────────────────────────────────────────
export function useInventoryItems(filters = {}) {
  return useQuery({
    queryKey: ['inventory_items', filters],
    queryFn: async () => {
      let q = supabase
        .from('inventory_items')
        .select('*, categories(name, group_type)')
        .is('archived_at', null)
        .order('name')

      if (filters.status && filters.status !== 'all') q = q.eq('status', filters.status)
      if (filters.search) q = q.ilike('name', `%${filters.search}%`)

      const { data, error } = await q
      if (error) throw error
      return data
    },
  })
}

export function useAddStockMovement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ itemId, type, delta, reason, orderId }) => {
      // Get current quantity first
      const { data: item } = await supabase
        .from('inventory_items')
        .select('quantity_on_hand')
        .eq('id', itemId)
        .single()

      const prev = item.quantity_on_hand
      const next = type === 'stock_in' ? prev + delta : Math.max(0, prev - delta)

      // Write movement
      const { error: mvErr } = await supabase.from('inventory_movements').insert({
        item_id: itemId, movement_type: type, quantity_delta: type === 'stock_in' ? delta : -delta,
        previous_quantity: prev, new_quantity: next, reason, reference_order_id: orderId || null,
      })
      if (mvErr) throw mvErr

      // Update item
      const { error: itemErr } = await supabase
        .from('inventory_items')
        .update({ quantity_on_hand: next })
        .eq('id', itemId)
      if (itemErr) throw itemErr
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory_items'] }),
  })
}

// ── Products ──────────────────────────────────────────────────
export function useProducts(filters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      let q = supabase
        .from('products')
        .select('*, product_sizes(*), product_colors(*), product_occasions(occasions(name))')
        .is('archived_at', null)
        .order('name')

      if (filters.search) q = q.ilike('name', `%${filters.search}%`)
      if (filters.available !== undefined) q = q.eq('is_available', filters.available)

      const { data, error } = await q
      if (error) throw error
      return data
    },
  })
}

// ── Orders ────────────────────────────────────────────────────
export function useOrders(filters = {}) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: async () => {
      let q = supabase
        .from('orders')
        .select('*, profiles!customer_id(full_name, phone), order_items(*, products(name), product_sizes(label))')
        .order('created_at', { ascending: false })

      if (filters.status && filters.status !== 'all') q = q.eq('status', filters.status)
      if (filters.payment_status && filters.payment_status !== 'all') q = q.eq('payment_status', filters.payment_status)

      const { data, error } = await q
      if (error) throw error
      return data
    },
  })
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ orderId, status }) => {
      const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  })
}

// ── Custom Requests ───────────────────────────────────────────
export function useCustomRequests(filters = {}) {
  return useQuery({
    queryKey: ['custom_requests', filters],
    queryFn: async () => {
      let q = supabase
        .from('custom_arrangement_requests')
        .select('*, profiles!customer_id(full_name, phone), occasions(name)')
        .order('created_at', { ascending: false })

      if (filters.status && filters.status !== 'all') q = q.eq('status', filters.status)

      const { data, error } = await q
      if (error) throw error
      return data
    },
  })
}

export function useConvertRequestToOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ requestId, price, notes }) => {
      const { data, error } = await supabase.rpc('convert_request_to_order', {
        p_request_id: requestId, p_price: price, p_admin_notes: notes,
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['custom_requests'] })
      qc.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

// ── Deliveries ────────────────────────────────────────────────
export function useDeliveries(filters = {}) {
  return useQuery({
    queryKey: ['deliveries', filters],
    queryFn: async () => {
      let q = supabase
        .from('deliveries')
        .select('*, orders(order_number, recipient_name, recipient_contact), profiles!assigned_rider_id(full_name), delivery_attempts(*)')
        .order('scheduled_date', { ascending: true })

      if (filters.status && filters.status !== 'all') q = q.eq('status', filters.status)
      if (filters.date) q = q.eq('scheduled_date', filters.date)

      const { data, error } = await q
      if (error) throw error
      return data
    },
  })
}

export function useUpdateDelivery() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updates }) => {
      const { error } = await supabase.from('deliveries').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deliveries'] }),
  })
}

// ── Customers ─────────────────────────────────────────────────
export function useCustomers(search = '') {
  return useQuery({
    queryKey: ['customers', search],
    queryFn: async () => {
      let q = supabase
        .from('v_customer_summary')
        .select('*')
        .order('total_orders', { ascending: false })

      if (search) q = q.ilike('full_name', `%${search}%`)

      const { data, error } = await q
      if (error) throw error
      return data
    },
  })
}

// ── Notifications ─────────────────────────────────────────────
export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) throw error
      return data
    },
  })
}

export function useMarkNotificationRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

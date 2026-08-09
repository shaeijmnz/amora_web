-- ============================================================
-- Migration 001: Custom Enum Types
-- ============================================================

CREATE TYPE stock_status AS ENUM (
  'in_stock', 'low_stock', 'out_of_stock', 'reserved', 'damaged', 'spoiled'
);

CREATE TYPE order_status AS ENUM (
  'pending', 'confirmed', 'being_prepared', 'ready_for_delivery',
  'dispatched', 'delivered', 'completed', 'cancelled', 'refunded'
);

CREATE TYPE delivery_status AS ENUM (
  'unscheduled', 'scheduled', 'assigned', 'preparing_for_dispatch',
  'dispatched', 'out_for_delivery', 'delivered', 'delivery_failed', 'rescheduled'
);

CREATE TYPE payment_status AS ENUM (
  'unpaid', 'partially_paid', 'paid', 'refunded'
);

CREATE TYPE request_status AS ENUM (
  'new', 'under_review', 'awaiting_customer_approval', 'approved',
  'in_preparation', 'completed', 'rejected', 'cancelled'
);

CREATE TYPE notification_cat AS ENUM (
  'inventory', 'orders', 'custom_requests', 'deliveries', 'system'
);

CREATE TYPE account_status AS ENUM (
  'active', 'inactive', 'blocked'
);

CREATE TYPE movement_type AS ENUM (
  'stock_in', 'stock_out', 'adjustment', 'damaged', 'spoiled', 'reserved_release'
);

CREATE TYPE order_type AS ENUM (
  'standard', 'custom'
);

CREATE TYPE category_group AS ENUM (
  'flower', 'material', 'addon'
);

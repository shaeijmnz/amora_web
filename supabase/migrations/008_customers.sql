-- ============================================================
-- Migration 008: Customer Notes & Account Status
-- ============================================================

-- customer_notes table (account_status was already added to profiles in 002)
CREATE TABLE customer_notes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  note         TEXT NOT NULL,
  created_by   UUID REFERENCES profiles(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- View: customer summary (avoids storing stale aggregates)
CREATE OR REPLACE VIEW v_customer_summary AS
SELECT
  p.id,
  p.full_name,
  p.phone,
  p.account_status,
  p.created_at AS joined_at,
  COUNT(o.id)                         AS total_orders,
  COALESCE(SUM(o.total), 0)           AS total_spent,
  MAX(o.created_at)                   AS last_order_date
FROM profiles p
LEFT JOIN orders o ON o.customer_id = p.id
WHERE p.role = 'customer'
GROUP BY p.id, p.full_name, p.phone, p.account_status, p.created_at;

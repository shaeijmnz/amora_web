-- ============================================================
-- Migration 010: Report Views
-- Implemented as views → always live, no stale aggregates
-- ============================================================

-- ── Inventory Views ──────────────────────────────────────────

CREATE OR REPLACE VIEW v_current_stock AS
SELECT ii.id, ii.name, c.name AS category, ii.unit,
       ii.quantity_on_hand, ii.min_stock_level, ii.status, ii.expiration_date, ii.last_updated_at
FROM inventory_items ii
LEFT JOIN categories c ON c.id = ii.category_id
WHERE ii.archived_at IS NULL
ORDER BY ii.name;

CREATE OR REPLACE VIEW v_low_stock AS
SELECT * FROM v_current_stock WHERE status = 'low_stock';

CREATE OR REPLACE VIEW v_out_of_stock AS
SELECT * FROM v_current_stock WHERE status = 'out_of_stock';

CREATE OR REPLACE VIEW v_damaged_stock AS
SELECT * FROM v_current_stock WHERE status = 'damaged';

CREATE OR REPLACE VIEW v_spoiled_flowers AS
SELECT * FROM v_current_stock WHERE status = 'spoiled';

CREATE OR REPLACE VIEW v_material_usage AS
SELECT
  ii.id AS item_id,
  ii.name AS item_name,
  c.name AS category,
  SUM(ABS(im.quantity_delta)) FILTER (WHERE im.movement_type = 'stock_out') AS total_used,
  SUM(im.quantity_delta)      FILTER (WHERE im.movement_type = 'stock_in')  AS total_received,
  SUM(ABS(im.quantity_delta)) FILTER (WHERE im.movement_type = 'damaged')   AS total_damaged,
  SUM(ABS(im.quantity_delta)) FILTER (WHERE im.movement_type = 'spoiled')   AS total_spoiled
FROM inventory_items ii
LEFT JOIN categories c ON c.id = ii.category_id
LEFT JOIN inventory_movements im ON im.item_id = ii.id
WHERE ii.archived_at IS NULL
GROUP BY ii.id, ii.name, c.name
ORDER BY total_used DESC NULLS LAST;

-- ── Sales Views ──────────────────────────────────────────────

CREATE OR REPLACE VIEW v_sales_daily AS
SELECT
  DATE_TRUNC('day', created_at) AS period,
  COUNT(*)                       AS order_count,
  SUM(total)                     AS revenue,
  AVG(total)                     AS avg_order_value
FROM orders
WHERE status NOT IN ('cancelled', 'refunded')
GROUP BY 1 ORDER BY 1 DESC;

CREATE OR REPLACE VIEW v_sales_weekly AS
SELECT
  DATE_TRUNC('week', created_at) AS period,
  COUNT(*)                        AS order_count,
  SUM(total)                      AS revenue,
  AVG(total)                      AS avg_order_value
FROM orders
WHERE status NOT IN ('cancelled', 'refunded')
GROUP BY 1 ORDER BY 1 DESC;

CREATE OR REPLACE VIEW v_sales_monthly AS
SELECT
  DATE_TRUNC('month', created_at) AS period,
  COUNT(*)                         AS order_count,
  SUM(total)                       AS revenue,
  AVG(total)                       AS avg_order_value
FROM orders
WHERE status NOT IN ('cancelled', 'refunded')
GROUP BY 1 ORDER BY 1 DESC;

CREATE OR REPLACE VIEW v_best_selling_arrangements AS
SELECT
  p.id AS product_id,
  p.name AS product_name,
  COUNT(oi.id) AS order_count,
  SUM(oi.quantity * oi.unit_price) AS total_revenue
FROM products p
JOIN order_items oi ON oi.product_id = p.id
JOIN orders o ON o.id = oi.order_id
WHERE o.status NOT IN ('cancelled', 'refunded')
GROUP BY p.id, p.name
ORDER BY order_count DESC;

CREATE OR REPLACE VIEW v_most_popular_occasions AS
SELECT
  oc.name AS occasion,
  COUNT(DISTINCT o.id) AS order_count
FROM occasions oc
JOIN product_occasions po ON po.occasion_id = oc.id
JOIN order_items oi ON oi.product_id = po.product_id
JOIN orders o ON o.id = oi.order_id
WHERE o.status NOT IN ('cancelled', 'refunded')
GROUP BY oc.name
ORDER BY order_count DESC;

CREATE OR REPLACE VIEW v_cancelled_orders AS
SELECT o.id, o.order_number, o.total, o.cancelled_at,
       p.full_name AS customer_name,
       (SELECT note FROM order_status_history h WHERE h.order_id = o.id AND h.status = 'cancelled' ORDER BY changed_at DESC LIMIT 1) AS cancel_reason
FROM orders o
JOIN profiles p ON p.id = o.customer_id
WHERE o.status = 'cancelled'
ORDER BY o.cancelled_at DESC;

CREATE OR REPLACE VIEW v_custom_arrangement_sales AS
SELECT
  car.id, car.request_number, car.bouquet_size, car.budget, car.estimated_price,
  p.full_name AS customer_name,
  oc.name AS occasion,
  car.status, car.created_at
FROM custom_arrangement_requests car
JOIN profiles p ON p.id = car.customer_id
LEFT JOIN occasions oc ON oc.id = car.occasion_id
ORDER BY car.created_at DESC;

-- ── Delivery Views ───────────────────────────────────────────

CREATE OR REPLACE VIEW v_delivery_performance AS
SELECT
  COUNT(*) FILTER (WHERE d.status = 'delivered')         AS total_delivered,
  COUNT(*) FILTER (WHERE d.status = 'delivery_failed')   AS total_failed,
  COUNT(*) FILTER (WHERE d.status = 'rescheduled')       AS total_rescheduled,
  COUNT(*)                                                AS total_deliveries,
  ROUND(
    COUNT(*) FILTER (WHERE d.status = 'delivered') * 100.0 / NULLIF(COUNT(*),0), 1
  ) AS delivery_success_rate
FROM deliveries d;

CREATE OR REPLACE VIEW v_orders_per_delivery_person AS
SELECT
  p.id AS rider_id,
  p.full_name AS rider_name,
  COUNT(d.id) AS total_assigned,
  COUNT(d.id) FILTER (WHERE d.status = 'delivered') AS delivered,
  COUNT(d.id) FILTER (WHERE d.status = 'delivery_failed') AS failed
FROM profiles p
LEFT JOIN deliveries d ON d.assigned_rider_id = p.id
WHERE p.role = 'rider'
GROUP BY p.id, p.full_name
ORDER BY total_assigned DESC;

CREATE OR REPLACE VIEW v_completed_deliveries AS
SELECT d.id, o.order_number, d.scheduled_date, d.scheduled_time,
       p.full_name AS rider_name, d.proof_of_delivery_url, d.updated_at AS completed_at
FROM deliveries d
JOIN orders o ON o.id = d.order_id
LEFT JOIN profiles p ON p.id = d.assigned_rider_id
WHERE d.status = 'delivered'
ORDER BY d.updated_at DESC;

CREATE OR REPLACE VIEW v_failed_deliveries AS
SELECT d.id, o.order_number, d.scheduled_date,
       p.full_name AS rider_name,
       da.attempt_number, da.failed_reason, da.attempted_at
FROM deliveries d
JOIN orders o ON o.id = d.order_id
LEFT JOIN profiles p ON p.id = d.assigned_rider_id
LEFT JOIN delivery_attempts da ON da.delivery_id = d.id AND da.status = 'failed'
WHERE d.status IN ('delivery_failed', 'rescheduled')
ORDER BY da.attempted_at DESC;

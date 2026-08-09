-- ============================================================
-- Migration 013: RPC Functions
-- ============================================================

-- get_dashboard_summary()
-- Returns all summary-card counts in ONE round trip.
-- Used by the Dashboard page.
CREATE OR REPLACE FUNCTION get_dashboard_summary()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    -- Inventory
    'total_products',     (SELECT COUNT(*) FROM products WHERE archived_at IS NULL),
    'available_flowers',  (SELECT COALESCE(SUM(quantity_on_hand), 0)
                           FROM inventory_items ii
                           JOIN categories c ON c.id = ii.category_id
                           WHERE c.group_type = 'flower' AND ii.archived_at IS NULL AND ii.status = 'in_stock'),
    'low_stock',          (SELECT COUNT(*) FROM inventory_items WHERE status = 'low_stock' AND archived_at IS NULL),
    'out_of_stock',       (SELECT COUNT(*) FROM inventory_items WHERE status = 'out_of_stock' AND archived_at IS NULL),
    'damaged_spoiled',    (SELECT COUNT(*) FROM inventory_items WHERE status IN ('damaged','spoiled') AND archived_at IS NULL),

    -- Orders
    'new_orders',         (SELECT COUNT(*) FROM orders WHERE status = 'pending'),
    'being_prepared',     (SELECT COUNT(*) FROM orders WHERE status = 'being_prepared'),
    'for_delivery',       (SELECT COUNT(*) FROM orders WHERE status IN ('ready_for_delivery','dispatched')),
    'completed_today',    (SELECT COUNT(*) FROM orders WHERE status = 'completed'
                           AND DATE_TRUNC('day', completed_at) = CURRENT_DATE),

    -- Sales
    'todays_sales',       (SELECT COALESCE(SUM(total), 0) FROM orders
                           WHERE status NOT IN ('cancelled','refunded')
                           AND DATE_TRUNC('day', created_at) = CURRENT_DATE),

    -- Pending custom requests
    'pending_requests',   (SELECT COUNT(*) FROM custom_arrangement_requests
                           WHERE status IN ('new','under_review')),

    -- Unassigned deliveries
    'unassigned_deliveries', (SELECT COUNT(*) FROM deliveries
                              WHERE assigned_rider_id IS NULL
                              AND scheduled_date = CURRENT_DATE)
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users (dashboard uses service-role or authenticated)
GRANT EXECUTE ON FUNCTION get_dashboard_summary() TO authenticated;

-- convert_request_to_order(request_id UUID, price NUMERIC, notes TEXT)
-- Converts an approved custom arrangement request into a standard order.
CREATE OR REPLACE FUNCTION convert_request_to_order(
  p_request_id UUID,
  p_price NUMERIC,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  req  custom_arrangement_requests%ROWTYPE;
  new_order_id UUID;
BEGIN
  SELECT * INTO req FROM custom_arrangement_requests WHERE id = p_request_id;

  IF req.id IS NULL THEN
    RAISE EXCEPTION 'Custom request % not found', p_request_id;
  END IF;
  IF req.status <> 'approved' THEN
    RAISE EXCEPTION 'Request must be approved before converting to order. Current status: %', req.status;
  END IF;

  -- Create the order
  INSERT INTO orders (
    customer_id, order_type, status, payment_status,
    subtotal, total, recipient_name, admin_notes
  ) VALUES (
    req.customer_id, 'custom', 'confirmed', 'unpaid',
    p_price, p_price, (SELECT full_name FROM profiles WHERE id = req.customer_id),
    COALESCE(p_admin_notes, req.admin_notes)
  ) RETURNING id INTO new_order_id;

  -- Create a placeholder order item
  INSERT INTO order_items (order_id, custom_request_id, quantity, unit_price)
  VALUES (new_order_id, req.id, 1, p_price);

  -- Mark request as completed and link the order
  UPDATE custom_arrangement_requests
  SET status = 'in_preparation', converted_order_id = new_order_id, updated_at = NOW()
  WHERE id = p_request_id;

  RETURN new_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION convert_request_to_order(UUID, NUMERIC, TEXT) TO authenticated;

-- ============================================================
-- Migration 009: Notifications
-- ============================================================

CREATE TABLE notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category      notification_cat NOT NULL,
  title         TEXT NOT NULL,
  body          TEXT,
  related_type  TEXT,      -- 'order', 'delivery', 'inventory_item', 'custom_request'
  related_id    UUID,
  is_read       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast unread queries per user
CREATE INDEX idx_notifications_user_unread
  ON notifications (user_id, is_read, created_at DESC)
  WHERE is_read = FALSE;

-- ── Notification Triggers ────────────────────────────────────

-- 1. New order → notify all admins
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, category, title, body, related_type, related_id)
  SELECT id, 'orders',
    'New Order Received',
    'Order ' || NEW.order_number || ' has been placed.',
    'order', NEW.id
  FROM profiles WHERE role = 'admin';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notify_new_order
  AFTER INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION notify_new_order();

-- 2. Order cancelled → notify admins
CREATE OR REPLACE FUNCTION notify_order_cancelled()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status <> 'cancelled' THEN
    INSERT INTO notifications (user_id, category, title, body, related_type, related_id)
    SELECT id, 'orders',
      'Order Cancelled',
      'Order ' || NEW.order_number || ' was cancelled.',
      'order', NEW.id
    FROM profiles WHERE role = 'admin';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notify_order_cancelled
  AFTER UPDATE OF status ON orders
  FOR EACH ROW EXECUTE FUNCTION notify_order_cancelled();

-- 3. New custom request → notify admins
CREATE OR REPLACE FUNCTION notify_new_custom_request()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, category, title, body, related_type, related_id)
  SELECT id, 'custom_requests',
    'New Custom Arrangement Request',
    'Request ' || NEW.request_number || ' submitted by a customer.',
    'custom_request', NEW.id
  FROM profiles WHERE role = 'admin';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notify_new_custom_request
  AFTER INSERT ON custom_arrangement_requests
  FOR EACH ROW EXECUTE FUNCTION notify_new_custom_request();

-- 4. Delivery failed → notify admins
CREATE OR REPLACE FUNCTION notify_delivery_failed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivery_failed' AND OLD.status <> 'delivery_failed' THEN
    INSERT INTO notifications (user_id, category, title, body, related_type, related_id)
    SELECT p.id, 'deliveries',
      'Delivery Failed',
      'A delivery for order ' || o.order_number || ' has failed. Consider rescheduling.',
      'delivery', NEW.id
    FROM profiles p, orders o
    WHERE p.role = 'admin' AND o.id = NEW.order_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notify_delivery_failed
  AFTER UPDATE OF status ON deliveries
  FOR EACH ROW EXECUTE FUNCTION notify_delivery_failed();

-- 5. Delivery assigned to rider without a rider → notify admins
CREATE OR REPLACE FUNCTION notify_unassigned_delivery()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assigned_rider_id IS NULL THEN
    INSERT INTO notifications (user_id, category, title, body, related_type, related_id)
    SELECT p.id, 'deliveries',
      'Unassigned Delivery',
      'A delivery has a scheduled date but no assigned rider.',
      'delivery', NEW.id
    FROM profiles p
    WHERE p.role = 'admin';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notify_unassigned_delivery
  AFTER INSERT ON deliveries
  FOR EACH ROW
  WHEN (NEW.scheduled_date IS NOT NULL AND NEW.assigned_rider_id IS NULL)
  EXECUTE FUNCTION notify_unassigned_delivery();

-- ============================================================
-- Migration 011: Additional Scheduled Triggers
-- (Low-stock & expiry notifications — meant to run via pg_cron
--  or a Supabase Edge Function on a schedule)
-- ============================================================

-- Function: scan inventory and fire low-stock / near-expiry notifications
-- Call this via pg_cron: SELECT cron.schedule('inventory-check', '0 7 * * *', 'SELECT check_inventory_notifications()');
CREATE OR REPLACE FUNCTION check_inventory_notifications()
RETURNS VOID AS $$
DECLARE
  rec RECORD;
BEGIN
  -- Low stock / out of stock alerts
  FOR rec IN
    SELECT ii.id, ii.name, ii.status
    FROM inventory_items ii
    WHERE ii.status IN ('low_stock', 'out_of_stock')
      AND ii.archived_at IS NULL
  LOOP
    INSERT INTO notifications (user_id, category, title, body, related_type, related_id)
    SELECT p.id,
      'inventory',
      CASE WHEN rec.status = 'out_of_stock' THEN 'Item Out of Stock' ELSE 'Low Stock Alert' END,
      rec.name || ' is ' || REPLACE(rec.status::TEXT, '_', ' ') || '.',
      'inventory_item', rec.id
    FROM profiles p
    WHERE p.role = 'admin'
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- Near-expiry (within 3 days)
  FOR rec IN
    SELECT ii.id, ii.name, ii.expiration_date
    FROM inventory_items ii
    WHERE ii.expiration_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'
      AND ii.archived_at IS NULL
  LOOP
    INSERT INTO notifications (user_id, category, title, body, related_type, related_id)
    SELECT p.id,
      'inventory',
      'Nearing Expiration',
      rec.name || ' expires on ' || TO_CHAR(rec.expiration_date, 'Mon DD') || '.',
      'inventory_item', rec.id
    FROM profiles p
    WHERE p.role = 'admin'
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Migration 007: Delivery Tables
-- ============================================================

CREATE TABLE deliveries (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id                UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  status                  delivery_status NOT NULL DEFAULT 'unscheduled',
  scheduled_date          DATE,
  scheduled_time          TIME,
  delivery_fee            NUMERIC(10,2) NOT NULL DEFAULT 0,
  assigned_rider_id       UUID REFERENCES profiles(id),
  delivery_address_id     UUID REFERENCES addresses(id),
  delivery_address_text   TEXT,         -- free-text fallback if no saved address
  delivery_instructions   TEXT,
  proof_of_delivery_url   TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE delivery_attempts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id    UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  status         TEXT NOT NULL CHECK (status IN ('in_progress', 'delivered', 'failed')),
  failed_reason  TEXT,
  attempted_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  attempted_by   UUID REFERENCES profiles(id)
);

CREATE TRIGGER deliveries_updated_at
  BEFORE UPDATE ON deliveries
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Trigger: sync delivery.status = 'delivered' → orders.status = 'delivered'
CREATE OR REPLACE FUNCTION sync_delivery_to_order()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status <> 'delivered' THEN
    UPDATE orders SET status = 'delivered' WHERE id = NEW.order_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deliveries_sync_order
  AFTER UPDATE OF status ON deliveries
  FOR EACH ROW EXECUTE FUNCTION sync_delivery_to_order();

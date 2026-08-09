-- ============================================================
-- Migration 006: Orders
-- ============================================================

CREATE SEQUENCE IF NOT EXISTS order_seq START 1;

CREATE TABLE orders (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number         TEXT NOT NULL UNIQUE DEFAULT ('ORD-' || LPAD(nextval('order_seq')::TEXT, 4, '0')),
  customer_id          UUID NOT NULL REFERENCES profiles(id),
  order_type           order_type NOT NULL DEFAULT 'standard',
  status               order_status NOT NULL DEFAULT 'pending',
  payment_status       payment_status NOT NULL DEFAULT 'unpaid',
  payment_method       TEXT,           -- GCash, Cash, Bank Transfer, etc.
  subtotal             NUMERIC(10,2) NOT NULL DEFAULT 0,
  addon_cost           NUMERIC(10,2) NOT NULL DEFAULT 0,
  customization_fee    NUMERIC(10,2) NOT NULL DEFAULT 0,
  delivery_fee         NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount             NUMERIC(10,2) NOT NULL DEFAULT 0,
  total                NUMERIC(10,2) NOT NULL DEFAULT 0,
  recipient_name       TEXT,           -- Supports gifting (sender ≠ recipient)
  recipient_contact    TEXT,
  admin_notes          TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at         TIMESTAMPTZ,
  completed_at         TIMESTAMPTZ,
  cancelled_at         TIMESTAMPTZ
);

CREATE TABLE order_items (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id              UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id            UUID REFERENCES products(id),           -- NULL for custom items
  custom_request_id     UUID REFERENCES custom_arrangement_requests(id),
  size_id               UUID REFERENCES product_sizes(id),
  quantity              INTEGER NOT NULL DEFAULT 1,
  unit_price            NUMERIC(10,2) NOT NULL,
  flower_color          TEXT,
  personalized_message  TEXT,
  reference_image_url   TEXT
);

CREATE TABLE order_addons (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id       UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  inventory_item_id   UUID NOT NULL REFERENCES inventory_items(id),
  quantity            INTEGER NOT NULL DEFAULT 1,
  unit_price          NUMERIC(10,2) NOT NULL
);

CREATE TABLE order_status_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status      order_status NOT NULL,
  changed_by  UUID REFERENCES profiles(id),
  changed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note        TEXT
);

-- Back-fill FKs deferred from earlier migrations
ALTER TABLE custom_arrangement_requests
  ADD CONSTRAINT fk_converted_order
  FOREIGN KEY (converted_order_id) REFERENCES orders(id);

ALTER TABLE inventory_movements
  ADD CONSTRAINT fk_reference_order
  FOREIGN KEY (reference_order_id) REFERENCES orders(id);

-- Trigger: auto-log status history on order status change
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_history (order_id, status, changed_at)
    VALUES (NEW.id, NEW.status, NOW());
    -- Set timestamp fields
    IF NEW.status = 'confirmed' THEN NEW.confirmed_at = NOW(); END IF;
    IF NEW.status IN ('completed', 'delivered') THEN NEW.completed_at = NOW(); END IF;
    IF NEW.status = 'cancelled' THEN NEW.cancelled_at = NOW(); END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_status_history
  BEFORE UPDATE OF status ON orders
  FOR EACH ROW EXECUTE FUNCTION log_order_status_change();

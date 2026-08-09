-- ============================================================
-- Migration 003: Inventory Tables
-- ============================================================

CREATE TABLE inventory_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  category_id       UUID REFERENCES categories(id),
  image_url         TEXT,
  unit              TEXT NOT NULL DEFAULT 'piece',  -- stem, bunch, piece, roll, meter, box
  quantity_on_hand  INTEGER NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
  min_stock_level   INTEGER NOT NULL DEFAULT 0,
  status            stock_status NOT NULL DEFAULT 'in_stock',
  expiration_date   DATE,
  last_updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at       TIMESTAMPTZ,                    -- soft delete
  created_by        UUID REFERENCES profiles(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE inventory_movements (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id             UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  movement_type       movement_type NOT NULL,
  quantity_delta      INTEGER NOT NULL,             -- positive = in, negative = out
  previous_quantity   INTEGER NOT NULL,
  new_quantity        INTEGER NOT NULL,
  reason              TEXT,
  reference_order_id  UUID,                         -- FK added in migration 006
  created_by          UUID REFERENCES profiles(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: auto-compute stock_status based on quantity vs min_stock_level
CREATE OR REPLACE FUNCTION compute_stock_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Only auto-compute if status is not a manual override (reserved/damaged/spoiled)
  IF NEW.status NOT IN ('reserved', 'damaged', 'spoiled') THEN
    IF NEW.quantity_on_hand = 0 THEN
      NEW.status = 'out_of_stock';
    ELSIF NEW.quantity_on_hand < NEW.min_stock_level THEN
      NEW.status = 'low_stock';
    ELSE
      NEW.status = 'in_stock';
    END IF;
  END IF;
  NEW.last_updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER inventory_items_status
  BEFORE UPDATE OF quantity_on_hand ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION compute_stock_status();

-- ============================================================
-- Migration 004: Products & Arrangements
-- ============================================================

CREATE TABLE products (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                      TEXT NOT NULL,
  description               TEXT,
  primary_image_url         TEXT,
  preparation_time_minutes  INTEGER DEFAULT 60,
  is_available              BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured               BOOLEAN NOT NULL DEFAULT FALSE,
  archived_at               TIMESTAMPTZ,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Many-to-many: products ↔ occasions
CREATE TABLE product_occasions (
  product_id   UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  occasion_id  UUID NOT NULL REFERENCES occasions(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, occasion_id)
);

-- Multiple images per product
CREATE TABLE product_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

-- Size variants with prices
CREATE TABLE product_sizes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,    -- "Small", "Medium", "Large"
  price       NUMERIC(10,2) NOT NULL CHECK (price >= 0)
);

-- Available colors per product
CREATE TABLE product_colors (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color_name  TEXT NOT NULL
);

-- Required materials / flowers per product (enables material availability check)
CREATE TABLE product_required_materials (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id          UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  inventory_item_id   UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity_required   INTEGER NOT NULL DEFAULT 1
);

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

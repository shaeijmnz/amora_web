-- ============================================================
-- Migration 012: Row Level Security (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE occasions                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items             ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements         ENABLE ROW LEVEL SECURITY;
ALTER TABLE products                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_occasions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images              ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sizes               ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_colors              ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_required_materials  ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_arrangement_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_addons                ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history        ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_attempts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_notes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications               ENABLE ROW LEVEL SECURITY;

-- ── Helper: is current user admin? ──────────────────────────
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_rider()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'rider'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── profiles ────────────────────────────────────────────────
CREATE POLICY "profiles: own row or admin"
  ON profiles FOR ALL
  USING (id = auth.uid() OR is_admin());

-- ── addresses ───────────────────────────────────────────────
CREATE POLICY "addresses: own or admin"
  ON addresses FOR ALL
  USING (customer_id = auth.uid() OR is_admin());

-- ── Public read: categories, occasions, products ─────────────
CREATE POLICY "categories: public read"    ON categories   FOR SELECT USING (TRUE);
CREATE POLICY "occasions: public read"     ON occasions    FOR SELECT USING (TRUE);
CREATE POLICY "products: public read"      ON products     FOR SELECT USING (is_available = TRUE OR is_admin());
CREATE POLICY "product_sizes: public"      ON product_sizes FOR SELECT USING (TRUE);
CREATE POLICY "product_images: public"     ON product_images FOR SELECT USING (TRUE);
CREATE POLICY "product_colors: public"     ON product_colors FOR SELECT USING (TRUE);
CREATE POLICY "product_occasions: public"  ON product_occasions FOR SELECT USING (TRUE);

-- Admin-only write on catalog tables
CREATE POLICY "products: admin write"     ON products     FOR ALL USING (is_admin());
CREATE POLICY "categories: admin write"   ON categories   FOR ALL USING (is_admin());

-- ── inventory: admin only ────────────────────────────────────
CREATE POLICY "inventory_items: admin"     ON inventory_items     FOR ALL USING (is_admin());
CREATE POLICY "inventory_movements: admin" ON inventory_movements FOR ALL USING (is_admin());
CREATE POLICY "product_required_materials: admin" ON product_required_materials FOR ALL USING (is_admin());

-- ── custom requests: customer (own) or admin ─────────────────
CREATE POLICY "custom_requests: own or admin"
  ON custom_arrangement_requests FOR ALL
  USING (customer_id = auth.uid() OR is_admin());

-- ── orders: customer (own) or admin or rider ─────────────────
CREATE POLICY "orders: own or admin"
  ON orders FOR ALL
  USING (customer_id = auth.uid() OR is_admin());

CREATE POLICY "order_items: own order or admin"
  ON order_items FOR ALL
  USING (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND (o.customer_id = auth.uid() OR is_admin()))
  );

CREATE POLICY "order_addons: via order_items"
  ON order_addons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM order_items oi JOIN orders o ON o.id = oi.order_id
      WHERE oi.id = order_item_id AND (o.customer_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "order_status_history: own order or admin"
  ON order_status_history FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND (o.customer_id = auth.uid() OR is_admin()))
  );

-- ── deliveries: admin + assigned rider ───────────────────────
CREATE POLICY "deliveries: admin or assigned rider"
  ON deliveries FOR ALL
  USING (is_admin() OR assigned_rider_id = auth.uid());

CREATE POLICY "delivery_attempts: admin or rider"
  ON delivery_attempts FOR ALL
  USING (
    is_admin() OR EXISTS (
      SELECT 1 FROM deliveries d WHERE d.id = delivery_id AND d.assigned_rider_id = auth.uid()
    )
  );

-- ── customer notes: admin only ───────────────────────────────
CREATE POLICY "customer_notes: admin"
  ON customer_notes FOR ALL USING (is_admin());

-- ── notifications: own only ──────────────────────────────────
CREATE POLICY "notifications: own"
  ON notifications FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- Migration 002: Core Tables (profiles, addresses, occasions, categories)
-- ============================================================

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT,
  phone           TEXT,
  avatar_url      TEXT,
  role            TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer', 'rider')),
  account_status  account_status NOT NULL DEFAULT 'active',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Addresses
CREATE TABLE addresses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label        TEXT,                   -- e.g. "Home", "Office"
  address_line TEXT NOT NULL,
  city         TEXT NOT NULL,
  province     TEXT,
  postal_code  TEXT,
  is_default   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Occasions
CREATE TABLE occasions (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE
);

INSERT INTO occasions (name) VALUES
  ('Birthday'), ('Anniversary'), ('Wedding'), ('Graduation'),
  ('Valentine''s Day'), ('Mother''s Day'), ('Sympathy'),
  ('Congratulations'), ('Get Well Soon'), ('Thank You'), ('Other');

-- Categories (for inventory items)
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  group_type  category_group NOT NULL  -- flower | material | addon
);

INSERT INTO categories (name, group_type) VALUES
  ('Fresh Flowers', 'flower'),
  ('Dried Flowers', 'flower'),
  ('Other Flower Types', 'flower'),
  ('Wrapping & Ribbons', 'material'),
  ('Floral Foam & Wire', 'material'),
  ('Packaging', 'material'),
  ('Other Materials', 'material'),
  ('Chocolates & Sweets', 'addon'),
  ('Balloons', 'addon'),
  ('Stuffed Toys', 'addon'),
  ('Gift Items', 'addon'),
  ('Cakes', 'addon'),
  ('Other Add-ons', 'addon');

-- Trigger: auto-update profiles.updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

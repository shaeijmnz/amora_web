-- ============================================================
-- Migration 005: Custom Arrangement Requests
-- ============================================================

CREATE TABLE custom_arrangement_requests (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number            TEXT NOT NULL UNIQUE DEFAULT ('REQ-' || LPAD(nextval('req_seq')::TEXT, 4, '0')),
  customer_id               UUID NOT NULL REFERENCES profiles(id),
  reference_image_url       TEXT,
  occasion_id               UUID REFERENCES occasions(id),
  preferred_flowers         TEXT,
  preferred_colors          TEXT,
  bouquet_size              TEXT,   -- Small, Medium, Large, Extra Large
  budget                    NUMERIC(10,2),
  personalized_message      TEXT,
  requested_delivery_date   DATE,
  status                    request_status NOT NULL DEFAULT 'new',
  estimated_price           NUMERIC(10,2),
  admin_notes               TEXT,
  converted_order_id        UUID,   -- FK added in migration 006
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sequence for REQ-XXXX numbering
CREATE SEQUENCE IF NOT EXISTS req_seq START 1;

CREATE TRIGGER custom_requests_updated_at
  BEFORE UPDATE ON custom_arrangement_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

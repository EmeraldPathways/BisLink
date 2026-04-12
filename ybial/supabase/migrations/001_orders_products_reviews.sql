-- ─── ORDERS TABLE ─────────────────────────────────────────────────────────────
-- Stores product purchases. payment_intent_id is UNIQUE for idempotency.

CREATE TABLE orders (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id       UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_name     TEXT NOT NULL,
  customer_email    TEXT NOT NULL,
  items             JSONB NOT NULL,   -- [{ productId, name, emoji, price, quantity }]
  total             INTEGER NOT NULL, -- cents
  payment_intent_id TEXT UNIQUE NOT NULL,
  status            TEXT DEFAULT 'paid',
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner orders access" ON orders
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE INDEX idx_orders_business ON orders(business_id);
CREATE INDEX idx_orders_payment_intent ON orders(payment_intent_id);


-- ─── PRODUCTS TABLE ────────────────────────────────────────────────────────────
-- Up to 10 active products per business. Enforced by trigger below.

CREATE TABLE products (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id    UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  description    TEXT,
  price          INTEGER NOT NULL,          -- cents
  original_price INTEGER,                   -- cents, shown as crossed-out price
  category       TEXT,
  emoji          TEXT DEFAULT '📦',
  badge          TEXT,                      -- "New", "Popular", "Limited", etc.
  in_stock       BOOLEAN DEFAULT TRUE,
  sort_order     INTEGER DEFAULT 0,
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read products" ON products
  FOR SELECT USING (is_active = TRUE AND in_stock = TRUE);

CREATE POLICY "Owner write products" ON products
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE INDEX idx_products_business ON products(business_id);

-- Enforce 10-product limit per business
CREATE OR REPLACE FUNCTION enforce_product_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT COUNT(*) FROM products
    WHERE business_id = NEW.business_id AND is_active = TRUE
  ) >= 10 THEN
    RAISE EXCEPTION 'Maximum of 10 active products per business';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_product_limit
  BEFORE INSERT ON products
  FOR EACH ROW EXECUTE FUNCTION enforce_product_limit();


-- ─── REVIEWS TABLE ─────────────────────────────────────────────────────────────

CREATE TABLE reviews (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id   UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  booking_id    UUID REFERENCES bookings(id),
  customer_name TEXT NOT NULL,
  rating        INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text          TEXT,
  service_name  TEXT,
  is_visible    BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read reviews" ON reviews
  FOR SELECT USING (is_visible = TRUE);

CREATE POLICY "Owner write reviews" ON reviews
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Public insert reviews" ON reviews
  FOR INSERT WITH CHECK (TRUE);

CREATE INDEX idx_reviews_business ON reviews(business_id);


-- ─── BUSINESSES TABLE — additional columns for tabs ────────────────────────────

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS full_bio         TEXT,
  ADD COLUMN IF NOT EXISTS quote            TEXT,
  ADD COLUMN IF NOT EXISTS experience       TEXT,
  ADD COLUMN IF NOT EXISTS clients_served   TEXT,
  ADD COLUMN IF NOT EXISTS specialisms      TEXT[],
  ADD COLUMN IF NOT EXISTS credentials      TEXT[],
  ADD COLUMN IF NOT EXISTS google_review_url TEXT,
  ADD COLUMN IF NOT EXISTS contact_email    TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone    TEXT,
  ADD COLUMN IF NOT EXISTS address          TEXT,
  ADD COLUMN IF NOT EXISTS google_maps_url  TEXT;


-- ─── RPC: increment_customer_stats ─────────────────────────────────────────────
-- Atomically increments total_bookings, total_spent, and last_booking_at.
-- Called from the Stripe webhook after payment_intent.succeeded.

CREATE OR REPLACE FUNCTION increment_customer_stats(
  p_business_id UUID,
  p_email       TEXT,
  p_amount      INTEGER,
  p_booking_at  TIMESTAMPTZ
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE customers
  SET
    total_bookings = total_bookings + 1,
    total_spent    = total_spent + p_amount,
    last_booking_at = GREATEST(last_booking_at, p_booking_at)
  WHERE business_id = p_business_id
    AND email = p_email;
END;
$$;

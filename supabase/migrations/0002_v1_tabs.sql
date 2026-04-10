ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS full_bio TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS parking_notes TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS years_experience INTEGER,
  ADD COLUMN IF NOT EXISTS google_review_url TEXT;

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS review_token TEXT,
  ADD COLUMN IF NOT EXISTS review_requested_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS specialisms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  original_price INTEGER,
  category TEXT,
  badge TEXT,
  emoji TEXT DEFAULT '📦',
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  in_stock BOOLEAN DEFAULT TRUE,
  is_digital BOOLEAN DEFAULT FALSE,
  digital_url TEXT,
  sort_order INTEGER DEFAULT 0,
  rating NUMERIC(3,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  items JSONB NOT NULL,
  total_amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'paid' CHECK (status IN ('pending','paid','fulfilled','refunded')),
  payment_intent_id TEXT,
  shipping_address JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS first_activity_at TIMESTAMPTZ;

ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialisms ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read credentials" ON credentials;
CREATE POLICY "Public read credentials" ON credentials FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Public read specialisms" ON specialisms;
CREATE POLICY "Public read specialisms" ON specialisms FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Public read products" ON products;
CREATE POLICY "Public read products" ON products FOR SELECT USING (is_active = TRUE);
DROP POLICY IF EXISTS "Public read reviews" ON reviews;
CREATE POLICY "Public read reviews" ON reviews FOR SELECT USING (is_published = TRUE);

DROP POLICY IF EXISTS "Owner credentials" ON credentials;
CREATE POLICY "Owner credentials" ON credentials FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));
DROP POLICY IF EXISTS "Owner specialisms" ON specialisms;
CREATE POLICY "Owner specialisms" ON specialisms FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));
DROP POLICY IF EXISTS "Owner products" ON products;
CREATE POLICY "Owner products" ON products FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));
DROP POLICY IF EXISTS "Owner orders" ON orders;
CREATE POLICY "Owner orders" ON orders FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));
DROP POLICY IF EXISTS "Owner reviews" ON reviews;
CREATE POLICY "Owner reviews" ON reviews FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "Public insert orders" ON orders;
CREATE POLICY "Public insert orders" ON orders FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "Public insert reviews" ON reviews;
CREATE POLICY "Public insert reviews" ON reviews FOR INSERT WITH CHECK (TRUE);

CREATE INDEX IF NOT EXISTS idx_products_business ON products(business_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_reviews_business ON reviews(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_business ON orders(business_id, created_at DESC);

CREATE OR REPLACE FUNCTION check_product_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM products WHERE business_id = NEW.business_id AND is_active = TRUE) >= 10 THEN
    RAISE EXCEPTION 'Maximum of 10 products per business';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_product_limit ON products;
CREATE TRIGGER enforce_product_limit
  BEFORE INSERT ON products
  FOR EACH ROW EXECUTE FUNCTION check_product_limit();

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS quote TEXT,
  ADD COLUMN IF NOT EXISTS experience TEXT,
  ADD COLUMN IF NOT EXISTS clients_served TEXT,
  ADD COLUMN IF NOT EXISTS specialisms TEXT[],
  ADD COLUMN IF NOT EXISTS credentials TEXT[],
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_intent_id TEXT,
  ALTER COLUMN payment_intent_id SET NOT NULL;

DROP INDEX IF EXISTS idx_orders_payment_intent;
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_payment_intent_unique ON orders(payment_intent_id);

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS service_name TEXT;

DROP POLICY IF EXISTS "Public read products" ON products;
CREATE POLICY "Public read products" ON products FOR SELECT USING (is_active = TRUE AND in_stock = TRUE);

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
    total_spent = total_spent + p_amount,
    last_booking_at = GREATEST(COALESCE(last_booking_at, p_booking_at), p_booking_at),
    last_activity_at = GREATEST(COALESCE(last_activity_at, p_booking_at), p_booking_at),
    first_activity_at = COALESCE(first_activity_at, p_booking_at)
  WHERE business_id = p_business_id
    AND email = p_email;
END;
$$;

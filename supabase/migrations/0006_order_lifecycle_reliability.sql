ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS confirmation_sent BOOLEAN DEFAULT FALSE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_payment_intent_unique
  ON orders(payment_intent_id)
  WHERE payment_intent_id IS NOT NULL;

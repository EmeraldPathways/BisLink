CREATE OR REPLACE FUNCTION increment_customer_order_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO customers (
    business_id,
    name,
    email,
    phone,
    total_orders,
    total_spent,
    last_activity_at,
    first_activity_at
  )
  VALUES (
    NEW.business_id,
    COALESCE(NEW.customer_name, ''),
    NEW.customer_email,
    NEW.customer_phone,
    1,
    COALESCE(NEW.total_amount, 0),
    COALESCE(NEW.created_at, NOW()),
    COALESCE(NEW.created_at, NOW())
  )
  ON CONFLICT (business_id, email) DO UPDATE
  SET
    name = COALESCE(EXCLUDED.name, customers.name),
    phone = COALESCE(EXCLUDED.phone, customers.phone),
    total_orders = COALESCE(customers.total_orders, 0) + 1,
    total_spent = COALESCE(customers.total_spent, 0) + COALESCE(NEW.total_amount, 0),
    last_activity_at = GREATEST(COALESCE(customers.last_activity_at, COALESCE(NEW.created_at, NOW())), COALESCE(NEW.created_at, NOW())),
    first_activity_at = COALESCE(customers.first_activity_at, COALESCE(NEW.created_at, NOW()));

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_customer_stats_trigger ON orders;

CREATE TRIGGER orders_customer_stats_trigger
AFTER INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION increment_customer_order_stats();

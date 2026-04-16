CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_booking_unique
  ON reviews(booking_id)
  WHERE booking_id IS NOT NULL;

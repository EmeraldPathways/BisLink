ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS bookings_image_url TEXT,
  ADD COLUMN IF NOT EXISTS bookings_title TEXT,
  ADD COLUMN IF NOT EXISTS bookings_subtitle TEXT,
  ADD COLUMN IF NOT EXISTS products_image_url TEXT,
  ADD COLUMN IF NOT EXISTS products_title TEXT,
  ADD COLUMN IF NOT EXISTS products_subtitle TEXT,
  ADD COLUMN IF NOT EXISTS about_image_url TEXT,
  ADD COLUMN IF NOT EXISTS about_title TEXT,
  ADD COLUMN IF NOT EXISTS about_subtitle TEXT,
  ADD COLUMN IF NOT EXISTS contact_image_url TEXT,
  ADD COLUMN IF NOT EXISTS contact_title TEXT,
  ADD COLUMN IF NOT EXISTS contact_subtitle TEXT;

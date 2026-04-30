ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS theme_key TEXT NOT NULL DEFAULT 'classic-luxe';

ALTER TABLE businesses
  DROP CONSTRAINT IF EXISTS businesses_theme_key_check;

ALTER TABLE businesses
  ADD CONSTRAINT businesses_theme_key_check
  CHECK (theme_key IN ('classic-luxe', 'wellness-studio', 'bright-performance'));

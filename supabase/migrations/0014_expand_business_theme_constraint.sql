ALTER TABLE public.businesses
  DROP CONSTRAINT IF EXISTS businesses_theme_key_check;

ALTER TABLE public.businesses
  ADD CONSTRAINT businesses_theme_key_check
  CHECK (
    theme_key IN (
      'classic-luxe',
      'wellness-studio',
      'bright-performance',
      'editorial-minimal',
      'warm-studio',
      'dark-athletic'
    )
  );

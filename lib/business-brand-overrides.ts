import type { CSSProperties } from 'react';
import type { BusinessProfile } from '@/types';

export const FONT_PAIRINGS = {
  'theme-default': null,
  editorial: {
    label: 'Editorial - Instrument Serif / Sora',
    display: "'Instrument Serif', serif",
    ui: "'Sora', sans-serif"
  },
  modern: {
    label: 'Modern - Space Grotesk / Manrope',
    display: "'Space Grotesk', sans-serif",
    ui: "'Manrope', sans-serif"
  },
  friendly: {
    label: 'Friendly - Fraunces / DM Sans',
    display: "'Fraunces', serif",
    ui: "'DM Sans', sans-serif"
  },
  premium: {
    label: 'Premium - Cormorant Garamond / Manrope',
    display: "'Cormorant Garamond', serif",
    ui: "'Manrope', sans-serif"
  }
} as const;

export type FontPairingKey = keyof typeof FONT_PAIRINGS;

export function applyBusinessBrandOverrides(baseStyle: CSSProperties, business: BusinessProfile): CSSProperties {
  const next = { ...baseStyle } as CSSProperties & Record<string, string>;

  if (business.custom_primary_color) {
    next['--accent'] = business.custom_primary_color;
    next['--accent-strong'] = business.custom_primary_color;
    next['--nav-indicator'] = business.custom_primary_color;
    next['--cta-bg'] = business.custom_primary_color;
    next['--badge-bg'] = business.custom_primary_color;
  }

  const fontPairing =
    business.custom_font_pairing && business.custom_font_pairing !== 'theme-default'
      ? FONT_PAIRINGS[business.custom_font_pairing as FontPairingKey]
      : null;

  if (fontPairing) {
    next['--font-display'] = fontPairing.display;
    next['--font-ui'] = fontPairing.ui;
  }

  return next;
}

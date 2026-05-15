import type { CSSProperties } from 'react';
import type { BusinessThemeKey } from '@/types';

export const BUSINESS_THEME_KEYS = [
  'classic-luxe',
  'wellness-studio',
  'bright-performance',
  'editorial-minimal',
  'warm-studio',
  'dark-athletic'
] as const satisfies readonly BusinessThemeKey[];

type ThemeStyle = CSSProperties & Record<`--${string}`, string>;

type ThemePreview = {
  group: 'Editorial' | 'Studio' | 'Performance';
  kicker: string;
  bestFor: string;
  badge: string;
  ctaLabel: string;
};

type ThemeBehavior = {
  heroStyle: 'editorial' | 'soft' | 'energetic';
  cardStyle: 'elevated' | 'outlined' | 'soft';
  tabStyle: 'underline' | 'pill';
  badgeStyle: 'solid' | 'soft';
};

type ThemeTokens = {
  pageBg: string;
  pageSurface: string;
  pageSurfaceMuted: string;
  pageSurfaceEmphasis: string;
  pageCardBg: string;
  pageCardMuted: string;
  pageBorder: string;
  pageBorderStrong: string;
  pageText: string;
  pageTextSecondary: string;
  pageTextMuted: string;
  accent: string;
  accentStrong: string;
  accentSoft: string;
  accentContrast: string;
  heroGradient: string;
  heroText: string;
  heroTextSecondary: string;
  heroTextMuted: string;
  heroKicker: string;
  heroDivider: string;
  heroGlow: string;
  heroGlowSoft: string;
  navGradient: string;
  navText: string;
  navActive: string;
  navIndicator: string;
  badgeBg: string;
  badgeText: string;
  badgeSoftBg: string;
  badgeSoftText: string;
  ctaBg: string;
  ctaText: string;
  ctaAccentBg: string;
  ctaAccentText: string;
  inputBg: string;
  inputBorder: string;
  sheetBg: string;
  sheetHandle: string;
  mediaGradient: string;
  gridPattern: string;
  success: string;
  error: string;
  warning: string;
  cardShadow: string;
  cardHoverShadow: string;
  panelShadow: string;
  cardRadius: string;
  buttonRadius: string;
  heroRadius: string;
  tabBorder: string;
};

export type BusinessThemeDefinition = {
  key: BusinessThemeKey;
  label: string;
  description: string;
  audience: string;
  preview: ThemePreview;
  behavior: ThemeBehavior;
  fonts: {
    display: string;
    ui: string;
  };
  tokens: ThemeTokens;
  style: ThemeStyle;
};

function buildThemeStyle({
  fonts,
  tokens
}: {
  fonts: BusinessThemeDefinition['fonts'];
  tokens: ThemeTokens;
}): ThemeStyle {
  return {
    '--page-bg': tokens.pageBg,
    '--page-surface': tokens.pageSurface,
    '--page-surface-muted': tokens.pageSurfaceMuted,
    '--page-surface-emphasis': tokens.pageSurfaceEmphasis,
    '--page-card-bg': tokens.pageCardBg,
    '--page-card-muted': tokens.pageCardMuted,
    '--page-border': tokens.pageBorder,
    '--page-border-strong': tokens.pageBorderStrong,
    '--page-text': tokens.pageText,
    '--page-text-secondary': tokens.pageTextSecondary,
    '--page-text-muted': tokens.pageTextMuted,
    '--accent': tokens.accent,
    '--accent-strong': tokens.accentStrong,
    '--accent-soft': tokens.accentSoft,
    '--accent-contrast': tokens.accentContrast,
    '--hero-gradient': tokens.heroGradient,
    '--hero-text': tokens.heroText,
    '--hero-text-secondary': tokens.heroTextSecondary,
    '--hero-text-muted': tokens.heroTextMuted,
    '--hero-kicker': tokens.heroKicker,
    '--hero-divider': tokens.heroDivider,
    '--hero-glow': tokens.heroGlow,
    '--hero-glow-soft': tokens.heroGlowSoft,
    '--nav-gradient': tokens.navGradient,
    '--nav-text': tokens.navText,
    '--nav-active': tokens.navActive,
    '--nav-indicator': tokens.navIndicator,
    '--badge-bg': tokens.badgeBg,
    '--badge-text': tokens.badgeText,
    '--badge-soft-bg': tokens.badgeSoftBg,
    '--badge-soft-text': tokens.badgeSoftText,
    '--cta-bg': tokens.ctaBg,
    '--cta-text': tokens.ctaText,
    '--cta-accent-bg': tokens.ctaAccentBg,
    '--cta-accent-text': tokens.ctaAccentText,
    '--input-bg': tokens.inputBg,
    '--input-border': tokens.inputBorder,
    '--sheet-bg': tokens.sheetBg,
    '--sheet-handle': tokens.sheetHandle,
    '--media-gradient': tokens.mediaGradient,
    '--grid-pattern': tokens.gridPattern,
    '--status-success': tokens.success,
    '--status-error': tokens.error,
    '--status-warning': tokens.warning,
    '--card-shadow': tokens.cardShadow,
    '--card-hover-shadow': tokens.cardHoverShadow,
    '--panel-shadow': tokens.panelShadow,
    '--card-radius': tokens.cardRadius,
    '--button-radius': tokens.buttonRadius,
    '--hero-radius': tokens.heroRadius,
    '--tab-border': tokens.tabBorder,
    '--font-display': fonts.display,
    '--font-ui': fonts.ui,
    '--color-void': tokens.ctaBg,
    '--color-void-2': tokens.navGradient,
    '--color-gold': tokens.accent,
    '--color-gold-dark': tokens.accentStrong,
    '--color-gold-muted': tokens.accentSoft,
    '--color-bg': tokens.pageBg,
    '--color-surface': tokens.pageSurface,
    '--color-surface-2': tokens.pageSurfaceMuted,
    '--color-surface-3': tokens.pageSurfaceEmphasis,
    '--color-border': tokens.pageBorder,
    '--color-border-2': tokens.pageBorderStrong,
    '--color-border-dark': tokens.tabBorder,
    '--color-text-primary': tokens.pageText,
    '--color-text-secondary': tokens.pageTextSecondary,
    '--color-text-tertiary': tokens.pageTextMuted,
    '--color-text-hero': tokens.heroText,
    '--color-text-hero-2': tokens.heroTextSecondary,
    '--color-text-hero-3': tokens.heroTextMuted,
    '--color-success': tokens.success,
    '--color-error': tokens.error,
    '--color-warning': tokens.warning,
    '--tab-gradient': tokens.navGradient,
    '--revenue-gradient': tokens.navGradient,
    '--stat-icon-bg': tokens.pageSurfaceMuted,
    '--stat-icon-color': tokens.pageText,
    '--calendar-today-column': tokens.accentSoft,
    '--calendar-booking-bg': tokens.badgeSoftBg,
    '--sidebar-active-bg': tokens.pageSurfaceMuted,
    '--mobile-nav-active-bg': tokens.pageSurfaceMuted,
    '--empty-state-icon': tokens.pageTextMuted,
    '--stat-positive-bg': tokens.badgeSoftBg,
    '--stat-positive-color': tokens.badgeSoftText,
    '--stat-info-bg': tokens.pageSurfaceMuted,
    '--stat-info-color': tokens.pageText
  };
}

function defineTheme(theme: Omit<BusinessThemeDefinition, 'style'>): BusinessThemeDefinition {
  return {
    ...theme,
    style: buildThemeStyle({ fonts: theme.fonts, tokens: theme.tokens })
  };
}

export const BUSINESS_THEMES: BusinessThemeDefinition[] = [
  defineTheme({
    key: 'classic-luxe',
    label: 'Classic Luxe',
    description: 'Dark, polished, and premium.',
    audience: 'Best for elevated service brands and specialists.',
    preview: {
      group: 'Editorial',
      kicker: 'Premium service',
      bestFor: 'Consultants, specialists, elevated studios.',
      badge: 'Most Booked',
      ctaLabel: 'Reserve'
    },
    behavior: {
      heroStyle: 'editorial',
      cardStyle: 'elevated',
      tabStyle: 'underline',
      badgeStyle: 'solid'
    },
    fonts: {
      display: "'Cormorant Garamond', serif",
      ui: "'DM Sans', sans-serif"
    },
    tokens: {
      pageBg: '#f7f4ee',
      pageSurface: '#fffdf9',
      pageSurfaceMuted: '#f2ede3',
      pageSurfaceEmphasis: '#ebe4d8',
      pageCardBg: '#fffdfb',
      pageCardMuted: '#f5f0e7',
      pageBorder: '#e7ddd0',
      pageBorderStrong: '#d3c3ad',
      pageText: '#17120f',
      pageTextSecondary: '#6d6155',
      pageTextMuted: '#9a8f81',
      accent: '#caa45b',
      accentStrong: '#8b6825',
      accentSoft: 'rgba(202,164,91,0.16)',
      accentContrast: '#17120f',
      heroGradient: 'linear-gradient(145deg,#120f0c 0%,#1f1811 54%,#2b2117 100%)',
      heroText: '#fbf6ef',
      heroTextSecondary: '#dbcfbf',
      heroTextMuted: '#b5a590',
      heroKicker: '#d5b270',
      heroDivider: 'rgba(213,178,112,0.28)',
      heroGlow: '#caa45b',
      heroGlowSoft: 'rgba(202,164,91,0.18)',
      navGradient: 'linear-gradient(145deg,#17120f 0%,#21180f 100%)',
      navText: '#bba98e',
      navActive: '#f7ecd8',
      navIndicator: '#d5b270',
      badgeBg: '#15110d',
      badgeText: '#e9c77f',
      badgeSoftBg: '#f3ead7',
      badgeSoftText: '#7c5b1c',
      ctaBg: '#110d0a',
      ctaText: '#fff9f0',
      ctaAccentBg: '#d5b270',
      ctaAccentText: '#17120f',
      inputBg: '#f8f4ed',
      inputBorder: '#dfd2c2',
      sheetBg: '#fffdfa',
      sheetHandle: '#d2c3ae',
      mediaGradient: 'linear-gradient(135deg,#f5efe4,#e8ddcc)',
      gridPattern: 'linear-gradient(rgba(202,164,91,0.16) 1px,transparent 1px),linear-gradient(90deg,rgba(202,164,91,0.16) 1px,transparent 1px)',
      success: '#3e9b69',
      error: '#c65858',
      warning: '#bf8733',
      cardShadow: '0 18px 44px rgba(42,26,11,0.08)',
      cardHoverShadow: '0 24px 56px rgba(42,26,11,0.14)',
      panelShadow: '0 -24px 64px rgba(20,12,5,0.28)',
      cardRadius: '24px',
      buttonRadius: '18px',
      heroRadius: '28px',
      tabBorder: 'rgba(213,178,112,0.16)'
    }
  }),
  defineTheme({
    key: 'wellness-studio',
    label: 'Wellness Studio',
    description: 'Soft, calm, and restorative.',
    audience: 'Massage, hair, beauty, and slower premium care.',
    preview: {
      group: 'Studio',
      kicker: 'Calm care',
      bestFor: 'Wellness, beauty, massage, gentle luxury.',
      badge: 'Signature',
      ctaLabel: 'Book'
    },
    behavior: {
      heroStyle: 'soft',
      cardStyle: 'soft',
      tabStyle: 'pill',
      badgeStyle: 'soft'
    },
    fonts: {
      display: "'Fraunces', serif",
      ui: "'DM Sans', sans-serif"
    },
    tokens: {
      pageBg: '#fdf8f4',
      pageSurface: '#fffdfa',
      pageSurfaceMuted: '#f7eee7',
      pageSurfaceEmphasis: '#f1e2d6',
      pageCardBg: '#fffdfa',
      pageCardMuted: '#f7efe8',
      pageBorder: '#eadbcf',
      pageBorderStrong: '#dcbfae',
      pageText: '#2f2420',
      pageTextSecondary: '#705f57',
      pageTextMuted: '#99867d',
      accent: '#d29a86',
      accentStrong: '#8f5c49',
      accentSoft: 'rgba(210,154,134,0.18)',
      accentContrast: '#2f2420',
      heroGradient: 'linear-gradient(155deg,#816b63 0%,#a28a80 58%,#c0a89b 100%)',
      heroText: '#fff8f4',
      heroTextSecondary: '#f1ddd2',
      heroTextMuted: '#e0c8bc',
      heroKicker: '#f4c6b2',
      heroDivider: 'rgba(255,240,232,0.2)',
      heroGlow: '#f0bcab',
      heroGlowSoft: 'rgba(240,188,171,0.24)',
      navGradient: 'linear-gradient(180deg,rgba(109,86,76,0.94) 0%,rgba(129,107,99,0.92) 100%)',
      navText: '#ead2c5',
      navActive: '#fff7f1',
      navIndicator: '#f0c0ab',
      badgeBg: '#6b5147',
      badgeText: '#f9e6dd',
      badgeSoftBg: '#f3e0d7',
      badgeSoftText: '#875846',
      ctaBg: '#6b5147',
      ctaText: '#fff8f4',
      ctaAccentBg: '#f3d4c6',
      ctaAccentText: '#5f463d',
      inputBg: '#fff9f5',
      inputBorder: '#e5d2c7',
      sheetBg: '#fffbf8',
      sheetHandle: '#d9c2b5',
      mediaGradient: 'linear-gradient(135deg,#fcf1ea,#f3ddd0)',
      gridPattern: 'linear-gradient(rgba(210,154,134,0.15) 1px,transparent 1px),linear-gradient(90deg,rgba(210,154,134,0.15) 1px,transparent 1px)',
      success: '#4b8b67',
      error: '#be6461',
      warning: '#bc8c43',
      cardShadow: '0 14px 34px rgba(116,86,71,0.08)',
      cardHoverShadow: '0 20px 48px rgba(116,86,71,0.12)',
      panelShadow: '0 -24px 64px rgba(99,73,60,0.22)',
      cardRadius: '26px',
      buttonRadius: '20px',
      heroRadius: '30px',
      tabBorder: 'rgba(255,248,244,0.12)'
    }
  }),
  defineTheme({
    key: 'bright-performance',
    label: 'Bright Performance',
    description: 'Crisp, bright, and high-energy.',
    audience: 'Gyms, fitness coaches, and performance-led brands.',
    preview: {
      group: 'Performance',
      kicker: 'High energy',
      bestFor: 'Fitness brands, trainers, sport and movement.',
      badge: 'Coach Pick',
      ctaLabel: 'Train'
    },
    behavior: {
      heroStyle: 'energetic',
      cardStyle: 'outlined',
      tabStyle: 'underline',
      badgeStyle: 'solid'
    },
    fonts: {
      display: "'Space Grotesk', sans-serif",
      ui: "'Manrope', sans-serif"
    },
    tokens: {
      pageBg: '#f3f8ff',
      pageSurface: '#ffffff',
      pageSurfaceMuted: '#ebf4ff',
      pageSurfaceEmphasis: '#dcecff',
      pageCardBg: '#ffffff',
      pageCardMuted: '#eff6ff',
      pageBorder: '#c8dcf7',
      pageBorderStrong: '#8cbaf3',
      pageText: '#10213a',
      pageTextSecondary: '#4b6a8a',
      pageTextMuted: '#7b95b1',
      accent: '#4cebd8',
      accentStrong: '#11756f',
      accentSoft: 'rgba(76,235,216,0.16)',
      accentContrast: '#10213a',
      heroGradient: 'linear-gradient(145deg,#1a2652 0%,#2644d2 56%,#30a6ed 100%)',
      heroText: '#f5fbff',
      heroTextSecondary: '#d8e5ff',
      heroTextMuted: '#abc4ea',
      heroKicker: '#6df1dc',
      heroDivider: 'rgba(255,255,255,0.16)',
      heroGlow: '#4cebd8',
      heroGlowSoft: 'rgba(76,235,216,0.24)',
      navGradient: 'linear-gradient(180deg,rgba(26,41,102,0.94) 0%,rgba(36,78,196,0.92) 100%)',
      navText: '#bfd0ec',
      navActive: '#f6fdff',
      navIndicator: '#63f2df',
      badgeBg: '#15224a',
      badgeText: '#63f2df',
      badgeSoftBg: '#defaf7',
      badgeSoftText: '#0f6662',
      ctaBg: '#15224a',
      ctaText: '#f6fbff',
      ctaAccentBg: '#63f2df',
      ctaAccentText: '#10213a',
      inputBg: '#f6fbff',
      inputBorder: '#bfd6f0',
      sheetBg: '#fbfdff',
      sheetHandle: '#bfd0eb',
      mediaGradient: 'linear-gradient(135deg,#eff7ff,#ddf3ff)',
      gridPattern: 'linear-gradient(rgba(39,94,217,0.15) 1px,transparent 1px),linear-gradient(90deg,rgba(39,94,217,0.15) 1px,transparent 1px)',
      success: '#22a559',
      error: '#dd4e5f',
      warning: '#f29d3d',
      cardShadow: '0 10px 26px rgba(26,49,97,0.06)',
      cardHoverShadow: '0 18px 42px rgba(26,49,97,0.12)',
      panelShadow: '0 -24px 64px rgba(16,33,58,0.22)',
      cardRadius: '22px',
      buttonRadius: '16px',
      heroRadius: '28px',
      tabBorder: 'rgba(255,255,255,0.1)'
    }
  }),
  defineTheme({
    key: 'editorial-minimal',
    label: 'Editorial Minimal',
    description: 'Light, refined, and typography-first.',
    audience: 'Creative consultants, tastemakers, and minimalist brands.',
    preview: {
      group: 'Editorial',
      kicker: 'Minimal profile',
      bestFor: 'Writers, stylists, consultants, design-led brands.',
      badge: 'Featured',
      ctaLabel: 'Enquire'
    },
    behavior: {
      heroStyle: 'editorial',
      cardStyle: 'outlined',
      tabStyle: 'underline',
      badgeStyle: 'soft'
    },
    fonts: {
      display: "'Instrument Serif', serif",
      ui: "'DM Sans', sans-serif"
    },
    tokens: {
      pageBg: '#f6f4ef',
      pageSurface: '#fffdfa',
      pageSurfaceMuted: '#f2efe8',
      pageSurfaceEmphasis: '#ebe7df',
      pageCardBg: '#fffdfa',
      pageCardMuted: '#f6f3ed',
      pageBorder: '#ddd7cd',
      pageBorderStrong: '#c1b7a7',
      pageText: '#171717',
      pageTextSecondary: '#5e5a53',
      pageTextMuted: '#8f897f',
      accent: '#1d1d1d',
      accentStrong: '#000000',
      accentSoft: 'rgba(23,23,23,0.08)',
      accentContrast: '#fffdfa',
      heroGradient: 'linear-gradient(180deg,#f5f2ec 0%,#ede8de 100%)',
      heroText: '#161514',
      heroTextSecondary: '#544f49',
      heroTextMuted: '#80796f',
      heroKicker: '#3a3835',
      heroDivider: 'rgba(29,29,29,0.12)',
      heroGlow: '#ffffff',
      heroGlowSoft: 'rgba(255,255,255,0.45)',
      navGradient: 'linear-gradient(180deg,#f8f5ef 0%,#f1ece3 100%)',
      navText: '#726c64',
      navActive: '#171717',
      navIndicator: '#171717',
      badgeBg: '#171717',
      badgeText: '#fffdfa',
      badgeSoftBg: '#ece7de',
      badgeSoftText: '#37332e',
      ctaBg: '#171717',
      ctaText: '#fffdfa',
      ctaAccentBg: '#ece7de',
      ctaAccentText: '#1d1d1d',
      inputBg: '#fbf8f2',
      inputBorder: '#d7d0c5',
      sheetBg: '#fffdfa',
      sheetHandle: '#cbc4b8',
      mediaGradient: 'linear-gradient(135deg,#f4f0e8,#ece5da)',
      gridPattern: 'linear-gradient(rgba(29,29,29,0.09) 1px,transparent 1px),linear-gradient(90deg,rgba(29,29,29,0.09) 1px,transparent 1px)',
      success: '#2c8d5a',
      error: '#bf5b5b',
      warning: '#b47f2b',
      cardShadow: '0 8px 20px rgba(23,23,23,0.04)',
      cardHoverShadow: '0 16px 34px rgba(23,23,23,0.08)',
      panelShadow: '0 -24px 54px rgba(23,23,23,0.14)',
      cardRadius: '20px',
      buttonRadius: '14px',
      heroRadius: '24px',
      tabBorder: 'rgba(0,0,0,0.06)'
    }
  }),
  defineTheme({
    key: 'warm-studio',
    label: 'Warm Studio',
    description: 'Terracotta, cream, and boutique warmth.',
    audience: 'Studios, makers, wellness boutiques, and artisan services.',
    preview: {
      group: 'Studio',
      kicker: 'Boutique warmth',
      bestFor: 'Therapists, creatives, salons, independent studios.',
      badge: 'Signature',
      ctaLabel: 'Book'
    },
    behavior: {
      heroStyle: 'soft',
      cardStyle: 'soft',
      tabStyle: 'pill',
      badgeStyle: 'soft'
    },
    fonts: {
      display: "'Fraunces', serif",
      ui: "'Manrope', sans-serif"
    },
    tokens: {
      pageBg: '#fff7f1',
      pageSurface: '#fffdfa',
      pageSurfaceMuted: '#f8ece3',
      pageSurfaceEmphasis: '#f2ddd0',
      pageCardBg: '#fffdfa',
      pageCardMuted: '#faeee5',
      pageBorder: '#edd4c4',
      pageBorderStrong: '#d7af99',
      pageText: '#352520',
      pageTextSecondary: '#73574d',
      pageTextMuted: '#a07f72',
      accent: '#e19172',
      accentStrong: '#a25338',
      accentSoft: 'rgba(225,145,114,0.18)',
      accentContrast: '#352520',
      heroGradient: 'linear-gradient(155deg,#8f4f3e 0%,#c4745e 54%,#e7a181 100%)',
      heroText: '#fff7f2',
      heroTextSecondary: '#f9ddd1',
      heroTextMuted: '#efc6b4',
      heroKicker: '#ffd0bc',
      heroDivider: 'rgba(255,247,242,0.18)',
      heroGlow: '#f3b096',
      heroGlowSoft: 'rgba(243,176,150,0.25)',
      navGradient: 'linear-gradient(180deg,rgba(122,69,55,0.94) 0%,rgba(155,94,76,0.9) 100%)',
      navText: '#f0d4c9',
      navActive: '#fffaf5',
      navIndicator: '#ffd0bc',
      badgeBg: '#824a3b',
      badgeText: '#ffe8df',
      badgeSoftBg: '#f7ded2',
      badgeSoftText: '#8f513d',
      ctaBg: '#824a3b',
      ctaText: '#fff8f3',
      ctaAccentBg: '#ffd0bc',
      ctaAccentText: '#5a3126',
      inputBg: '#fff8f3',
      inputBorder: '#e7c6b6',
      sheetBg: '#fffbf8',
      sheetHandle: '#dcb6a4',
      mediaGradient: 'linear-gradient(135deg,#fdf0e8,#f4d7c8)',
      gridPattern: 'linear-gradient(rgba(225,145,114,0.14) 1px,transparent 1px),linear-gradient(90deg,rgba(225,145,114,0.14) 1px,transparent 1px)',
      success: '#3e966c',
      error: '#cf665a',
      warning: '#cb8b32',
      cardShadow: '0 14px 32px rgba(146,85,61,0.08)',
      cardHoverShadow: '0 22px 44px rgba(146,85,61,0.14)',
      panelShadow: '0 -24px 64px rgba(101,51,35,0.22)',
      cardRadius: '24px',
      buttonRadius: '18px',
      heroRadius: '30px',
      tabBorder: 'rgba(255,255,255,0.1)'
    }
  }),
  defineTheme({
    key: 'dark-athletic',
    label: 'Dark Athletic',
    description: 'Deep charcoal with electric contrast.',
    audience: 'Combat gyms, strength coaches, and harder-edged training brands.',
    preview: {
      group: 'Performance',
      kicker: 'Harder edge',
      bestFor: 'Strength, fight, conditioning, and high-intensity brands.',
      badge: 'Top Session',
      ctaLabel: 'Book'
    },
    behavior: {
      heroStyle: 'energetic',
      cardStyle: 'elevated',
      tabStyle: 'underline',
      badgeStyle: 'solid'
    },
    fonts: {
      display: "'Sora', sans-serif",
      ui: "'Manrope', sans-serif"
    },
    tokens: {
      pageBg: '#0d1014',
      pageSurface: '#151922',
      pageSurfaceMuted: '#1d2634',
      pageSurfaceEmphasis: '#263245',
      pageCardBg: '#171d28',
      pageCardMuted: '#202938',
      pageBorder: '#3a475d',
      pageBorderStrong: '#526682',
      pageText: '#f4f7fb',
      pageTextSecondary: '#d7e1ec',
      pageTextMuted: '#a9b8cc',
      accent: '#67f7d0',
      accentStrong: '#9ffbea',
      accentSoft: 'rgba(103,247,208,0.2)',
      accentContrast: '#091017',
      heroGradient: 'linear-gradient(145deg,#0a0d11 0%,#111723 46%,#1b3558 100%)',
      heroText: '#f6fbff',
      heroTextSecondary: '#e1ebf5',
      heroTextMuted: '#b4c5d8',
      heroKicker: '#67f7d0',
      heroDivider: 'rgba(159,251,234,0.3)',
      heroGlow: '#2eb6ff',
      heroGlowSoft: 'rgba(46,182,255,0.24)',
      navGradient: 'linear-gradient(180deg,rgba(10,13,17,0.96) 0%,rgba(18,24,34,0.94) 100%)',
      navText: '#b5c6d9',
      navActive: '#f4f7fb',
      navIndicator: '#67f7d0',
      badgeBg: '#67f7d0',
      badgeText: '#081117',
      badgeSoftBg: 'rgba(103,247,208,0.2)',
      badgeSoftText: '#d7fff4',
      ctaBg: '#67f7d0',
      ctaText: '#091017',
      ctaAccentBg: '#1d3145',
      ctaAccentText: '#f4f7fb',
      inputBg: '#111722',
      inputBorder: '#42526b',
      sheetBg: '#10141d',
      sheetHandle: '#536884',
      mediaGradient: 'linear-gradient(135deg,#172232,#0f1724)',
      gridPattern: 'linear-gradient(rgba(103,247,208,0.12) 1px,transparent 1px),linear-gradient(90deg,rgba(103,247,208,0.12) 1px,transparent 1px)',
      success: '#29cf7c',
      error: '#ff6c6c',
      warning: '#ffb547',
      cardShadow: '0 16px 42px rgba(2,8,20,0.36)',
      cardHoverShadow: '0 24px 58px rgba(2,8,20,0.48)',
      panelShadow: '0 -24px 64px rgba(0,0,0,0.45)',
      cardRadius: '20px',
      buttonRadius: '14px',
      heroRadius: '26px',
      tabBorder: 'rgba(103,247,208,0.08)'
    }
  })
];

export function isBusinessThemeKey(value: unknown): value is BusinessThemeKey {
  return typeof value === 'string' && BUSINESS_THEME_KEYS.includes(value as BusinessThemeKey);
}

export function resolveBusinessTheme(
  themeKey: BusinessThemeKey | null | undefined
): BusinessThemeDefinition {
  return BUSINESS_THEMES.find((theme) => theme.key === themeKey) ?? BUSINESS_THEMES[0]!;
}

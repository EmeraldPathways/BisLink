import type { CSSProperties } from 'react';
import type { BusinessThemeKey } from '@/types';

export const BUSINESS_THEME_KEYS = [
  'classic-luxe',
  'wellness-studio',
  'bright-performance'
] as const satisfies readonly BusinessThemeKey[];

type ThemeStyle = CSSProperties & Record<`--${string}`, string>;

export type BusinessThemeDefinition = {
  key: BusinessThemeKey;
  label: string;
  description: string;
  audience: string;
  style: ThemeStyle;
};

export const BUSINESS_THEMES: BusinessThemeDefinition[] = [
  {
    key: 'classic-luxe',
    label: 'Classic Luxe',
    description: 'Dark, polished, and premium.',
    audience: 'Best for elevated service brands and specialists.',
    style: {
      '--color-void': '#0c0b09',
      '--color-void-2': '#1c1610',
      '--color-gold': '#c9a45c',
      '--color-gold-dark': '#8b6b1a',
      '--color-gold-muted': '#f2ede3',
      '--color-bg': '#fafaf8',
      '--color-surface': '#ffffff',
      '--color-surface-2': '#f7f4ef',
      '--color-surface-3': '#f4f4f2',
      '--color-border': '#ebebeb',
      '--color-border-2': '#eae5dc',
      '--color-border-dark': '#2e2a26',
      '--color-text-primary': '#111111',
      '--color-text-secondary': '#888888',
      '--color-text-tertiary': '#aaaaaa',
      '--color-text-hero': '#f7f3ed',
      '--color-text-hero-2': '#9e9890',
      '--color-text-hero-3': '#666666',
      '--color-success': '#4ade80',
      '--color-error': '#ef4444',
      '--color-warning': '#f59e0b',
      '--font-display': "'Cormorant Garamond', serif",
      '--font-ui': "'DM Sans', sans-serif",
      '--hero-gradient': 'linear-gradient(165deg,#0c0b09 0%,#1c1610 55%,#0f0d0b 100%)',
      '--tab-gradient': 'linear-gradient(165deg,#0c0b09 0%,#1c1610 55%,#0f0d0b 100%)',
      '--hero-glow': '#c9a45c',
      '--hero-glow-soft': 'rgba(201,164,92,0.14)',
      '--media-gradient': 'linear-gradient(135deg,#f7f4ef,#eee9df)',
      '--grid-pattern': 'linear-gradient(rgba(139,107,26,0.12) 1px,transparent 1px),linear-gradient(90deg,rgba(139,107,26,0.12) 1px,transparent 1px)',
      '--stat-icon-bg': '#f7f4ef',
      '--stat-icon-color': '#0c0b09',
      '--revenue-gradient': 'linear-gradient(165deg,#0c0b09 0%,#1c1610 55%,#0f0d0b 100%)',
      '--calendar-today-column': 'rgba(201,164,92,0.06)',
      '--calendar-booking-bg': 'rgba(201,164,92,0.12)',
      '--sidebar-active-bg': '#f7f4ef',
      '--mobile-nav-active-bg': '#f7f4ef',
      '--empty-state-icon': '#aaaaaa',
      '--stat-positive-bg': '#f2ede3',
      '--stat-positive-color': '#8b6b1a',
      '--stat-info-bg': '#f7f4ef',
      '--stat-info-color': '#0c0b09'
    }
  },
  {
    key: 'wellness-studio',
    label: 'Wellness Studio',
    description: 'Soft, calm, and restorative.',
    audience: 'Massage, hair, beauty, and slower premium care.',
    style: {
      '--color-void': '#4d3e39',
      '--color-void-2': '#76645c',
      '--color-gold': '#c78f7b',
      '--color-gold-dark': '#8f5b49',
      '--color-gold-muted': '#f7ece7',
      '--color-bg': '#fffaf7',
      '--color-surface': '#fffefe',
      '--color-surface-2': '#f8efea',
      '--color-surface-3': '#f4e7df',
      '--color-border': '#eaded8',
      '--color-border-2': '#e5d3cb',
      '--color-border-dark': '#8a746b',
      '--color-text-primary': '#2d2421',
      '--color-text-secondary': '#7f6f69',
      '--color-text-tertiary': '#a3928d',
      '--color-text-hero': '#fff6f0',
      '--color-text-hero-2': '#e6d6cf',
      '--color-text-hero-3': '#ccb9b0',
      '--color-success': '#4e9c74',
      '--color-error': '#c65b5b',
      '--color-warning': '#c18d3a',
      '--font-display': "'Fraunces', serif",
      '--font-ui': "'DM Sans', sans-serif",
      '--hero-gradient': 'linear-gradient(160deg,#5b4a43 0%,#7c675f 52%,#9e7f72 100%)',
      '--tab-gradient': 'linear-gradient(160deg,#5b4a43 0%,#7c675f 52%,#9e7f72 100%)',
      '--hero-glow': '#e0b3a2',
      '--hero-glow-soft': 'rgba(224,179,162,0.16)',
      '--media-gradient': 'linear-gradient(135deg,#fcf1ec,#f2ddd2)',
      '--grid-pattern': 'linear-gradient(rgba(199,143,123,0.18) 1px,transparent 1px),linear-gradient(90deg,rgba(199,143,123,0.18) 1px,transparent 1px)',
      '--stat-icon-bg': '#f8efea',
      '--stat-icon-color': '#4d3e39',
      '--revenue-gradient': 'linear-gradient(160deg,#5b4a43 0%,#7c675f 52%,#9e7f72 100%)',
      '--calendar-today-column': 'rgba(199,143,123,0.06)',
      '--calendar-booking-bg': 'rgba(199,143,123,0.12)',
      '--sidebar-active-bg': '#f8efea',
      '--mobile-nav-active-bg': '#f8efea',
      '--empty-state-icon': '#a3928d',
      '--stat-positive-bg': '#f4e7df',
      '--stat-positive-color': '#8f5b49',
      '--stat-info-bg': '#f8efea',
      '--stat-info-color': '#4d3e39'
    }
  },
  {
    key: 'bright-performance',
    label: 'Bright Performance',
    description: 'Crisp, bright, and high-energy.',
    audience: 'Gyms, fitness coaches, and performance-led brands.',
    style: {
      '--color-void': '#14213d',
      '--color-void-2': '#1d4ed8',
      '--color-gold': '#45f0df',
      '--color-gold-dark': '#0f766e',
      '--color-gold-muted': '#e7fbff',
      '--color-bg': '#f6fbff',
      '--color-surface': '#ffffff',
      '--color-surface-2': '#edf6ff',
      '--color-surface-3': '#dbeafe',
      '--color-border': '#cfe1f5',
      '--color-border-2': '#bdd5ef',
      '--color-border-dark': '#3b82f6',
      '--color-text-primary': '#10213a',
      '--color-text-secondary': '#52708d',
      '--color-text-tertiary': '#7b93ab',
      '--color-text-hero': '#f7fbff',
      '--color-text-hero-2': '#ccdcf8',
      '--color-text-hero-3': '#9cb7e7',
      '--color-success': '#22c55e',
      '--color-error': '#ef4444',
      '--color-warning': '#f59e0b',
      '--font-display': "'Space Grotesk', sans-serif",
      '--font-ui': "'Manrope', sans-serif",
      '--hero-gradient': 'linear-gradient(155deg,#14213d 0%,#1d4ed8 58%,#0ea5e9 100%)',
      '--tab-gradient': 'linear-gradient(155deg,#14213d 0%,#1d4ed8 58%,#0ea5e9 100%)',
      '--hero-glow': '#45f0df',
      '--hero-glow-soft': 'rgba(69,240,223,0.16)',
      '--media-gradient': 'linear-gradient(135deg,#eff8ff,#dff4ff)',
      '--grid-pattern': 'linear-gradient(rgba(29,78,216,0.16) 1px,transparent 1px),linear-gradient(90deg,rgba(29,78,216,0.16) 1px,transparent 1px)',
      '--stat-icon-bg': '#edf6ff',
      '--stat-icon-color': '#14213d',
      '--revenue-gradient': 'linear-gradient(155deg,#14213d 0%,#1d4ed8 58%,#0ea5e9 100%)',
      '--calendar-today-column': 'rgba(69,240,223,0.06)',
      '--calendar-booking-bg': 'rgba(69,240,223,0.12)',
      '--sidebar-active-bg': '#edf6ff',
      '--mobile-nav-active-bg': '#edf6ff',
      '--empty-state-icon': '#7b93ab',
      '--stat-positive-bg': '#dff4ff',
      '--stat-positive-color': '#1d4ed8',
      '--stat-info-bg': '#e7fbff',
      '--stat-info-color': '#14213d'
    }
  }
];

export function isBusinessThemeKey(value: unknown): value is BusinessThemeKey {
  return typeof value === 'string' && BUSINESS_THEME_KEYS.includes(value as BusinessThemeKey);
}

export function resolveBusinessTheme(
  themeKey: BusinessThemeKey | null | undefined
): BusinessThemeDefinition {
  return BUSINESS_THEMES.find((theme) => theme.key === themeKey) ?? BUSINESS_THEMES[0]!;
}

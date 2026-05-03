import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      borderRadius: {
        '10': '10px',
        '14': '14px',
        '18': '18px',
        '22': '22px',
        '28': '28px',
      },
      boxShadow: {
        'card': '0 2px 12px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 8px 28px rgba(0, 0, 0, 0.06)',
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.04)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};

export default config;

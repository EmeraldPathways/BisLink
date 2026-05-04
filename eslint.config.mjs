import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

const config = [
  ...nextCoreWebVitals,
  {
    ignores: [
      '.next/**',
      '.next-build/**',
      'functions/dist/**',
      'functions/node_modules/**',
      'node_modules/**',
      'ybial/**',
      'ybial-agents/**',
    ],
  },
  {
    rules: {
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
];

export default config;

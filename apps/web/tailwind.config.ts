import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-dark': '#0D1117',
        'bg-surface': '#161B22',
        'bg-elevated': '#21262D',
        'primary': '#58A6FF',
        'primary-hover': '#79B8FF',
        'accent-green': '#3FB950',
        'accent-red': '#F85149',
        'accent-gold': '#D29922',
        'card-hearts': '#E53935',
        'card-spades': '#1A1A2E',
        'table-felt': '#1B5E20',
        'text-primary': '#F0F6FC',
        'text-secondary': '#8B949E',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './.storybook/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        'bg-alt': 'var(--color-bg-alt)',
        text: 'var(--color-text)',
        accent: 'var(--color-accent)',
        error: 'var(--color-error)',
      },
      fontFamily: {
        body: 'var(--font-body)',
      },
      borderWidth: {
        DEFAULT: 'var(--border-width)',
      },
    },
  },
  plugins: [],
}


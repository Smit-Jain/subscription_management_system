/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FBF6EC',
        paper: '#FFFDF8',
        ink: '#1E1B2E',
        'ink-soft': '#6B667A',
        forest: '#0E5A55',
        'forest-light': '#DDF0EA',
        marigold: '#F6B73C',
        coral: '#FF6A4D',
        lilac: '#DCD3F7',
        mint: '#3FBF8F',
        sky: '#7CC4F0',
        border: '#EADFCB',
      },
      fontFamily: {
        heading: ['"Bricolage Grotesque"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        warm: '0 2px 16px 0 rgba(30,27,46,0.07)',
        'warm-md': '0 4px 24px 0 rgba(30,27,46,0.10)',
        'warm-lg': '0 8px 40px 0 rgba(30,27,46,0.13)',
      },
    },
  },
  plugins: [],
};

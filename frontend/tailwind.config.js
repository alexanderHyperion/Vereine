/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:       '#0F0F0F',
        secondary:     '#2D2D2D',
        accent:        '#E63946',
        'accent-dark': '#C1121F',
        muted:         '#6B6B6B',
        border:        '#E0E0E0',
        surface:       '#F5F5F5',
        success:       '#2D6A4F',
        warning:       '#E9C46A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

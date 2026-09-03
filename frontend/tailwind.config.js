/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        navy: {
          950: '#070d18',
          900: '#0a1628',
          800: '#0e1e38',
          700: '#14284b',
          600: '#1a335a',
        },
        blue: {
          DEFAULT: '#1e6fff',
          light: '#4d91ff',
        },
        saffron: {
          DEFAULT: '#ff9500',
        },
        green: {
          DEFAULT: '#00c896',
        },
        red: {
          DEFAULT: '#ff4757',
        },
      },
    },
  },
  plugins: [],
}

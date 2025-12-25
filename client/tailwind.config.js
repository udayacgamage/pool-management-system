/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff1f1',
          100: '#ffdfdf',
          200: '#ffc5c5',
          300: '#ff9d9d',
          400: '#ff6464',
          500: '#f83b3b',
          600: '#e11d1d',
          700: '#800000', // USJ Maroon
          800: '#6d0000',
          900: '#5a0000',
        },
        secondary: {
          50: '#fffdf0',
          100: '#fff8be',
          200: '#ffef8d',
          300: '#ffe14d',
          400: '#ffcf1a',
          500: '#ffbf00', // USJ Gold
          600: '#e6ac00',
          700: '#bf8f00',
          800: '#997200',
          900: '#735600',
        },
        accent: {
          teal: '#14b8a6',
          indigo: '#6366f1',
          rose: '#f43f5e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}


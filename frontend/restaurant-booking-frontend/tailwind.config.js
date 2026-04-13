/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#fdf6ee',
          100: '#fae9d4',
          200: '#f4d0a4',
          300: '#ecb06c',
          400: '#e4893a',
          500: '#dc6b1a',
          600: '#ce5211',
          700: '#ab3d10',
          800: '#883115',
          900: '#6e2a14',
          950: '#3c1308',
        },
        slate: {
          850: '#1a2332',
          950: '#0d1520',
        }
      },
      animation: {
        'fade-up':    'fadeUp 0.5s ease forwards',
        'fade-in':    'fadeIn 0.4s ease forwards',
        'slide-in':   'slideIn 0.3s ease forwards',
        'shimmer':    'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideIn: {
          '0%':   { transform: 'translateX(-10px)', opacity: 0 },
          '100%': { transform: 'translateX(0)',     opacity: 1 },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
      },
    },
  },
  plugins: [],
}

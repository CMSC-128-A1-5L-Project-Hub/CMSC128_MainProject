/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui'],
        serif: ['"Cormorant Garamond"', 'ui-serif', 'Georgia']
      },
      keyframes: {
        'uble-spin': {
          to: { transform: 'rotate(1turn)' },
        },
        'uble-glow': {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.1)' },
        },
        'uble-bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'uble-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'uble-dot-pulse': {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.3)' },
        },
        'uble-fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(10deg)' },
        },
      },
      animation: {
        'uble-spin': 'uble-spin 1.5s linear infinite',
        'uble-glow': 'uble-glow 2s ease-in-out infinite',
        'uble-bounce': 'uble-bounce 1s ease-in-out infinite',
        'uble-pulse': 'uble-pulse 2s ease-in-out infinite',
        'uble-dot-pulse': 'uble-dot-pulse 1.4s ease-in-out infinite',
        'uble-fade-in': 'uble-fade-in 0.5s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
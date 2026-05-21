/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#050505',
          darkBlue: '#0B1020',
          orange: '#FF6A00',
          neonOrange: '#FF7A00',
          darkGray: '#1b1b1b',
          grayBorder: '#2b2b2b',
          cardHover: '#222222',
          lightGray: '#A0A0A0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'neon-orange': '0 0 15px rgba(255, 106, 0, 0.2)',
        'neon-orange-lg': '0 0 30px rgba(255, 106, 0, 0.45)',
        'neon-glow': '0 0 20px rgba(255, 122, 0, 0.15)',
      },
      backgroundImage: {
        'glow-gradient': 'radial-gradient(circle at center, rgba(255, 106, 0, 0.08) 0%, transparent 75%)',
        'dark-radial': 'radial-gradient(circle at top, #0B1020 0%, #050505 100%)',
      }
    },
  },
  plugins: [],
}

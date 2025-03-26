/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyber-black': '#0D0D0D',
        'cyber-pink': '#FF2A6D',
        'cyber-blue': '#05D9E8',
        'cyber-green': '#D1FF33',
        'cyber-gold': '#FFD700',
        'cyber-purple': '#7638FA',
        'cyber-dark': '#1A1A2E',
      },
      fontFamily: {
        sans: ['Rajdhani', 'Orbitron', 'sans-serif'],
      },
      boxShadow: {
        'neon-pink': '0 0 5px #FF2A6D, 0 0 20px #FF2A6D',
        'neon-blue': '0 0 5px #05D9E8, 0 0 20px #05D9E8',
        'neon-green': '0 0 5px #D1FF33, 0 0 20px #D1FF33',
        'neon-gold': '0 0 5px #FFD700, 0 0 20px #FFD700',
      },
      backdropBlur: {
        'glass': '10px',
      },
    },
  },
  plugins: [],
}


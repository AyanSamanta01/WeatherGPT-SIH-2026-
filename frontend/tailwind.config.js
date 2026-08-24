/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        weather: {
          dark: '#0B132B',
          navy: '#1C2541',
          blue: '#3A506B',
          cyan: '#5BC0BE',
          sky: '#00B4D8',
          accent: '#6FFFE9',
          alert: '#FF4D4D',
          warning: '#FFA500',
          advisory: '#FFD700',
          success: '#10B981'
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}

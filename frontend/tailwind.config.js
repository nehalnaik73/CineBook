/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cinema: {
          red: '#E50914',
          dark: '#0D0D0D',
          card: '#1A1A1A',
          border: '#2A2A2A',
          muted: '#888888',
        }
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'cursive'],
        body: ['"DM Sans"', 'sans-serif'],
      }
    }
  },
  plugins: []
}

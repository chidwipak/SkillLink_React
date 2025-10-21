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
          50: '#f0f4ee',
          100: '#e8f0e6',
          200: '#d1e1cd',
          300: '#a3c39a',
          400: '#75a567',
          500: '#4a6741',
          600: '#3a5233',
          700: '#2a3d26',
          800: '#1a281a',
          900: '#0a130d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

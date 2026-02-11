/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        background: '#0f172a',
        surface: '#1e293b',
        'surface-light': '#334155',
        border: '#475569',
      },
    },
  },
  plugins: [],
}

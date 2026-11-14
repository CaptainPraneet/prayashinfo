/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      gridTemplateColumns:{
        'auto':'repeat(auto-fill, minmax(200px, 1fr))'
      },
      colors:{
        'primary': '#3978E8',
        'secondary': '#625EFF',
        'navy': '#172B4D',
        'light-blue': '#EFF5FF',
        'success': '#10B981'
      }
    },
  },
  plugins: [],
}
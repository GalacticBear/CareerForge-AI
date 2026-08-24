/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        brand: '#4f46e5',
        surface: '#f8fafc'
      },
      boxShadow: {
        soft: '0 14px 40px rgba(15, 23, 42, 0.08)'
      }
    }
  },
  plugins: []
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#1e40af',
        'secondary': '#1d4ed8',
        'accent': '#3b82f6',
        'success': '#16a34a',
        'danger': '#dc2626',
        'neutral': '#f8fafc',
        'base-100': '#1f2937',
        'base-200': '#374151',
        'base-300': '#4b5563',
      },
    },
  },
  plugins: [],
}
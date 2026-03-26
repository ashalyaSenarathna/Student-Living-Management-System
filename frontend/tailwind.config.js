/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Health Subsystem Custom Colors
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          900: '#312e81',
        },
        secondary: '#a855f7',
        accent: '#06b6d4',
        background: '#060a1f',
        surface: '#0f1436',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#06b6d4',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6366f1, #a855f7)',
      },
    },
  },
  plugins: [],
}

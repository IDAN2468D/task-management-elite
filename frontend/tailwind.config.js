/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#6366f1',
          secondary: '#818cf8',
          accent: '#4f46e5',
        },
        slate: {
          950: '#020617',
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
        },
        glass: {
          10: 'rgba(255, 255, 255, 0.05)',
          20: 'rgba(255, 255, 255, 0.1)',
          30: 'rgba(255, 255, 255, 0.15)',
        },
        status: {
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#6366f1',
        }
      },
      borderRadius: {
        'card': '32px',
        'pill': '40px',
        'elite': '50px',
      },
      letterSpacing: {
        'elite': '4px',
        'widest-plus': '6px',
      },
      fontWeight: {
        'black': '900',
        'extrabold': '800',
      }
    },
  },
  plugins: [],
}

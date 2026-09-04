/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Georgia', '"Times New Roman"', 'serif'],
        sans: ['Georgia', '"Times New Roman"', 'serif'],
        primary: ['Georgia', '"Times New Roman"', 'serif']
      },
      colors: {
        gov: {
          maroon: {
            DEFAULT: '#7a1113', // Deep Delhi public sector maroon
            dark: '#5e0b0d',
            light: '#9b1e21',
            surface: '#fcf2f2',
            border: '#e7c6c7'
          },
          navy: {
            DEFAULT: '#142a45', // Subtle navy secondary accent
            dark: '#0c1a2c',
            light: '#1e3c63',
            surface: '#f0f4f9',
            border: '#c8d6e5'
          },
          gold: {
            DEFAULT: '#b45309', // Public sector emblem subtle gold
            light: '#d97706',
            surface: '#fef3c7'
          },
          sand: {
            50: '#fdfcf9',
            100: '#fbf9f4',
            200: '#f4f1ea',
            300: '#e8e4da',
            400: '#d1cbc0'
          },
          border: '#dbe1e8',
          text: {
            primary: '#1a1f26',
            secondary: '#4b5563',
            muted: '#6b7280'
          }
        }
      },
      boxShadow: {
        'gov': '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'gov-card': '0 2px 5px rgba(20, 42, 69, 0.05), 0 1px 2px rgba(20, 42, 69, 0.03)',
        'gov-hover': '0 6px 12px rgba(122, 17, 19, 0.09), 0 2px 4px rgba(20, 42, 69, 0.04)'
      }
    },
  },
  plugins: [],
}

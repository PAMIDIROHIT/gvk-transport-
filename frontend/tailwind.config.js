/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Clash Display"', 'sans-serif'],
        data: ['"IBM Plex Sans"', 'monospace'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        base: {
          '900': '#0F111A',
          '800': '#1A1D27',
          '700': '#2A2E3D',
          '600': '#3F445B',
          '500': '#5A617C',
          '100': '#E2E8F0',
          '50': '#F8FAFC',
        },
        accent: {
          DEFAULT: '#EAB308',
          hover: '#CA8A04',
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
        }
      }
    },
  },
  plugins: [],
}

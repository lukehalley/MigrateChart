/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        surface: '#0A0A0A',

        // ZERA Green Variations
        zera: {
          DEFAULT: '#52C97D',  // Primary ZERA green
          50: '#E8F7EF',       // Very light (backgrounds)
          100: '#D1F0DF',      // Light highlights
          200: '#A3E1BF',      // Subtle accents
          300: '#75D29F',      // Medium
          400: '#52C97D',      // Brand color
          500: '#3FAA66',      // Darker variant
          600: '#2D8A4D',      // Deep
          700: '#1F6338',      // Very deep
          800: '#133D23',      // Almost black
          900: '#0A1F12',      // Ultra dark
        },

        text: '#FFFFFF',
        textMuted: '#6B7280',
        red: '#EF4444',
      },
    },
  },
  plugins: [],
}

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
        surface: '#161b22',
        border: '#52C97D',
        text: '#ffffff',
        textMuted: '#8b949e',
        zera: '#52C97D',
        green: '#26a69a',
        red: '#ef5350',
      },
    },
  },
  plugins: [],
}

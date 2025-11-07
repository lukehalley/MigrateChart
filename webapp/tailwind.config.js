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
        background: '#0d1117',
        surface: '#161b22',
        border: '#30363d',
        text: '#c9d1d9',
        textMuted: '#8b949e',
        green: '#26a69a',
        red: '#ef5350',
        blue: '#45B7D1',
      },
    },
  },
  plugins: [],
}

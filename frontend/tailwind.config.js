/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f0f0f",
        card: "#111827",
        groww: "#00D09C",
        "groww-dark": "#00A97F",
        text: "#f0f2f5",
        muted: "#9ba1a6",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

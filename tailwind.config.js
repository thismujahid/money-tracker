/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Cairo", "Outfit", "sans-serif"],
        outfit: ["Outfit", "sans-serif"],
      },
      colors: {
        darkbg: {
          950: "#05070c",
          900: "#0a0e17",
          800: "#101622",
          700: "#182132",
          600: "#222d42",
        },
        gold: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b", // Primary Gold
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          950: "#451a03",
        }
      },
      boxShadow: {
        'gold-glow': '0 0 15px rgba(245, 158, 11, 0.15)',
        'gold-glow-lg': '0 0 25px rgba(245, 158, 11, 0.25)',
      }
    },
  },
  plugins: [],
}

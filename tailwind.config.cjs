/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#22C55E",
          dark: "#16A34A"
        },
        darkA: "#0B0B10",
        darkB: "#050509",
        danger: "#EF4444"
      }
    }
  },
  plugins: []
};

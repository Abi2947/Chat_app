//frontend/src/tailwindcss.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        primary: "#6366f1", // indigo-500
        secondary: "#8b5cf6", // purple-500
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

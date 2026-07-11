/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ending: {
          safe: "#2e7d32",
          warn: "#f9a825",
          danger: "#c0392b",
        },
      },
      width: {
        phone: "390px",
      },
      height: {
        phone: "844px",
      },
    },
  },
  plugins: [],
};

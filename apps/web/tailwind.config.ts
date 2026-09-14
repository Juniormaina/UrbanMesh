/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        civic: {
          ink: "#0B1F2A",
          slate: "#1C3A4A",
          mist: "#E8F1F4",
          paper: "#F7FBFC",
          accent: "#0E7C6B",
          accentDark: "#0A5C50",
          alert: "#C45C26",
          line: "#C5D5DC",
        },
      },
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        sans: ['"Nunito Sans"', "ui-sans-serif", "sans-serif"],
      },
      boxShadow: {
        card: "0 8px 24px rgba(11, 31, 42, 0.08)",
      },
    },
  },
  plugins: [],
};

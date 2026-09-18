/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        civic: {
          ink: "#16181D",
          slate: "#3F4A52",
          muted: "#6E7A82",
          paper: "#F4F1EA",
          surface: "#FFFFFF",
          mist: "#ECE7DE",
          line: "#DDD6CC",
          accent: "#2F6B5A",
          accentDark: "#245548",
          pending: "#A67C2A",
          pendingBg: "#F3E6C4",
          verified: "#2F6B5A",
          verifiedBg: "#E3EDE8",
          critical: "#A63D2F",
          criticalBg: "#F3E0DB",
        },
      },
      fontFamily: {
        sans: ['Inter', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(22, 24, 29, 0.05), 0 8px 20px rgba(22, 24, 29, 0.05)",
      },
      borderRadius: {
        card: "12px",
      },
    },
  },
  plugins: [],
};

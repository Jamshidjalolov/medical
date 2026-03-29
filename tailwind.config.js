/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Aptos"', '"Segoe UI"', '"Trebuchet MS"', "sans-serif"],
        display: ['"Georgia"', '"Palatino Linotype"', "serif"]
      },
      boxShadow: {
        soft: "0 18px 45px -22px rgba(15, 23, 42, 0.24)",
        premium: "0 30px 80px -28px rgba(37, 99, 235, 0.32)"
      },
      backgroundImage: {
        "hero-grid":
          "linear-gradient(to right, rgba(148, 163, 184, 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.12) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

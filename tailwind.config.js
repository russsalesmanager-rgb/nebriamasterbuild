/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        nebula: {
          900: "#0a0f1c",
          800: "#10182f",
          700: "#131c38",
          600: "#1a2650",
          500: "#243169",
          400: "#2e3e84"
        },
        accent: {
          500: "#7c5cff",
          400: "#31d4ff",
          300: "#41ffb3"
        }
      },
      boxShadow: {
        glow: "0 0 40px rgba(124, 92, 255, 0.35)",
        glass: "0 10px 30px rgba(5, 8, 20, 0.55)"
      }
    }
  },
  plugins: []
};

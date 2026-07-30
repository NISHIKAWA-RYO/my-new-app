import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        keio: {
          50: "#eef6ff",
          100: "#d9eaff",
          200: "#b6d6ff",
          300: "#86bcff",
          400: "#4f98ff",
          500: "#1f6fff",
          600: "#1757d1",
          700: "#1647a8",
          800: "#173e86",
          900: "#17376b",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

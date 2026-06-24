import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        outcome: {
          passed: "#16a34a",
          failed: "#dc2626",
          pending: "#d97706",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

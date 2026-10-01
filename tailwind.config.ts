import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ishtar: {
          50: "#eef4fb",
          100: "#d8e5f5",
          200: "#b3cceb",
          300: "#84abdd",
          400: "#4f83c9",
          500: "#2f66ad",
          600: "#1B4F8C",
          700: "#173f70",
          800: "#143459",
          900: "#122c4a",
          950: "#0b1c30",
        },
        gold: {
          50: "#fbf8ec",
          100: "#f5eecb",
          200: "#ecdc99",
          300: "#e1c55f",
          400: "#d7b038",
          500: "#C9A227",
          600: "#ab7f1f",
          700: "#895d1c",
          800: "#724a1e",
          900: "#623e1f",
          950: "#38200e",
        },
        sand: "#EDE6D6",
        charcoal: "#0E1116",
        night: {
          800: "#141a23",
          900: "#0E1116",
          950: "#090b0f",
        },
      },
      fontFamily: {
        sans: ["Tajawal", "Inter", "system-ui", "sans-serif"],
        en: ["Inter", "Tajawal", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "16px",
      },
      boxShadow: {
        glow: "0 0 40px rgba(201,162,39,0.25)",
        card: "0 8px 30px rgba(0,0,0,0.25)",
        soft: "0 4px 20px rgba(0,0,0,0.12)",
      },
      backgroundImage: {
        "babylon-pattern": "url('/patterns/babylon.svg')",
      },
      animation: {
        "spin-slow": "spin 18s linear infinite",
        shimmer: "shimmer 2.5s linear infinite",
        float: "float 5s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

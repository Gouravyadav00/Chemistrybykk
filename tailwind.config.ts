import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Plus Jakarta Sans", "Inter", "sans-serif"],
      },
      colors: {
        clay: {
          bg: "#eaf2ff",
          surface: "#ffffff",
          ink: "#0b1f4d",
          muted: "#5b6b91",
          accent: "#2563eb",
          accentDeep: "#1d4ed8",
          soft: "#dbe7ff",
          mint: "#cfe6ff",
          lilac: "#e0e7ff",
        },
      },
      boxShadow: {
        clay:
          "12px 12px 28px rgba(37, 99, 235, 0.15), -8px -8px 20px rgba(255, 255, 255, 0.9), inset 2px 2px 4px rgba(255,255,255,0.6), inset -2px -2px 6px rgba(37,99,235,0.07)",
        "clay-sm":
          "6px 6px 14px rgba(37, 99, 235, 0.12), -4px -4px 10px rgba(255, 255, 255, 0.9), inset 1px 1px 2px rgba(255,255,255,0.6)",
        "clay-inset":
          "inset 6px 6px 14px rgba(37, 99, 235, 0.18), inset -4px -4px 10px rgba(255, 255, 255, 0.9)",
        "clay-press":
          "inset 4px 4px 10px rgba(37, 99, 235, 0.18), inset -3px -3px 8px rgba(255, 255, 255, 0.9)",
        "clay-dark":
          "12px 12px 28px rgba(0, 0, 0, 0.45), -6px -6px 16px rgba(255, 255, 255, 0.04), inset 2px 2px 4px rgba(255,255,255,0.04), inset -2px -2px 6px rgba(0,0,0,0.4)",
      },
      borderRadius: {
        clay: "28px",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-14px) rotate(3deg)" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-22px) rotate(-4deg)" },
        },
        pop: {
          "0%": { transform: "scale(0.96)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        floatSlow: "floatSlow 9s ease-in-out infinite",
        pop: "pop 320ms ease-out",
        shimmer: "shimmer 1.6s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;

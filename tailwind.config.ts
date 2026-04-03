import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        space: "#000000",
        ink: "#E8E4D8",
        muted: "#8C8A82",
        dim: "#636059",
        live: "#C0392B",
        done: "#2E7D32",
        cream: "#FBFAF7",
        "earth-body": "#163E8A",
        "earth-land": "#1B5630",
        "moon-body": "#3E3B36",
      },
      fontFamily: {
        mono: ["var(--font-dm-mono)", "DM Mono", "monospace"],
        serif: ["var(--font-cormorant-garamond)", "Cormorant Garamond", "serif"],
      },
      keyframes: {
        "live-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.2" },
        },
      },
      animation: {
        "live-pulse": "live-pulse 1.6s infinite",
      },
      letterSpacing: {
        instrument: "0.18em",
      },
    },
  },
  plugins: [],
};

export default config;

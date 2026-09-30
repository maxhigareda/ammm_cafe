import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        amm: {
          mauve: "#9C8DAC",
          "mauve-light": "#C4B8D3",
          "mauve-soft": "#F2EDF7",
          "mauve-dark": "#756588",
          mint: "#C9F4D3",
          "mint-light": "#EDFDF3",
          "mint-dark": "#7ECFA0",
          cream: "#FCFBF9",
          sand: "#F7F3EE",
          latte: "#EDE6DD",
          espresso: "#2B2521",
          roast: "#595650",
          caramel: "#D98852",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(156, 141, 172, 0.12), 0 2px 6px -1px rgba(0, 0, 0, 0.04)",
        card: "0 10px 30px -4px rgba(43, 37, 33, 0.06), 0 4px 10px -2px rgba(43, 37, 33, 0.03)",
        glow: "0 0 20px rgba(156, 141, 172, 0.35)",
        mintglow: "0 0 20px rgba(201, 244, 211, 0.5)",
      },
    },
  },
  plugins: [],
};
export default config;

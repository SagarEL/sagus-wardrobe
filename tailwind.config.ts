import type { Config } from "tailwindcss";

/**
 * GetWardrobe Design System Tokens (from Skill.md)
 * - Font: Montserrat, system-ui, -apple-system, Segoe UI, Roboto, sans-serif
 * - Text: primary #090909, secondary #ffffff, tertiary #666666, inverse/accent #0288d1
 * - Surface: base #000000 / #ffffff, raised/success #269238, strong #f5f8ff
 * - Radius: xs 10px, sm 12px, md 18px, lg 25px
 * - Shadows: shadow-1..4 including GetWardrobe blue elevation rgba(2, 136, 209, 0.18) 0px 6px 16px 0px
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-montserrat)",
          "Montserrat",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        serif: [
          "var(--font-montserrat)",
          "Montserrat",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        gw: {
          textPrimary: "#090909",
          textSecondary: "#ffffff",
          textTertiary: "#666666",
          blue: "#0288d1",
          blueDark: "#0277bd",
          green: "#269238",
          surfaceStrong: "#f5f8ff",
          base: "#000000",
        },
        stone: {
          50: "#f5f8ff",
          100: "#eaf0fb",
          200: "#dce4f2",
          300: "#c4d0e4",
          400: "#8896ab",
          500: "#666666",
          600: "#4b5563",
          700: "#333333",
          800: "#1a1a1a",
          900: "#090909",
          950: "#000000",
        },
        zinc: {
          50: "#f5f8ff",
          100: "#eaf0fb",
          200: "#dce4f2",
          300: "#c4d0e4",
          400: "#8896ab",
          500: "#666666",
          600: "#4b5563",
          700: "#333333",
          800: "#1a1a1a",
          900: "#090909",
          950: "#000000",
        },
        bronze: {
          400: "#29b6f6",
          500: "#0288d1",
          600: "#0277bd",
          700: "#01579b",
        },
      },
      borderRadius: {
        "gw-xs": "10px",
        "gw-sm": "12px",
        "gw-md": "18px",
        "gw-lg": "25px",
      },
      boxShadow: {
        "gw-1": "rgba(0, 0, 0, 0.12) 0px 2px 4px 0px",
        "gw-2": "rgba(0, 0, 0, 0.1) 0px 1px 2px 0px",
        "gw-3": "rgba(2, 136, 209, 0.18) 0px 6px 16px 0px",
        "gw-4": "rgba(0, 0, 0, 0.14) 0px 1px 3px 0px",
        editorial: "rgba(0, 0, 0, 0.1) 0px 1px 2px 0px",
        "editorial-lg": "rgba(2, 136, 209, 0.18) 0px 6px 16px 0px",
      },
      transitionDuration: {
        instant: "180ms",
        fast: "200ms",
        normal: "250ms",
        slow: "700ms",
      },
    },
  },
  plugins: [],
};

export default config;

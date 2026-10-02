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
        bgPrimary: "var(--bg-primary)",
        bgSecondary: "var(--bg-secondary)",
        bgSurface: "var(--bg-surface)",
        accentPrimary: "var(--accent-primary)",
        accentPrimaryHover: "var(--accent-primary-hover)",
        accentPrimaryLight: "var(--accent-primary-light)",
        accentSecondary: "var(--accent-secondary)",
        textPrimary: "var(--text-primary)",
        textSecondary: "var(--text-secondary)",
        textTertiary: "var(--text-tertiary)",
        borderSubtle: "var(--border-subtle)",
        borderStrong: "var(--border-strong)",
        success: "var(--success)",
        warning: "var(--warning)",
        caveatBg: "var(--caveat-bg)",
        danger: "var(--danger)",
      },
      fontFamily: {
        serif: ["Georgia", "Lora", "Source Serif 4", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 3px rgba(43,43,38,0.06), 0 1px 2px rgba(43,43,38,0.04)",
        elevated: "0 4px 16px rgba(43,43,38,0.08)",
      }
    },
  },
  plugins: [],
};
export default config;

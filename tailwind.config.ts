import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        latin: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        // Modern slate + indigo theme.
        bg: "#f8fafc",         // slate-50
        surface: "#ffffff",
        surface2: "#f1f5f9",   // slate-100
        border: "#e2e8f0",     // slate-200
        borderStrong: "#cbd5e1", // slate-300
        fg: "#0f172a",         // slate-900
        muted: "#64748b",      // slate-500
        subtle: "#94a3b8",     // slate-400
        // Legacy aliases so older class references keep compiling.
        panel: "#ffffff",
        panel2: "#f1f5f9",
        text: "#0f172a",
        accent: "#4f46e5",     // indigo-600
        accent2: "#4338ca",    // indigo-700
        success: "#16a34a",
        warn: "#d97706",
        danger: "#dc2626",
        info: "#4f46e5",       // indigo-600
      },
      boxShadow: {
        flat: "0 1px 2px rgb(15 23 42 / 0.06)",
        soft: "0 1px 3px rgb(15 23 42 / 0.08), 0 1px 2px rgb(15 23 42 / 0.04)",
      },
      borderRadius: {
        // Legacy alias.
        xl2: "12px",
      },
    },
  },
  plugins: [],
};

export default config;

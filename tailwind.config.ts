import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", "data-theme=[\"dark\"]"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Supabase Design System Colors */
        background: "var(--background)",
        foreground: {
          DEFAULT: "var(--foreground)",
          light: "var(--foreground-light)",
          lighter: "var(--foreground-lighter)",
          muted: "var(--foreground-muted)",
        },
        brand: {
          DEFAULT: "var(--brand)",
          200: "var(--brand-200)",
          300: "var(--brand-300)",
          400: "var(--brand-400)",
          500: "var(--brand-500)",
          600: "var(--brand-600)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          200: "var(--warning-200)",
          300: "var(--warning-300)",
          400: "var(--warning-400)",
          500: "var(--warning-500)",
          600: "var(--warning-600)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          200: "var(--destructive-200)",
          300: "var(--destructive-300)",
          400: "var(--destructive-400)",
          500: "var(--destructive-500)",
          600: "var(--destructive-600)",
          foreground: "hsl(var(--destructive-foreground))",
        },
        surface: {
          75: "var(--surface-75)",
          100: "var(--surface-100)",
          200: "var(--surface-200)",
          300: "var(--surface-300)",
          400: "var(--surface-400)",
        },
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
          stronger: "var(--border-stronger)",
        },
        scale: {
          1: "var(--colors-scale1)",
          2: "var(--colors-scale2)",
          3: "var(--colors-scale3)",
          4: "var(--colors-scale4)",
          5: "var(--colors-scale5)",
          6: "var(--colors-scale6)",
          7: "var(--colors-scale7)",
          8: "var(--colors-scale8)",
          9: "var(--colors-scale9)",
          10: "var(--colors-scale10)",
          11: "var(--colors-scale11)",
          12: "var(--colors-scale12)",
        },
        /* Legacy shadcn/ui compatibility */
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-circular)",
          "var(--font-inter)",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "var(--font-source-code-pro)",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "slide-in-from-bottom": {
          from: { transform: "translateY(10px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "slide-in-from-right": {
          from: { transform: "translateX(10px)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-from-left": {
          from: { transform: "translateX(-10px)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "fade-out": "fade-out 0.2s ease-out",
        "slide-in-from-bottom": "slide-in-from-bottom 0.3s ease-out",
        "slide-in-from-right": "slide-in-from-right 0.3s ease-out",
        "slide-in-from-left": "slide-in-from-left 0.3s ease-out",
        "spin-slow": "spin-slow 1s linear infinite",
      },
      transitionTimingFunction: {
        "ease-in-out-cubic": "cubic-bezier(0.65, 0, 0.35, 1)",
        "ease-out-cubic": "cubic-bezier(0.33, 1, 0.68, 1)",
        "ease-in-cubic": "cubic-bezier(0.32, 0, 0.67, 0)",
      },
    },
  },
  plugins: [],
};
export default config;

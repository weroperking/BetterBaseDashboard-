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
      /* ============================================
         SUPABASE DESIGN TOKENS
         ============================================ */
      
      /* Supabase Colors - Dark Mode */
      colors: {
        /* Existing color definitions */
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
        
        /* ============================================
           NEW SUPABASE DESIGN TOKENS
           ============================================ */
        
        /* Supabase Backgrounds */
        "bg-primary": "var(--bg-primary)",
        "bg-secondary": "var(--bg-secondary)",
        "bg-tertiary": "var(--bg-tertiary)",
        "bg-input": "var(--bg-input)",
        
        /* Supabase Borders */
        "border-default": "var(--border-default)",
        "border-subtle": "var(--border-subtle)",
        
        /* Supabase Text Colors */
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        
        /* Supabase Accent (Green) */
        "accent-green": "var(--accent-green)",
        "accent-green-hover": "var(--accent-green-hover)",
        "accent-green-muted": "var(--accent-green-muted)",
        
        /* Supabase Status Colors */
        danger: "var(--status-danger)",
        status: {
          danger: "var(--status-danger)",
          warning: "var(--status-warning)",
          info: "var(--status-info)",
        },
        info: "var(--status-info)",
      },
      
      /* ============================================
         TYPOGRAPHY
         ============================================ */
      fontFamily: {
        sans: [
          "Inter",
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
          "JetBrains Mono",
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
      
      fontSize: {
        /* Supabase Typography Scale */
        'h1': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'h2': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'h3': ['16px', { lineHeight: '24px', fontWeight: '600' }],
        'body': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'small': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'table-header': ['11px', { lineHeight: '16px', fontWeight: '500' }],
        'code': ['13px', { lineHeight: '20px', fontWeight: '400' }],
      },
      
      /* ============================================
         SPACING (4px Base Unit)
         ============================================ */
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '12': '48px',
      },
      
      /* ============================================
         LAYOUT DIMENSIONS
         ============================================ */
      width: {
        'sidebar': '280px',
        'sidebar-collapsed': '64px',
      },
      height: {
        'header': '56px',
        'button': '36px',
        'input': '36px',
        'tab': '36px',
        'sidebar-item': '40px',
        'table-header': '40px',
        'table-row': '44px',
        'badge': '22px',
      },
      maxWidth: {
        'content': '1400px',
      },
      
      /* ============================================
         BORDER RADIUS
         ============================================ */
      borderRadius: {
        'card': '8px',
        'button': '6px',
        'input': '6px',
        'badge': '4px',
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      
      /* ============================================
         KEYFRAME ANIMATIONS
         ============================================ */
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
      
      /* ============================================
         ANIMATIONS
         ============================================ */
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
      
      /* ============================================
         TRANSITION TIMING FUNCTIONS
         ============================================ */
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

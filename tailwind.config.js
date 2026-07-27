/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── THE AGI DOSSIER design tokens (design.md §3) ──
        ink: "#0B0C0E",
        "ink-2": "#121318",
        "ink-3": "#1A1C22",
        bone: "#E9E4D6",
        "bone-dim": "#9A968A",
        mute: "#5C5F68",
        cn: "#D63A2C",
        "cn-deep": "#8E2118",
        us: "#2E6FE0",
        "us-deep": "#173A7A",
        gold: "#C9A24B",
        jade: "#35C48D",
        line: "#262932",
        // shadcn tokens
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        anton: ["Anton", "Impact", "sans-serif"],
        serifsc: ["'Noto Serif SC'", "serif"],
        grotesk: ["'Space Grotesk'", "sans-serif"],
        sanssc: ["'Noto Sans SC'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "glow-cn": "0 0 40px rgba(214,58,44,0.25)",
        "glow-us": "0 0 40px rgba(46,111,224,0.25)",
        "glow-gold": "0 0 24px rgba(201,162,75,0.3)",
      },
      transitionTimingFunction: {
        dossier: "cubic-bezier(0.22, 1, 0.36, 1)",
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
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "pulse-segment": {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
        "ring-breathe": {
          "0%,100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        "scroll-hint": {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(8px)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        marquee: "marquee 40s linear infinite",
        "pulse-segment": "pulse-segment 1.8s ease-in-out infinite",
        "ring-breathe": "ring-breathe 3s ease-in-out infinite",
        "scroll-hint": "scroll-hint 1.2s ease-in-out infinite",
        "spin-slow": "spin-slow 4s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

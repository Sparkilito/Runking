import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ["Fredoka", "Nunito", "sans-serif"],
        heading: ["Nunito", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        // Neo-Tangible Color Palette
        midnight: {
          DEFAULT: "#0F111A",
          50: "#1A1D2E",
          100: "#151827",
          200: "#121420",
          300: "#0F111A",
          400: "#0C0E15",
          500: "#090A10",
        },

        // Neon Cyan - UI accents
        cyan: {
          DEFAULT: "#00F0FF",
          glow: "#00F0FF",
          50: "#E6FEFF",
          100: "#B3FCFF",
          200: "#80FAFF",
          300: "#4DF7FF",
          400: "#1AF5FF",
          500: "#00F0FF",
          600: "#00C0CC",
          700: "#009099",
          800: "#006066",
          900: "#003033",
        },

        // Electric Purple - Primary brand
        purple: {
          DEFAULT: "#A855F7",
          glow: "#A855F7",
          50: "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#A855F7",
          600: "#9333EA",
          700: "#7C3AED",
          800: "#6D28D9",
          900: "#5B21B6",
        },

        // Solar Yellow - CTA buttons
        solar: {
          DEFAULT: "#FFC800",
          glow: "#FFC800",
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#FFC800",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },

        primary: {
          DEFAULT: "hsl(var(--primary))",
          glow: "hsl(var(--primary-glow))",
          dark: "hsl(var(--primary-dark))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          glow: "hsl(var(--accent-glow))",
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

        // Glass colors
        glass: {
          DEFAULT: "rgba(255, 255, 255, 0.05)",
          light: "rgba(255, 255, 255, 0.08)",
          medium: "rgba(255, 255, 255, 0.12)",
          strong: "rgba(255, 255, 255, 0.18)",
          border: "rgba(255, 255, 255, 0.1)",
        },
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-accent': 'var(--gradient-accent)',
        'gradient-hero': 'var(--gradient-hero)',
        'gradient-midnight': 'linear-gradient(135deg, #0F111A 0%, #1A1D2E 50%, #2D1B4E 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'gradient-solar': 'linear-gradient(135deg, #FFC800 0%, #FFD84D 100%)',
        'gradient-purple': 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)',
        'gradient-cyan': 'linear-gradient(135deg, #00F0FF 0%, #00C0CC 100%)',
      },
      boxShadow: {
        'glow': 'var(--shadow-glow)',
        'accent': 'var(--shadow-accent)',
        'card': 'var(--shadow-card)',
        // Glassmorphism shadows
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-lg': '0 16px 48px 0 rgba(0, 0, 0, 0.45)',
        'glass-inset': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)',
        // Claymorphism shadows (3D effect)
        'clay': '8px 8px 16px rgba(0, 0, 0, 0.4), -4px -4px 12px rgba(255, 255, 255, 0.05), inset 1px 1px 2px rgba(255, 255, 255, 0.2)',
        'clay-sm': '4px 4px 8px rgba(0, 0, 0, 0.35), -2px -2px 6px rgba(255, 255, 255, 0.04), inset 1px 1px 1px rgba(255, 255, 255, 0.15)',
        'clay-lg': '12px 12px 24px rgba(0, 0, 0, 0.5), -6px -6px 18px rgba(255, 255, 255, 0.06), inset 2px 2px 4px rgba(255, 255, 255, 0.25)',
        'clay-pressed': 'inset 4px 4px 8px rgba(0, 0, 0, 0.4), inset -2px -2px 6px rgba(255, 255, 255, 0.05)',
        // Glow shadows
        'glow-cyan': '0 0 20px rgba(0, 240, 255, 0.4), 0 0 40px rgba(0, 240, 255, 0.2)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.4), 0 0 40px rgba(168, 85, 247, 0.2)',
        'glow-solar': '0 0 20px rgba(255, 200, 0, 0.4), 0 0 40px rgba(255, 200, 0, 0.2)',
        // Podium shadows
        'podium-gold': '0 8px 32px rgba(255, 200, 0, 0.5), 0 0 60px rgba(255, 200, 0, 0.3)',
        'podium-silver': '0 8px 32px rgba(192, 192, 192, 0.4), 0 0 60px rgba(192, 192, 192, 0.2)',
        'podium-bronze': '0 8px 32px rgba(205, 127, 50, 0.4), 0 0 60px rgba(205, 127, 50, 0.2)',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      borderRadius: {
        'lg': "var(--radius)",
        'md': "calc(var(--radius) - 2px)",
        'sm': "calc(var(--radius) - 4px)",
        // Squircle radii (Neo-Tangible style)
        'squircle': '20px',
        'squircle-md': '24px',
        'squircle-lg': '32px',
        'squircle-xl': '40px',
        'squircle-2xl': '50px',
      },
      backdropBlur: {
        'glass': '20px',
        'glass-lg': '40px',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0", opacity: "0" },
          to: { height: "var(--radix-accordion-content-height)", opacity: "1" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)", opacity: "1" },
          to: { height: "0", opacity: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        // Neo-Tangible animations
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0, 240, 255, 0.4)" },
          "50%": { boxShadow: "0 0 40px rgba(0, 240, 255, 0.6)" },
        },
        "wiggle": {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        "pop": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "podium-rise": {
          "0%": { transform: "translateY(50px) scale(0.9)", opacity: "0" },
          "60%": { transform: "translateY(-10px) scale(1.02)" },
          "100%": { transform: "translateY(0) scale(1)", opacity: "1" },
        },
        "crown-bounce": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "25%": { transform: "translateY(-5px) rotate(-5deg)" },
          "75%": { transform: "translateY(-5px) rotate(5deg)" },
        },
        "confetti": {
          "0%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(100vh) rotate(720deg)", opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.3s ease-out",
        "accordion-up": "accordion-up 0.3s ease-out",
        "fade-in": "fade-in 0.4s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "bounce-in": "bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "shimmer": "shimmer 2s infinite linear",
        // Neo-Tangible animations
        "float": "float 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "wiggle": "wiggle 0.5s ease-in-out",
        "pop": "pop 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.4s ease-out",
        "slide-in-left": "slide-in-left 0.4s ease-out",
        "podium-rise": "podium-rise 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "crown-bounce": "crown-bounce 2s ease-in-out infinite",
        "confetti": "confetti 3s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

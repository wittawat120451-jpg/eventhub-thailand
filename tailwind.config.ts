import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          950: "#2e1065",
        },
        accent: {
          cyan: "#06b6d4",
          blue: "#3b82f6",
          pink: "#ec4899",
          amber: "#f59e0b",
          emerald: "#10b981",
        },
        dark: {
          900: "#090A15",
          850: "#0F1123",
          800: "#151833",
          700: "#1E2245",
          600: "#2B305E",
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-glow": "radial-gradient(circle at 50% 30%, rgba(124, 58, 237, 0.18), transparent 70%)",
        "mesh-pattern": "radial-gradient(at 40% 20%, hsla(260,100%,70%,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(217,100%,70%,0.12) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(280,100%,70%,0.12) 0px, transparent 50%)",
      },
      boxShadow: {
        "glass": "0 8px 32px 0 rgba(109, 40, 217, 0.15)",
        "glass-hover": "0 12px 40px 0 rgba(124, 58, 237, 0.25)",
        "glow": "0 0 25px -5px rgba(139, 92, 246, 0.5)",
        "glow-lg": "0 0 45px -5px rgba(124, 58, 237, 0.6)",
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        }
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
};
export default config;

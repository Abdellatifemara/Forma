import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Semantic Colors (driven by CSS vars)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Legacy brand colors (used in marketing + other pages)
        'forma-teal': {
          DEFAULT: '#2BB5A0',
          light: '#3CC4AF',
          dark: '#229688',
        },
        'forma-navy': {
          DEFAULT: '#0A1628',
          light: '#1A2D4A',
        },
        coral: {
          DEFAULT: '#FF6B6B',
          50: '#FFF0F0',
          100: '#FFD6D6',
          500: '#FF6B6B',
          600: '#E85555',
        },
        // Standard palette (Tailwind defaults extended)
        cyan: {
          DEFAULT: '#06B6D4',
          50: '#ECFEFF',
          100: '#CFFAFE',
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
          700: '#0E7490',
          800: '#155E75',
          900: '#164E63',
        },
        purple: {
          DEFAULT: '#8B5CF6',
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        green: {
          DEFAULT: '#22C55E',
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
        pink: {
          DEFAULT: '#EC4899',
          50: '#FDF2F8',
          100: '#FCE7F3',
          200: '#FBCFE8',
          300: '#F9A8D4',
          400: '#F472B6',
          500: '#EC4899',
          600: '#DB2777',
          700: '#BE185D',
          800: '#9D174D',
          900: '#831843',
        },
        orange: {
          DEFAULT: '#F97316',
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        sans: ['var(--font-sans)', 'Cairo', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, hsl(174 72% 40%), hsl(174 72% 50%))',
        'gradient-accent': 'linear-gradient(135deg, hsl(152 60% 42%), hsl(174 72% 40%))',
        'gradient-warm': 'linear-gradient(135deg, hsl(25 95% 53%), hsl(330 80% 55%))',
        'gradient-gold': 'linear-gradient(135deg, #F59E0B, #D97706)',
      },
      boxShadow: {
        'card': '0 1px 3px hsl(220 15% 10% / 0.04), 0 1px 2px hsl(220 15% 10% / 0.03)',
        'card-hover': '0 4px 12px hsl(220 15% 10% / 0.08), 0 1px 3px hsl(220 15% 10% / 0.04)',
        'card-active': '0 8px 24px hsl(220 15% 10% / 0.1), 0 2px 4px hsl(220 15% 10% / 0.06)',
        'nav': '0 -1px 4px hsl(220 15% 10% / 0.06)',
        // Legacy compat — used by other pages
        'glow-sm': '0 2px 8px hsl(var(--primary) / 0.15)',
        'glow': '0 4px 14px hsl(var(--primary) / 0.2)',
        'glow-lg': '0 8px 24px hsl(var(--primary) / 0.25)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;

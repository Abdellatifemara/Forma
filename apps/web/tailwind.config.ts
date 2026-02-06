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
        // Brand Colors - Futuristic Fitness
        cyan: {
          DEFAULT: '#00FFFF',
          50: '#E5FFFF',
          100: '#B3FFFF',
          200: '#80FFFF',
          300: '#4DFFFF',
          400: '#1AFFFF',
          500: '#00FFFF',
          600: '#00CCCC',
          700: '#009999',
          800: '#006666',
          900: '#003333',
        },
        purple: {
          DEFAULT: '#A855F7',
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#A855F7',
          600: '#9333EA',
          700: '#7E22CE',
          800: '#6B21A8',
          900: '#581C87',
        },
        green: {
          DEFAULT: '#00FF94',
          50: '#E5FFF4',
          100: '#B3FFE0',
          200: '#80FFCC',
          300: '#4DFFB8',
          400: '#1AFFA6',
          500: '#00FF94',
          600: '#00CC76',
          700: '#009959',
          800: '#00663B',
          900: '#00331E',
        },
        orange: {
          DEFAULT: '#FF6B35',
          50: '#FFF4F0',
          100: '#FFE4DB',
          200: '#FFC4B0',
          300: '#FF9F7A',
          400: '#FF8555',
          500: '#FF6B35',
          600: '#E85A28',
          700: '#C44A1E',
          800: '#9D3B18',
          900: '#7D3015',
        },
        pink: {
          DEFAULT: '#FF3399',
          50: '#FFF0F7',
          100: '#FFD6EA',
          200: '#FFB3D9',
          300: '#FF80C2',
          400: '#FF4DAB',
          500: '#FF3399',
          600: '#CC297A',
          700: '#991F5C',
          800: '#66143D',
          900: '#330A1F',
        },
        // Semantic Colors
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
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, hsl(180 100% 50%), hsl(270 95% 65%))',
        'gradient-accent': 'linear-gradient(135deg, hsl(150 100% 50%), hsl(180 100% 50%))',
        'gradient-warm': 'linear-gradient(135deg, hsl(25 100% 55%), hsl(330 100% 65%))',
      },
      boxShadow: {
        'glow-sm': '0 0 15px hsl(var(--primary) / 0.3)',
        'glow': '0 0 30px hsl(var(--primary) / 0.3)',
        'glow-lg': '0 0 50px hsl(var(--primary) / 0.4)',
        'glow-secondary': '0 0 30px hsl(var(--secondary) / 0.3)',
        'glow-accent': '0 0 30px hsl(var(--accent) / 0.3)',
        'inner-glow': 'inset 0 0 20px hsl(var(--primary) / 0.1)',
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
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px hsl(var(--primary) / 0.3)' },
          '50%': { boxShadow: '0 0 40px hsl(var(--primary) / 0.5)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'gradient-flow': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'gradient': 'gradient-flow 3s ease infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;

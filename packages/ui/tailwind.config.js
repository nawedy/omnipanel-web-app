/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './src/**/*.{js,ts,jsx,tsx}',
      './stories/**/*.{js,ts,jsx,tsx}',
    ],
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
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
          neon: {
            blue: '#00D4FF',
            green: '#00FF88',
            purple: '#B347FF',
            pink: '#FF47B3',
            yellow: '#FFD700',
          },
        },
        borderRadius: {
          lg: 'var(--radius)',
          md: 'calc(var(--radius) - 2px)',
          sm: 'calc(var(--radius) - 4px)',
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
          glow: {
            '0%, 100%': { boxShadow: '0 0 5px currentColor' },
            '50%': { boxShadow: '0 0 20px currentColor, 0 0 30px currentColor' },
          },
          pulse: {
            '0%, 100%': { opacity: '1' },
            '50%': { opacity: '0.5' },
          },
          float: {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-4px)' },
          },
        },
        animation: {
          'accordion-down': 'accordion-down 0.2s ease-out',
          'accordion-up': 'accordion-up 0.2s ease-out',
          glow: 'glow 2s ease-in-out infinite alternate',
          pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          float: 'float 3s ease-in-out infinite',
        },
        backdropBlur: {
          xs: '2px',
        },
        backgroundImage: {
          'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
          'gradient-conic':
            'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
          'navy-gradient': 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
          'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        },
      },
    },
    plugins: [
      require('daisyui'),
      require('@tailwindcss/typography'),
    ],
    daisyui: {
      themes: [
        {
          dark: {
            primary: '#00D4FF',
            secondary: '#00FF88',
            accent: '#B347FF',
            neutral: '#1e293b',
            'base-100': '#0f172a',
            'base-200': '#1e293b',
            'base-300': '#334155',
            info: '#00D4FF',
            success: '#00FF88',
            warning: '#FFD700',
            error: '#FF6B6B',
          },
        },
      ],
      darkTheme: 'dark',
      base: true,
      styled: true,
      utils: true,
      prefix: '',
      logs: false,
      themeRoot: ':root',
    },
  };
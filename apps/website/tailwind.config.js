/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class'],
  theme: {
  	extend: {
  		colors: {
  			primary: {
  				'50': '#eff6ff',
  				'100': '#dbeafe',
  				'200': '#bfdbfe',
  				'300': '#93c5fd',
  				'400': '#60a5fa',
  				'500': '#3b82f6',
  				'600': '#2563eb',
  				'700': '#1d4ed8',
  				'800': '#1e40af',
  				'900': '#1e3a8a',
  				'950': '#172554',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				'50': '#f0f9ff',
  				'100': '#e0f2fe',
  				'200': '#bae6fd',
  				'300': '#7dd3fc',
  				'400': '#38bdf8',
  				'500': '#0ea5e9',
  				'600': '#0284c7',
  				'700': '#0369a1',
  				'800': '#075985',
  				'900': '#0c4a6e',
  				'950': '#082f49',
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			accent: {
  				'50': '#fef7ff',
  				'100': '#fceeff',
  				'200': '#f8daff',
  				'300': '#f2b8ff',
  				'400': '#e879ff',
  				'500': '#d946ef',
  				'600': '#c026d3',
  				'700': '#a21caf',
  				'800': '#86198f',
  				'900': '#701a75',
  				'950': '#4a044e',
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			'neon-blue': {
  				'50': '#eff6ff',
  				'100': '#dbeafe',
  				'200': '#bfdbfe',
  				'300': '#93c5fd',
  				'400': '#60a5fa',
  				'500': '#3b82f6',
  				'600': '#2563eb',
  				'700': '#1d4ed8',
  				'800': '#1e40af',
  				'900': '#1e3a8a',
  				DEFAULT: '#3b82f6'
  			},
  			'neon-purple': {
  				'50': '#faf5ff',
  				'100': '#f3e8ff',
  				'200': '#e9d5ff',
  				'300': '#d8b4fe',
  				'400': '#c084fc',
  				'500': '#a855f7',
  				'600': '#9333ea',
  				'700': '#7c3aed',
  				'800': '#6b21a8',
  				'900': '#581c87',
  				DEFAULT: '#a855f7'
  			},
  			'neon-green': {
  				'50': '#f0fdf4',
  				'100': '#dcfce7',
  				'200': '#bbf7d0',
  				'300': '#86efac',
  				'400': '#4ade80',
  				'500': '#22c55e',
  				'600': '#16a34a',
  				'700': '#15803d',
  				'800': '#166534',
  				'900': '#14532d',
  				DEFAULT: '#4ade80'
  			},
  			'neon-yellow': {
  				'50': '#fffbeb',
  				'100': '#fef3c7',
  				'200': '#fde68a',
  				'300': '#fcd34d',
  				'400': '#fbbf24',
  				'500': '#f59e0b',
  				'600': '#d97706',
  				'700': '#b45309',
  				'800': '#92400e',
  				'900': '#78350f',
  				DEFAULT: '#fbbf24'
  			},
  			gray: {
  				'50': '#f8fafc',
  				'100': '#f1f5f9',
  				'200': '#e2e8f0',
  				'300': '#cbd5e1',
  				'400': '#94a3b8',
  				'500': '#64748b',
  				'600': '#475569',
  				'700': '#334155',
  				'800': '#1e293b',
  				'900': '#0f172a',
  				'950': '#020617'
  			},
  			success: {
  				'50': '#f0fdf4',
  				'100': '#dcfce7',
  				'200': '#bbf7d0',
  				'300': '#86efac',
  				'400': '#4ade80',
  				'500': '#22c55e',
  				'600': '#16a34a',
  				'700': '#15803d',
  				'800': '#166534',
  				'900': '#14532d',
  				'950': '#052e16'
  			},
  			warning: {
  				'50': '#fffbeb',
  				'100': '#fef3c7',
  				'200': '#fde68a',
  				'300': '#fcd34d',
  				'400': '#fbbf24',
  				'500': '#f59e0b',
  				'600': '#d97706',
  				'700': '#b45309',
  				'800': '#92400e',
  				'900': '#78350f',
  				'950': '#451a03'
  			},
  			danger: {
  				'50': '#fef2f2',
  				'100': '#fee2e2',
  				'200': '#fecaca',
  				'300': '#fca5a5',
  				'400': '#f87171',
  				'500': '#ef4444',
  				'600': '#dc2626',
  				'700': '#b91c1c',
  				'800': '#991b1b',
  				'900': '#7f1d1d',
  				'950': '#450a0a'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'Inter',
  				'system-ui',
  				'sans-serif'
  			],
  			mono: [
  				'JetBrains Mono',
  				'Fira Code',
  				'monospace'
  			],
  			display: [
  				'Cal Sans',
  				'Inter',
  				'system-ui',
  				'sans-serif'
  			]
  		},
  		fontSize: {
  			xs: '0.75rem',
  			sm: '0.875rem',
  			base: '1rem',
  			lg: '1.125rem',
  			xl: '1.25rem',
  			'2xl': '1.5rem',
  			'3xl': '1.875rem',
  			'4xl': '2.25rem',
  			'5xl': '3rem',
  			'6xl': '3.75rem',
  			'7xl': '4.5rem',
  			'8xl': '6rem',
  			'9xl': '8rem'
  		},
  		spacing: {
  			'18': '4.5rem',
  			'88': '22rem',
  			'112': '28rem',
  			'128': '32rem'
  		},
  		maxWidth: {
  			'8xl': '88rem',
  			'9xl': '96rem'
  		},
  				animation: {
			// Basic animations
			'fade-in': 'fadeIn 0.5s ease-in-out',
			'fade-in-up': 'fadeInUp 0.5s ease-out',
			'fade-in-down': 'fadeInDown 0.5s ease-out',
			'slide-in-left': 'slideInLeft 0.5s ease-out',
			'slide-in-right': 'slideInRight 0.5s ease-out',
			'bounce-slow': 'bounce 2s infinite',
			'pulse-slow': 'pulse 3s infinite',
			// Custom animations
			float: 'float 3s ease-in-out infinite',
			glow: 'glow 2s ease-in-out infinite alternate',
			gradient: 'gradient 3s ease infinite',
			shimmer: 'shimmer 2s linear infinite',
			blob: 'blob 7s infinite',
			// Magic UI animations
			meteor: 'meteor 5s linear infinite',
			aurora: 'aurora 8s ease-in-out infinite',
			'shiny-text': 'shiny-text 2s ease-in-out infinite',
			'animated-gradient': 'animated-gradient 6s ease infinite',
			marquee: 'marquee 25s linear infinite',
			'marquee-vertical': 'marquee-vertical 25s linear infinite',
			orbit: 'orbit 20s linear infinite',
			shine: 'shine 2s ease-in-out infinite',
			'background-position-spin': 'background-position-spin 3000ms infinite alternate',
			// Accordion animations
			'accordion-down': 'accordion-down 0.2s ease-out',
			'accordion-up': 'accordion-up 0.2s ease-out'
		},
  				keyframes: {
			// Basic keyframes
			fadeIn: {
				'0%': { opacity: '0' },
				'100%': { opacity: '1' }
			},
			fadeInUp: {
				'0%': { opacity: '0', transform: 'translateY(20px)' },
				'100%': { opacity: '1', transform: 'translateY(0)' }
			},
			fadeInDown: {
				'0%': { opacity: '0', transform: 'translateY(-20px)' },
				'100%': { opacity: '1', transform: 'translateY(0)' }
			},
			slideInLeft: {
				'0%': { opacity: '0', transform: 'translateX(-20px)' },
				'100%': { opacity: '1', transform: 'translateX(0)' }
			},
			slideInRight: {
				'0%': { opacity: '0', transform: 'translateX(20px)' },
				'100%': { opacity: '1', transform: 'translateX(0)' }
			},
			// Custom keyframes
			float: {
				'0%, 100%': { transform: 'translateY(0px)' },
				'50%': { transform: 'translateY(-10px)' }
			},
			glow: {
				'0%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' },
				'100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' }
			},
			gradient: {
				'0%, 100%': { backgroundPosition: '0% 50%' },
				'50%': { backgroundPosition: '100% 50%' }
			},
			shimmer: {
				'0%': { transform: 'translateX(-100%)' },
				'100%': { transform: 'translateX(100%)' }
			},
			blob: {
				'0%': { transform: 'translate(0px, 0px) scale(1)' },
				'33%': { transform: 'translate(30px, -50px) scale(1.1)' },
				'66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
				'100%': { transform: 'translate(0px, 0px) scale(1)' }
			},
			// Magic UI keyframes
			meteor: {
				'0%': { 
					transform: 'translateY(-100vh) translateX(-100px)',
					opacity: '0'
				},
				'15%': { opacity: '1' },
				'85%': { opacity: '1' },
				'100%': { 
					transform: 'translateY(100vh) translateX(300px)',
					opacity: '0'
				}
			},
			aurora: {
				'0%': { backgroundPosition: '0% 50%' },
				'50%': { backgroundPosition: '100% 50%' },
				'100%': { backgroundPosition: '0% 50%' }
			},
			'shiny-text': {
				'0%': { backgroundPosition: '0% 50%' },
				'50%': { backgroundPosition: '100% 50%' },
				'100%': { backgroundPosition: '0% 50%' }
			},
			'animated-gradient': {
				'0%': { backgroundPosition: '0% 50%' },
				'50%': { backgroundPosition: '100% 50%' },
				'100%': { backgroundPosition: '0% 50%' }
			},
			marquee: {
				'0%': { transform: 'translateX(0%)' },
				'100%': { transform: 'translateX(-100%)' }
			},
			'marquee-vertical': {
				'0%': { transform: 'translateY(0%)' },
				'100%': { transform: 'translateY(-100%)' }
			},
			orbit: {
				'0%': { 
					transform: 'rotate(0deg) translateY(calc(var(--radius) * 1px)) rotate(0deg)',
				},
				'100%': { 
					transform: 'rotate(360deg) translateY(calc(var(--radius) * 1px)) rotate(-360deg)',
				}
			},
			shine: {
				'0%': { backgroundPosition: '0% 0%' },
				'50%': { backgroundPosition: '100% 100%' },
				'100%': { backgroundPosition: '0% 0%' }
			},
			'background-position-spin': {
				'0%': { backgroundPosition: 'top center' },
				'100%': { backgroundPosition: 'bottom center' }
			},
			// Accordion keyframes
			'accordion-down': {
				from: { height: '0' },
				to: { height: 'var(--radix-accordion-content-height)' }
			},
			'accordion-up': {
				from: { height: 'var(--radix-accordion-content-height)' },
				to: { height: '0' }
			}
		},
  		backgroundImage: {
  			'0': 0,
  			'60': 60,
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
  			'gradient-mesh': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  			'hero-pattern': 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
  		},
  		backdropBlur: {
  			xs: '2px'
  		},
  		boxShadow: {
  			glow: '0 0 20px rgba(59, 130, 246, 0.3)',
  			'glow-lg': '0 0 40px rgba(59, 130, 246, 0.4)',
  			'glow-purple': '0 0 20px rgba(168, 85, 247, 0.3)',
  			'glow-green': '0 0 20px rgba(74, 222, 128, 0.3)',
  			'inner-lg': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
  			'neon-blue': '0 0 5px #3b82f6, 0 0 10px #3b82f6, 0 0 15px #3b82f6',
  			'neon-purple': '0 0 5px #a855f7, 0 0 10px #a855f7, 0 0 15px #a855f7',
  			'neon-green': '0 0 5px #4ade80, 0 0 10px #4ade80, 0 0 15px #4ade80'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		screens: {
  			'xs': '475px',
  		},
  		// 3D Transform utilities for flip cards
  		transformStyle: {
  			'preserve-3d': 'preserve-3d',
  		},
  		perspective: {
  			'1000': '1000px',
  		},
  		backfaceVisibility: {
  			'hidden': 'hidden',
  		},
  		rotate: {
  			'y-180': 'rotateY(180deg)',
  		},
  	}
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require("tailwindcss-animate"),
    function ({ addUtilities }) {
      const newUtilities = {
        '.transform-style-preserve-3d': {
          'transform-style': 'preserve-3d',
        },
        '.perspective-1000': {
          'perspective': '1000px',
        },
        '.backface-hidden': {
          'backface-visibility': 'hidden',
        },
        '.rotate-y-180': {
          'transform': 'rotateY(180deg)',
        },
        // Line clamp utilities
        '.line-clamp-1': {
          'overflow': 'hidden',
          'display': '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '1',
        },
        '.line-clamp-2': {
          'overflow': 'hidden',
          'display': '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '2',
        },
        '.line-clamp-3': {
          'overflow': 'hidden',
          'display': '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '3',
        },
        // Scrollbar utilities
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
        },
        '.scrollbar-track-transparent': {
          'scrollbar-color': 'transparent transparent',
        },
        '.scrollbar-thumb-white\\/20': {
          'scrollbar-color': 'rgba(255, 255, 255, 0.2) transparent',
        },
        '.scrollbar-thin::-webkit-scrollbar': {
          'width': '4px',
        },
        '.scrollbar-thin::-webkit-scrollbar-track': {
          'background': 'transparent',
        },
        '.scrollbar-thin::-webkit-scrollbar-thumb': {
          'background': 'rgba(255, 255, 255, 0.2)',
          'border-radius': '2px',
        },
        '.scrollbar-thin::-webkit-scrollbar-thumb:hover': {
          'background': 'rgba(255, 255, 255, 0.3)',
        },
      }
      addUtilities(newUtilities)
    },
],
  safelist: [
    'animate-meteor',
    'animate-aurora',
    'animate-shiny-text',
    'animate-orbit',
    'animate-marquee',
    'animate-marquee-vertical',
    'animate-shine',
    'animate-background-position-spin',
    'text-neon-blue',
    'text-neon-purple',
    'text-neon-green',
    'text-neon-yellow',
    'bg-neon-blue',
    'bg-neon-purple', 
    'bg-neon-green',
    'bg-neon-yellow',
    'from-neon-blue',
    'from-neon-purple',
    'from-neon-green',
    'to-neon-blue',
    'to-neon-purple',
    'to-neon-green',
    'border-neon-blue',
    'border-neon-purple',
    'border-neon-green',
    'shadow-neon-blue',
    'shadow-neon-purple',
    'shadow-neon-green'
  ]
}; 
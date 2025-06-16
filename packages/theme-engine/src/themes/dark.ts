import { Theme } from '../types';

export const darkTheme: Theme = {
  id: 'omnipanel-dark',
  name: 'OmniPanel Dark',
  description: 'A professional dark theme for OmniPanel AI Workspace with excellent contrast and readability',
  version: '1.0.0',
  author: 'OmniPanel Team',
  category: 'dark',
  type: 'static',
  
  metadata: {
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    tags: ['dark', 'professional', 'modern', 'dark-mode'],
    preview: '/themes/dark/preview.png',
    screenshots: [
      '/themes/dark/screenshot-dashboard.png',
      '/themes/dark/screenshot-editor.png',
      '/themes/dark/screenshot-chat.png'
    ],
    compatibility: {
      minVersion: '1.0.0',
      requiredFeatures: ['web', 'desktop', 'mobile']
    },
    license: 'MIT',
    homepage: 'https://omnipanel.ai/themes/dark',
    repository: 'https://github.com/omnipanel/themes',
    rating: 5,
    downloads: 0
  },

  colors: {
    // Primary blue color palette (same as default)
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554'
    },

    // Secondary slate color palette
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617'
    },

    // Accent emerald color palette
    accent: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
      950: '#022c22'
    },

    // Neutral gray color palette
    neutral: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b',
      950: '#09090b'
    },

    semantic: {
      success: {
        light: '#065f46',
        default: '#10b981',
        dark: '#34d399',
        contrast: '#000000'
      },
      warning: {
        light: '#92400e',
        default: '#f59e0b',
        dark: '#fbbf24',
        contrast: '#000000'
      },
      error: {
        light: '#991b1b',
        default: '#ef4444',
        dark: '#f87171',
        contrast: '#000000'
      },
      info: {
        light: '#1e40af',
        default: '#3b82f6',
        dark: '#60a5fa',
        contrast: '#000000'
      },
      text: {
        primary: '#f8fafc',
        secondary: '#cbd5e1',
        muted: '#94a3b8',
        disabled: '#64748b',
        inverse: '#0f172a'
      },
      border: {
        default: '#334155',
        muted: '#1e293b',
        subtle: '#475569',
        strong: '#64748b'
      }
    },

    surface: {
      background: '#0f172a',
      foreground: '#1e293b',
      card: '#1e293b',
      popover: '#334155',
      modal: '#1e293b',
      sidebar: '#0f172a',
      header: '#1e293b',
      footer: '#0f172a'
    },

    state: {
      hover: 'rgba(59, 130, 246, 0.1)',
      active: 'rgba(59, 130, 246, 0.2)',
      focus: '#3b82f6',
      disabled: '#334155',
      selected: 'rgba(59, 130, 246, 0.2)',
      pressed: 'rgba(59, 130, 246, 0.3)'
    },

    syntax: {
      keyword: '#a78bfa',
      string: '#34d399',
      number: '#f87171',
      comment: '#94a3b8',
      operator: '#cbd5e1',
      function: '#60a5fa',
      variable: '#f8fafc',
      type: '#fdba74',
      constant: '#f472b6',
      tag: '#f87171',
      attribute: '#34d399',
      punctuation: '#94a3b8'
    }
  },

  typography: {
    fonts: {
      sans: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'Helvetica Neue',
        'Arial',
        'sans-serif'
      ],
      serif: [
        'Charter',
        'Bitstream Charter',
        'Sitka Text',
        'Cambria',
        'serif'
      ],
      mono: [
        'JetBrains Mono',
        'Fira Code',
        'Monaco',
        'Consolas',
        'Liberation Mono',
        'Courier New',
        'monospace'
      ],
      display: [
        'Cal Sans',
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        'sans-serif'
      ]
    },

    sizes: {
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

    weights: {
      thin: 100,
      extralight: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900
    },

    lineHeights: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2
    },

    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em'
    },

    textStyles: {
      h1: {
        fontSize: '2.25rem',
        fontWeight: 700,
        lineHeight: 1.111
      },
      h2: {
        fontSize: '1.875rem',
        fontWeight: 600,
        lineHeight: 1.2
      },
      h3: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.333
      },
      h4: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.4
      },
      h5: {
        fontSize: '1.125rem',
        fontWeight: 600,
        lineHeight: 1.444
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600,
        lineHeight: 1.5
      },
      body: {
        fontSize: '1rem',
        fontWeight: 400,
        lineHeight: 1.5
      },
      caption: {
        fontSize: '0.875rem',
        fontWeight: 400,
        lineHeight: 1.429
      },
      label: {
        fontSize: '0.875rem',
        fontWeight: 500,
        lineHeight: 1.429
      },
      code: {
        fontSize: '0.875rem',
        fontWeight: 400,
        lineHeight: 1.714
      }
    }
  },

  spacing: {
    scale: {
      px: '1px',
      0: '0px',
      0.5: '0.125rem',
      1: '0.25rem',
      1.5: '0.375rem',
      2: '0.5rem',
      2.5: '0.625rem',
      3: '0.75rem',
      3.5: '0.875rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      7: '1.75rem',
      8: '2rem',
      9: '2.25rem',
      10: '2.5rem',
      11: '2.75rem',
      12: '3rem',
      14: '3.5rem',
      16: '4rem',
      20: '5rem',
      24: '6rem',
      28: '7rem',
      32: '8rem',
      36: '9rem',
      40: '10rem',
      44: '11rem',
      48: '12rem',
      52: '13rem',
      56: '14rem',
      60: '15rem',
      64: '16rem',
      72: '18rem',
      80: '20rem',
      96: '24rem'
    },

    component: {
      button: {
        padding: { x: '1rem', y: '0.5rem' },
        margin: { x: '0.25rem', y: '0.25rem' },
        gap: '0.5rem'
      },
      input: {
        padding: { x: '0.75rem', y: '0.5rem' },
        margin: { x: '0rem', y: '0.25rem' },
        gap: '0.5rem'
      },
      card: {
        padding: { x: '1.5rem', y: '1rem' },
        margin: { x: '0rem', y: '1rem' },
        gap: '1rem'
      },
      modal: {
        padding: { x: '2rem', y: '1.5rem' },
        margin: { x: '1rem', y: '1rem' },
        gap: '1.5rem'
      },
      dropdown: {
        padding: { x: '0.75rem', y: '0.5rem' },
        margin: { x: '0rem', y: '0.25rem' },
        gap: '0.5rem'
      }
    },

    layout: {
      container: '80rem',
      section: '6rem',
      grid: '2rem',
      sidebar: '16rem',
      header: '4rem',
      footer: '3rem'
    }
  },

  components: {
    button: {
      base: {},
      variants: {
        primary: {},
        secondary: {},
        outline: {},
        ghost: {},
        link: {},
        destructive: {}
      },
      sizes: {
        sm: {},
        md: {},
        lg: {},
        xl: {}
      }
    },
    input: {
      base: {},
      variants: {
        default: {},
        filled: {},
        outline: {},
        underline: {}
      },
      sizes: {
        sm: {},
        md: {},
        lg: {}
      },
      states: {
        default: {},
        hover: {},
        active: {},
        focus: {},
        disabled: {},
        error: {},
        success: {}
      }
    },
    card: {
      base: {},
      variants: {
        default: {},
        outlined: {},
        elevated: {},
        filled: {}
      }
    },
    modal: {
      overlay: {},
      content: {},
      header: {},
      body: {},
      footer: {}
    },
    sidebar: {},
    header: {},
    footer: {},
    dropdown: {},
    tooltip: {},
    badge: {},
    avatar: {},
    progress: {},
    slider: {},
    switch: {},
    checkbox: {},
    radio: {},
    select: {},
    textarea: {},
    table: {},
    tabs: {},
    accordion: {}
  },

  layout: {
    breakpoints: {
      xs: '0px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    },
    containers: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      full: '100%'
    },
    grid: {
      columns: 12,
      gap: '1rem',
      columnGap: '1rem',
      rowGap: '1rem'
    },
    flexbox: {
      gap: '1rem',
      columnGap: '1rem',
      rowGap: '1rem'
    }
  },

  effects: {
    shadows: {
      xs: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
      sm: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.4)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)',
      none: 'none'
    },

    borders: {
      width: {
        default: '1px',
        0: '0px',
        2: '2px',
        4: '4px',
        8: '8px'
      },
      radius: {
        none: '0px',
        sm: '0.125rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px'
      },
      style: {
        solid: 'solid',
        dashed: 'dashed',
        dotted: 'dotted',
        double: 'double',
        none: 'none'
      }
    },

    animations: {
      duration: {
        75: '75ms',
        100: '100ms',
        150: '150ms',
        200: '200ms',
        300: '300ms',
        500: '500ms',
        700: '700ms',
        1000: '1000ms'
      },
      easing: {
        linear: 'linear',
        ease: 'ease',
        'ease-in': 'ease-in',
        'ease-out': 'ease-out',
        'ease-in-out': 'ease-in-out',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      },
      keyframes: {
        fadeIn: `
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `,
        fadeOut: `
          @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
          }
        `,
        slideIn: `
          @keyframes slideIn {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
          }
        `,
        slideOut: `
          @keyframes slideOut {
            from { transform: translateX(0); }
            to { transform: translateX(100%); }
          }
        `,
        scaleIn: `
          @keyframes scaleIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `,
        scaleOut: `
          @keyframes scaleOut {
            from { transform: scale(1); opacity: 1; }
            to { transform: scale(0.95); opacity: 0; }
          }
        `,
        rotateIn: `
          @keyframes rotateIn {
            from { transform: rotate(-180deg); opacity: 0; }
            to { transform: rotate(0deg); opacity: 1; }
          }
        `,
        rotateOut: `
          @keyframes rotateOut {
            from { transform: rotate(0deg); opacity: 1; }
            to { transform: rotate(180deg); opacity: 0; }
          }
        `
      }
    },

    transitions: {
      property: {
        none: 'none',
        all: 'all',
        colors: 'color, background-color, border-color, text-decoration-color, fill, stroke',
        opacity: 'opacity',
        shadow: 'box-shadow',
        transform: 'transform'
      },
      duration: {
        75: '75ms',
        100: '100ms',
        150: '150ms',
        200: '200ms',
        300: '300ms',
        500: '500ms',
        700: '700ms',
        1000: '1000ms'
      },
      timing: {
        linear: 'linear',
        ease: 'ease',
        'ease-in': 'ease-in',
        'ease-out': 'ease-out',
        'ease-in-out': 'ease-in-out'
      },
      delay: {
        75: '75ms',
        100: '100ms',
        150: '150ms',
        200: '200ms',
        300: '300ms',
        500: '500ms',
        700: '700ms',
        1000: '1000ms'
      }
    },

    filters: {
      blur: {
        none: 'blur(0)',
        sm: 'blur(4px)',
        md: 'blur(8px)',
        lg: 'blur(16px)',
        xl: 'blur(24px)',
        '2xl': 'blur(40px)',
        '3xl': 'blur(64px)'
      },
      brightness: {
        0: 'brightness(0)',
        50: 'brightness(.5)',
        75: 'brightness(.75)',
        90: 'brightness(.9)',
        95: 'brightness(.95)',
        100: 'brightness(1)',
        105: 'brightness(1.05)',
        110: 'brightness(1.1)',
        125: 'brightness(1.25)',
        150: 'brightness(1.5)',
        200: 'brightness(2)'
      },
      contrast: {
        0: 'contrast(0)',
        50: 'contrast(.5)',
        75: 'contrast(.75)',
        100: 'contrast(1)',
        125: 'contrast(1.25)',
        150: 'contrast(1.5)',
        200: 'contrast(2)'
      },
      grayscale: {
        0: 'grayscale(0)',
        100: 'grayscale(100%)'
      },
      opacity: {
        0: 'opacity(0)',
        5: 'opacity(0.05)',
        10: 'opacity(0.1)',
        20: 'opacity(0.2)',
        25: 'opacity(0.25)',
        30: 'opacity(0.3)',
        40: 'opacity(0.4)',
        50: 'opacity(0.5)',
        60: 'opacity(0.6)',
        70: 'opacity(0.7)',
        75: 'opacity(0.75)',
        80: 'opacity(0.8)',
        90: 'opacity(0.9)',
        95: 'opacity(0.95)',
        100: 'opacity(1)'
      },
      saturate: {
        0: 'saturate(0)',
        50: 'saturate(.5)',
        100: 'saturate(1)',
        150: 'saturate(1.5)',
        200: 'saturate(2)'
      },
      sepia: {
        0: 'sepia(0)',
        100: 'sepia(100%)'
      }
    }
  }
}; 
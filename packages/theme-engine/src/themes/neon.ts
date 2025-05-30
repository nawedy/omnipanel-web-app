import { Theme } from '../types';
import { darkTheme } from './dark';

export const neonTheme: Theme = {
  ...darkTheme,
  id: 'omnipanel-neon',
  name: 'OmniPanel Neon',
  description: 'A vibrant neon theme with glowing effects for OmniPanel AI Workspace',
  category: 'neon',
  metadata: {
    ...darkTheme.metadata,
    tags: ['neon', 'vibrant', 'glowing', 'cyberpunk'],
    preview: '/themes/neon/preview.png',
    screenshots: [
      '/themes/neon/screenshot-dashboard.png',
      '/themes/neon/screenshot-editor.png',
      '/themes/neon/screenshot-chat.png'
    ],
    homepage: 'https://omnipanel.ai/themes/neon'
  },
  colors: {
    ...darkTheme.colors,
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9', // Bright cyan
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      950: '#082f49'
    },
    accent: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e', // Bright green
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16'
    },
    syntax: {
      keyword: '#a855f7', // Purple
      string: '#22c55e', // Green
      number: '#f59e0b', // Orange
      comment: '#6b7280',
      operator: '#06b6d4', // Cyan
      function: '#3b82f6', // Blue
      variable: '#f8fafc',
      type: '#f472b6', // Pink
      constant: '#8b5cf6', // Violet
      tag: '#ef4444', // Red
      attribute: '#10b981', // Emerald
      punctuation: '#94a3b8'
    }
  },
  effects: {
    ...darkTheme.effects,
    shadows: {
      xs: '0 1px 2px 0 rgba(14, 165, 233, 0.2)',
      sm: '0 1px 3px 0 rgba(14, 165, 233, 0.3), 0 1px 2px -1px rgba(14, 165, 233, 0.3)',
      md: '0 4px 6px -1px rgba(14, 165, 233, 0.3), 0 2px 4px -2px rgba(14, 165, 233, 0.3)',
      lg: '0 10px 15px -3px rgba(14, 165, 233, 0.4), 0 4px 6px -4px rgba(14, 165, 233, 0.4)',
      xl: '0 20px 25px -5px rgba(14, 165, 233, 0.4), 0 8px 10px -6px rgba(14, 165, 233, 0.4)',
      '2xl': '0 25px 50px -12px rgba(14, 165, 233, 0.5)',
      inner: 'inset 0 2px 4px 0 rgba(14, 165, 233, 0.3)',
      none: 'none'
    }
  }
}; 
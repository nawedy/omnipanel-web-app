import { Theme } from '../types';
import { lightTheme } from './light';

export const minimalTheme: Theme = {
  ...lightTheme,
  id: 'omnipanel-minimal',
  name: 'OmniPanel Minimal',
  description: 'A clean, minimal theme with focus on content and reduced visual clutter',
  category: 'minimal',
  metadata: {
    ...lightTheme.metadata,
    tags: ['minimal', 'clean', 'simple', 'focus'],
    preview: '/themes/minimal/preview.png',
    screenshots: [
      '/themes/minimal/screenshot-dashboard.png',
      '/themes/minimal/screenshot-editor.png',
      '/themes/minimal/screenshot-chat.png'
    ],
    homepage: 'https://omnipanel.ai/themes/minimal'
  },
  colors: {
    ...lightTheme.colors,
    primary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b', // Muted primary
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617'
    }
  },
  effects: {
    ...lightTheme.effects,
    shadows: {
      xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      none: 'none'
    }
  }
}; 
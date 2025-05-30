import { Theme } from '../types';
import { darkTheme } from './dark';

export const glassmorphismTheme: Theme = {
  ...darkTheme,
  id: 'omnipanel-glassmorphism',
  name: 'OmniPanel Glassmorphism',
  description: 'A modern glassmorphism theme with translucent surfaces and blur effects',
  category: 'glassmorphism',
  metadata: {
    ...darkTheme.metadata,
    tags: ['glassmorphism', 'translucent', 'blur', 'modern'],
    preview: '/themes/glassmorphism/preview.png',
    screenshots: [
      '/themes/glassmorphism/screenshot-dashboard.png',
      '/themes/glassmorphism/screenshot-editor.png',
      '/themes/glassmorphism/screenshot-chat.png'
    ],
    homepage: 'https://omnipanel.ai/themes/glassmorphism'
  },
  colors: {
    ...darkTheme.colors,
    surface: {
      background: 'rgba(15, 23, 42, 0.8)',
      foreground: 'rgba(30, 41, 59, 0.8)',
      card: 'rgba(30, 41, 59, 0.7)',
      popover: 'rgba(51, 65, 85, 0.8)',
      modal: 'rgba(30, 41, 59, 0.9)',
      sidebar: 'rgba(15, 23, 42, 0.9)',
      header: 'rgba(30, 41, 59, 0.8)',
      footer: 'rgba(15, 23, 42, 0.9)'
    }
  }
}; 
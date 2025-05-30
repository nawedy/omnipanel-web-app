import { Theme } from '../types';
import { darkTheme } from './dark';

export const highContrastTheme: Theme = {
  ...darkTheme,
  id: 'omnipanel-high-contrast',
  name: 'OmniPanel High Contrast',
  description: 'A high contrast theme optimized for accessibility and visual clarity',
  category: 'high-contrast',
  metadata: {
    ...darkTheme.metadata,
    tags: ['high-contrast', 'accessibility', 'a11y', 'clear'],
    preview: '/themes/high-contrast/preview.png',
    screenshots: [
      '/themes/high-contrast/screenshot-dashboard.png',
      '/themes/high-contrast/screenshot-editor.png',
      '/themes/high-contrast/screenshot-chat.png'
    ],
    homepage: 'https://omnipanel.ai/themes/high-contrast'
  },
  colors: {
    ...darkTheme.colors,
    surface: {
      background: '#000000',
      foreground: '#ffffff',
      card: '#000000',
      popover: '#000000',
      modal: '#000000',
      sidebar: '#000000',
      header: '#000000',
      footer: '#000000'
    },
    semantic: {
      ...darkTheme.colors.semantic,
      text: {
        primary: '#ffffff',
        secondary: '#ffffff',
        muted: '#cccccc',
        disabled: '#999999',
        inverse: '#000000'
      },
      border: {
        default: '#ffffff',
        muted: '#cccccc',
        subtle: '#999999',
        strong: '#ffffff'
      }
    }
  }
}; 
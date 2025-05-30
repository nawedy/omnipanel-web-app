import { Theme } from '../types';
import { defaultTheme } from './default';

export const lightTheme: Theme = {
  ...defaultTheme,
  id: 'omnipanel-light',
  name: 'OmniPanel Light',
  description: 'A clean and bright theme for OmniPanel AI Workspace with excellent readability',
  category: 'light',
  metadata: {
    ...defaultTheme.metadata,
    tags: ['light', 'clean', 'bright', 'professional'],
    preview: '/themes/light/preview.png',
    screenshots: [
      '/themes/light/screenshot-dashboard.png',
      '/themes/light/screenshot-editor.png',
      '/themes/light/screenshot-chat.png'
    ],
    homepage: 'https://omnipanel.ai/themes/light'
  }
}; 
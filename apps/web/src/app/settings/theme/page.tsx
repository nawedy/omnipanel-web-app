// apps/web/src/app/settings/theme/page.tsx
// Theme settings page with color schemes and visual customization

import React from 'react';
import { ThemeSettings } from '@/components/settings/ThemeSettings';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Theme Settings - OmniPanel',
  description: 'Customize colors, fonts, and visual appearance of OmniPanel development workspace.',
  keywords: ['theme', 'colors', 'appearance', 'dark mode', 'light mode', 'customization'],
};

export default function ThemeSettingsPage() {
  return <ThemeSettings />;
} 
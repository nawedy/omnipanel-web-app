// apps/web/src/app/settings/keyboard/page.tsx
// Keyboard shortcuts settings page with customization and conflict detection

import React from 'react';
import { KeyboardSettings } from '@/components/settings/KeyboardSettings';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Keyboard Shortcuts - OmniPanel',
  description: 'Customize keyboard shortcuts and hotkeys for OmniPanel development workspace.',
  keywords: ['keyboard', 'shortcuts', 'hotkeys', 'customization', 'productivity'],
};

export default function KeyboardSettingsPage() {
  return <KeyboardSettings />;
} 
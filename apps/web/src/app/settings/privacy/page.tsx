// apps/web/src/app/settings/privacy/page.tsx
// Privacy settings page with comprehensive privacy policy

import React from 'react';
import { PrivacyPolicy } from '@/components/legal/PrivacyPolicy';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Settings - OmniPanel',
  description: 'Privacy policy and data handling information for OmniPanel development workspace.',
  keywords: ['privacy', 'policy', 'GDPR', 'CCPA', 'data protection', 'privacy rights'],
};

export default function PrivacySettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Privacy & Data Protection</h2>
        <p className="text-muted-foreground">
          Learn how OmniPanel protects your privacy and handles your data
        </p>
      </div>
      
      <PrivacyPolicy showNavigation={true} />
    </div>
  );
} 
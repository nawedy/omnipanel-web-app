// apps/web/src/app/privacy/page.tsx
// Privacy policy page with comprehensive GDPR compliance

import React from 'react';
import { PrivacyPolicy } from '@/components/legal/PrivacyPolicy';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - OmniPanel',
  description: 'Comprehensive privacy policy for OmniPanel development workspace. GDPR and CCPA compliant with local-first privacy principles.',
  keywords: ['privacy policy', 'GDPR', 'CCPA', 'data protection', 'privacy rights', 'local-first'],
  robots: 'index, follow',
  openGraph: {
    title: 'Privacy Policy - OmniPanel',
    description: 'Learn how OmniPanel protects your privacy with local-first storage and transparent data practices.',
    type: 'website',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <PrivacyPolicy />
    </div>
  );
} 
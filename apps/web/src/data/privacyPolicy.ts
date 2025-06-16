// apps/web/src/data/privacyPolicy.ts
// Comprehensive privacy policy content with GDPR compliance

export interface PrivacySection {
  id: string;
  title: string;
  content: string[];
  lastUpdated?: string;
}

export const PRIVACY_POLICY_DATA: PrivacySection[] = [
  {
    id: 'overview',
    title: 'Privacy Overview',
    content: [
      'OmniPanel is built with privacy as a fundamental principle. We believe your data belongs to you, and we\'ve designed our platform to minimize data collection while maximizing your control.',
      'This privacy policy explains how OmniPanel handles your information when you use our development workspace platform.',
      'Key principles: Local-first storage, minimal data collection, transparent practices, and user control.'
    ]
  },
  {
    id: 'data-collection',
    title: 'What Data We Collect',
    content: [
      '**Local Data (Stored on Your Device):**',
      '• Project files and code you create or import',
      '• Application settings and preferences',
      '• Chat history and AI conversations',
      '• Terminal command history',
      '• Notebook cells and outputs',
      '• Theme customizations and workspace layouts',
      '',
      '**Optional Analytics Data:**',
      '• Anonymous usage statistics (if enabled)',
      '• Performance metrics for optimization',
      '• Error reports for debugging (no personal data)',
      '• Feature usage patterns (aggregated and anonymized)',
      '',
      '**Account Data (If Using Cloud Features):**',
      '• Email address for account creation',
      '• Authentication tokens',
      '• Sync preferences',
      '• Subscription status (for premium features)'
    ]
  },
  {
    id: 'data-usage',
    title: 'How We Use Your Data',
    content: [
      '**Local Data Usage:**',
      '• Provide core application functionality',
      '• Maintain your workspace state and preferences',
      '• Enable AI assistance and code completion',
      '• Support project management and file operations',
      '',
      '**Analytics Data Usage (Optional):**',
      '• Improve application performance and stability',
      '• Understand feature usage to guide development',
      '• Identify and fix bugs and issues',
      '• Optimize user experience',
      '',
      '**We Never:**',
      '• Sell your data to third parties',
      '• Use your code or projects for training AI models',
      '• Access your local files without explicit permission',
      '• Share personal information with advertisers'
    ]
  },
  {
    id: 'data-storage',
    title: 'Data Storage and Security',
    content: [
      '**Local Storage:**',
      '• All project data is stored locally on your device by default',
      '• Uses browser localStorage and IndexedDB for application data',
      '• File system access is sandboxed and secure',
      '• No automatic cloud uploads without explicit consent',
      '',
      '**Cloud Storage (Optional):**',
      '• End-to-end encryption for all synced data',
      '• Zero-knowledge architecture - we cannot read your encrypted data',
      '• Data stored in SOC 2 compliant data centers',
      '• Regular security audits and penetration testing',
      '',
      '**Security Measures:**',
      '• HTTPS encryption for all data transmission',
      '• Secure authentication with industry-standard protocols',
      '• Regular security updates and vulnerability patches',
      '• Isolated execution environments for code and AI operations'
    ]
  },
  {
    id: 'ai-privacy',
    title: 'AI and Machine Learning Privacy',
    content: [
      '**Local AI Models:**',
      '• When using local AI models (Ollama, etc.), all processing happens on your device',
      '• No data is sent to external servers',
      '• Complete privacy and control over AI interactions',
      '',
      '**Cloud AI Services:**',
      '• When using cloud AI providers (OpenAI, Anthropic, etc.), data is sent to their servers',
      '• We do not store or log your AI conversations on our servers',
      '• Each provider has their own privacy policy and data handling practices',
      '• You can review and control which AI providers you use',
      '',
      '**AI Training:**',
      '• We do not use your code, conversations, or data to train AI models',
      '• Third-party AI providers may have their own training policies',
      '• You can opt out of data usage for training with most providers',
      '• Local models ensure complete privacy for sensitive projects'
    ]
  },
  {
    id: 'third-party',
    title: 'Third-Party Services',
    content: [
      '**AI Providers:**',
      '• OpenAI, Anthropic, Google, and other AI services have separate privacy policies',
      '• Data sent to these services is subject to their terms and policies',
      '• We recommend reviewing each provider\'s privacy policy',
      '• You can disable or switch providers at any time',
      '',
      '**Development Tools:**',
      '• Git integration may connect to GitHub, GitLab, or other services',
      '• Package managers may download dependencies from public repositories',
      '• Terminal operations may interact with external services you choose',
      '',
      '**Analytics (Optional):**',
      '• Anonymous usage analytics through privacy-focused services',
      '• No personal identifiers or sensitive data included',
      '• Can be disabled in application settings'
    ]
  },
  {
    id: 'user-rights',
    title: 'Your Rights and Controls',
    content: [
      '**Data Access:**',
      '• View all data stored locally through application settings',
      '• Export your projects and data at any time',
      '• Request copies of any cloud-stored data',
      '',
      '**Data Control:**',
      '• Delete local data through application settings',
      '• Request deletion of cloud-stored data',
      '• Disable analytics and telemetry',
      '• Choose which AI providers to use',
      '',
      '**GDPR Rights (EU Users):**',
      '• Right to access your personal data',
      '• Right to rectification of inaccurate data',
      '• Right to erasure ("right to be forgotten")',
      '• Right to restrict processing',
      '• Right to data portability',
      '• Right to object to processing',
      '',
      '**California Privacy Rights (CCPA):**',
      '• Right to know what personal information is collected',
      '• Right to delete personal information',
      '• Right to opt-out of sale of personal information',
      '• Right to non-discrimination for exercising privacy rights'
    ]
  },
  {
    id: 'data-retention',
    title: 'Data Retention',
    content: [
      '**Local Data:**',
      '• Retained until you delete it or uninstall the application',
      '• You have complete control over local data retention',
      '• No automatic deletion or expiration',
      '',
      '**Cloud Data:**',
      '• Account data retained while your account is active',
      '• Sync data retained according to your subscription plan',
      '• Deleted within 30 days of account closure',
      '• Backup copies deleted within 90 days',
      '',
      '**Analytics Data:**',
      '• Anonymous usage data retained for up to 2 years',
      '• Used only for product improvement and optimization',
      '• Cannot be linked back to individual users'
    ]
  },
  {
    id: 'children',
    title: 'Children\'s Privacy',
    content: [
      'OmniPanel is not intended for use by children under 13 years of age.',
      'We do not knowingly collect personal information from children under 13.',
      'If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.',
      'Parents or guardians who believe their child has provided personal information should contact us immediately.'
    ]
  },
  {
    id: 'international',
    title: 'International Data Transfers',
    content: [
      '**Data Processing Locations:**',
      '• Local data processing occurs on your device regardless of location',
      '• Cloud services may process data in various regions',
      '• We ensure adequate protection for international transfers',
      '',
      '**EU-US Data Transfers:**',
      '• Compliance with GDPR requirements for data transfers',
      '• Use of Standard Contractual Clauses where applicable',
      '• Regular assessment of data transfer mechanisms',
      '',
      '**Data Localization:**',
      '• Option to choose data processing regions for cloud features',
      '• Local-first architecture minimizes international transfers',
      '• Transparency about where your data is processed'
    ]
  },
  {
    id: 'updates',
    title: 'Policy Updates',
    content: [
      'We may update this privacy policy from time to time to reflect changes in our practices or legal requirements.',
      'Material changes will be communicated through:',
      '• In-application notifications',
      '• Email notifications (if you have an account)',
      '• Updates to this page with revision dates',
      '',
      'Continued use of OmniPanel after policy updates constitutes acceptance of the revised policy.',
      'You can always review the current policy at any time in the application settings.'
    ]
  },
  {
    id: 'contact',
    title: 'Contact Information',
    content: [
      'If you have questions about this privacy policy or our data practices, please contact us:',
      '',
      '**Email:** privacy@omnipanel.dev',
      '**Data Protection Officer:** dpo@omnipanel.dev',
      '**Mailing Address:**',
      'OmniPanel Privacy Team',
      '[Company Address]',
      '[City, State, ZIP]',
      '',
      '**Response Time:**',
      '• General inquiries: Within 5 business days',
      '• GDPR requests: Within 30 days',
      '• Security concerns: Within 24 hours'
    ]
  }
];

export const PRIVACY_POLICY_METADATA = {
  version: '1.0.0',
  lastUpdated: '2024-01-15',
  effectiveDate: '2024-01-15',
  nextReview: '2024-07-15',
  language: 'en-US',
  jurisdiction: 'United States',
  gdprCompliant: true,
  ccpaCompliant: true
};

// Helper function to get section by ID
export const getPrivacySection = (id: string): PrivacySection | undefined => {
  return PRIVACY_POLICY_DATA.find(section => section.id === id);
};

// Helper function to get all section titles for navigation
export const getPrivacySectionTitles = (): Array<{ id: string; title: string }> => {
  return PRIVACY_POLICY_DATA.map(section => ({
    id: section.id,
    title: section.title
  }));
}; 
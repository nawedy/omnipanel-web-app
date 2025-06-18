import { SiteLayout } from '@/components/site-layout';

export const metadata = {
  title: 'Privacy Policy | OmniPanel - Your Data, Your Control',
  description: 'Learn how OmniPanel protects your privacy with local-first processing, zero data transmission, and GDPR compliance.',
};

export default function PrivacyPolicy() {
  return (
    <SiteLayout>
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            
            <div className="text-gray-300 space-y-8">
              <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
                <h2 className="text-2xl font-semibold text-white mb-4">Our Privacy Commitment</h2>
                <p className="text-lg">
                  At OmniPanel, privacy isn't just a feature—it's our foundation. We've built our platform with 
                  local-first processing to ensure your code, data, and intellectual property never leave your device.
                </p>
              </div>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
                
                <h3 className="text-xl font-medium text-blue-400 mb-3">What We DO Collect:</h3>
                <ul className="list-disc list-inside space-y-2 mb-4">
                  <li>Account information (email, username) for authentication</li>
                  <li>Usage analytics (page views, feature usage) - anonymized</li>
                  <li>Error logs for debugging and improvement</li>
                  <li>Billing information (processed by Stripe)</li>
                </ul>

                <h3 className="text-xl font-medium text-red-400 mb-3">What We DON'T Collect:</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Your source code or project files</li>
                  <li>AI conversation history or prompts</li>
                  <li>Personal documents or data processed by AI</li>
                  <li>Biometric or behavioral tracking data</li>
                  <li>Location data beyond general country/region</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>To provide and maintain our service</li>
                  <li>To authenticate your account and ensure security</li>
                  <li>To process payments and manage subscriptions</li>
                  <li>To send important service updates and security notifications</li>
                  <li>To improve our platform based on anonymized usage patterns</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">3. Local-First Architecture</h2>
                <div className="bg-blue-900/20 p-6 rounded-lg border border-blue-800">
                  <h3 className="text-xl font-medium text-blue-400 mb-3">Zero Data Transmission Guarantee</h3>
                  <p className="mb-4">
                    OmniPanel processes all AI interactions locally on your device. This means:
                  </p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Your code never travels to our servers or third-party AI providers</li>
                    <li>AI models run entirely on your hardware</li>
                    <li>No cloud-based processing of sensitive data</li>
                    <li>Complete offline functionality for core features</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">4. Data Sharing and Third Parties</h2>
                <p className="mb-4">We do not sell, trade, or rent your personal information. We only share data with:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Stripe:</strong> For payment processing (PCI DSS compliant)</li>
                  <li><strong>Vercel:</strong> For website hosting and analytics</li>
                  <li><strong>Legal authorities:</strong> Only when required by law</li>
                </ul>
                <p className="mt-4 text-sm text-gray-400">
                  We have data processing agreements with all third parties to ensure GDPR compliance.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">5. Your Rights (GDPR)</h2>
                <p className="mb-4">Under GDPR and other privacy laws, you have the right to:</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-900/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-400 mb-2">Access</h4>
                    <p className="text-sm">Request a copy of your personal data</p>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-400 mb-2">Rectification</h4>
                    <p className="text-sm">Correct inaccurate personal data</p>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-400 mb-2">Erasure</h4>
                    <p className="text-sm">Request deletion of your data</p>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-400 mb-2">Portability</h4>
                    <p className="text-sm">Export your data in a standard format</p>
                  </div>
                </div>
                <p className="mt-4">
                  To exercise these rights, contact us at{' '}
                  <a href="mailto:privacy@omnipanel.ai" className="text-blue-400 hover:text-blue-300">
                    privacy@omnipanel.ai
                  </a>
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">6. Data Security</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                    <h4 className="font-semibold text-cyan-400 mb-2">Encryption</h4>
                    <p className="text-sm">AES-256 encryption at rest and TLS 1.3 in transit</p>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                    <h4 className="font-semibold text-green-400 mb-2">Access Control</h4>
                    <p className="text-sm">Multi-factor authentication and role-based access</p>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                    <h4 className="font-semibold text-purple-400 mb-2">Monitoring</h4>
                    <p className="text-sm">24/7 security monitoring and incident response</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">7. Data Retention</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>Account data: Retained while your account is active</li>
                  <li>Usage analytics: Anonymized and retained for 2 years</li>
                  <li>Error logs: Retained for 90 days</li>
                  <li>Billing records: Retained for 7 years (legal requirement)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">8. Cookies and Tracking</h2>
                <p className="mb-4">We use minimal cookies for:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Authentication and session management</li>
                  <li>User preferences and settings</li>
                  <li>Anonymous usage analytics</li>
                </ul>
                <p className="mt-4 text-sm text-gray-400">
                  We do not use advertising cookies or cross-site tracking.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">9. International Transfers</h2>
                <p>
                  Your data is primarily processed in the United States and European Union. 
                  All international transfers comply with GDPR adequacy decisions or use 
                  Standard Contractual Clauses (SCCs).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">10. Changes to This Policy</h2>
                <p>
                  We may update this privacy policy from time to time. We will notify you of 
                  any material changes by email and by posting the new policy on our website. 
                  Continued use of our service after changes constitutes acceptance.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">11. Contact Information</h2>
                <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700">
                  <h3 className="text-lg font-medium text-blue-400 mb-3">Data Protection Officer</h3>
                  <p className="mb-2">Email: <a href="mailto:dpo@omnipanel.ai" className="text-blue-400 hover:text-blue-300">dpo@omnipanel.ai</a></p>
                  <p className="mb-2">Privacy Inquiries: <a href="mailto:privacy@omnipanel.ai" className="text-blue-400 hover:text-blue-300">privacy@omnipanel.ai</a></p>
                  <p className="mb-4">Response Time: Within 48 hours</p>
                  
                  <h4 className="font-medium text-gray-300 mb-2">Postal Address:</h4>
                  <p className="text-sm text-gray-400">
                    OmniPanel Inc.<br />
                    Data Protection Office<br />
                    [Address to be provided]<br />
                    Email preferred for faster response
                  </p>
                </div>
              </section>

              <div className="border-t border-gray-700 pt-8 mt-12">
                <p className="text-sm text-gray-400">
                  <strong>Last Updated:</strong> January 18, 2025<br />
                  <strong>Effective Date:</strong> January 18, 2025<br />
                  <strong>Version:</strong> 1.0
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
} 
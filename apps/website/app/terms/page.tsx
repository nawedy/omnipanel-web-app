import { SiteLayout } from '@/components/site-layout';

export const metadata = {
  title: 'Terms of Service | OmniPanel - Clear, Fair Terms',
  description: 'Read OmniPanel\'s Terms of Service covering usage rights, intellectual property protection, and service policies.',
};

export default function TermsOfService() {
  return (
    <SiteLayout>
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              Terms of Service
            </h1>
            
            <div className="text-gray-300 space-y-8">
              <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
                <h2 className="text-2xl font-semibold text-white mb-4">Agreement Overview</h2>
                <p className="text-lg">
                  These Terms of Service govern your use of OmniPanel, a local-first AI development platform. 
                  By using our service, you agree to these terms and our commitment to protecting your intellectual property.
                </p>
              </div>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">1. Service Description</h2>
                <p className="mb-4">
                  OmniPanel is a privacy-first AI development platform that provides:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Local AI model execution for code analysis and generation</li>
                  <li>Secure development environment with privacy protection</li>
                  <li>Collaboration tools for development teams</li>
                  <li>Project management and workflow optimization features</li>
                  <li>Enterprise-grade security and compliance tools</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">2. User Accounts and Responsibilities</h2>
                
                <h3 className="text-xl font-medium text-blue-400 mb-3">Account Creation</h3>
                <ul className="list-disc list-inside space-y-2 mb-4">
                  <li>You must provide accurate and complete information</li>
                  <li>You are responsible for maintaining account security</li>
                  <li>One account per user; corporate accounts available for teams</li>
                  <li>You must be 18+ or have parental consent</li>
                </ul>

                <h3 className="text-xl font-medium text-blue-400 mb-3">User Responsibilities</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Keep your login credentials secure and confidential</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Respect other users' rights and intellectual property</li>
                  <li>Use the service only for lawful purposes</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">3. Intellectual Property Rights</h2>
                
                <div className="bg-green-900/20 p-6 rounded-lg border border-green-800 mb-6">
                  <h3 className="text-xl font-medium text-green-400 mb-3">Your Code Ownership Guarantee</h3>
                  <p className="mb-4">
                    <strong>You retain full ownership</strong> of all code, projects, and intellectual property 
                    you create or process using OmniPanel. We make no claims to your work.
                  </p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>All code processed locally remains your property</li>
                    <li>No licensing or rights transfer to OmniPanel</li>
                    <li>You may export your data at any time</li>
                    <li>No vendor lock-in or proprietary formats</li>
                  </ul>
                </div>

                <h3 className="text-xl font-medium text-blue-400 mb-3">OmniPanel Platform Rights</h3>
                <p className="mb-4">OmniPanel and its underlying technology are protected by:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Copyright, trademark, and patent laws</li>
                  <li>Trade secret and proprietary information protections</li>
                  <li>Open source licenses for applicable components</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">4. Prohibited Uses</h2>
                <p className="mb-4">You may not use OmniPanel to:</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-red-900/20 p-4 rounded-lg border border-red-800">
                    <h4 className="font-semibold text-red-400 mb-2">Illegal Activities</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Violate laws or regulations</li>
                      <li>• Infringe intellectual property</li>
                      <li>• Create malicious software</li>
                      <li>• Engage in fraud or deception</li>
                    </ul>
                  </div>
                  <div className="bg-red-900/20 p-4 rounded-lg border border-red-800">
                    <h4 className="font-semibold text-red-400 mb-2">Harmful Content</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Generate harmful or offensive content</li>
                      <li>• Create discriminatory applications</li>
                      <li>• Develop surveillance tools</li>
                      <li>• Build weapons or illegal tools</li>
                    </ul>
                  </div>
                  <div className="bg-red-900/20 p-4 rounded-lg border border-red-800">
                    <h4 className="font-semibold text-red-400 mb-2">System Abuse</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Reverse engineer our platform</li>
                      <li>• Attempt unauthorized access</li>
                      <li>• Disrupt service availability</li>
                      <li>• Exceed usage limits</li>
                    </ul>
                  </div>
                  <div className="bg-red-900/20 p-4 rounded-lg border border-red-800">
                    <h4 className="font-semibold text-red-400 mb-2">Commercial Misuse</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Resell or redistribute our service</li>
                      <li>• Create competing platforms</li>
                      <li>• Violate licensing terms</li>
                      <li>• Circumvent payment systems</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">5. Subscription and Billing</h2>
                
                <h3 className="text-xl font-medium text-blue-400 mb-3">Subscription Plans</h3>
                <ul className="list-disc list-inside space-y-2 mb-4">
                  <li>Free tier with limited features and usage</li>
                  <li>Professional plans with enhanced capabilities</li>
                  <li>Enterprise plans with custom features and support</li>
                  <li>Educational discounts available for students</li>
                </ul>

                <h3 className="text-xl font-medium text-blue-400 mb-3">Billing Terms</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Subscriptions are billed monthly or annually in advance</li>
                  <li>All payments processed securely through Stripe</li>
                  <li>Automatic renewal unless cancelled before billing date</li>
                  <li>Pro-rated refunds for annual plans cancelled within 30 days</li>
                  <li>No refunds for monthly plans or partial months</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">6. Service Availability</h2>
                <div className="bg-blue-900/20 p-6 rounded-lg border border-blue-800">
                  <h3 className="text-xl font-medium text-blue-400 mb-3">Uptime Commitment</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>99.9% uptime</strong> for paid plans (excluding maintenance)</li>
                    <li>Scheduled maintenance with 48-hour notice</li>
                    <li>Emergency maintenance as needed for security</li>
                    <li>Service credits for extended outages</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">7. Data and Privacy</h2>
                <p className="mb-4">
                  Our data handling is governed by our Privacy Policy. Key points:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Local-first processing means your code stays on your device</li>
                  <li>We collect minimal data necessary for service operation</li>
                  <li>GDPR and CCPA compliance for data protection</li>
                  <li>Data export and deletion available upon request</li>
                  <li>No sale or sharing of personal data with third parties</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">8. Limitation of Liability</h2>
                <div className="bg-yellow-900/20 p-6 rounded-lg border border-yellow-800">
                  <h3 className="text-xl font-medium text-yellow-400 mb-3">Service Limitations</h3>
                  <p className="mb-4">
                    OmniPanel is provided "as is" without warranties. Our liability is limited to:
                  </p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Maximum liability: amount paid in the last 12 months</li>
                    <li>No liability for indirect, consequential, or punitive damages</li>
                    <li>No warranty for third-party integrations or AI model accuracy</li>
                    <li>Users responsible for data backup and security practices</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">9. Account Termination</h2>
                
                <h3 className="text-xl font-medium text-blue-400 mb-3">User-Initiated Termination</h3>
                <ul className="list-disc list-inside space-y-2 mb-4">
                  <li>Cancel subscription anytime through account settings</li>
                  <li>Access continues until end of current billing period</li>
                  <li>Data export available for 90 days after cancellation</li>
                  <li>Account reactivation possible within 90 days</li>
                </ul>

                <h3 className="text-xl font-medium text-red-400 mb-3">Service-Initiated Termination</h3>
                <p className="mb-4">We may terminate accounts for:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Violation of these terms or acceptable use policy</li>
                  <li>Non-payment of fees after grace period</li>
                  <li>Fraudulent or abusive behavior</li>
                  <li>Legal requirements or court orders</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">10. Dispute Resolution</h2>
                <p className="mb-4">
                  For disputes, we encourage direct communication first:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Contact support@omnipanel.ai for technical issues</li>
                  <li>Contact legal@omnipanel.ai for legal matters</li>
                  <li>30-day informal resolution period before formal proceedings</li>
                  <li>Binding arbitration for unresolved disputes</li>
                  <li>Governing law: Delaware, United States</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">11. Changes to Terms</h2>
                <p className="mb-4">
                  We may update these terms to reflect:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>New features or service changes</li>
                  <li>Legal or regulatory requirements</li>
                  <li>Security or privacy improvements</li>
                  <li>Business model adjustments</li>
                </ul>
                <p className="mt-4">
                  Material changes will be communicated 30 days in advance via email 
                  and platform notifications.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">12. Contact Information</h2>
                <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700">
                  <h3 className="text-lg font-medium text-blue-400 mb-3">Legal and Support Contacts</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-300 mb-2">General Support</h4>
                      <p className="text-sm text-gray-400">
                        Email: <a href="mailto:support@omnipanel.ai" className="text-blue-400 hover:text-blue-300">support@omnipanel.ai</a><br />
                        Response: Within 24 hours
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-300 mb-2">Legal Matters</h4>
                      <p className="text-sm text-gray-400">
                        Email: <a href="mailto:legal@omnipanel.ai" className="text-blue-400 hover:text-blue-300">legal@omnipanel.ai</a><br />
                        Response: Within 48 hours
                      </p>
                    </div>
                  </div>
                  
                  <h4 className="font-medium text-gray-300 mb-2 mt-4">Corporate Address</h4>
                  <p className="text-sm text-gray-400">
                    OmniPanel Inc.<br />
                    Legal Department<br />
                    [Address to be provided]<br />
                    Email preferred for faster response
                  </p>
                </div>
              </section>

              <div className="border-t border-gray-700 pt-8 mt-12">
                <p className="text-sm text-gray-400">
                  <strong>Last Updated:</strong> January 18, 2025<br />
                  <strong>Effective Date:</strong> January 18, 2025<br />
                  <strong>Version:</strong> 1.0<br />
                  <strong>Acceptance:</strong> By using OmniPanel, you agree to these terms
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
} 
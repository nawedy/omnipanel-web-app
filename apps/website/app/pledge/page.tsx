'use client';

import React from 'react';
import { SiteLayout } from '@/components/site-layout';
import { motion } from 'framer-motion';
import { Shield, Heart, Globe, Lock, CheckCircle, XCircle } from 'lucide-react';

export default function PledgePage(): React.JSX.Element {
  return (
    <SiteLayout>
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="py-24 bg-gradient-to-b from-primary/10 to-background">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex justify-center mb-8">
                <div className="bg-primary/20 p-6 rounded-full">
                  <Shield className="w-16 h-16 text-primary" />
                </div>
              </div>
              <h1 className="text-5xl font-bold text-foreground mb-6">
                The OmniPanel Pledge
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Our Sacred Commitment to Developer Privacy and Intellectual Property Rights
              </p>
            </motion.div>
          </div>
        </section>

        {/* Sacred Promise Section */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-foreground mb-8">
                🛡️ THE OMNIPANEL PLEDGE
              </h2>
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 mb-12">
                <p className="text-lg text-muted-foreground italic">
                  We, the creators of OmniPanel, make this solemn commitment to the developer community, 
                  enterprises, and all who entrust us with their most valuable asset - their intellectual property.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <h3 className="text-3xl font-bold text-center mb-8">
                OUR SACRED PROMISE: YOUR CODE STAYS YOURS
              </h3>
              <p className="text-lg text-muted-foreground text-center mb-12 max-w-4xl mx-auto">
                We pledge that <strong>your intellectual property will never become our competitive advantage</strong>. 
                In an industry that has normalized the harvesting of developer creativity, we stand as guardians 
                of what rightfully belongs to you.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    icon: Shield,
                    title: 'Zero Data Harvesting',
                    description: 'We will never use your code to train our models or improve our services'
                  },
                  {
                    icon: Lock,
                    title: 'Local Processing Only',
                    description: 'Your code, conversations, and innovations remain on your machines'
                  },
                  {
                    icon: XCircle,
                    title: 'No Surveillance Capitalism',
                    description: 'We refuse to profit from your privacy violations'
                  },
                  {
                    icon: Heart,
                    title: 'Lifetime Ownership',
                    description: 'Once you own OmniPanel, you own it forever - no subscriptions, no hostage situations'
                  }
                ].map((promise, index) => (
                  <motion.div
                    key={promise.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="card bg-base-100 shadow-lg border border-base-300"
                  >
                    <div className="card-body p-6 text-center">
                      <div className="flex justify-center mb-4">
                        <promise.icon className="w-12 h-12 text-primary" />
                      </div>
                      <h4 className="card-title text-lg mb-3">{promise.title}</h4>
                      <p className="text-sm text-muted-foreground">{promise.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Social Responsibility Section */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-foreground mb-8">
                🚀 OUR CONTRIBUTION TO SOCIETY
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              {[
                {
                  icon: Globe,
                  title: 'Democratizing AI Privacy Protection',
                  description: 'We pledge to make privacy-first AI accessible to every developer, regardless of budget or technical expertise.',
                  actions: [
                    'Affordable Lifetime Pricing: One-time payment eliminates recurring costs',
                    'Open Architecture: Support for open-source AI models',
                    'Education First: Free resources on AI privacy and security',
                    'Community Building: Foster a movement of privacy-conscious developers'
                  ]
                },
                {
                  icon: Shield,
                  title: 'Protecting Innovation and Creativity',
                  description: 'We pledge to safeguard the intellectual property that drives technological progress.',
                  actions: [
                    'Preserve Competitive Advantages: Keep proprietary algorithms private',
                    'Protect Startup Innovation: Prevent big tech from harvesting startup IP',
                    'Secure Government Projects: Enable classified development environments',
                    'Defend Academic Research: Protect university and research institution work'
                  ]
                }
              ].map((contribution, index) => (
                <motion.div
                  key={contribution.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="card bg-base-100 shadow-xl border border-base-300"
                >
                  <div className="card-body p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="bg-primary/20 p-3 rounded-full">
                        <contribution.icon className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="card-title text-xl">{contribution.title}</h3>
                    </div>
                    <p className="text-muted-foreground mb-6">{contribution.description}</p>
                    <div className="space-y-3">
                      {contribution.actions.map((action, actionIndex) => (
                        <div key={actionIndex} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Ethical Framework Section */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-foreground mb-8">
                ⚖️ OUR ETHICAL FRAMEWORK
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Privacy as a Human Right',
                  description: 'We treat privacy not as a feature or selling point, but as a fundamental human right.',
                  principles: [
                    'Privacy by Design: Every feature built with privacy as the foundation',
                    'User Control: You decide what data to share and with whom',
                    'Transparent Operations: Clear documentation of how everything works',
                    'No Dark Patterns: Honest interfaces that respect user choices'
                  ]
                },
                {
                  title: 'Technological Self-Determination',
                  description: 'We support developers\' right to choose their own tools, models, and workflows.',
                  principles: [
                    'Open Standards: Support for industry-standard formats and protocols',
                    'Vendor Independence: No lock-in to our platform or specific providers',
                    'Interoperability: Work seamlessly with your existing tools',
                    'Migration Rights: Easy export of all your data and configurations'
                  ]
                },
                {
                  title: 'Accountability and Transparency',
                  description: 'We hold ourselves accountable through transparent operations and community oversight.',
                  principles: [
                    'Annual Transparency Reports: Public reporting on our privacy practices',
                    'Third-Party Audits: Independent verification of our security and privacy',
                    'Community Oversight: Developer advisory board with veto power',
                    'Open Source Components: Where possible, open source our privacy-protecting code'
                  ]
                }
              ].map((framework, index) => (
                <motion.div
                  key={framework.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="card bg-base-100 shadow-xl border border-base-300"
                >
                  <div className="card-body p-6">
                    <h3 className="card-title text-lg mb-4">{framework.title}</h3>
                    <p className="text-muted-foreground mb-6 text-sm">{framework.description}</p>
                    <div className="space-y-2">
                      {framework.principles.map((principle, principleIndex) => (
                        <div key={principleIndex} className="text-xs">
                          <strong>{principle.split(':')[0]}:</strong> {principle.split(':')[1]}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Promises Section */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-foreground mb-8">
                💪 OUR PROMISE TO YOU
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="card bg-red-50 dark:bg-red-950/20 shadow-xl border border-red-200 dark:border-red-800"
              >
                <div className="card-body p-8">
                  <h3 className="card-title text-xl mb-6 text-red-600 dark:text-red-400">
                    What We Will NEVER Do:
                  </h3>
                  <div className="space-y-4">
                    {[
                      'Sell, share, or monetize your personal data',
                      'Use your code to train our models or improve our services',
                      'Force you into subscription models or recurring payments',
                      'Lock you into our platform or make it difficult to leave',
                      'Compromise on security to increase profits',
                      'Hide our practices behind complex legal language'
                    ].map((never, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{never}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="card bg-green-50 dark:bg-green-950/20 shadow-xl border border-green-200 dark:border-green-800"
              >
                <div className="card-body p-8">
                  <h3 className="card-title text-xl mb-6 text-green-600 dark:text-green-400">
                    What We Will ALWAYS Do:
                  </h3>
                  <div className="space-y-4">
                    {[
                      'Keep your data on your devices under your control',
                      'Provide transparent, honest communication about our practices',
                      'Respect your right to privacy and intellectual property',
                      'Continuously improve our security and privacy protections',
                      'Listen to and respond to community feedback',
                      'Fight for developer rights in the broader technology industry'
                    ].map((always, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{always}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-20 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-foreground mb-8">
                🌟 JOIN THE PRIVACY REVOLUTION
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
                This pledge is not just about OmniPanel - it's about creating a new standard for how 
                technology companies should treat developer privacy and intellectual property.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="text-left">
                  <h3 className="text-xl font-bold mb-4">Together, we can:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span>End the surveillance economy in developer tools</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span>Protect innovation from exploitation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span>Build a future where privacy and progress coexist</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span>Ensure that your code remains your intellectual property</span>
                    </li>
                  </ul>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-4">The privacy revolution starts with us.</h3>
                  <button className="btn btn-primary btn-lg mb-4">
                    Join the Movement
                  </button>
                  <p className="text-sm text-muted-foreground">
                    #PrivacyRevolution #DeveloperRights #OmniPanelPledge
                  </p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>This pledge is published under Creative Commons Attribution 4.0 International License, 
                allowing other companies to adopt similar commitments to developer privacy.</p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </SiteLayout>
  );
} 
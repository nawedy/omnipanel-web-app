// apps/website/app/solutions/enterprise/page.tsx
// Solutions page specifically designed for large enterprises and organizations

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Shield, 
  Lock, 
  Users, 
  BarChart3, 
  CheckCircle, 
  ArrowRight, 
  Play, 
  Globe, 
  Server,
  Workflow,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SiteLayout } from '@/components/site-layout';

const EnterprisePage: React.FC = () => {
  return (
    <SiteLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_50%)]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-purple-500/20 to-orange-500/20 rounded-xl">
                <Building2 className="w-8 h-8 text-purple-400" />
              </div>
              <Badge className="bg-gradient-to-r from-purple-500/20 to-orange-500/20 text-purple-400 border-purple-500/30">
                Enterprise
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              Enterprise-Grade{' '}
              <span className="bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
                AI Development
              </span>{' '}
              Platform
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-8">
              Scale AI-powered development across your entire organization with enterprise security, 
              compliance, and governance. Built for the world's most demanding environments.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-orange-600 hover:from-purple-600 hover:to-orange-700">
                Contact Sales
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
                Schedule Demo
                <Play className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enterprise Features */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Built for Enterprise Scale
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything your enterprise needs to deploy AI development tools securely and at scale, 
              with the governance and compliance features you require.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'SOC 2 Type II Compliance',
                description: 'Full compliance with SOC 2, GDPR, HIPAA, and other regulatory frameworks.',
                highlight: 'Certified Secure'
              },
              {
                icon: Server,
                title: 'On-Premises Deployment',
                description: 'Deploy on your own infrastructure with air-gapped environments and custom configurations.',
                highlight: 'Complete Control'
              },
              {
                icon: Users,
                title: 'Unlimited Scale',
                description: 'Support for thousands of developers with advanced user management and provisioning.',
                highlight: 'Enterprise Scale'
              },
              {
                icon: Lock,
                title: 'Advanced Security',
                description: 'Multi-factor authentication, SSO integration, and granular access controls.',
                highlight: 'Bank-Level Security'
              },
              {
                icon: BarChart3,
                title: 'Enterprise Analytics',
                description: 'Comprehensive reporting, usage analytics, and custom dashboards for leadership.',
                highlight: 'Executive Insights'
              },
              {
                icon: Phone,
                title: 'Dedicated Support',
                description: '24/7 dedicated support with assigned customer success managers and SLA guarantees.',
                highlight: 'White-Glove Service'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <Card className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border-slate-700/40 hover:border-purple-500/50 transition-all duration-300 h-full group-hover:scale-105">
                  <CardHeader className="text-center">
                    <div className="mx-auto p-4 bg-gradient-to-r from-purple-500/20 to-orange-500/20 rounded-xl mb-4 w-fit">
                      <feature.icon className="w-8 h-8 text-purple-400" />
                    </div>
                    <Badge className="mx-auto mb-2 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      {feature.highlight}
                    </Badge>
                    <CardTitle className="text-white text-lg">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance & Security */}
      <section className="py-20 px-6 bg-slate-900/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Security & Compliance First
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Meet the most stringent security and compliance requirements with our enterprise-grade platform.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Certifications & Compliance</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  'SOC 2 Type II',
                  'GDPR Compliant',
                  'HIPAA Ready',
                  'ISO 27001',
                  'FedRAMP Authorized',
                  'PCI DSS Level 1'
                ].map((cert, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">{cert}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Security Features</h3>
              <div className="space-y-4">
                {[
                  'End-to-end encryption at rest and in transit',
                  'Multi-factor authentication with hardware tokens',
                  'Role-based access control with granular permissions',
                  'Comprehensive audit logs and monitoring',
                  'Regular security assessments and penetration testing',
                  'Zero-trust architecture with network segmentation'
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deployment Options */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Flexible Deployment Options
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Deploy OmniPanel exactly how your organization needs it, with full control over data and infrastructure.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Cloud',
                icon: Globe,
                description: 'Fully managed cloud deployment with enterprise SLAs',
                features: [
                  'Multi-region availability',
                  'Auto-scaling infrastructure',
                  '99.9% uptime guarantee',
                  'Managed updates and maintenance'
                ],
                highlight: false
              },
              {
                name: 'Hybrid',
                icon: Workflow,
                description: 'Combine cloud convenience with on-premises control',
                features: [
                  'Data residency compliance',
                  'Seamless cloud integration',
                  'Flexible workload placement',
                  'Unified management interface'
                ],
                highlight: true
              },
              {
                name: 'On-Premises',
                icon: Server,
                description: 'Complete control with air-gapped deployment options',
                features: [
                  'Full data sovereignty',
                  'Custom security policies',
                  'Air-gapped environments',
                  'Direct hardware control'
                ],
                highlight: false
              }
            ].map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <Card className={`bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm transition-all duration-300 h-full group-hover:scale-105 ${
                  option.highlight 
                    ? 'border-purple-500/50 ring-1 ring-purple-500/20' 
                    : 'border-slate-700/40 hover:border-purple-500/50'
                }`}>
                  <CardHeader className="text-center">
                    {option.highlight && (
                      <Badge className="mx-auto mb-4 bg-purple-500/20 text-purple-400 border-purple-500/30">
                        Most Popular
                      </Badge>
                    )}
                    <div className="mx-auto p-4 bg-gradient-to-r from-purple-500/20 to-orange-500/20 rounded-xl mb-4 w-fit">
                      <option.icon className="w-8 h-8 text-purple-400" />
                    </div>
                    <CardTitle className="text-white text-xl mb-2">
                      {option.name}
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      {option.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {option.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-3 text-sm text-gray-300">
                          <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Pricing */}
      <section className="py-20 px-6 bg-slate-900/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Enterprise Pricing
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Transparent, scalable pricing designed for enterprise budgets and procurement processes.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                name: 'Enterprise',
                price: 'Custom',
                period: 'contact sales',
                description: 'Tailored solutions for large organizations',
                features: [
                  'Unlimited developers',
                  'On-premises or cloud deployment',
                  'Advanced security and compliance',
                  '24/7 dedicated support',
                  'Custom integrations',
                  'Training and onboarding',
                  'SLA guarantees',
                  'Executive reporting'
                ],
                highlight: false,
                buttonText: 'Contact Sales'
              },
              {
                name: 'Enterprise Plus',
                price: 'Custom',
                period: 'premium support',
                description: 'White-glove service with maximum customization',
                features: [
                  'Everything in Enterprise',
                  'Dedicated customer success manager',
                  'Custom feature development',
                  'Priority feature requests',
                  'Advanced training programs',
                  'Quarterly business reviews',
                  'Custom SLAs',
                  'Direct engineering support'
                ],
                highlight: true,
                buttonText: 'Contact Sales'
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <Card className={`bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm transition-all duration-300 h-full group-hover:scale-105 ${
                  plan.highlight 
                    ? 'border-purple-500/50 ring-1 ring-purple-500/20' 
                    : 'border-slate-700/40 hover:border-purple-500/50'
                }`}>
                  <CardHeader className="text-center">
                    {plan.highlight && (
                      <Badge className="mx-auto mb-4 bg-orange-500/20 text-orange-400 border-orange-500/30">
                        Premium Support
                      </Badge>
                    )}
                    <CardTitle className="text-white text-2xl mb-4">
                      {plan.name}
                    </CardTitle>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
                      <div className="text-gray-400 text-sm mt-1">{plan.period}</div>
                    </div>
                    <CardDescription className="text-gray-300">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-3 text-sm text-gray-300">
                          <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full ${
                        plan.highlight 
                          ? 'bg-gradient-to-r from-purple-500 to-orange-600 hover:from-purple-600 hover:to-orange-700' 
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                    >
                      {plan.buttonText}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <Card className="bg-gradient-to-br from-purple-500/10 to-orange-500/10 border-purple-500/20 backdrop-blur-sm">
              <CardContent className="p-12">
                <Building2 className="w-16 h-16 text-purple-400 mx-auto mb-6" />
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Transform Your Enterprise?
                </h2>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  Join leading enterprises who have revolutionized their development workflows with OmniPanel. 
                  Schedule a personalized demo to see how we can transform your organization.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button size="lg" className="bg-gradient-to-r from-purple-500 to-orange-600 hover:from-purple-600 hover:to-orange-700">
                    Schedule Enterprise Demo
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
                    Contact Sales Team
                    <Phone className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                <div className="mt-6 text-sm text-gray-400">
                  ✓ Custom deployment options  ✓ Enterprise security  ✓ Dedicated support
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
    </SiteLayout>
  );
};

export default EnterprisePage; 
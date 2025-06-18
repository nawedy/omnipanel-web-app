// apps/website/app/solutions/teams/page.tsx
// Solutions page specifically designed for development teams and small companies

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Shield, 
  GitBranch, 
  BarChart3, 
  CheckCircle, 
  ArrowRight, 
  Play, 
  Target, 
  Workflow,
  FileText,
  Lock,
  Brain,
  Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SiteLayout } from '@/components/site-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TeamFeature {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  benefits: string[];
  metric: string;
  category: 'collaboration' | 'management' | 'security' | 'productivity';
}

interface Solution {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  highlight: string;
  features: string[];
}

const TeamsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('collaboration');

  const teamFeatures: TeamFeature[] = [
    {
      id: 'real-time-collaboration',
      title: 'Real-Time Code Collaboration',
      description: 'Multiple developers can work on the same codebase simultaneously with live editing and conflict resolution.',
      icon: Users,
      category: 'collaboration',
      benefits: [
        'Live collaborative editing with cursor tracking',
        'Real-time conflict detection and resolution',
        'Shared workspaces and project environments',
        'Instant code sharing and pair programming'
      ],
      metric: '85% faster team coding'
    },
    {
      id: 'ai-code-review',
      title: 'AI-Powered Team Code Reviews',
      description: 'Automated code review system that maintains consistency across your entire team.',
      icon: FileText,
      category: 'collaboration',
      benefits: [
        'Consistent code style enforcement',
        'Automated security vulnerability detection',
        'Best practices recommendations',
        'Team-specific coding standards'
      ],
      metric: '70% faster reviews'
    },
    {
      id: 'project-management',
      title: 'Integrated Project Management',
      description: 'Built-in project tracking, sprint planning, and task management integrated with your development workflow.',
      icon: Target,
      category: 'management',
      benefits: [
        'Sprint planning and backlog management',
        'Task assignment and progress tracking',
        'Automated time tracking and reporting',
        'Integration with popular PM tools'
      ],
      metric: '60% better project visibility'
    },
    {
      id: 'team-analytics',
      title: 'Team Performance Analytics',
      description: 'Comprehensive insights into team productivity, code quality, and development patterns.',
      icon: BarChart3,
      category: 'management',
      benefits: [
        'Individual and team productivity metrics',
        'Code quality and technical debt tracking',
        'Sprint velocity and burndown charts',
        'Custom reporting and dashboards'
      ],
      metric: '45% productivity improvement'
    },
    {
      id: 'access-control',
      title: 'Advanced Access Control',
      description: 'Granular permissions and role-based access control for secure team collaboration.',
      icon: Lock,
      category: 'security',
      benefits: [
        'Role-based access control (RBAC)',
        'Project-level permissions',
        'Audit logs and compliance tracking',
        'SSO and LDAP integration'
      ],
      metric: '100% security compliance'
    },
    {
      id: 'private-deployment',
      title: 'Private Cloud Deployment',
      description: 'Deploy OmniPanel on your own infrastructure with complete data sovereignty.',
      icon: Shield,
      category: 'security',
      benefits: [
        'On-premises or private cloud deployment',
        'Complete data sovereignty',
        'Custom security policies',
        'Air-gapped environment support'
      ],
      metric: 'Enterprise-grade security'
    },
    {
      id: 'workflow-automation',
      title: 'Team Workflow Automation',
      description: 'Automate repetitive team processes and standardize development workflows.',
      icon: Workflow,
      category: 'productivity',
      benefits: [
        'Automated CI/CD pipeline setup',
        'Custom workflow templates',
        'Automated testing and deployment',
        'Integration with DevOps tools'
      ],
      metric: '50% faster deployments'
    },
    {
      id: 'knowledge-sharing',
      title: 'AI-Powered Knowledge Base',
      description: 'Automatically build and maintain a searchable knowledge base from your team\'s code and documentation.',
      icon: Brain,
      category: 'productivity',
      benefits: [
        'Automatic documentation generation',
        'Searchable code and decision history',
        'Onboarding assistance for new team members',
        'Best practices knowledge retention'
      ],
      metric: '75% faster onboarding'
    }
  ];

  const solutions: Solution[] = [
    {
      icon: Users,
      title: 'Team Collaboration Hub',
      description: 'Centralized workspace for seamless team collaboration and communication',
      highlight: 'Real-Time Sync',
      features: [
        'Live collaborative editing',
        'Integrated chat and video calls',
        'Shared project workspaces',
        'Real-time presence indicators'
      ]
    },
    {
      icon: GitBranch,
      title: 'Advanced Version Control',
      description: 'Enhanced Git workflows with AI-powered merge conflict resolution',
      highlight: 'Smart Merging',
      features: [
        'AI-assisted conflict resolution',
        'Automated branch management',
        'Smart commit message generation',
        'Visual merge tools'
      ]
    },
    {
      icon: BarChart3,
      title: 'Team Analytics Dashboard',
      description: 'Comprehensive insights into team performance and project health',
      highlight: 'Data-Driven',
      features: [
        'Real-time productivity metrics',
        'Code quality tracking',
        'Sprint performance analysis',
        'Custom reporting tools'
      ]
    },
    {
      icon: Shield,
      title: 'Security & Compliance',
      description: 'Enterprise-grade security with compliance tracking and audit logs',
      highlight: 'Bank-Level Security',
      features: [
        'Role-based access control',
        'Compliance automation',
        'Security audit trails',
        'Data encryption at rest and in transit'
      ]
    }
  ];

  const filteredFeatures = teamFeatures.filter(feature => feature.category === activeTab);

  return (
    <SiteLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl">
                <Users className="w-8 h-8 text-blue-400" />
              </div>
              <Badge className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30">
                Teams & Small Companies
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              Supercharge Your{' '}
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Team's Productivity
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-8">
              Built for development teams that want to ship faster, collaborate seamlessly, 
              and maintain high code quality. Scale from 2 to 200 developers with confidence.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">t Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
                Watch Demo
                <Play className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Team Features with Tabs */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything Your Team Needs
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              From real-time collaboration to advanced analytics, discover how OmniPanel 
              helps development teams work better together.
            </p>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-12 bg-slate-800/50">
              <TabsTrigger value="collaboration" className="data-[state=active]:bg-blue-500/20">
                Collaboration
              </TabsTrigger>
              <TabsTrigger value="management" className="data-[state=active]:bg-blue-500/20">
                Management
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-blue-500/20">
                Security
              </TabsTrigger>
              <TabsTrigger value="productivity" className="data-[state=active]:bg-blue-500/20">
                Productivity
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              <div className="grid md:grid-cols-2 gap-8">
                {filteredFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="group"
                  >
                    <Card className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border-slate-700/40 hover:border-blue-500/50 transition-all duration-300 h-full group-hover:scale-105">
                      <CardHeader>
                        <div className="flex items-start gap-4 mb-4">
                          <div className="p-3 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl">
                            <feature.icon className="w-6 h-6 text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <Badge className="mb-2 bg-green-500/20 text-green-400 border-green-500/30">
                              {feature.metric}
                            </Badge>
                            <CardTitle className="text-white text-xl mb-2">
                              {feature.title}
                            </CardTitle>
                            <CardDescription className="text-gray-300">
                              {feature.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {feature.benefits.map((benefit, benefitIndex) => (
                            <li key={benefitIndex} className="flex items-center gap-3 text-sm text-gray-300">
                              <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Solutions Overview */}
      <section className="py-20 px-6 bg-slate-900/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Complete Development Platform
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Four integrated solutions that work together to accelerate your team's development workflow.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {solutions.map((solution, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <Card className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border-slate-700/40 hover:border-blue-500/50 transition-all duration-300 h-full group-hover:scale-105">
                  <CardHeader className="text-center">
                    <div className="mx-auto p-4 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl mb-4 w-fit">
                      <solution.icon className="w-8 h-8 text-blue-400" />
                    </div>
                    <Badge className="mx-auto mb-2 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      {solution.highlight}
                    </Badge>
                    <CardTitle className="text-white text-lg">
                      {solution.title}
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      {solution.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {solution.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-3 text-sm text-gray-300">
                          <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
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

      {/* Team Sizes & Pricing */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Scales With Your Team
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              From startup teams to growing companies, we have the right plan for your team size and needs.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'tup Team',
                size: '2-10 developers',
                price: '$29',
                period: 'per developer/month',
                description: 'Perfect for early-stage startups and small development teams',
                features: [
                  'Real-time collaboration',
                  'Basic project management',
                  'Community support',
                  'Basic analytics'
                ],
                highlight: false
              },
              {
                name: 'Growing Team',
                size: '11-50 developers',
                price: '$49',
                period: 'per developer/month',
                description: 'Advanced features for scaling development teams',
                features: [
                  'Advanced collaboration tools',
                  'Full project management suite',
                  'Priority support',
                  'Advanced analytics',
                  'Team workflow automation',
                  'Custom integrations'
                ],
                highlight: true
              },
              {
                name: 'Scale Team',
                size: '51+ developers',
                price: 'Custom',
                period: 'enterprise pricing',
                description: 'Enterprise features for large development organizations',
                features: [
                  'Everything in Growing Team',
                  'Advanced security & compliance',
                  'Dedicated account manager',
                  'Custom deployment options',
                  'SLA guarantees',
                  'Advanced reporting'
                ],
                highlight: false
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
                    ? 'border-blue-500/50 ring-1 ring-blue-500/20' 
                    : 'border-slate-700/40 hover:border-blue-500/50'
                }`}>
                  <CardHeader className="text-center">
                    {plan.highlight && (
                      <Badge className="mx-auto mb-4 bg-blue-500/20 text-blue-400 border-blue-500/30">
                        Most Popular
                      </Badge>
                    )}
                    <CardTitle className="text-white text-2xl mb-2">
                      {plan.name}
                    </CardTitle>
                    <div className="text-sm text-blue-400 mb-4">{plan.size}</div>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
                      {plan.price !== 'Custom' && (
                        <span className="text-gray-400 ml-2">/{plan.period}</span>
                      )}
                      {plan.price === 'Custom' && (
                        <div className="text-gray-400 text-sm mt-1">{plan.period}</div>
                      )}
                    </div>
                    <CardDescription className="text-gray-300">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-3 text-sm text-gray-300">
                          <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full ${
                        plan.highlight 
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700' 
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                    >
                      {plan.price === 'Custom' ? 'Contact Sales' : 't Free Trial'}
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
            <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20 backdrop-blur-sm">
              <CardContent className="p-12">
                <Rocket className="w-16 h-16 text-blue-400 mx-auto mb-6" />
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Transform Your Team's Workflow?
                </h2>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  Join thousands of development teams who have accelerated their productivity with OmniPanel.t your free trial today - no credit card required.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button size="lg" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">t Free 14-Day Trial
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
                    Schedule Team Demo
                    <Users className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                <div className="mt-6 text-sm text-gray-400">
                  ✓ No credit card required  ✓ Setup in under 5 minutes  ✓ Cancel anytime
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

export default TeamsPage;

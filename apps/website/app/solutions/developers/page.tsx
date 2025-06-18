// apps/website/app/solutions/developers/page.tsx
// Solutions page specifically designed for individual developers

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Code2, 
  Zap, 
  Shield, 
  Brain, 
  Terminal, 
  FileCode, 
  GitBranch, 
  Cpu, 
  Lock, 
  CheckCircle, 
  ArrowRight, 
  Target, 
  Database, 
  Workflow,
  Rocket,
  Eye} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SiteLayout } from '@/components/site-layout';
import { VideoDialog } from '@/components/VideoDialog';

interface UseCase {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  benefits: string[];
  timesSaved: string;
  category: 'coding' | 'debugging' | 'learning' | 'productivity';
}

interface Feature {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  highlight: string;
}

const DevelopersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('coding');

  const useCases: UseCase[] = [
    {
      id: 'ai-coding',
      title: 'AI-Powered Code Generation',
      description: 'Generate high-quality code snippets, functions, and entire modules with intelligent AI assistance.',
      icon: Code2,
      category: 'coding',
      benefits: [
        'Context-aware code suggestions',
        'Multi-language support (Python, JS, Go, Rust, etc.)',
        'Best practices and optimization recommendations',
        'Instant documentation generation'
      ],
      timesSaved: '70% faster coding'
    },
    {
      id: 'local-processing',
      title: 'Private Local AI Processing',
      description: 'All AI computations happen on your machine - your code never leaves your control.',
      icon: Shield,
      category: 'coding',
      benefits: [
        'Zero data transmission to external servers',
        'Complete intellectual property protection',
        'Works offline without internet dependency',
        'Custom model deployment and fine-tuning'
      ],
      timesSaved: '100% privacy guaranteed'
    },
    {
      id: 'intelligent-debugging',
      title: 'Intelligent Debugging Assistant',
      description: 'AI-powered debugging that identifies issues, suggests fixes, and explains root causes.',
      icon: Target,
      category: 'debugging',
      benefits: [
        'Automatic error detection and analysis',
        'Root cause identification with explanations',
        'Suggested fixes with code examples',
        'Performance bottleneck identification'
      ],
      timesSaved: '60% faster debugging'
    },
    {
      id: 'code-review',
      title: 'Automated Code Review',
      description: 'Get instant feedback on code quality, security vulnerabilities, and best practices.',
      icon: Eye,
      category: 'debugging',
      benefits: [
        'Security vulnerability scanning',
        'Code quality metrics and suggestions',
        'Best practices enforcement',
        'Performance optimization recommendations'
      ],
      timesSaved: '50% faster reviews'
    },
    {
      id: 'learning-assistant',
      title: 'Personalized Learning Path',
      description: 'AI creates custom learning experiences based on your coding patterns and goals.',
      icon: Brain,
      category: 'learning',
      benefits: [
        'Skill gap analysis and recommendations',
        'Interactive coding tutorials',
        'Real-time feedback and guidance',
        'Progress tracking and achievements'
      ],
      timesSaved: '3x faster skill development'
    },
    {
      id: 'documentation',
      title: 'Smart Documentation Generator',
      description: 'Automatically generate comprehensive documentation from your codebase.',
      icon: FileCode,
      category: 'learning',
      benefits: [
        'Auto-generated API documentation',
        'Code comments and explanations',
        'Usage examples and tutorials',
        'Markdown and HTML output formats'
      ],
      timesSaved: '80% less documentation time'
    },
    {
      id: 'project-setup',
      title: 'Instant Project Scaffolding',
      description: 'Generate complete project structures with best practices and configurations.',
      icon: Rocket,
      category: 'productivity',
      benefits: [
        'Framework-specific templates',
        'Pre-configured development environments',
        'CI/CD pipeline setup',
        'Testing framework integration'
      ],
      timesSaved: '90% faster project setup'
    },
    {
      id: 'workflow-automation',
      title: 'Development Workflow Automation',
      description: 'Automate repetitive tasks and optimize your development workflow.',
      icon: Workflow,
      category: 'productivity',
      benefits: [
        'Automated testing and deployment',
        'Code formatting and linting',
        'Git workflow optimization',
        'Custom automation scripts'
      ],
      timesSaved: '40% productivity increase'
    }
  ];

  const features: Feature[] = [
    {
      icon: Cpu,
      title: 'Local AI Models',
      description: 'Run powerful AI models locally with support for Ollama, vLLM, and llama.cpp',
      highlight: 'Complete Privacy'
    },
    {
      icon: Terminal,
      title: 'Integrated Development Environment',
      description: 'Monaco editor, Jupyter notebooks, and terminal all in one workspace',
      highlight: 'All-in-One'
    },
    {
      icon: GitBranch,
      title: 'Version Control Integration',
      description: 'Seamless Git integration with AI-powered commit messages and branch management',
      highlight: 'Smart Git'
    },
    {
      icon: Database,
      title: 'Database Integration',
      description: 'Connect to any database with AI-assisted query generation and optimization',
      highlight: 'Universal Support'
    },
    {
      icon: Lock,
      title: 'Enterprise Security',
      description: 'Military-grade encryption with SOC 2 compliance and audit trails',
      highlight: 'Bank-Level Security'
    },
    {
      icon: Zap,
      title: 'Lightning Performance',
      description: 'Optimized for speed with local processing and efficient resource management',
      highlight: 'Ultra-Fast'
    }
  ];

  const filteredUseCases = useCases.filter(useCase => useCase.category === activeTab);

  return (
    <SiteLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_50%)]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl">
                <Code2 className="w-8 h-8 text-green-400" />
              </div>
              <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border-green-500/30">
                For Developers
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              Code Faster with{' '}
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                AI Superpowers
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-8">
              The ultimate development environment that amplifies your coding abilities. 
              Write better code, debug faster, and ship with confidence - all while keeping your data private.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">t Coding for Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <VideoDialog 
                triggerText="Watch Demo" 
                triggerClassName="border-slate-600 text-white hover:bg-slate-800"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Use Cases with Tabs */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Accelerate Every Aspect of Development
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              From writing code to shipping products, discover how AI-powered assistance 
              transforms your development workflow.
            </p>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-12 bg-slate-800/50">
              <TabsTrigger value="coding" className="data-[state=active]:bg-green-500/20">
                Coding
              </TabsTrigger>
              <TabsTrigger value="debugging" className="data-[state=active]:bg-green-500/20">
                Debugging
              </TabsTrigger>
              <TabsTrigger value="learning" className="data-[state=active]:bg-green-500/20">
                Learning
              </TabsTrigger>
              <TabsTrigger value="productivity" className="data-[state=active]:bg-green-500/20">
                Productivity
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              <div className="grid md:grid-cols-2 gap-8">
                {filteredUseCases.map((useCase, index) => (
                  <motion.div
                    key={useCase.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="group"
                  >
                    <Card className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border-slate-700/40 hover:border-green-500/50 transition-all duration-300 h-full group-hover:scale-105">
                      <CardHeader>
                        <div className="flex items-start gap-4 mb-4">
                          <div className="p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl">
                            <useCase.icon className="w-6 h-6 text-green-400" />
                          </div>
                          <div className="flex-1">
                            <Badge className="mb-2 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                              {useCase.timesSaved}
                            </Badge>
                            <CardTitle className="text-white text-xl mb-2">
                              {useCase.title}
                            </CardTitle>
                            <CardDescription className="text-gray-300">
                              {useCase.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {useCase.benefits.map((benefit, benefitIndex) => (
                            <li key={benefitIndex} className="flex items-center gap-3 text-sm text-gray-300">
                              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
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

      {/* Core Features */}
      <section className="py-20 px-6 bg-slate-900/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              A comprehensive development environment designed specifically for individual developers 
              who demand the best tools and complete privacy.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <Card className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border-slate-700/40 hover:border-green-500/50 transition-all duration-300 h-full group-hover:scale-105">
                  <CardHeader className="text-center">
                    <div className="mx-auto p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl mb-4 w-fit">
                      <feature.icon className="w-8 h-8 text-green-400" />
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

      {/* Pricing for Developers */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Simple, Developer-Friendly Pricing
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">t free and scale as you grow. No hidden fees, no vendor lock-in.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Free',
                price: '$0',
                period: 'forever',
                description: 'Perfect for trying out OmniPanel and small projects',
                features: [
                  'Basic AI code assistance',
                  'Local model support',
                  '5 projects',
                  'Community support'
                ],
                highlight: false,
                buttonText: 'Getted Free'
              },
              {
                name: 'Pro',
                price: '$19',
                period: 'per month',
                description: 'Advanced features for professional developers',
                features: [
                  'Advanced AI models',
                  'Unlimited projects',
                  'Priority support',
                  'Advanced debugging tools',
                  'Custom AI model deployment',
                  'Advanced analytics'
                ],
                highlight: true,
                buttonText: 't Free Trial'
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                period: 'contact sales',
                description: 'For developers working on enterprise projects',
                features: [
                  'Everything in Pro',
                  'On-premises deployment',
                  'Custom integrations',
                  'Dedicated support',
                  'SLA guarantees',
                  'Advanced security'
                ],
                highlight: false,
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
                <Card className={`bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm transition-all duration-300 h-full group-hover:scale-105 flex flex-col ${
                  plan.highlight 
                    ? 'border-green-500/50 ring-1 ring-green-500/20' 
                    : 'border-slate-700/40 hover:border-green-500/50'
                }`}>
                  <CardHeader className="text-center flex-shrink-0">
                    {plan.highlight && (
                      <Badge className="mx-auto mb-4 bg-green-500/20 text-green-400 border-green-500/30">
                        Most Popular
                      </Badge>
                    )}
                    <CardTitle className="text-white text-2xl mb-4">
                      {plan.name}
                    </CardTitle>
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
                  <CardContent className="flex flex-col flex-grow">
                    <ul className="space-y-3 mb-6 flex-grow">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-3 text-sm text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full mt-auto ${
                        plan.highlight 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' 
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
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 backdrop-blur-sm">
              <CardContent className="p-12">
                <Rocket className="w-16 h-16 text-green-400 mx-auto mb-6" />
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Supercharge Your Development?
                </h2>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  Join thousands of developers who have transformed their coding experience with OmniPanel.t building better software today.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">t Free Trial
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
                    View Documentation
                    <FileCode className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                <div className="mt-6 text-sm text-gray-400">
                  ✓ Free forever plan  ✓ No credit card required  ✓ Setup in under 2 minutes
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

export default DevelopersPage; 
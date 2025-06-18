// app/features/page.tsx
// Comprehensive Features page with detailed descriptions and comparison section

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Code, 
  Lock, 
  Monitor,
  GitBranch,
  Users,
  BarChart3,
  CheckCircle,
  X,
  ArrowRight,
  Star,
  Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VideoDialog } from '@/components/VideoDialog';
import { SiteLayout } from '@/components/site-layout';
import { BorderBeam } from '@/components/magicui/border-beam';
import { AuroraText } from '@/components/magicui/aurora-text';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'privacy' | 'development' | 'collaboration' | 'security';
  benefits: string[];
  availability: 'available' | 'coming-soon' | 'beta';
}

interface ComparisonItem {
  feature: string;
  omnipanel: boolean | string;
  github_copilot: boolean | string;
  chatgpt: boolean | string;
  claude: boolean | string;
}

const FeaturesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const features: Feature[] = [
    {
      id: 'ai-guardian',
      title: 'AI Guardian Technology',
      description: 'Revolutionary real-time security scanning and privacy compliance verification for your code.',
      icon: Shield,
      category: 'security',
      benefits: [
        'Real-time vulnerability detection',
        'GDPR, HIPAA, SOX compliance checking',
        'Intellectual property protection alerts',
        'Zero false positives with intelligent filtering'
      ],
      availability: 'available'
    },
    {
      id: 'ai-guardian-privacy',
      title: 'AI Guardian Privacy Shield',
      description: 'Advanced AI-powered privacy protection that monitors and secures your development environment in real-time.',
      icon: Shield,
      category: 'privacy',
      benefits: [
        'Real-time privacy compliance monitoring',
        'Automatic PII detection and redaction',
        'GDPR, HIPAA, and SOX compliance verification',
        'Zero-knowledge architecture with local processing'
      ],
      availability: 'available'
    },
    {
      id: 'local-ai',
      title: 'Complete Local AI Processing',
      description: 'All AI computations happen on your hardware - your code never leaves your control.',
      icon: Cpu,
      category: 'privacy',
      benefits: [
        'Zero data transmission to external servers',
        'Complete offline functionality',
        'Support for multiple AI models (Ollama, vLLM, llama.cpp)',
        'Custom model deployment and fine-tuning'
      ],
      availability: 'available'
    },
    {
      id: 'unified-workspace',
      title: 'Unified Development Environment',
      description: 'Monaco editor, Jupyter notebooks, terminal, and collaboration tools in one interface.',
      icon: Code,
      category: 'development',
      benefits: [
        'Monaco code editor with AI-powered completion',
        'Jupyter-style notebooks with embedded AI assistance',
        'Integrated terminal with intelligent command suggestions',
        'Multi-language support and syntax highlighting'
      ],
      availability: 'available'
    },
    {
      id: 'real-time-collab',
      title: 'Privacy-First Collaboration',
      description: 'Real-time collaboration without compromising your intellectual property.',
      icon: Users,
      category: 'collaboration',
      benefits: [
        'End-to-end encrypted collaboration',
        'Role-based access controls',
        'Private team workspaces',
        'Audit trails and activity logging'
      ],
      availability: 'beta'
    },
    {
      id: 'enterprise-security',
      title: 'Enterprise-Grade Security',
      description: 'Military-grade security features designed for the most sensitive environments.',
      icon: Lock,
      category: 'security',
      benefits: [
        'Air-gapped deployment options',
        'Multi-factor authentication',
        'Comprehensive audit logging',
        'SOC 2 Type II compliance'
      ],
      availability: 'available'
    },
    {
      id: 'cross-platform',
      title: 'Cross-Platform Applications',
      description: 'Native desktop and mobile applications for seamless development anywhere.',
      icon: Monitor,
      category: 'development',
      benefits: [
        'Windows, macOS, and Linux desktop apps',
        'iOS and Android mobile applications',
        'Synchronized projects and settings',
        'Offline-first architecture'
      ],
      availability: 'coming-soon'
    },
    {
      id: 'advanced-analytics',
      title: 'Development Analytics',
      description: 'Comprehensive insights into your development patterns and productivity.',
      icon: BarChart3,
      category: 'development',
      benefits: [
        'Code quality metrics and trends',
        'Productivity analytics and insights',
        'Security vulnerability tracking',
        'Team performance dashboards'
      ],
      availability: 'beta'
    },
    {
      id: 'api-integrations',
      title: 'Extensive API Integrations',
      description: 'Connect with your existing tools and workflows seamlessly.',
      icon: GitBranch,
      category: 'development',
      benefits: [
        'Git repository integrations',
        'CI/CD pipeline connections',
        'Issue tracking system sync',
        'Custom webhook support'
      ],
      availability: 'available'
    }
  ];

  const comparisonData: ComparisonItem[] = [
    {
      feature: 'Local AI Processing',
      omnipanel: true,
      github_copilot: false,
      chatgpt: false,
      claude: false
    },
    {
      feature: 'Zero Data Transmission',
      omnipanel: true,
      github_copilot: false,
      chatgpt: false,
      claude: false
    },
    {
      feature: 'Real-time Security Scanning',
      omnipanel: true,
      github_copilot: false,
      chatgpt: false,
      claude: false
    },
    {
      feature: 'IP Protection Guarantees',
      omnipanel: true,
      github_copilot: false,
      chatgpt: false,
      claude: false
    },
    {
      feature: 'GDPR/HIPAA Compliance',
      omnipanel: true,
      github_copilot: 'Limited',
      chatgpt: 'Limited',
      claude: 'Limited'
    },
    {
      feature: 'Air-Gapped Deployment',
      omnipanel: true,
      github_copilot: false,
      chatgpt: false,
      claude: false
    },
    {
      feature: 'Custom Model Support',
      omnipanel: true,
      github_copilot: false,
      chatgpt: false,
      claude: false
    },
    {
      feature: 'Lifetime License Option',
      omnipanel: true,
      github_copilot: false,
      chatgpt: false,
      claude: false
    },
    {
      feature: 'Multi-Language Support',
      omnipanel: true,
      github_copilot: true,
      chatgpt: true,
      claude: true
    },
    {
      feature: 'Code Completion',
      omnipanel: true,
      github_copilot: true,
      chatgpt: true,
      claude: true
    },
    {
      feature: 'Enterprise Support',
      omnipanel: true,
      github_copilot: true,
      chatgpt: 'Limited',
      claude: 'Limited'
    },
    {
      feature: 'Monthly Subscription Cost',
      omnipanel: '$0 (Lifetime)',
      github_copilot: '$10/month',
      chatgpt: '$20/month',
      claude: '$20/month'
    }
  ];

  const filteredFeatures = activeTab === 'all' 
    ? features 
    : features.filter(feature => feature.category === activeTab);

  const getAvailabilityBadge = (availability: Feature['availability']) => {
    switch (availability) {
      case 'available':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Available</Badge>;
      case 'beta':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Beta</Badge>;
      case 'coming-soon':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Coming Soon</Badge>;
    }
  };

  const renderComparisonCell = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <CheckCircle className="w-5 h-5 text-green-400 mx-auto" />
      ) : (
        <X className="w-5 h-5 text-red-400 mx-auto" />
      );
    }
    return <span className="text-sm text-gray-300">{value}</span>;
  };

  return (
    <SiteLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl">
                <Star className="w-8 h-8 text-blue-400" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white">
                Features
              </h1>
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Discover the revolutionary features that make OmniPanel the world's first 
              privacy-first AI development workspace. Built for developers who refuse to 
              compromise on security and intellectual property protection.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                Try OmniPanel Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <VideoDialog triggerText="Watch Demo" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
              <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 border border-slate-700">
                <TabsTrigger value="all" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
                  All Features
                </TabsTrigger>
                <TabsTrigger value="privacy" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
                  Privacy
                </TabsTrigger>
                <TabsTrigger value="development" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
                  Development
                </TabsTrigger>
                <TabsTrigger value="security" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
                  Security
                </TabsTrigger>
                <TabsTrigger value="collaboration" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
                  Collaboration
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredFeatures.map((feature, index) => (
                    <motion.div
                      key={feature.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card className="relative bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border-slate-700/40 hover:border-blue-500/50 transition-all duration-300 h-full flex flex-col overflow-hidden">
                        <BorderBeam
                          size={80}
                          duration={12 + index * 2}
                          delay={index * 0.5}
                          colorFrom={feature.category === 'privacy' ? '#10b981' : 
                                   feature.category === 'security' ? '#f59e0b' :
                                   feature.category === 'development' ? '#3b82f6' : '#8b5cf6'}
                          colorTo={feature.category === 'privacy' ? '#06b6d4' : 
                                 feature.category === 'security' ? '#ef4444' :
                                 feature.category === 'development' ? '#6366f1' : '#a855f7'}
                        />
                        <CardHeader className="flex-shrink-0">
                          <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl">
                              <feature.icon className="w-6 h-6 text-blue-400" />
                            </div>
                            {getAvailabilityBadge(feature.availability)}
                          </div>
                          <CardTitle className="text-white text-xl mb-2">
                            {feature.title}
                          </CardTitle>
                          <CardDescription className="text-gray-300">
                            {feature.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col flex-grow">
                          <ul className="space-y-2 mb-6 flex-grow">
                            {feature.benefits.map((benefit, idx) => (
                              <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                          <Button 
                            variant="outline" 
                            className="w-full border-slate-600 text-white hover:bg-slate-800 mt-auto"
                            onClick={() => setSelectedFeature(selectedFeature === feature.id ? null : feature.id)}
                          >
                            {selectedFeature === feature.id ? 'Hide Details' : 'Learn More'}
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </section>

      {/* Feature Comparison Section */}
      <section className="py-20 px-6 bg-slate-900/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How <AuroraText className="text-3xl md:text-4xl font-bold" colors={["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981"]}>OmniPanelAI Workspace</AuroraText> Compares
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              See why OmniPanelAI by Cipher Intelligence is the superior choice for privacy-conscious developers 
              and enterprises that value intellectual property protection.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="overflow-x-auto"
          >
            <div className="min-w-[800px] bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/40 rounded-xl overflow-hidden">
              <div className="grid grid-cols-5 bg-slate-800/60 border-b border-slate-700">
                <div className="p-4 font-semibold text-white">Feature</div>
                <div className="p-4 font-semibold text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Shield className="w-5 h-5 text-blue-400" />
                    <span className="text-blue-400">OmniPanel</span>
                  </div>
                </div>
                <div className="p-4 font-semibold text-center text-gray-300">GitHub Copilot</div>
                <div className="p-4 font-semibold text-center text-gray-300">ChatGPT</div>
                <div className="p-4 font-semibold text-center text-gray-300">Claude</div>
              </div>
              
              {comparisonData.map((item, index) => (
                <div 
                  key={index} 
                  className={`grid grid-cols-5 border-b border-slate-700/30 ${
                    index % 2 === 0 ? 'bg-slate-800/20' : 'bg-transparent'
                  }`}
                >
                  <div className="p-4 text-white font-medium">{item.feature}</div>
                  <div className="p-4 text-center">
                    {renderComparisonCell(item.omnipanel)}
                  </div>
                  <div className="p-4 text-center">
                    {renderComparisonCell(item.github_copilot)}
                  </div>
                  <div className="p-4 text-center">
                    {renderComparisonCell(item.chatgpt)}
                  </div>
                  <div className="p-4 text-center">
                    {renderComparisonCell(item.claude)}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Protect Your Code?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of developers who have chosen privacy-first AI development. 
              Start your free trial today and experience the future of secure coding.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
                Schedule Demo
              </Button>
            </div>
            <p className="text-sm text-gray-400 mt-4">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>
    </div>
    </SiteLayout>
  );
};

export default FeaturesPage; 
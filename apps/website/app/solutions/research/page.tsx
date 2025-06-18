// apps/website/app/solutions/research/page.tsx
// Solutions page specifically designed for research institutions and academic organizations

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Microscope, 
  BookOpen, 
  Users, 
  Database, 
  CheckCircle, 
  ArrowRight, 
  Play, 
  Brain, 
  FileText, 
  Share2,
  Globe,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SiteLayout } from '@/components/site-layout';

const ResearchPage: React.FC = () => {
  return (
    <SiteLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.1),transparent_50%)]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-sky-500/20 to-cyan-500/20 rounded-xl">
                <GraduationCap className="w-8 h-8 text-sky-400" />
              </div>
              <Badge className="bg-gradient-to-r from-sky-500/20 to-cyan-500/20 text-sky-400 border-sky-500/30">
                Research & Academia
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              Accelerate{' '}
              <span className="bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
                Research
              </span>{' '}
              with AI
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-8">
              Empower researchers, students, and academic institutions with AI-powered development tools 
              designed for scientific computing, data analysis, and collaborative research.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700">
                Get Academic Pricing
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

      {/* Research Features */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Built for Scientific Discovery
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              From computational research to collaborative projects, OmniPanel provides the tools 
              researchers need to push the boundaries of knowledge.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Microscope,
                title: 'Scientific Computing',
                description: 'Specialized tools for data analysis, machine learning research, and computational modeling.',
                highlight: 'Research-Optimized'
              },
              {
                icon: BookOpen,
                title: 'Jupyter Integration',
                description: 'Native support for Jupyter notebooks with AI-powered cell completion and documentation.',
                highlight: 'Notebook-First'
              },
              {
                icon: Share2,
                title: 'Collaborative Research',
                description: 'Share code, data, and insights with research teams across institutions and disciplines.',
                highlight: 'Global Collaboration'
              },
              {
                icon: Database,
                title: 'Data Pipeline Tools',
                description: 'Build and manage complex data pipelines for large-scale research datasets.',
                highlight: 'Big Data Ready'
              },
              {
                icon: Brain,
                title: 'AI Model Training',
                description: 'Train and deploy machine learning models with built-in GPU acceleration and monitoring.',
                highlight: 'ML-Accelerated'
              },
              {
                icon: FileText,
                title: 'Publication Support',
                description: 'Generate research documentation, papers, and reproducible code for publications.',
                highlight: 'Publication-Ready'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <Card className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border-slate-700/40 hover:border-sky-500/50 transition-all duration-300 h-full group-hover:scale-105">
                  <CardHeader className="text-center">
                    <div className="mx-auto p-4 bg-gradient-to-r from-sky-500/20 to-cyan-500/20 rounded-xl mb-4 w-fit">
                      <feature.icon className="w-8 h-8 text-sky-400" />
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

      {/* Academic Benefits */}
      <section className="py-20 px-6 bg-slate-900/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Academic & Research Benefits
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Special programs and features designed specifically for the academic and research community.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Academic Programs</h3>
              <div className="space-y-4">
                {[
                  'Free access for students and educators',
                  'Discounted pricing for research institutions',
                  'Grant funding assistance and support',
                  'Academic conference sponsorships',
                  'Research collaboration opportunities',
                  'Open source project contributions'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-sky-400" />
                    <span className="text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Research Support</h3>
              <div className="space-y-4">
                {[
                  'Dedicated research computing resources',
                  'High-performance computing integration',
                  'Research data management and sharing',
                  'Reproducible research environments',
                  'Citation and attribution tracking',
                  'Academic publishing workflow integration'
                ].map((support, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Microscope className="w-5 h-5 text-sky-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{support}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Research Use Cases */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Research Use Cases
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover how researchers across disciplines are using OmniPanel to accelerate discovery and innovation.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'Computational Biology',
                description: 'Genomics analysis, protein folding, and bioinformatics workflows',
                icon: Microscope,
                examples: ['Genome sequencing pipelines', 'Protein structure prediction', 'Drug discovery simulations']
              },
              {
                title: 'Climate Science',
                description: 'Climate modeling, data analysis, and environmental research',
                icon: Globe,
                examples: ['Weather prediction models', 'Carbon cycle analysis', 'Climate change simulations']
              },
              {
                title: 'Machine Learning',
                description: 'AI research, model development, and algorithmic innovation',
                icon: Brain,
                examples: ['Neural architecture search', 'Reinforcement learning', 'Computer vision research']
              },
              {
                title: 'Social Sciences',
                description: 'Data analysis, survey research, and behavioral studies',
                icon: Users,
                examples: ['Survey data analysis', 'Social network analysis', 'Behavioral modeling']
              }
            ].map((useCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <Card className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border-slate-700/40 hover:border-sky-500/50 transition-all duration-300 h-full group-hover:scale-105">
                  <CardHeader className="text-center">
                    <div className="mx-auto p-3 bg-gradient-to-r from-sky-500/20 to-cyan-500/20 rounded-xl mb-4 w-fit">
                      <useCase.icon className="w-6 h-6 text-sky-400" />
                    </div>
                    <CardTitle className="text-white text-lg mb-2">
                      {useCase.title}
                    </CardTitle>
                    <CardDescription className="text-gray-300 mb-4">
                      {useCase.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {useCase.examples.map((example, exampleIndex) => (
                        <li key={exampleIndex} className="flex items-center gap-3 text-sm text-gray-300">
                          <CheckCircle className="w-3 h-3 text-sky-400 flex-shrink-0" />
                          {example}
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

      {/* Academic Pricing */}
      <section className="py-20 px-6 bg-slate-900/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Academic Pricing
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Special pricing designed for educational institutions, researchers, and students.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Student',
                price: 'Free',
                period: 'always',
                description: 'For students and individual researchers',
                features: [
                  'Full access to all features',
                  'Unlimited personal projects',
                  'Community support',
                  'Educational resources'
                ],
                highlight: false,
                buttonText: 'Get Student Access'
              },
              {
                name: 'Academic',
                price: '$99',
                period: 'per month per lab',
                description: 'For research labs and small academic teams',
                features: [
                  'Everything in Student',
                  'Team collaboration features',
                  'Priority support',
                  'Advanced analytics',
                  'Research publication tools',
                  'Grant application assistance'
                ],
                highlight: true,
                buttonText: 'Contact Academic Sales'
              },
              {
                name: 'Institution',
                price: 'Custom',
                period: 'enterprise pricing',
                description: 'For universities and research institutions',
                features: [
                  'Everything in Academic',
                  'Campus-wide deployment',
                  'Custom integrations',
                  'Dedicated support',
                  'Training and workshops',
                  'Research collaboration platform'
                ],
                highlight: false,
                buttonText: 'Contact Enterprise'
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
                    ? 'border-sky-500/50 ring-1 ring-sky-500/20' 
                    : 'border-slate-700/40 hover:border-sky-500/50'
                }`}>
                  <CardHeader className="text-center">
                    {plan.highlight && (
                      <Badge className="mx-auto mb-4 bg-sky-500/20 text-sky-400 border-sky-500/30">
                        Most Popular
                      </Badge>
                    )}
                    <CardTitle className="text-white text-2xl mb-4">
                      {plan.name}
                    </CardTitle>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
                      {plan.price !== 'Custom' && plan.price !== 'Free' && (
                        <span className="text-gray-400 ml-2">/{plan.period}</span>
                      )}
                      {(plan.price === 'Custom' || plan.price === 'Free') && (
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
                          <CheckCircle className="w-4 h-4 text-sky-400 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full ${
                        plan.highlight 
                          ? 'bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700' 
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
            <Card className="bg-gradient-to-br from-sky-500/10 to-cyan-500/10 border-sky-500/20 backdrop-blur-sm">
              <CardContent className="p-12">
                <GraduationCap className="w-16 h-16 text-sky-400 mx-auto mb-6" />
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Accelerate Your Research?
                </h2>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  Join thousands of researchers who have transformed their workflows with OmniPanel.t your free academic account today.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button size="lg" className="bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700">
                    Get Academic Access
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
                    Schedule Research Demo
                    <Microscope className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                <div className="mt-6 text-sm text-gray-400">
                  ✓ Free for students  ✓ Special academic pricing  ✓ Research support included
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

export default ResearchPage; 
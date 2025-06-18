'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Shield, 
  BookOpen, 
  Download, 
  ExternalLink, 
  Lock, 
  Users,
  Code,
  Globe,
  AlertTriangle
} from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'whitepaper' | 'guide' | 'documentation' | 'case-study' | 'report';
  category: 'security' | 'privacy' | 'compliance' | 'development' | 'enterprise';
  icon: React.ReactNode;
  downloadUrl?: string;
  readTime: string;
  featured: boolean;
  tags: string[];
  color: string;
}

const resources: Resource[] = [
  {
    id: 'security-whitepaper',
    title: 'Local-First AI Security Architecture',
    description: 'Comprehensive analysis of our zero-transmission security model and how it protects your intellectual property.',
    type: 'whitepaper',
    category: 'security',
    icon: <Shield className="w-6 h-6" />,
    downloadUrl: '/resources/security-architecture-whitepaper.pdf',
    readTime: '12 min read',
    featured: true,
    tags: ['Security', 'Architecture', 'AI Safety'],
    color: 'text-blue-400'
  },
  {
    id: 'privacy-guide',
    title: 'GDPR Compliance for AI Development',
    description: 'Step-by-step guide to maintaining GDPR compliance while using AI tools in your development workflow.',
    type: 'guide',
    category: 'privacy',
    icon: <Lock className="w-6 h-6" />,
    downloadUrl: '/resources/gdpr-compliance-guide.pdf',
    readTime: '8 min read',
    featured: true,
    tags: ['GDPR', 'Privacy', 'Compliance'],
    color: 'text-green-400'
  },
  {
    id: 'enterprise-security',
    title: 'Enterprise Security Best Practices',
    description: 'Security recommendations for enterprise teams adopting AI-powered development tools.',
    type: 'report',
    category: 'enterprise',
    icon: <Users className="w-6 h-6" />,
    downloadUrl: '/resources/enterprise-security-practices.pdf',
    readTime: '15 min read',
    featured: true,
    tags: ['Enterprise', 'Security', 'Teams'],
    color: 'text-purple-400'
  },
  {
    id: 'api-documentation',
    title: 'OmniPanel API Documentation',
    description: 'Complete API reference for integrating OmniPanel into your existing development workflow.',
    type: 'documentation',
    category: 'development',
    icon: <Code className="w-6 h-6" />,
    downloadUrl: '/docs/api',
    readTime: '5 min read',
    featured: false,
    tags: ['API', 'Integration', 'Development'],
    color: 'text-cyan-400'
  },
  {
    id: 'threat-landscape',
    title: '2025 AI Security Threat Landscape',
    description: 'Analysis of emerging security threats in AI development and how to protect against them.',
    type: 'report',
    category: 'security',
    icon: <AlertTriangle className="w-6 h-6" />,
    downloadUrl: '/resources/ai-threat-landscape-2025.pdf',
    readTime: '20 min read',
    featured: true,
    tags: ['Threats', 'Security', 'Analysis'],
    color: 'text-red-400'
  },
  {
    id: 'compliance-checklist',
    title: 'SOC 2 Compliance Checklist',
    description: 'Essential checklist for achieving SOC 2 Type II compliance in AI-powered development environments.',
    type: 'guide',
    category: 'compliance',
    icon: <FileText className="w-6 h-6" />,
    downloadUrl: '/resources/soc2-compliance-checklist.pdf',
    readTime: '10 min read',
    featured: false,
    tags: ['SOC 2', 'Compliance', 'Audit'],
    color: 'text-yellow-400'
  }
];

const typeLabels = {
  whitepaper: 'Whitepaper',
  guide: 'Guide',
  documentation: 'Docs',
  'case-study': 'Case Study',
  report: 'Report'
};

const categoryColors = {
  security: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  privacy: 'bg-green-500/20 text-green-400 border-green-500/30',
  compliance: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  development: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  enterprise: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
};

export function ResourcesCarousel() {
  const [emblaRef] = useEmblaCarousel(
    { 
      loop: true,
      align: 'start',
      skipSnaps: false,
      dragFree: true
    },
    [Autoplay({ delay: 4000, stopOnInteraction: true })]
  );

  const handleDownload = (resource: Resource) => {
    if (resource.downloadUrl) {
      // Track download analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'download', {
          event_category: 'resources',
          event_label: resource.title,
          value: 1
        });
      }
      
      // Open download link
      window.open(resource.downloadUrl, '_blank');
    }
  };

  return (
    <section className="py-24 bg-black">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Security & Privacy Resources
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Stay informed with our comprehensive collection of security guides, compliance documentation, 
            and industry reports designed for privacy-conscious developers.
          </p>
        </motion.div>

        {/* Carousel Container */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="overflow-hidden"
          ref={emblaRef}
        >
          <div className="flex gap-6">
            {resources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex-none w-80"
              >
                <Card className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 h-full">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg bg-gray-800/50 ${resource.color}`}>
                        {resource.icon}
                      </div>
                      {resource.featured && (
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          Featured
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Badge 
                        variant="outline" 
                        className={categoryColors[resource.category]}
                      >
                        {resource.category.charAt(0).toUpperCase() + resource.category.slice(1)}
                      </Badge>
                      <Badge variant="outline" className="text-gray-400 border-gray-600">
                        {typeLabels[resource.type]}
                      </Badge>
                    </div>

                    <CardTitle className="text-white text-lg leading-tight mb-2">
                      {resource.title}
                    </CardTitle>
                    <CardDescription className="text-gray-300 text-sm leading-relaxed">
                      {resource.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-1 mb-4">
                      {resource.tags.map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="outline" 
                          className="text-xs text-gray-400 border-gray-700 bg-gray-800/30"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-400">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {resource.readTime}
                      </div>
                      
                      <Button
                        onClick={() => handleDownload(resource)}
                        variant="outline"
                        size="sm"
                        className="bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50"
                      >
                        {resource.type === 'documentation' ? (
                          <>
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* View All Resources CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button
            variant="outline"
            size="lg"
            className="bg-gray-900/50 border-gray-700 text-white hover:bg-gray-800/50 hover:border-gray-600"
          >
            <Globe className="w-5 h-5 mr-2" />
            View All Resources
          </Button>
        </motion.div>
      </div>
    </section>
  );
} 
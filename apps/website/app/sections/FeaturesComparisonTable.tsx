// FeaturesComparisonTable.tsx - Redesigned with modern UI and enhanced performance
'use client';

import React, { useState, useRef, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, X, Star, Crown, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Enhanced TypeScript interfaces with better typing
export interface ComparisonFeature {
  id: string;
  name: string;
  category: 'core' | 'security' | 'collaboration' | 'enterprise' | 'development';
  description?: string;
  omnipanelai: boolean | string;
  copilot: boolean | string;
  cursor: boolean | string;
  chatgpt: boolean | string;
  priority: 'high' | 'medium' | 'low';
}

export interface ComparisonPlatform {
  id: string;
  name: string;
  displayName: string;
  logo?: string;
  highlighted?: boolean;
  tagline?: string;
  color: string;
}

// Comprehensive feature data with enhanced structure
export const comparisonFeatures: ComparisonFeature[] = [
  // Core Features
  {
    id: 'unlimited-ai',
    name: 'Unlimited AI Usage',
    category: 'core',
    description: 'Use AI features without limits or token restrictions',
    omnipanelai: true,
    copilot: false,
    cursor: false,
    chatgpt: false,
    priority: 'high'
  },
  {
    id: 'lifetime-access',
    name: 'Lifetime Access',
    category: 'core',
    description: 'One-time purchase with permanent access',
    omnipanelai: true,
    copilot: false,
    cursor: false,
    chatgpt: false,
    priority: 'high'
  },
  {
    id: 'vscode-integration',
    name: 'VS Code Integration',
    category: 'development',
    description: 'Native integration with Visual Studio Code',
    omnipanelai: true,
    copilot: true,
    cursor: true,
    chatgpt: true,
    priority: 'high'
  },
  {
    id: 'custom-ai-models',
    name: 'Custom AI Models',
    category: 'core',
    description: 'Support for custom and local AI models',
    omnipanelai: true,
    copilot: false,
    cursor: false,
    chatgpt: false,
    priority: 'high'
  },
  {
    id: 'multi-provider-ai',
    name: 'Multi-Provider AI',
    category: 'core',
    description: 'Support for multiple AI providers and models',
    omnipanelai: '9 providers',
    copilot: 'OpenAI only',
    cursor: 'Limited',
    chatgpt: 'OpenAI only',
    priority: 'high'
  },
  
  // Security Features
  {
    id: 'no-data-harvesting',
    name: 'No Data Harvesting',
    category: 'security',
    description: 'Your code and data stay completely private',
    omnipanelai: true,
    copilot: false,
    cursor: false,
    chatgpt: false,
    priority: 'high'
  },
  {
    id: 'local-ai-execution',
    name: 'Local AI Execution',
    category: 'security',
    description: 'AI models run locally on your machine',
    omnipanelai: true,
    copilot: false,
    cursor: false,
    chatgpt: false,
    priority: 'high'
  },
  {
    id: 'privacy-protection',
    name: 'Privacy Protection',
    category: 'security',
    description: 'Complete privacy with no external data transmission',
    omnipanelai: true,
    copilot: false,
    cursor: false,
    chatgpt: false,
    priority: 'high'
  },
  {
    id: 'air-gap-deployment',
    name: 'Air-Gap Deployment',
    category: 'security',
    description: 'Deploy in completely isolated environments',
    omnipanelai: true,
    copilot: false,
    cursor: false,
    chatgpt: false,
    priority: 'medium'
  },
  {
    id: 'compliance-ready',
    name: 'Compliance Ready',
    category: 'security',
    description: 'SOC 2, GDPR, and enterprise compliance features',
    omnipanelai: true,
    copilot: 'Limited',
    cursor: false,
    chatgpt: false,
    priority: 'medium'
  },

  // Collaboration Features
  {
    id: 'team-collaboration',
    name: 'Team Collaboration',
    category: 'collaboration',
    description: 'Real-time collaboration and sharing features',
    omnipanelai: 'Coming Soon',
    copilot: false,
    cursor: true,
    chatgpt: false,
    priority: 'medium'
  },
  {
    id: 'enterprise-features',
    name: 'Enterprise Team Features',
    category: 'enterprise',
    description: 'Advanced team management and enterprise controls',
    omnipanelai: true,
    copilot: false,
    cursor: false,
    chatgpt: false,
    priority: 'medium'
  },

  // Development Features
  {
    id: 'self-hosting',
    name: 'Self-Hosting',
    category: 'enterprise',
    description: 'Host on your own infrastructure',
    omnipanelai: true,
    copilot: false,
    cursor: false,
    chatgpt: false,
    priority: 'medium'
  },
  {
    id: 'open-source',
    name: 'Open Source',
    category: 'development',
    description: 'Transparency and community contributions',
    omnipanelai: 'Partial',
    copilot: false,
    cursor: false,
    chatgpt: false,
    priority: 'low'
  },
  {
    id: 'notebook-support',
    name: 'Notebook Support',
    category: 'development',
    description: 'Jupyter notebook integration and support',
    omnipanelai: true,
    copilot: false,
    cursor: false,
    chatgpt: false,
    priority: 'medium'
  },
  {
    id: 'terminal-integration',
    name: 'Terminal Integration',
    category: 'development',
    description: 'Built-in terminal with AI assistance',
    omnipanelai: true,
    copilot: false,
    cursor: false,
    chatgpt: false,
    priority: 'medium'
  },
  {
    id: 'ai-security-scanning',
    name: 'AI Security Scanning',
    category: 'security',
    description: 'Automated security vulnerability detection',
    omnipanelai: true,
    copilot: false,
    cursor: false,
    chatgpt: false,
    priority: 'medium'
  },
  {
    id: 'support-24-7',
    name: '24/7 Support',
    category: 'enterprise',
    description: 'Round-the-clock customer support',
    omnipanelai: true,
    copilot: false,
    cursor: false,
    chatgpt: false,
    priority: 'low'
  }
];

export const comparisonPlatforms: ComparisonPlatform[] = [
  {
    id: 'omnipanelai',
    name: 'omnipanelai',
    displayName: 'OmniPanel',
    highlighted: true,
    tagline: 'AI-Powered Development Platform',
    color: 'from-blue-500 to-purple-600'
  },
  {
    id: 'copilot',
    name: 'copilot',
    displayName: 'GitHub Copilot',
    tagline: 'AI Pair Programmer',
    color: 'from-gray-600 to-gray-700'
  },
  {
    id: 'cursor',
    name: 'cursor',
    displayName: 'Cursor',
    tagline: 'AI Code Editor',
    color: 'from-gray-600 to-gray-700'
  },
  {
    id: 'chatgpt',
    name: 'chatgpt',
    displayName: 'ChatGPT',
    tagline: 'AI Assistant',
    color: 'from-gray-600 to-gray-700'
  }
];

// Optimized cell renderer with proper TypeScript typing
const FeatureCell: React.FC<{ 
  value: boolean | string; 
  isHighlighted?: boolean;
}> = ({ value, isHighlighted = false }) => {
  const getCellContent = () => {
    if (typeof value === 'boolean') {
      return value ? (
        <div className="flex items-center justify-center">
          <Check className={cn(
            "w-5 h-5",
            isHighlighted ? "text-green-400" : "text-green-500"
          )} />
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <X className="text-red-400 w-5 h-5" />
        </div>
      );
    }
    
    return (
      <div className="flex items-center justify-center">
        <Badge 
          variant="secondary" 
          className={cn(
            "text-xs font-medium",
            isHighlighted ? "bg-yellow-500/20 text-yellow-400" : "bg-gray-500/20 text-gray-400"
          )}
        >
          {value}
        </Badge>
      </div>
    );
  };

  return (
    <div className={cn(
      "p-4 text-center",
      isHighlighted && "bg-blue-500/5"
    )}>
      {getCellContent()}
    </div>
  );
};

// Category filter component
const CategoryFilter: React.FC<{
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}> = ({ categories, activeCategory, onCategoryChange }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6 justify-center">
      {categories.map((category) => (
        <Button
          key={category}
          variant={activeCategory === category ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(category)}
          className={cn(
            "transition-all duration-200",
            activeCategory === category 
              ? "bg-blue-500 hover:bg-blue-600" 
              : "hover:bg-slate-800"
          )}
        >
          {category === 'all' ? 'All Features' : category.charAt(0).toUpperCase() + category.slice(1)}
        </Button>
      ))}
    </div>
  );
};

export interface FeaturesComparisonTableProps {
  heading?: string;
  description?: string;
  features?: ComparisonFeature[];
  platforms?: ComparisonPlatform[];
  showCategoryFilter?: boolean;
  showDescription?: boolean;
  maxHeight?: string;
}

export default function FeaturesComparisonTable({
  heading = 'Feature Comparison',
  description = 'See how OmniPanel compares to other AI development tools',
  features = comparisonFeatures,
  platforms = comparisonPlatforms,
  showCategoryFilter = true,
  showDescription = true,
  maxHeight = "600px"
}: FeaturesComparisonTableProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedFeatures, setExpandedFeatures] = useState<Set<string>>(new Set());
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef as React.RefObject<Element>, { once: true, margin: "-100px" });

  // Memoized category list for performance
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(features.map(f => f.category)));
    return ['all', ...uniqueCategories];
  }, [features]);

  // Memoized filtered features for performance
  const filteredFeatures = useMemo(() => {
    if (activeCategory === 'all') return features;
    return features.filter(feature => feature.category === activeCategory);
  }, [features, activeCategory]);

  // Memoized high priority features for performance
  const priorityFeatures = useMemo(() => {
    return filteredFeatures.filter(f => f.priority === 'high');
  }, [filteredFeatures]);

  const toggleFeatureExpansion = (featureId: string) => {
    setExpandedFeatures(prev => {
      const newSet = new Set(prev);
      if (newSet.has(featureId)) {
        newSet.delete(featureId);
      } else {
        newSet.add(featureId);
      }
      return newSet;
    });
  };

      return (
      <section
        ref={sectionRef}
        className="py-20 px-4"
      >
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {heading}
            </h2>
            {showDescription && (
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                {description}
              </p>
            )}
          </motion.div>

          {/* Category Filter */}
          {showCategoryFilter && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <CategoryFilter
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
            </motion.div>
          )}

          {/* Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
          <Card className="bg-slate-900/40 backdrop-blur-sm border-slate-700/40 overflow-hidden">
            <CardHeader className="bg-slate-800/40">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-1">
                  <CardTitle className="text-white text-lg">Features</CardTitle>
                </div>
                {platforms.map((platform) => (
                  <div key={platform.id} className="text-center">
                    <div className={cn(
                      "inline-flex items-center justify-center px-4 py-2 rounded-lg mb-2",
                      platform.highlighted 
                        ? `bg-gradient-to-r ${platform.color}` 
                        : "bg-slate-700/40"
                    )}>
                      <span className={cn(
                        "font-bold text-sm",
                        platform.highlighted ? "text-white" : "text-gray-300"
                      )}>
                        {platform.displayName}
                      </span>
                      {platform.highlighted && (
                        <Crown className="w-4 h-4 ml-2 text-yellow-400" />
                      )}
                    </div>
                    {platform.tagline && (
                      <p className="text-xs text-gray-400">{platform.tagline}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-y-auto" style={{ maxHeight }}>
                {filteredFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                    className={cn(
                      "grid grid-cols-1 md:grid-cols-5 gap-4 border-b border-slate-700/40 hover:bg-slate-800/20 transition-colors",
                      index % 2 === 0 ? "bg-slate-900/20" : "bg-slate-800/20"
                    )}
                  >
                    <div className="p-4 md:col-span-1">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium text-sm">
                            {feature.name}
                          </span>
                          {feature.priority === 'high' && (
                            <Star className="w-3 h-3 text-yellow-400" />
                          )}
                          {feature.description && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFeatureExpansion(feature.id)}
                              className="h-auto p-1 text-gray-400 hover:text-white"
                            >
                              {expandedFeatures.has(feature.id) ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </Button>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs w-fit">
                          {feature.category}
                        </Badge>
                        {expandedFeatures.has(feature.id) && feature.description && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-xs text-gray-400 mt-2"
                          >
                            {feature.description}
                          </motion.p>
                        )}
                      </div>
                    </div>
                    {platforms.map((platform) => (
                                           <FeatureCell
                       key={`${feature.id}-${platform.id}`}
                       value={feature[platform.name as keyof ComparisonFeature] as boolean | string}
                       isHighlighted={platform.highlighted || false}
                     />
                    ))}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8 text-center"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/40 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{filteredFeatures.length}</div>
              <div className="text-sm text-gray-400">Total Features</div>
            </div>
            <div className="bg-slate-800/40 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400">{priorityFeatures.length}</div>
              <div className="text-sm text-gray-400">High Priority</div>
            </div>
            <div className="bg-slate-800/40 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">
                {filteredFeatures.filter(f => f.omnipanelai === true).length}
              </div>
              <div className="text-sm text-gray-400">OmniPanel Advantages</div>
            </div>
            <div className="bg-slate-800/40 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-400">{categories.length - 1}</div>
              <div className="text-sm text-gray-400">Categories</div>
            </div>
          </div>
                 </motion.div>
       </div>
      </section>
    );
}

// apps/website/components/FlipCardGrid.tsx
// Flip card grid component for workspace tools with hover animations

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BorderBeam } from '@/components/magicui/border-beam';
import { 
  CheckCircle, MessageSquare, Terminal, FileText, Brain, Code, Search
} from 'lucide-react';

interface WorkspaceTool {
  name: string;
  category: string;
  icon: any;
  image: string;
  size: string;
  description: string;
  features: string[];
  preview: string;
  previewTitle: string;
  status: string;
}

const workspaceTools: WorkspaceTool[] = [
  {
    name: "AI Chat Interface",
    category: "Communication",
    icon: MessageSquare,
    image: "https://images.unsplash.com/photo-1587560699334-cc4ff634909a?w=400&h=300&fit=crop",
    size: "md:col-span-1",
    description: "Context-aware AI conversations that understand your entire project ecosystem. Chat with your codebase, ask questions about architecture, get suggestions for improvements, and maintain context across all conversations. The AI remembers your project history, coding patterns, and preferences to provide increasingly personalized assistance.",
    features: [
      "Project-wide context understanding",
      "Smart code suggestions & reviews",
      "Real-time collaboration sync",
      "Multi-model AI support (GPT, Claude, Gemini)",
      "Conversation history & memory",
      "Code explanation & documentation"
    ],
    preview: "> How do I optimize this React component?\n< Based on your current codebase, I can see you're using functional components. Here's an optimized version...",
    previewTitle: "AI Assistant",
    status: "Active"
  },
  {
    name: "Monaco Code Editor",
    category: "Development",
    icon: Code,
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop",
    size: "md:col-span-1",
    description: "Advanced code editor powered by Visual Studio Code's Monaco engine with AI-enhanced capabilities. Features intelligent autocomplete, real-time error detection, smart refactoring, and seamless integration with your AI assistant. Supports 100+ programming languages with syntax highlighting and advanced editing features.",
    features: [
      "AI-powered intelligent autocomplete",
      "Real-time error detection & fixes",
      "Smart refactoring suggestions",
      "100+ language support",
      "Git integration & diff viewer",
      "Custom themes & extensions"
    ],
    preview: "function optimizeQuery() {\n  // AI suggests: Use indexes for better performance\n  return db.query.where(conditions)...",
    previewTitle: "Code Editor",
    status: "Active"
  },
  {
    name: "Jupyter Notebooks",
    category: "Analysis",
    icon: FileText,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
    size: "md:col-span-1",
    description: "AI-enhanced interactive notebooks for data analysis, prototyping, and documentation. Seamlessly blend code, visualizations, and markdown with embedded AI assistance. Perfect for data science workflows, API testing, documentation, and rapid prototyping with live code execution and rich output display.",
    features: [
      "Embedded AI code assistance",
      "Live code execution environment",
      "Rich data visualizations",
      "Markdown & LaTeX support",
      "Interactive widgets & plots",
      "Export to multiple formats"
    ],
    preview: "# Data Analysis\nimport pandas as pd\ndf = pd.read_csv('data.csv')\n# AI: Suggests next analysis steps",
    previewTitle: "Notebook",
    status: "Active"
  },
  {
    name: "Smart Terminal",
    category: "Operations",
    icon: Terminal,
    image: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=400&h=300&fit=crop",
    size: "md:col-span-1",
    description: "Intelligent terminal with AI-powered command suggestions, error resolution, and automation capabilities. Get smart command completions, automatic error diagnosis and fixes, script generation, and context-aware suggestions based on your current project and workflow patterns.",
    features: [
      "Smart command suggestions",
      "Automatic error resolution",
      "Script generation & automation",
      "Context-aware completions",
      "Command history & patterns",
      "Multi-shell support (bash, zsh, PowerShell)"
    ],
    preview: "$ npm run build --production\n# AI suggests: --analyze flag for bundle analysis\n✓ Build completed successfully!",
    previewTitle: "Terminal",
    status: "Active"
  },
  {
    name: "Advanced Research",
    category: "Intelligence",
    icon: Search,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
    size: "md:col-span-1",
    description: "Powered by Tavily AI for comprehensive research capabilities. Search the web for the latest technical documentation, code examples, best practices, and solutions. Get real-time access to current information, stack overflow discussions, GitHub repositories, and technical blogs to enhance your development workflow.",
    features: [
      "Real-time web search via Tavily AI",
      "Technical documentation finder",
      "Code example discovery",
      "Best practices research",
      "Stack Overflow integration",
      "Repository & library search"
    ],
    preview: "Search: 'React 18 concurrent features'\n→ Found latest documentation\n→ Code examples from GitHub\n→ Performance benchmarks",
    previewTitle: "Research Assistant",
    status: "Active"
  },
  {
    name: "Context Engine",
    category: "Intelligence",
    icon: Brain,
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop",
    size: "md:col-span-1",
    description: "Central intelligence system that maintains comprehensive project context across all tools and interactions. Understands your codebase structure, development patterns, project goals, and preferences to enable seamless context sharing between chat, editor, notebooks, and terminal for a truly unified experience.",
    features: [
      "Cross-tool context memory",
      "Project understanding & mapping",
      "Development pattern recognition",
      "Smart recommendations engine",
      "Workflow optimization",
      "Preference learning & adaptation"
    ],
    preview: "Context: React + TypeScript project\nCurrent: Authentication module\nSuggestion: Add error boundaries\nPattern: You prefer functional components",
    previewTitle: "Context Engine",
    status: "Learning"
  }
];

export default function FlipCardGrid() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
      {workspaceTools.map((tool, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          className={`relative min-h-[500px] h-auto rounded-2xl border bg-gradient-to-br from-neon-blue/10 to-neon-purple/10 border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl backdrop-blur-sm cursor-pointer overflow-hidden`}
          style={{ perspective: '1000px' }}
          onMouseEnter={() => setHoveredCard(index)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          {/* Border Beam Effect */}
          <BorderBeam
            size={60}
            duration={8}
            delay={index * 0.5}
            colorFrom="#06b6d4"
            colorTo="#8b5cf6"
          />
          {/* Flip Card Container */}
          <div 
            className="relative w-full h-full transition-transform duration-700 ease-in-out"
            style={{ 
              transformStyle: 'preserve-3d',
              transform: hoveredCard === index ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}
          >
            {/* Front Side */}
            <div 
              className="absolute inset-0 flex flex-col"
              style={{ backfaceVisibility: 'hidden' }}
            >
              {/* Tool Image - Full Width */}
              <div className="w-full h-60 mb-0 rounded-t-2xl overflow-hidden bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 relative">
                <img 
                  src={tool.image} 
                  alt={tool.name}
                  className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-300"
                />
                {/* Status Badge */}
                <div className="absolute top-4 right-4 bg-neon-green/20 text-neon-green px-3 py-2 rounded-lg text-sm font-medium border border-neon-green/30 backdrop-blur-sm">
                  {tool.status}
                </div>
              </div>

              {/* Content Container */}
              <div className="flex-1 p-6 flex flex-col">
                {/* Tool Title and Category */}
                <div className="mb-4">
                  <h4 className="text-xl font-bold text-white mb-1">{tool.name}</h4>
                  <p className="text-sm text-gray-400 font-medium">{tool.category}</p>
                </div>

                {/* Key Features */}
                <div className="space-y-2 flex-1">
                  {tool.features.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-neon-green flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Hover Indicator */}
                <div className="text-center text-xs text-gray-500 mt-4 opacity-60">
                  Hover to Learn More
                </div>
              </div>
            </div>

            {/* Back Side */}
            <div 
              className="absolute inset-0 p-6 flex flex-col"
              style={{ 
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <div className="h-full flex flex-col overflow-hidden">
                {/* Tool Header */}
                <div className="flex-shrink-0 mb-4">
                  <h4 className="text-xl font-bold text-white mb-2">{tool.name}</h4>
                  <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
                    {tool.description}
                  </p>
                </div>
                
                {/* Scrollable Features */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 pr-2">
                  <div className="space-y-2">
                    {tool.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-neon-green flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 leading-tight">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mini Preview/Demo */}
                <div className="flex-shrink-0 mt-4">
                  <div className="bg-black/40 rounded-lg p-3 border border-white/10">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-gray-400 ml-2 font-medium">{tool.previewTitle}</span>
                    </div>
                    <div className="text-xs font-mono text-gray-300 leading-tight line-clamp-3">
                      {tool.preview}
                    </div>
                  </div>
                </div>

                {/* Return Indicator */}
                <div className="text-center text-xs text-gray-500 mt-3 opacity-60">
                  Hover to Return
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
} 
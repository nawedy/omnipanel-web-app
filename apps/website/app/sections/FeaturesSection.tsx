// Features Section Component - Conversion Optimized
'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { BentoCard, BentoGrid } from '@/components/magicui/bento-grid';
import { AnimatedBeam } from '@/components/magicui/animated-beam';
import { AuroraText } from '@/components/magicui/aurora-text';
import { AnimatedGradientText } from '@/components/magicui/animated-gradient-text';
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text';
import { Meteors } from '@/components/magicui/meteors';
import { BorderBeam } from '@/components/magicui/border-beam';
import FlipCardGrid from '@/components/FlipCardGrid';
import { 
  Shield, Zap, Lock, Eye, Users, Server, CheckCircle, Download, Globe, AlertTriangle,
  Brain, Gavel, UserCheck, ScrollText, FileSearch
} from 'lucide-react';

export default function FeaturesSection() {
  const containerRef = useRef<HTMLElement | null>(null);
  const fromRef = useRef<HTMLElement | null>(null);
  const toRef = useRef<HTMLElement | null>(null);
  const [activeGuardianTab, setActiveGuardianTab] = useState<'security' | 'privacy' | 'compliance'>('security');

  return (
    <section ref={containerRef} className="relative py-20 bg-gradient-to-b from-black/40 to-black/60 overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <AnimatedBeam
            className="mx-auto mb-6 max-w-lg"
            containerRef={containerRef}
            fromRef={fromRef}
            toRef={toRef}
            gradientStartColor="#6366f1"
            gradientStopColor="#06b6d4"
          />
          <div className="inline-flex items-center px-4 py-2 bg-neon-blue/20 border border-neon-blue/50 rounded-full mb-6">
            <Shield className="w-5 h-5 text-neon-blue mr-2" />
            <span className="text-neon-blue font-medium">Revolutionary AI Protection</span>
          </div>
          <AuroraText className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Stop Feeding Your Code to
            <AnimatedGradientText className="block">Your Competition</AnimatedGradientText>
          </AuroraText>
          <div className="flex items-center justify-center">
            <AnimatedShinyText className="text-xl text-green-500/300 max-w-4xl mx-auto leading-relaxed">
              While others harvest your intellectual property, OmniPanel's AI Guardian provides 
              continuous security scanning and privacy protection in the world's first 
              truly unified development workspace.
            </AnimatedShinyText>
          </div>
          {/* Crisis Timeline */}
          <div className="mt-8 p-6 bg-red-500/10 border border-red-500/20 rounded-xl max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-4 text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <span className="font-bold text-lg">72 Hours Remaining</span>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <p className="text-red-300 mt-2">
              Save this privacy solution before it disappears forever
            </p>
          </div>
        </motion.div>

        {/* Unified Workspace Tools - Flip Card Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-neon-purple/20 border border-neon-purple/50 rounded-full mb-6">
              <Brain className="w-5 h-5 text-neon-purple mr-2" />
              <span className="text-neon-purple font-medium">Unified AI Development Workspace</span>
            </div>
            <h3 className="text-4xl font-bold text-white mb-4">
              All Your Development Tools, Finally Connected
            </h3>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience seamless context sharing across all development tools with AI-powered intelligence
            </p>
          </div>

          <FlipCardGrid />
        </motion.div>

        {/* AI Guardian Tabbed Interface */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-neon-green/20 border border-neon-green/50 rounded-full mb-6">
              <Shield className="w-5 h-5 text-neon-green mr-2" />
              <span className="text-neon-green font-medium">AI Guardian Technology</span>
            </div>
            <h3 className="text-4xl font-bold text-white mb-4">
              Your Personal AI Cybersecurity Expert
            </h3>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
              Triple protection framework: Privacy, Security, and Compliance monitoring powered by AI that never sleeps
            </p>
          </div>

          <div className="relative p-8 md:p-12 rounded-2xl border bg-gradient-to-br from-neon-green/10 to-neon-blue/10 border-white/10 backdrop-blur-sm">
            <BorderBeam
              size={80}
              duration={12}
              delay={1}
              colorFrom="#10b981"
              colorTo="#06b6d4"
            />
            {/* Guardian Tabs */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {guardianTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveGuardianTab(tab.id)}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    activeGuardianTab === tab.id
                      ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-lg'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                  {tab.id === activeGuardianTab && (
                    <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
                  )}
                </button>
              ))}
            </div>

            {/* Active Tab Content */}
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Left Column - Tab Content */}
              <div>
                {guardianTabs.map((tab) => (
                  activeGuardianTab === tab.id && (
                    <motion.div
                      key={tab.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <h4 className="text-3xl font-bold text-white mb-6">{tab.title}</h4>
                      <p className="text-xl text-gray-300 mb-8 leading-relaxed">{tab.description}</p>
                      
                      <div className="space-y-6">
                        {tab.features.map((feature, index) => (
                          <div key={index} className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-neon-green/30 to-neon-blue/30 rounded-xl flex items-center justify-center flex-shrink-0">
                              <feature.icon className="w-6 h-6 text-neon-green" />
                            </div>
                            <div>
                              <h5 className="text-lg font-bold text-white mb-2">{feature.title}</h5>
                              <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* ROI Metrics */}
                      <div className="mt-8 p-6 bg-gradient-to-br from-neon-yellow/10 to-neon-green/10 rounded-xl border border-neon-green/20">
                        <h5 className="text-lg font-bold text-white mb-4">💰 Financial Impact</h5>
                        <div className="grid md:grid-cols-2 gap-4">
                          {tab.metrics.map((metric, index) => (
                            <div key={index} className="text-center">
                              <div className="text-2xl font-bold text-neon-green mb-1">{metric.value}</div>
                              <div className="text-sm text-gray-300">{metric.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )
                ))}
              </div>

              {/* Right Column - Dashboard Preview */}
              <div className="relative">
                <div className="bg-gradient-to-br from-black/60 to-black/80 rounded-xl p-6 relative overflow-hidden border border-white/10">
                  {/* Dashboard Header */}
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-300 ml-4">
                      AI Guardian - {guardianTabs.find(tab => tab.id === activeGuardianTab)?.name} Dashboard
                    </span>
                  </div>
                  
                  {/* Dynamic Dashboard Content */}
                  {guardianTabs.map((tab) => (
                    activeGuardianTab === tab.id && (
                      <motion.div
                        key={tab.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-4"
                      >
                        {/* Status Indicator */}
                        <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <tab.icon className="w-6 h-6 text-green-400" />
                            <span className="text-green-400 font-medium">{tab.statusMessage}</span>
                          </div>
                          <span className="text-xs text-green-400">✓ ACTIVE</span>
                        </div>
                        
                        {/* Dashboard Metrics */}
                        <div className="grid grid-cols-2 gap-4">
                          {tab.dashboardMetrics.map((metric, index) => (
                            <div key={index} className="p-4 bg-gradient-to-br from-neon-blue/20 to-neon-green/20 rounded-lg border border-white/10">
                              <div className="text-2xl font-bold text-white">{metric.value}</div>
                              <div className="text-sm text-gray-300">{metric.label}</div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Activity Log */}
                        <div className="space-y-2">
                          {tab.activityLog.map((activity, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span className="text-gray-200">{activity}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )
                  ))}
                  
                  {/* Floating Badge */}
                  <div className="absolute -top-4 -right-4 bg-neon-green text-black px-4 py-2 rounded-full text-sm font-bold animate-pulse">
                    REAL-TIME PROTECTION
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Competitive Advantage Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-white mb-4">
              Why Enterprises Choose OmniPanel
            </h3>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              The only AI workspace that provides privacy protection AND intelligent security scanning
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {competitiveAdvantages.map((advantage, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative p-6 text-center rounded-2xl border bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl backdrop-blur-sm"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-neon-blue/30 to-neon-purple/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <advantage.icon className="w-8 h-8 text-neon-blue" />
                </div>
                <h4 className="text-lg font-bold text-white mb-3">{advantage.title}</h4>
                <p className="text-gray-200 text-sm leading-relaxed">{advantage.description}</p>
                <div className="mt-4 text-2xl font-bold text-neon-green">{advantage.metric}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Social Proof Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="relative p-8 md:p-12 rounded-2xl border bg-gradient-to-br from-neon-yellow/20 to-neon-purple/20 border-white/10 transition-all duration-300 backdrop-blur-sm">
            <h3 className="text-3xl font-bold text-white mb-8">
              Join 500+ Developers Fighting for Privacy
            </h3>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-neon-blue mb-2">$25,000</div>
                <div className="text-gray-300">Raised in 72 hours</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-neon-green mb-2">500+</div>
                <div className="text-gray-300">Privacy advocates</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-neon-purple mb-2">78%</div>
                <div className="text-gray-300">Enterprises ban cloud AI</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="py-3 px-6 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-neon-blue to-neon-purple text-white hover:shadow-lg hover:shadow-neon-blue/30">
                Save Your Privacy - Get Started Now
              </button>
              <button className="py-3 px-6 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 flex items-center justify-center">
                <Download className="w-5 h-5 mr-2" />
                Download Whitepaper
              </button>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Meteors Background Effect */}
      <Meteors 
        className="absolute inset-0 w-60px h-60px pointer-events-none z-0" 
        number={6}
        minDelay={1}
        maxDelay={3}
        minDuration={4}
        maxDuration={10}
      />
    </section>
  );
}

// Workspace Tools moved to FlipCardGrid component

// AI Guardian Tabs Data
const guardianTabs = [
  {
    id: 'security' as const,
    name: 'Security',
    title: 'AI-Powered Security Monitoring',
    icon: Shield,
    description: 'Continuous vulnerability detection and real-time threat analysis that prevents security issues before they become costly breaches.',
    statusMessage: 'Security Scan Complete - All Clear',
    features: [
      {
        icon: Eye,
        title: 'Continuous Monitoring',
        description: 'AI never sleeps, constantly scanning every line of code for security vulnerabilities and potential threats in real-time.'
      },
      {
        icon: Zap,
        title: 'Instant Remediation',
        description: 'Get immediate, contextual fixes for security issues with one-click AI-powered solutions and automated patching.'
      },
      {
        icon: FileSearch,
        title: 'Context-Aware Analysis',
        description: 'Intelligent scanning that understands your project structure, business logic, and reduces false positives by 80%.'
      },
      {
        icon: Brain,
        title: 'Adaptive Learning',
        description: 'AI learns your coding patterns and security preferences, improving accuracy and reducing violations by 30% over time.'
      }
    ],
    metrics: [
      { value: '$4.45M', label: 'Average breach cost prevented' },
      { value: '90%', label: 'Vulnerabilities prevented' }
    ],
    dashboardMetrics: [
      { value: '0', label: 'Critical Vulnerabilities' },
      { value: '247', label: 'Files Protected' }
    ],
    activityLog: [
      'No exposed secrets detected',
      'All dependencies scanned and verified',
      'Code patterns analyzed for security risks',
      'Real-time protection active'
    ]
  },
  {
    id: 'privacy' as const,
    name: 'Privacy',
    title: 'Complete Privacy Protection',
    icon: Lock,
    description: 'Your intellectual property never leaves your machine. Local AI execution ensures your innovations stay yours forever.',
    statusMessage: 'Privacy Shield Active - No Data Transmission',
    features: [
      {
        icon: Server,
        title: '100% Local AI Execution',
        description: 'All AI processing happens locally on your machine. Zero data transmission to external servers or cloud services.'
      },
      {
        icon: Shield,
        title: 'Air-Gap Deployment',
        description: 'Deploy in completely isolated environments for classified work and maximum security compliance.'
      },
      {
        icon: Lock,
        title: 'End-to-End Encryption',
        description: 'All project data encrypted at rest and in transit with military-grade security standards.'
      },
      {
        icon: UserCheck,
        title: 'No Training Data Harvest',
        description: 'Your code is never used to train AI models or shared with third parties. Complete intellectual property protection.'
      }
    ],
    metrics: [
      { value: '0%', label: 'Data sharing with external services' },
      { value: '100%', label: 'Local AI model execution' }
    ],
    dashboardMetrics: [
      { value: '0', label: 'External Connections' },
      { value: '100%', label: 'Local Processing' }
    ],
    activityLog: [
      'All AI models running locally',
      'No external data transmission detected',
      'Encryption verified for all project files',
      'Privacy compliance maintained'
    ]
  },
  {
    id: 'compliance' as const,
    name: 'Compliance',
    title: 'Automated Compliance Monitoring',
    icon: Gavel,
    description: 'AI-powered compliance automation for GDPR, CCPA, SOC 2, ISO 27001, and internal policy enforcement.',
    statusMessage: 'Compliance Check Passed - All Regulations Met',
    features: [
      {
        icon: ScrollText,
        title: 'Regulatory Compliance',
        description: 'Automated monitoring and enforcement of GDPR, CCPA, SOC 2, and ISO 27001 requirements with real-time alerts.'
      },
      {
        icon: Gavel,
        title: 'Internal Policy Enforcement',
        description: 'Custom policy creation and enforcement tailored to your organization\'s specific compliance requirements.'
      },
      {
        icon: CheckCircle,
        title: 'Audit Trail Generation',
        description: 'Comprehensive audit logs and compliance reports generated automatically for regulatory inspections.'
      },
      {
        icon: AlertTriangle,
        title: 'Proactive Risk Detection',
        description: 'AI identifies potential compliance violations before they occur, preventing costly penalties and legal issues.'
      }
    ],
    metrics: [
      { value: '$14.8M', label: 'Average compliance penalty avoided' },
      { value: '100%', label: 'Regulatory requirements covered' }
    ],
    dashboardMetrics: [
      { value: '4', label: 'Regulations Monitored' },
      { value: '0', label: 'Violations Detected' }
    ],
    activityLog: [
      'GDPR compliance verified',
      'CCPA requirements satisfied',
      'SOC 2 controls validated',
      'ISO 27001 standards maintained'
    ]
  }
];

// Competitive Advantages Data
const competitiveAdvantages = [
  {
    icon: Server,
    title: "Local AI Execution",
    description: "Complete privacy with local model processing",
    metric: "0% Data Sharing"
  },
  {
    icon: Shield,
    title: "AI Security Scanning", 
    description: "Real-time vulnerability detection and remediation",
    metric: "24/7 Protection"
  },
  {
    icon: Users,
    title: "Enterprise Ready",
    description: "Air-gap deployment and compliance automation",
    metric: "$4.45M Risk Avoided"
  },
  {
    icon: Globe,
    title: "Unified Workspace",
    description: "All tools working together with shared context",
    metric: "80% Time Saved"
  }
];
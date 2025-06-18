'use client';

import React from 'react';
import { SiteLayout } from '@/components/site-layout';
import { TestimonialCard } from '@/components/TestimonialCard';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { Footer } from '@/components/Footer';

import FeaturesSection from './sections/FeaturesSection';
import PricingSection from './sections/PricingSection';
import { testimonials } from '@/data/testimonials';
import HeroVideoDialog from '@/components/magicui/hero-video-dialog';
import { AuroraText } from '@/components/magicui/aurora-text';
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text';
import { motion } from 'framer-motion';
import { Shield, Download, Play, Zap, Lock, Users } from 'lucide-react';

// Features data moved to dedicated data file for consistency
// TODO: Move to @/data/features.ts in Sprint 5

export default function HomePage(): React.JSX.Element {
  return (
    <SiteLayout>
      <main>
        {/* Enhanced Hero Section with Video */}
        <section className="relative py-32 lg:py-40 bg-gradient-to-b from-black/20 to-black/40 overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
            <div className="mx-auto max-w-4xl text-center">
              
              {/* Hero Badge */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center px-4 py-2 bg-neon-blue/10 border border-neon-blue/20 rounded-full mb-8"
              >
                <Shield className="w-5 h-5 text-neon-blue mr-2" />
                <AnimatedShinyText className="text-neon-blue font-medium">
                  🚀 Revolutionary AI Workspace - Privacy First
                </AnimatedShinyText>
              </motion.div>

              {/* Hero Title */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <AuroraText className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                  OmniPanelAI
                </AuroraText>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
                  The AI Workspace That Protects Your Code
                </h2>
              </motion.div>

              {/* Hero Subtitle */}
              <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-20"
              >
                The world's first AI-powered development workspace with built-in security scanning and 100% local execution. 
                Code with confidence, knowing your intellectual property never leaves your machine.
              </motion.p>

              {/* Hero Video */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="mb-20"
              >``
                <HeroVideoDialog
                  videoSrc="/assets/videos/OmniPanelAI-Video.mp4"
                  className="rounded-xl shadow-2xl border border-white/10"
                />
                <p className="text-sm text-gray-400 mt-6">
                  <Play className="w-4 h-4 inline mr-2" />
                  Watch 3-minute product demo - See OmniPanelAI in action
                </p>
              </motion.div>

              {/* Hero CTAs */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
              >
                <button className="btn btn-primary btn-lg bg-neon-blue text-black hover:bg-neon-blue/90 transition-all duration-300 transform hover:scale-105">
                  <Shield className="w-5 h-5 mr-2" />
                  Start Free Trial - $0
                </button>
                <button className="btn btn-outline btn-lg border-white/20 text-white hover:bg-white/10 transition-all duration-300">
                  <Download className="w-5 h-5 mr-2" />
                  Download Security Report
                </button>
              </motion.div>

              {/* Social Proof Stats */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-neon-green mb-2">500+</div>
                  <div className="text-gray-300 text-md">Privacy-First Developers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-neon-blue mb-2">100%</div>
                  <div className="text-gray-300 text-md">Local Model Execution</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-neon-purple mb-2">24/7</div>
                  <div className="text-gray-300 text-md">Security Monitoring</div>
                </div>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="flex flex-wrap justify-center items-center gap-8 mt-16 text-gray-400"
              >
                <div className="flex items-center space-x-2">
                  <Lock className="w-5 h-5 text-neon-green" />
                  <span className="text-md font-bold">GDPR Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-neon-blue" />
                  <span className="text-md font-bold">SOC 2 Ready</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-neon-yellow" />
                  <span className="text-md font-bold">HIPAA Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-neon-yellow" />
                  <span className="text-md font-bold">Real-time Scanning & Monitoring</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-neon-purple" />
                  <span className="text-md font-bold">Enterprise Ready</span>
                </div>
              </motion.div>


            </div>
          </div>
          
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 via-transparent to-neon-purple/5" />
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-neon-blue/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-neon-purple/10 rounded-full blur-3xl" />
        </section>

        {/* Features Section */}
        <FeaturesSection />
        
        {/* Testimonials Section */}
        <section className="py-24 bg-muted/50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                What Our Users Say
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Real feedback from developers and teams using OmniPanel.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard
                  key={testimonial.author}
                  testimonial={testimonial}
                  index={index}
                  inView={true}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <PricingSection />

        {/* Newsletter Signup Section */}
        <NewsletterSignup />

        {/* Footer Section */}
        <Footer />
      </main>
    </SiteLayout>
  );
}

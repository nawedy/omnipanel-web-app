'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { 
  PlayIcon,
  ArrowRightIcon,
  CheckIcon,
  StarIcon,
  ChatBubbleBottomCenterTextIcon,
  CodeBracketIcon,
  CommandLineIcon,
  DocumentTextIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  UserGroupIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { Sparkles, Zap, Brain, Users } from 'lucide-react';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FeatureCard } from '@/components/FeatureCard';
import { TestimonialCard } from '@/components/TestimonialCard';
import { PricingCard } from '@/components/PricingCard';
import { VideoModal } from '@/components/VideoModal';
import { NewsletterSignup } from '@/components/NewsletterSignup';

const features = [
  {
    name: 'Multi-Model AI Chat',
    description: 'Connect with any AI model - OpenAI, Anthropic, Ollama, local models, and more. Switch between providers seamlessly.',
    icon: ChatBubbleBottomCenterTextIcon,
    color: 'blue',
  },
  {
    name: 'Powerful Code Editor',
    description: 'Full-featured IDE with syntax highlighting, IntelliSense, AI assistance, and Git integration.',
    icon: CodeBracketIcon,
    color: 'green',
  },
  {
    name: 'Integrated Terminal',
    description: 'Native terminal with AI command suggestions, environment management, and script execution.',
    icon: CommandLineIcon,
    color: 'purple',
  },
  {
    name: 'Interactive Notebooks',
    description: 'Jupyter-style notebooks for data science, research, and interactive documentation.',
    icon: DocumentTextIcon,
    color: 'orange',
  },
  {
    name: 'Local & Cloud Models',
    description: 'Run models locally for privacy or connect to cloud providers for scale. Your choice.',
    icon: CpuChipIcon,
    color: 'red',
  },
  {
    name: 'Privacy & Security',
    description: 'End-to-end encryption, local processing options, and complete data ownership.',
    icon: ShieldCheckIcon,
    color: 'teal',
  },
];

const platforms = [
  {
    name: 'Web App',
    description: 'Access from any browser',
    icon: GlobeAltIcon,
    link: '/app',
  },
  {
    name: 'Desktop',
    description: 'Native Windows, macOS, Linux',
    icon: ComputerDesktopIcon,
    link: '/download',
  },
  {
    name: 'Mobile',
    description: 'iOS and Android apps',
    icon: DevicePhoneMobileIcon,
    link: '/mobile',
  },
];

const testimonials = [
  {
    content: "OmniPanel has revolutionized my AI workflow. The ability to switch between different models seamlessly is incredible.",
    author: "Sarah Chen",
    role: "Senior Developer at TechCorp",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b593",
    rating: 5,
  },
  {
    content: "The local model support is a game-changer for our privacy-sensitive projects. No data leaves our environment.",
    author: "Michael Rodriguez",
    role: "Data Scientist at FinTech Solutions",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    rating: 5,
  },
  {
    content: "Best AI workspace I've used. The integration between chat, code, and notebooks is seamless.",
    author: "Emily Thompson",
    role: "AI Researcher at University Lab",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    rating: 5,
  },
];

const stats = [
  { name: 'Active Users', value: '50K+' },
  { name: 'Models Supported', value: '25+' },
  { name: 'Code Generated', value: '10M+ lines' },
  { name: 'Uptime', value: '99.9%' },
];

export default function HomePage(): JSX.Element {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const featuresRef = useRef(null);
  const testimonialsRef = useRef(null);
  const pricingRef = useRef(null);
  
  const featuresInView = useInView(featuresRef, { once: true });
  const testimonialsInView = useInView(testimonialsRef, { once: true });
  const pricingInView = useInView(pricingRef, { once: true });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
          {/* Background decorations */}
          <div className="absolute inset-0">
            <div className="blob w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-500 top-10 left-10"></div>
            <div className="blob w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-500 top-20 right-10 animation-delay-2000"></div>
            <div className="blob w-64 h-64 bg-gradient-to-r from-pink-400 to-red-500 bottom-20 left-1/3 animation-delay-4000"></div>
          </div>
          
          <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-7xl">
                  The Ultimate{' '}
                  <span className="text-shimmer">AI Workspace</span>
                </h1>
                <p className="mt-6 text-xl leading-8 text-gray-600 dark:text-gray-300">
                  Chat, code, and create with any AI model. Work offline or online, 
                  extend with plugins, and enjoy a beautiful experience across all your devices.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mt-10 flex items-center justify-center gap-x-6"
              >
                <Link
                  href="/app"
                  className="group relative rounded-full bg-primary-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-primary-700 hover:scale-105 btn-shimmer"
                >
                  <span className="relative z-10">Start Building</span>
                  <ArrowRightIcon className="relative z-10 ml-2 inline-block h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                
                <button
                  onClick={() => setIsVideoModalOpen(true)}
                  className="group flex items-center gap-3 rounded-full border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 px-6 py-4 text-lg font-semibold text-gray-900 dark:text-white backdrop-blur-sm transition-all hover:bg-white dark:hover:bg-gray-800 hover:scale-105"
                >
                  <PlayIcon className="h-5 w-5 text-primary-600" />
                  Watch Demo
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-16"
              >
                <div className="glass rounded-2xl p-8 mx-auto max-w-4xl">
                  <div className="bg-gray-900 rounded-lg p-6 text-left">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="ml-4 text-sm text-gray-400">OmniPanel Terminal</span>
                    </div>
                    <div className="font-mono text-sm">
                      <div className="text-green-400">$ omnipanel chat --model gpt-4</div>
                      <div className="mt-2 text-blue-400">🤖 Ready to help! What would you like to build?</div>
                      <div className="mt-2 text-yellow-300">💬 Create a React dashboard with real-time data</div>
                      <div className="mt-2 text-blue-400">🤖 I'll help you build that! Let me create the components...</div>
                      <div className="mt-2 animate-pulse">
                        <span className="bg-gray-400 text-transparent">█</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white dark:bg-gray-800 py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-primary-600 md:text-4xl">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {stat.name}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section ref={featuresRef} className="py-24 bg-gray-50 dark:bg-gray-900">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="mx-auto max-w-2xl text-center"
            >
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Everything you need for AI development
              </h2>
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
                A complete workspace that brings together chat, code, and creativity in one beautiful interface.
              </p>
            </motion.div>

            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                {features.map((feature, index) => (
                  <FeatureCard
                    key={feature.name}
                    feature={feature}
                    index={index}
                    inView={featuresInView}
                  />
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* Platforms Section */}
        <section className="py-24 bg-white dark:bg-gray-800">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Available everywhere you work
              </h2>
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
                Native apps for every platform, with full sync across all your devices.
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
              {platforms.map((platform, index) => (
                <motion.div
                  key={platform.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <Link href={platform.link} className="block">
                    <div className="feature-card text-center">
                      <platform.icon className="mx-auto h-12 w-12 text-primary-600" />
                      <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
                        {platform.name}
                      </h3>
                      <p className="mt-2 text-gray-600 dark:text-gray-300">
                        {platform.description}
                      </p>
                      <div className="mt-4 flex items-center justify-center text-primary-600 group-hover:text-primary-700">
                        <span className="text-sm font-medium">Learn more</span>
                        <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section ref={testimonialsRef} className="py-24 bg-gray-50 dark:bg-gray-900">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="mx-auto max-w-2xl text-center"
            >
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Loved by developers worldwide
              </h2>
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
                Join thousands of developers who've made OmniPanel their go-to AI workspace.
              </p>
            </motion.div>

            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard
                  key={testimonial.author}
                  testimonial={testimonial}
                  index={index}
                  inView={testimonialsInView}
                />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary-600">
          <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to supercharge your AI workflow?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-100">
                Join thousands of developers and researchers who use OmniPanel to build amazing AI applications.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="/app"
                  className="rounded-md bg-white px-8 py-4 text-lg font-semibold text-primary-600 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white btn-shimmer"
                >
                  Get started for free
                </Link>
                <Link
                  href="/docs"
                  className="text-lg font-semibold leading-6 text-white hover:text-primary-100"
                >
                  View documentation <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <NewsletterSignup />
      </main>

      <Footer />
      
      <VideoModal 
        isOpen={isVideoModalOpen} 
        onClose={() => setIsVideoModalOpen(false)} 
      />
    </div>
  );
} 
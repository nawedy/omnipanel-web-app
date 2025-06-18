'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

import { useIsMobile } from '@/hooks/use-media-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bars3Icon, 
  XMarkIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { ThemeToggle } from '@/components/theme-toggle';

const navigation = [
  { 
    name: 'Product', 
    href: '#',
    dropdown: [
      { name: 'Web App', href: '/app', description: 'Access from any browser' },
      { name: 'Desktop', href: '/download', description: 'Native apps for all platforms' },
      { name: 'Mobile', href: '/mobile', description: 'iOS and Android apps' },
      { name: 'Features', href: '/features', description: 'Comprehensive feature overview' },
    ]
  },
  { 
    name: 'Developers', 
    href: '#',
    dropdown: [
      { name: 'Documentation', href: '/docs', description: 'Complete guides and references' },
      { name: 'API Reference', href: '/docs/api', description: 'RESTful API documentation' },
      { name: 'Plugins', href: '/plugins', description: 'Extend OmniPanel functionality' },
      { name: 'GitHub', href: '/github', description: 'View source code' },
    ]
  },
  { 
    name: 'Solutions', 
    href: '#',
    dropdown: [
      { name: 'For Developers', href: '/solutions/developers', description: 'Code faster with AI assistance' },
      { name: 'For Teams', href: '/solutions/teams', description: 'Collaborate on AI projects' },
      { name: 'For Enterprises', href: '/solutions/enterprise', description: 'Scale AI across your organization' },
      { name: 'For Researchers', href: '/solutions/research', description: 'Advanced research workflows' },
    ]
  },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Blog', href: '/blog' },
];

export function Header(): React.JSX.Element {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDropdownEnter = (name: string): void => {
    setActiveDropdown(name);
  };

  const handleDropdownLeave = (): void => {
    setActiveDropdown(null);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
      <nav className="max-w-7xl mx-auto flex items-center justify-between p-6 lg:px-8" aria-label="Global">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 group">
            <span className="sr-only">OmniPanel</span>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-glow transition-all duration-300">
                  <img 
                    src="/omnipanel-logo.png" 
                    alt="OmniPanel Logo" 
                    className="h-10 w-10 object-contain"
                  />
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 opacity-0 group-hover:opacity-20 blur-xl transition-all duration-300"></div>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                OmniPanel
              </span>
            </div>
          </Link>
        </div>

        {/* Mobile menu button - only show on mobile */}
        {isMobile && (
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Desktop navigation - only show on non-mobile */}
        {!isMobile && (
          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map((item) => (
              <div 
                key={item.name} 
                className="relative"
                onMouseEnter={() => handleDropdownEnter(item.name)}
                onMouseLeave={handleDropdownLeave}
              >
                {item.dropdown ? (
                  <>
                    <button
                      type="button"
                      className="flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      aria-expanded={activeDropdown === item.name}
                    >
                      {item.name}
                      <ChevronDownIcon className="h-4 w-4 flex-none" aria-hidden="true" />
                    </button>

                    <AnimatePresence>
                      {activeDropdown === item.name && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute left-1/2 z-10 mt-3 w-screen max-w-md -translate-x-1/2 transform px-2"
                        >
                          <div className="overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-gray-900/5 dark:ring-gray-700/10">
                            <div className="p-4">
                              {item.dropdown.map((subItem) => (
                                <div
                                  key={subItem.name}
                                  className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm leading-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                  <div className="flex-auto">
                                    <Link
                                      href={subItem.href}
                                      className="block font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                    >
                                      {subItem.name}
                                      <span className="absolute inset-0" />
                                    </Link>
                                    <p className="mt-1 text-gray-600 dark:text-gray-400">{subItem.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className="text-sm font-semibold leading-6 text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Desktop CTA and theme toggle - only show on non-mobile */}
        {!isMobile && (
          <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-6">
            {/* Enhanced Theme toggle */}
            {mounted && (
              <ThemeToggle 
                showLabel={true} 
                variant="default"
                size="default"
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white hover:text-white"
              />
            )}

            {/* Sign in */}
            <Link
              href="/signin"
              className="text-sm font-semibold leading-6 text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
            >
              Sign in
            </Link>
            
            <Link
              href="/app"
              className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            >
              Get started
            </Link>
          </div>
        )}
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <div className="fixed inset-0 z-50" />
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white dark:bg-gray-900 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 dark:sm:ring-gray-800/20"
            >
              <div className="flex items-center justify-between">
                <Link href="/" className="-m-1.5 p-1.5" onClick={() => setMobileMenuOpen(false)}>
                  <span className="sr-only">OmniPanel</span>
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                      <img 
                        src="/omnipanel-logo.png" 
                        alt="OmniPanel Logo" 
                        className="h-10 w-10 object-contain"
                      />
                    </div>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      OmniPanel
                    </span>
                  </div>
                </Link>
                <button
                  type="button"
                  className="-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              
              <div className="mt-6 flow-root">
                <div className="-my-6 divide-y divide-gray-500/10 dark:divide-gray-500/25">
                  <div className="space-y-2 py-6">
                    {navigation.map((item) => (
                      <div key={item.name}>
                        {item.dropdown ? (
                          <div className="space-y-2">
                            <div className="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                              {item.name}
                            </div>
                            <div className="ml-4 space-y-2">
                              {item.dropdown.map((subItem) => (
                                <Link
                                  key={subItem.name}
                                  href={subItem.href}
                                  className="block rounded-lg px-3 py-2 text-sm leading-7 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {subItem.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <Link
                            href={item.href}
                            className="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {item.name}
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="py-6 space-y-4">
                    {mounted && (
                      <div className="px-3 py-2">
                        <ThemeToggle 
                          showLabel={true} 
                          variant="default"
                          size="default"
                          className="w-full justify-start"
                        />
                      </div>
                    )}
                    
                    <Link
                      href="/signin"
                      className="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign in
                    </Link>
                    
                    <Link
                      href="/app"
                      className="block rounded-lg bg-primary-600 px-3 py-2 text-base font-semibold leading-7 text-white text-center hover:bg-primary-500"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Get started
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
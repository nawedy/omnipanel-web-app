'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bars3Icon, 
  XMarkIcon,
  SunIcon,
  MoonIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

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

export function Header(): JSX.Element {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = (): void => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleDropdownEnter = (name: string): void => {
    setActiveDropdown(name);
  };

  const handleDropdownLeave = (): void => {
    setActiveDropdown(null);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 group">
            <span className="sr-only">OmniPanel</span>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg group-hover:shadow-glow transition-all duration-300">
                  <span className="text-white font-bold text-lg">OP</span>
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 opacity-0 group-hover:opacity-20 blur-xl transition-all duration-300"></div>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                OmniPanel
              </span>
            </div>
          </Link>
        </div>

        {/* Mobile menu button */}
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

        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => (
            <div 
              key={item.name} 
              className="relative"
              onMouseEnter={() => item.dropdown && handleDropdownEnter(item.name)}
              onMouseLeave={handleDropdownLeave}
            >
              {item.dropdown ? (
                <div>
                  <button className="flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    {item.name}
                    <ChevronDownIcon className="h-4 w-4 transition-transform" />
                  </button>
                  
                  <AnimatePresence>
                    {activeDropdown === item.name && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-1/2 z-10 mt-5 flex w-screen max-w-max -translate-x-1/2 px-4"
                      >
                        <div className="w-screen max-w-sm flex-auto overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-gray-900/5 dark:ring-gray-100/5">
                          <div className="p-4">
                            {item.dropdown.map((subItem) => (
                              <div key={subItem.name} className="group relative flex gap-x-6 rounded-lg p-4 text-sm leading-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                                <div className="flex-auto">
                                  <Link href={subItem.href} className="block font-semibold text-gray-900 dark:text-white">
                                    {subItem.name}
                                    <span className="absolute inset-0" />
                                  </Link>
                                  <p className="mt-1 text-gray-600 dark:text-gray-300">{subItem.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
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

        {/* Right side buttons */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:space-x-4">
          {/* Theme toggle */}
          {mounted && (
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>
          )}

          {/* Sign in */}
          <Link
            href="/signin"
            className="text-sm font-semibold leading-6 text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Sign in
          </Link>

          {/* Get started */}
          <Link
            href="/app"
            className="rounded-full bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all hover:scale-105 btn-shimmer"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white dark:bg-gray-900 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 dark:sm:ring-gray-100/10"
            >
              <div className="flex items-center justify-between">
                <Link href="/" className="-m-1.5 p-1.5" onClick={() => setMobileMenuOpen(false)}>
                  <span className="sr-only">OmniPanel</span>
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">OP</span>
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
                      <button
                        type="button"
                        onClick={toggleTheme}
                        className="flex items-center space-x-2 text-base font-semibold leading-7 text-gray-900 dark:text-white w-full px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        {theme === 'dark' ? (
                          <>
                            <SunIcon className="h-5 w-5" />
                            <span>Light mode</span>
                          </>
                        ) : (
                          <>
                            <MoonIcon className="h-5 w-5" />
                            <span>Dark mode</span>
                          </>
                        )}
                      </button>
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
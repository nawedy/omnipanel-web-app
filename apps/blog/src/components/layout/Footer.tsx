"use client";

import Link from 'next/link'
import Image from 'next/image'
import { Github, Twitter, Linkedin, Mail } from 'lucide-react'

export function Footer(): JSX.Element {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-950 border-t border-slate-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-1">
                    <Link href="/" className="flex items-center space-x-2 mb-4">
          <Image
            src="/omnipanel-logo-192.png"
            alt="OmniPanel"
            width={32}
            height={32}
            className="h-8 w-8 rounded-sm"
          />
          <span className="text-xl font-bold text-white">OmniPanel</span>
        </Link>
            <p className="text-slate-400 text-sm mb-4">
              The secure, privacy-first coding workspace that keeps your data local while connecting you to the best AI models.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com/omnipanel"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a
                href="https://twitter.com/omnipanel"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://linkedin.com/company/omnipanel"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="mailto:hello@omnipanel.com"
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Blog Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Blog</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/posts" className="text-slate-400 hover:text-white transition-colors text-sm">
                  All Articles
                </Link>
              </li>
              <li>
                <Link href="/categories/security" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Security
                </Link>
              </li>
              <li>
                <Link href="/categories/privacy" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/categories/ai" className="text-slate-400 hover:text-white transition-colors text-sm">
                  AI Development
                </Link>
              </li>
              <li>
                <Link href="/authors" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Authors
                </Link>
              </li>
            </ul>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href={`${process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://omnipanel.com'}/features`} 
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                  target="_blank"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link 
                  href={`${process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://omnipanel.com'}/pricing`} 
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                  target="_blank"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link 
                  href={`${process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://omnipanel.com'}/download`} 
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                  target="_blank"
                >
                  Download
                </Link>
              </li>
              <li>
                <Link 
                  href={`${process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://omnipanel.com'}/docs`} 
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                  target="_blank"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link 
                  href={`${process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://omnipanel.com'}/early-access`} 
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                  target="_blank"
                >
                  Early Access
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal and Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-slate-400 hover:text-white transition-colors text-sm">
                  About
                </Link>
              </li>
              <li>
                <Link 
                  href={`${process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://omnipanel.com'}/contact`} 
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                  target="_blank"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link 
                  href={`${process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://omnipanel.com'}/privacy`} 
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                  target="_blank"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  href={`${process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://omnipanel.com'}/terms`} 
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                  target="_blank"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/rss.xml" className="text-slate-400 hover:text-white transition-colors text-sm">
                  RSS Feed
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm">
            © {currentYear} OmniPanel. All rights reserved.
          </p>
          <p className="text-slate-400 text-sm mt-2 md:mt-0">
            Built with security and privacy by design.
          </p>
        </div>
      </div>
    </footer>
  )
} 
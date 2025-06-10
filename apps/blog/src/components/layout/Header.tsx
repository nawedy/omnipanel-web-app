"use client";

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Menu, X } from 'lucide-react'

export function Header(): JSX.Element {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/omnipanel-logo-192.png"
            alt="OmniPanel"
            width={32}
            height={32}
            className="h-8 w-8 rounded-sm"
          />
          <span className="text-xl font-bold text-white">
            OmniPanel <span className="text-slate-400">Blog</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            href="/posts" 
            className="text-slate-300 hover:text-white transition-colors"
          >
            Articles
          </Link>
          <Link 
            href="/categories" 
            className="text-slate-300 hover:text-white transition-colors"
          >
            Categories
          </Link>
          <Link 
            href="/authors" 
            className="text-slate-300 hover:text-white transition-colors"
          >
            Authors
          </Link>
          <Link 
            href="/about" 
            className="text-slate-300 hover:text-white transition-colors"
          >
            About
          </Link>
          <Link 
            href={process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://omnipanel.com'}
            className="text-slate-300 hover:text-white transition-colors"
            target="_blank"
          >
            Main Site
          </Link>
        </nav>

        {/* Desktop CTA Button */}
        <div className="hidden md:flex items-center space-x-4">
          <Button asChild>
            <Link href={`${process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://omnipanel.com'}/early-access`}>
              Get Early Access
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-slate-300 hover:text-white transition-colors"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-sm">
          <nav className="container mx-auto px-4 py-4 space-y-4">
            <Link 
              href="/posts" 
              className="block text-slate-300 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Articles
            </Link>
            <Link 
              href="/categories" 
              className="block text-slate-300 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Categories
            </Link>
            <Link 
              href="/authors" 
              className="block text-slate-300 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Authors
            </Link>
            <Link 
              href="/about" 
              className="block text-slate-300 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              href={process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://omnipanel.com'}
              className="block text-slate-300 hover:text-white transition-colors"
              target="_blank"
              onClick={() => setIsMenuOpen(false)}
            >
              Main Site
            </Link>
            <div className="pt-4">
              <Button asChild className="w-full">
                <Link href={`${process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://omnipanel.com'}/early-access`}>
                  Get Early Access
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
} 
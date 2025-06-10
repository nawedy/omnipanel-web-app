// src/components/blog/NewsletterSignup.tsx
// Newsletter signup component with marketing integration

"use client";

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Mail, CheckCircle, AlertCircle } from 'lucide-react'

interface NewsletterSignupProps {
  variant?: 'default' | 'inline' | 'popup'
  showDescription?: boolean
  campaignId?: string
  className?: string
}

export function NewsletterSignup({ 
  variant = 'default', 
  showDescription = true,
  campaignId,
  className = '' 
}: NewsletterSignupProps): JSX.Element {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setStatus('error')
      setMessage('Please enter your email address')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setStatus('error')
      setMessage('Please enter a valid email address')
      return
    }

    setStatus('loading')
    
    try {
      // Track newsletter signup with campaign integration
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          source: 'blog',
          campaignId: campaignId || 'blog-newsletter',
          utmSource: 'blog',
          utmMedium: 'newsletter',
          utmCampaign: campaignId || 'general',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to subscribe')
      }

      setStatus('success')
      setMessage('Thanks! You\'ve been subscribed to our newsletter.')
      setEmail('')
      
      // Track successful signup
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'newsletter_signup', {
          event_category: 'engagement',
          event_label: campaignId || 'blog-newsletter',
        })
      }
    } catch (error) {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  if (variant === 'inline') {
    return (
      <div className={`bg-slate-900/50 border border-slate-800 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-4">
          <Mail className="text-blue-400 flex-shrink-0" size={20} />
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={status === 'loading'}
              />
              <Button 
                type="submit" 
                size="md"
                disabled={status === 'loading'}
                className="whitespace-nowrap"
              >
                {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
          </div>
        </div>
        {message && (
          <div className={`mt-2 text-sm flex items-center space-x-1 ${
            status === 'success' ? 'text-green-400' : 'text-red-400'
          }`}>
            {status === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{message}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg p-6 ${className}`}>
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full mb-4">
          <Mail className="text-white" size={24} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          Stay Updated
        </h3>
        {showDescription && (
          <p className="text-slate-400 mb-6">
            Get the latest insights on AI development, security, and privacy delivered to your inbox. 
            No spam, unsubscribe anytime.
          </p>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={status === 'loading'}
          />
          <Button 
            type="submit" 
            size="lg"
            disabled={status === 'loading'}
            className="w-full"
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe to Newsletter'}
          </Button>
        </form>

        {message && (
          <div className={`mt-4 text-sm flex items-center justify-center space-x-1 ${
            status === 'success' ? 'text-green-400' : 'text-red-400'
          }`}>
            {status === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{message}</span>
          </div>
        )}

        <p className="text-xs text-slate-500 mt-4">
          By subscribing, you agree to our privacy policy and consent to receive updates from OmniPanel.
        </p>
      </div>
    </div>
  )
} 
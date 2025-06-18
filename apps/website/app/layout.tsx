// app/layout.tsx
// Root layout with comprehensive SEO optimization and meta tags

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : 'https://omnipanel.cipher-intelligence.com'
  ),
  title: {
    default: 'OmniPanel - Privacy-First AI Development Workspace',
    template: '%s | OmniPanel - Privacy-First AI Development Workspace',
  },
  description: 'The world\'s first privacy-first AI development workspace. Code with confidence knowing your intellectual property stays secure with local AI processing, real-time security scanning, and zero data transmission.',
  keywords: [
    'AI development workspace',
    'privacy-first AI',
    'local AI processing',
    'secure coding environment',
    'intellectual property protection',
    'AI code assistant',
    'development tools',
    'privacy protection',
    'secure AI workspace',
    'local LLM',
    'AI Guardian',
    'code security',
    'developer privacy',
    'secure development'
  ],
  authors: [{ name: 'OmniPanel Team' }],
  creator: 'OmniPanel',
  publisher: 'OmniPanel',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'OmniPanel',
    title: 'OmniPanel - Privacy-First AI Development Workspace',
    description: 'The world\'s first privacy-first AI development workspace. Code with confidence knowing your intellectual property stays secure with local AI processing and real-time security scanning.',
    images: [
      {
        url: '/assets/screenshots/omnipanel-web-app.png',
        width: 1200,
        height: 630,
        alt: 'OmniPanel - Privacy-First AI Development Workspace',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@omnipanel',
    creator: '@omnipanel',
    title: 'OmniPanel - Privacy-First AI Development Workspace',
    description: 'The world\'s first privacy-first AI development workspace. Code with confidence knowing your intellectual property stays secure.',
    images: ['/assets/screenshots/omnipanel-web-app.png'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_VERIFICATION,
  },
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/',
    },
  },
  category: 'technology',
  classification: 'Business',
  referrer: 'origin-when-cross-origin',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'OmniPanel',
              applicationCategory: 'DeveloperApplication',
              operatingSystem: 'Windows, macOS, Linux',
              description: 'Privacy-first AI development workspace with local AI processing and real-time security scanning.',
              url: 'https://omnipanel.cipher-intelligence.com',
              author: {
                '@type': 'Organization',
                name: 'OmniPanel',
                url: 'https://omnipanel.cipher-intelligence.com',
              },
              offers: {
                '@type': 'Offer',
                price: '29',
                priceCurrency: 'USD',
                priceValidUntil: '2025-12-31',
                availability: 'https://schema.org/InStock',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.9',
                ratingCount: '1250',
                bestRating: '5',
                worstRating: '1',
              },
              featureList: [
                'Local AI Processing',
                'Privacy Protection',
                'Real-time Security Scanning',
                'Cross-platform Support',
                'Team Collaboration',
                'Enterprise Security',
              ],
            }),
          }}
        />
        
        {/* Preload Critical Resources */}
        <link rel="preload" href="/assets/OmniPanel-logo-icon.svg" as="image" type="image/svg+xml" />
        <link rel="preload" href="/assets/videos/OmniPanelAI-Video.mp4" as="video" type="video/mp4" />
        
        {/* Security Headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/assets/ManifestJSON/manifest.json" />
        
        {/* Favicons */}
        <link rel="icon" type="image/x-icon" href="/assets/favicon/favicon-16x16.png" sizes="16x16" />
        <link rel="icon" type="image/x-icon" href="/assets/favicon/favicon-32x32.png" sizes="32x32" />
        <link rel="icon" type="image/x-icon" href="/assets/favicon/favicon-48x48.png" sizes="48x48" />
        <link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png" sizes="180x180" />
        
        {/* Performance Hints */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={cn(
        inter.className,
        'min-h-screen bg-gradient-to-br from-slate-950 via-zinc-900 to-slate-950 antialiased'
      )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
} 
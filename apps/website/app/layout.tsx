import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';

import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://omnipanel.ai'),
  title: {
    default: 'OmniPanel - The Ultimate AI Workspace',
    template: '%s | OmniPanel',
  },
  description: 'The most powerful AI workspace for chat, code, and creativity. Build with any LLM, work offline or online, extend with plugins. Available on web, desktop, and mobile.',
  keywords: [
    'AI workspace',
    'LLM',
    'ChatGPT',
    'Claude',
    'Ollama',
    'code editor',
    'AI chat',
    'machine learning',
    'artificial intelligence',
    'developer tools',
    'productivity',
    'open source',
    'local AI',
    'privacy-first',
  ],
  authors: [
    {
      name: 'OmniPanel Team',
      url: 'https://omnipanel.ai',
    },
  ],
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
    url: 'https://omnipanel.ai',
    title: 'OmniPanel - The Ultimate AI Workspace',
    description: 'The most powerful AI workspace for chat, code, and creativity. Build with any LLM, work offline or online, extend with plugins.',
    siteName: 'OmniPanel',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'OmniPanel - The Ultimate AI Workspace',
      },
      {
        url: '/og-image-square.png',
        width: 1200,
        height: 1200,
        alt: 'OmniPanel Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OmniPanel - The Ultimate AI Workspace',
    description: 'The most powerful AI workspace for chat, code, and creativity. Build with any LLM, work offline or online, extend with plugins.',
    images: ['/og-image.png'],
    creator: '@omnipanel',
    site: '@omnipanel',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon-16x16.png',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    other: {
      me: ['mailto:hello@omnipanel.ai', 'https://omnipanel.ai'],
    },
  },
  alternates: {
    canonical: 'https://omnipanel.ai',
    languages: {
      'en-US': 'https://omnipanel.ai',
      'es-ES': 'https://omnipanel.ai/es',
      'fr-FR': 'https://omnipanel.ai/fr',
      'de-DE': 'https://omnipanel.ai/de',
      'ja-JP': 'https://omnipanel.ai/ja',
      'zh-CN': 'https://omnipanel.ai/zh',
    },
  },
  category: 'technology',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  colorScheme: 'dark light',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <html 
      lang="en" 
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//api.omnipanel.ai" />
        <link rel="dns-prefetch" href="//cdn.omnipanel.ai" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'OmniPanel',
              applicationCategory: 'DeveloperApplication',
              operatingSystem: 'Web, Windows, macOS, Linux, iOS, Android',
              description: 'The ultimate AI workspace for chat, code, and creativity',
              url: 'https://omnipanel.ai',
              downloadUrl: 'https://omnipanel.ai/download',
              softwareVersion: '1.0.0',
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                reviewCount: '1250',
              },
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-white font-sans text-gray-900 antialiased dark:bg-gray-900 dark:text-gray-100">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster 
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
              },
            }}
          />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
} 
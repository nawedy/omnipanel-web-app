import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { Toaster } from 'sonner';

import { ThemeProvider } from "@/components/theme-provider";
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://omnipanel-website.vercel.app'),
  title: {
    default: 'OmniPanel - AI Workspace',
    template: '%s | OmniPanel'
  },
  description: 'Modern, extensible, and enjoyable LLM workspace combining project-based chat, code, notebooks, and automation.',
  keywords: ['AI', 'LLM', 'workspace', 'chat', 'code', 'notebooks', 'automation', 'development'],
  authors: [{ name: 'OmniPanel Team' }],
  creator: 'OmniPanel',
  applicationName: 'OmniPanel',
  generator: 'Next.js',
  publisher: 'OmniPanel',
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
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { url: '/omnipanel-logo.png', sizes: 'any', type: 'image/png' }
    ]
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://omnipanel-website.vercel.app',
    siteName: 'OmniPanel',
    title: 'OmniPanel - AI Workspace',
    description: 'Modern, extensible, and enjoyable LLM workspace combining project-based chat, code, notebooks, and automation.',
    images: [
      {
        url: '/omnipanel-logo.png',
        width: 1200,
        height: 630,
        alt: 'OmniPanel Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OmniPanel - AI Workspace',
    description: 'Modern, extensible, and enjoyable LLM workspace combining project-based chat, code, notebooks, and automation.',
    images: ['/omnipanel-logo.png'],
    creator: '@omnipanel',
  },
  manifest: '/manifest.json',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    other: {
      me: ['mailto:hello@omnipanel.ai', 'https://omnipanel-website.vercel.app'],
    },
  },
  alternates: {
    canonical: 'https://omnipanel-website.vercel.app',
    languages: {
      'en-US': 'https://omnipanel-website.vercel.app',
      'es-ES': 'https://omnipanel-website.vercel.app/es',
      'fr-FR': 'https://omnipanel-website.vercel.app/fr',
      'de-DE': 'https://omnipanel-website.vercel.app/de',
      'ja-JP': 'https://omnipanel-website.vercel.app/ja',
      'zh-CN': 'https://omnipanel-website.vercel.app/zh',
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
      </head>
      <body className="min-h-screen bg-white font-sans text-gray-900 antialiased dark:bg-gray-900 dark:text-gray-100">
        <ThemeProvider>
          {children}
          <Analytics />
          <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} />
        </ThemeProvider>
      </body>
    </html>
  );
} 
import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
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
  title: {
    default: 'OmniPanel Docs',
    template: '%s | OmniPanel Docs',
  },
  description: 'Documentation for OmniPanel - The ultimate AI workspace for chat, code, and creativity.',
  keywords: [
    'OmniPanel',
    'AI workspace',
    'LLM',
    'chat',
    'code editor',
    'documentation',
    'API',
    'developer tools',
    'artificial intelligence',
  ],
  authors: [
    {
      name: 'OmniPanel Team',
      url: 'https://omnipanel.ai',
    },
  ],
  creator: 'OmniPanel',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://docs.omnipanel.ai',
    title: 'OmniPanel Documentation',
    description: 'Documentation for OmniPanel - The ultimate AI workspace for chat, code, and creativity.',
    siteName: 'OmniPanel Docs',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'OmniPanel Documentation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OmniPanel Documentation',
    description: 'Documentation for OmniPanel - The ultimate AI workspace for chat, code, and creativity.',
    images: ['/og-image.png'],
    creator: '@omnipanel',
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
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
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
      <body className="min-h-screen bg-white font-sans text-gray-900 antialiased dark:bg-gray-900 dark:text-gray-100">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
} 
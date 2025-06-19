import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Providers } from '@/components/providers/Providers';
import { ThemeProvider } from '@/components/ThemeProvider';
import { WorkspaceProvider } from '@/providers/WorkspaceProvider';
import { PluginProvider } from '@/components/providers/PluginProvider';
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
  title: 'OmniPanel - AI Workspace',
  description: 'Modern, extensible, and enjoyable LLM workspace combining project-based chat, code, notebooks, and automation.',
  keywords: ['AI', 'LLM', 'workspace', 'chat', 'code', 'notebooks', 'automation', 'omnipanel'],
  authors: [{ name: 'OmniPanel Team' }],
  creator: 'OmniPanel',
  publisher: 'OmniPanel',
  applicationName: 'OmniPanel',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { url: '/logo.png', sizes: 'any', type: 'image/png' }
    ]
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'OmniPanel - AI Workspace',
    description: 'Modern, extensible, and enjoyable LLM workspace combining project-based chat, code, notebooks, and automation.',
    url: 'https://omnipanel.ai',
    siteName: 'OmniPanel',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'OmniPanel - AI Workspace',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OmniPanel - AI Workspace',
    description: 'Modern, extensible, and enjoyable LLM workspace combining project-based chat, code, notebooks, and automation.',
    images: ['/logo.png'],
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
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="OmniPanel" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-TileImage" content="/logo.png" />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <ThemeProvider>
          <WorkspaceProvider>
            <PluginProvider>
              <Providers>
                <div id="root" className="h-screen w-full overflow-hidden">
                  {children}
                </div>
              </Providers>
            </PluginProvider>
          </WorkspaceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 
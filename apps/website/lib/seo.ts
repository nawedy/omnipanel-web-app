// apps/website/lib/seo.ts
// Comprehensive SEO utilities for meta tag management

import type { Metadata } from 'next';

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  siteName?: string;
  locale?: string;
  authors?: string[];
  publishedTime?: string;
  modifiedTime?: string;
}

export const defaultSEO = {
  siteName: 'OmniPanel',
  locale: 'en_US',
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://omnipanel.ai',
  defaultTitle: 'OmniPanel - AI-Powered Development Workspace',
  defaultDescription: 'The privacy-first AI development workspace that keeps your code secure. Local execution, multiple AI providers, lifetime access.',
  defaultImage: '/og-image.png',
  twitterHandle: '@omnipanel',
  keywords: [
    'AI development',
    'code editor',
    'privacy-first',
    'local AI',
    'developer tools',
    'VS Code alternative',
    'secure coding',
    'AI assistant'
  ],
};

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    image,
    url,
    type = 'website',
    siteName = defaultSEO.siteName,
    locale = defaultSEO.locale,
    authors,
    publishedTime,
    modifiedTime,
  } = config;

  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  const fullImage = image ? (image.startsWith('http') ? image : `${defaultSEO.baseUrl}${image}`) : `${defaultSEO.baseUrl}${defaultSEO.defaultImage}`;
  const fullUrl = url ? (url.startsWith('http') ? url : `${defaultSEO.baseUrl}${url}`) : defaultSEO.baseUrl;

  return {
    title: fullTitle,
    description,
    keywords: [...defaultSEO.keywords, ...keywords].join(', '),
    authors: authors ? authors.map(name => ({ name })) : null,
    creator: siteName,
    publisher: siteName,
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
    openGraph: {
      type,
      title: fullTitle,
      description,
      url: fullUrl,
      siteName,
      locale,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      site: defaultSEO.twitterHandle,
      creator: defaultSEO.twitterHandle,
      title: fullTitle,
      description,
      images: [fullImage],
    },
    alternates: {
      canonical: fullUrl,
    },
    other: {
      'google-site-verification': process.env.GOOGLE_SITE_VERIFICATION || '',
    },
  };
}

export const pageSEO = {
  home: {
    title: defaultSEO.defaultTitle,
    description: defaultSEO.defaultDescription,
    keywords: [...defaultSEO.keywords, 'home', 'main'],
  },
  pricing: {
    title: 'Pricing - OmniPanel',
    description: 'Get lifetime access to OmniPanel for a one-time payment. No subscriptions, no data harvesting, complete privacy protection.',
    keywords: ['pricing', 'lifetime access', 'no subscription', 'privacy'],
  },
  features: {
    title: 'Features - OmniPanel',
    description: 'Discover OmniPanel\'s powerful features: local AI execution, multiple providers, secure development, and complete privacy protection.',
    keywords: ['features', 'AI providers', 'local execution', 'security'],
  },
  about: {
    title: 'About - OmniPanel',
    description: 'Learn about OmniPanel\'s mission to provide privacy-first AI development tools without data harvesting or vendor lock-in.',
    keywords: ['about', 'mission', 'privacy-first', 'team'],
  },
  contact: {
    title: 'Contact - OmniPanel',
    description: 'Get in touch with the OmniPanel team for support, partnerships, or enterprise inquiries.',
    keywords: ['contact', 'support', 'enterprise', 'partnerships'],
  },
};

export function generateStructuredData(type: 'Organization' | 'SoftwareApplication' | 'Product', data: any) {
  const baseStructuredData = {
    '@context': 'https://schema.org',
    '@type': type,
  };

  switch (type) {
    case 'Organization':
      return {
        ...baseStructuredData,
        name: defaultSEO.siteName,
        url: defaultSEO.baseUrl,
        logo: `${defaultSEO.baseUrl}/logo.png`,
        sameAs: [
          'https://github.com/omnipanel',
          'https://twitter.com/omnipanel',
          'https://linkedin.com/company/omnipanel',
        ],
        ...data,
      };

    case 'SoftwareApplication':
      return {
        ...baseStructuredData,
        name: defaultSEO.siteName,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: ['Windows', 'macOS', 'Linux'],
        offers: {
          '@type': 'Offer',
          price: '149',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        ...data,
      };

    case 'Product':
      return {
        ...baseStructuredData,
        name: data.name || defaultSEO.siteName,
        description: data.description || defaultSEO.defaultDescription,
        brand: {
          '@type': 'Brand',
          name: defaultSEO.siteName,
        },
        offers: {
          '@type': 'Offer',
          price: data.price || '149',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: `${defaultSEO.baseUrl}/pricing`,
        },
        ...data,
      };

    default:
      return baseStructuredData;
  }
} 
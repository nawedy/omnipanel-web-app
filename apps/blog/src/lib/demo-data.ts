// src/lib/demo-data.ts
// Demo data for testing blog functionality without Sanity connection

import type { BlogPost, Author, Category } from '@/types/blog'

export const demoAuthors: Author[] = [
  {
    _id: 'demo-author-1',
    name: 'Alex Chen',
    slug: 'alex-chen',
    bio: 'Security engineer and AI researcher focused on privacy-preserving development tools.',
    image: null,
    social: {
      twitter: 'https://twitter.com/alexchen_dev',
      linkedin: 'https://linkedin.com/in/alexchen-security',
      github: 'https://github.com/alexchen',
    }
  },
  {
    _id: 'demo-author-2',
    name: 'Sarah Rodriguez',
    slug: 'sarah-rodriguez',
    bio: 'Privacy advocate and full-stack developer specializing in secure AI applications.',
    image: null,
    social: {
      twitter: 'https://twitter.com/sarah_codes',
      linkedin: 'https://linkedin.com/in/sarah-rodriguez-dev',
      github: 'https://github.com/srodriguez',
    }
  }
]

export const demoCategories: Category[] = [
  {
    _id: 'demo-category-1',
    title: 'Security & Privacy',
    slug: 'security',
    description: 'Articles about securing AI development workflows and protecting sensitive data.',
    color: 'blue'
  },
  {
    _id: 'demo-category-2',
    title: 'AI Development',
    slug: 'ai',
    description: 'Best practices for building and deploying AI applications securely.',
    color: 'green'
  },
  {
    _id: 'demo-category-3',
    title: 'Developer Tools',
    slug: 'tools',
    description: 'Reviews and tutorials on development tools and productivity solutions.',
    color: 'purple'
  }
]

export const demoBlogPosts: BlogPost[] = [
  {
    _id: 'demo-post-1',
    title: 'The Hidden Privacy Crisis in AI Development Tools',
    slug: 'hidden-privacy-crisis-ai-development-tools',
    excerpt: 'Most AI development tools are sending your code, data, and intellectual property to third-party servers. Here\'s how to build AI applications while keeping your data truly private and secure.',
    content: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'The rise of AI-powered development tools has revolutionized how we write code, but it\'s come at a hidden cost: our privacy. Every time you use GitHub Copilot, ChatGPT for coding, or similar tools, you\'re potentially sending sensitive code and data to external servers.'
          }
        ]
      },
      {
        _type: 'block',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: 'The Scale of the Problem'
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'Recent surveys show that 78% of developers are using AI coding assistants, but only 23% understand what data is being transmitted. This creates several critical risks including intellectual property exposure, compliance violations, and unintentional data breaches.'
          }
        ]
      }
    ],
    author: demoAuthors[0],
    category: demoCategories[0],
    tags: ['privacy', 'security', 'ai-development', 'local-ai'],
    publishedAt: '2024-01-15T10:00:00Z',
    featured: true,
    readingTime: 8,
    featuredImage: null,
    seo: {
      title: 'AI Development Privacy Crisis: How to Keep Your Code Secure',
      description: 'Discover how AI development tools are exposing your code and data. Learn to build AI applications while maintaining complete privacy and security.',
      keywords: ['AI privacy', 'secure coding', 'local AI', 'developer privacy']
    },
    campaignIntegration: {
      relatedCampaign: 'early-access-2024',
      ctaText: 'Get Early Access to OmniPanel',
      ctaUrl: 'https://omnipanel.com/early-access?utm_source=blog&utm_campaign=privacy-crisis',
      trackingEnabled: true
    }
  },
  {
    _id: 'demo-post-2',
    title: 'Building Your First Secure AI Application with Local Models',
    slug: 'building-secure-ai-application-local-models',
    excerpt: 'Step-by-step guide to creating AI-powered applications that run entirely on your infrastructure, ensuring data privacy while maintaining cutting-edge functionality.',
    content: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'Building AI applications doesn\'t have to mean sacrificing privacy. In this comprehensive guide, we\'ll walk through creating a secure, local-first AI application that keeps your data under your control.'
          }
        ]
      }
    ],
    author: demoAuthors[1],
    category: demoCategories[1],
    tags: ['tutorial', 'local-ai', 'application-development', 'security'],
    publishedAt: '2024-01-12T14:30:00Z',
    featured: false,
    readingTime: 12,
    featuredImage: null,
    seo: {
      title: 'Build Secure AI Applications with Local Models - Complete Guide',
      description: 'Learn to create AI applications that run entirely on your infrastructure while maintaining privacy and security.',
      keywords: ['local AI', 'secure AI', 'privacy-first development', 'AI tutorial']
    },
    campaignIntegration: {
      relatedCampaign: 'developer-onboarding',
      ctaText: 'Try OmniPanel Free',
      ctaUrl: 'https://omnipanel.com/download?utm_source=blog&utm_campaign=tutorial',
      trackingEnabled: true
    }
  },
  {
    _id: 'demo-post-3',
    title: 'The Future of Developer Productivity: AI-Human Collaboration',
    slug: 'future-developer-productivity-ai-human-collaboration',
    excerpt: 'Exploring how the next generation of AI tools will augment human creativity rather than replace it, with insights from industry leaders and practical examples.',
    content: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'The debate about AI replacing developers misses the point entirely. The future lies in thoughtful collaboration between human creativity and AI capabilities.'
          }
        ]
      }
    ],
    author: demoAuthors[0],
    category: demoCategories[2],
    tags: ['future-of-work', 'ai-collaboration', 'productivity', 'developer-experience'],
    publishedAt: '2024-01-10T09:15:00Z',
    featured: false,
    readingTime: 6,
    featuredImage: null,
    seo: {
      title: 'The Future of Developer Productivity - AI-Human Collaboration',
      description: 'Discover how AI tools will augment human creativity in software development rather than replace developers.',
      keywords: ['AI collaboration', 'developer productivity', 'future of work', 'AI tools']
    },
    campaignIntegration: {
      relatedCampaign: 'thought-leadership',
      ctaText: 'Join the Future of Development',
      ctaUrl: 'https://omnipanel.com/community?utm_source=blog&utm_campaign=future-work',
      trackingEnabled: true
    }
  }
]

// Helper functions to simulate API calls
export async function getDemoPosts(): Promise<BlogPost[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100))
  return demoBlogPosts
}

export async function getDemoPost(slug: string): Promise<BlogPost | null> {
  await new Promise(resolve => setTimeout(resolve, 100))
  return demoBlogPosts.find(post => post.slug === slug) || null
}

export async function getDemoCategories(): Promise<Category[]> {
  await new Promise(resolve => setTimeout(resolve, 100))
  return demoCategories
}

export async function getDemoAuthors(): Promise<Author[]> {
  await new Promise(resolve => setTimeout(resolve, 100))
  return demoAuthors
} 
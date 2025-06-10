// src/types/blog.ts
// TypeScript types for blog data structures

export interface BlogPost {
  _id: string
  _type: 'blogPost'
  title: string
  slug: string
  author?: Author
  featuredImage?: SanityImage
  excerpt?: string
  content: any[] // Portable Text content
  categories?: Category[]
  tags: string[]
  publishedAt: string
  featured: boolean
  readingTime: number
  seo?: SEO
  campaignIntegration?: CampaignIntegration
}

export interface Author {
  _id: string
  _type: 'author'
  name: string
  slug: string
  image?: SanityImage
  bio?: string
  email?: string
  twitter?: string
  linkedin?: string
  github?: string
  website?: string
}

export interface Category {
  _id: string
  _type: 'category'
  title: string
  slug: string
  description?: string
  color: string
}

export interface SanityImage {
  _type: 'image'
  asset: {
    _ref: string
    _type: 'reference'
  }
  alt?: string
  caption?: string
  url?: string
}

export interface SEO {
  title?: string
  description?: string
  keywords?: string[]
  ogImage?: SanityImage
}

export interface CampaignIntegration {
  relatedCampaign?: string
  ctaText?: string
  ctaUrl?: string
  trackingEnabled?: boolean
}

export interface CodeBlock {
  _type: 'codeBlock'
  language: string
  code: string
  filename?: string
}

export interface Callout {
  _type: 'callout'
  type: 'info' | 'warning' | 'error' | 'success'
  title?: string
  content: string
}

// Query result types
export interface BlogPostsResult {
  posts: BlogPost[]
  total: number
}

export interface BlogPostQuery {
  limit?: number
  offset?: number
  category?: string
  tag?: string
  featured?: boolean
  search?: string
} 
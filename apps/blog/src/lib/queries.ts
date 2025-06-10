// src/lib/queries.ts
// GROQ queries for fetching blog data from Sanity

import { groq } from 'next-sanity'
import { client } from './sanity'
import type { BlogPost, Author, Category, BlogPostQuery } from '@/types/blog'

// Common fields for blog posts
const blogPostFields = groq`
  _id,
  _type,
  title,
  "slug": slug.current,
  author->{
    _id,
    name,
    "slug": slug.current,
    image,
    bio,
    email,
    twitter,
    linkedin,
    github,
    website
  },
  featuredImage,
  excerpt,
  content,
  categories[]->{
    _id,
    title,
    "slug": slug.current,
    description,
    color
  },
  tags,
  publishedAt,
  featured,
  readingTime,
  seo,
  campaignIntegration
`

// Get all published blog posts
export async function getAllPosts(query: BlogPostQuery = {}): Promise<BlogPost[]> {
  const { limit = 10, offset = 0, category, tag, featured, search } = query

  let groqQuery = groq`
    *[_type == "blogPost" && publishedAt <= now()]
  `

  // Add filters
  const filters: string[] = []
  
  if (category) {
    filters.push(`"${category}" in categories[]->slug.current`)
  }
  
  if (tag) {
    filters.push(`"${tag}" in tags`)
  }
  
  if (featured !== undefined) {
    filters.push(`featured == ${featured}`)
  }
  
  if (search) {
    filters.push(`(title match "*${search}*" || excerpt match "*${search}*")`)
  }

  if (filters.length > 0) {
    groqQuery += ` && (${filters.join(' && ')})`
  }

  groqQuery += groq`
    | order(publishedAt desc)
    [${offset}...${offset + limit}] {
      ${blogPostFields}
    }
  `

  return client.fetch(groqQuery)
}

// Get a single blog post by slug
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  return client.fetch(
    groq`
      *[_type == "blogPost" && slug.current == $slug && publishedAt <= now()][0] {
        ${blogPostFields}
      }
    `,
    { slug }
  )
}

// Alias for backward compatibility
export const getPostBySlug = getBlogPost

// Get featured posts
export async function getFeaturedPosts(limit: number = 3): Promise<BlogPost[]> {
  return client.fetch(
    groq`
      *[_type == "blogPost" && featured == true && publishedAt <= now()]
      | order(publishedAt desc)
      [0...${limit}] {
        ${blogPostFields}
      }
    `
  )
}

// Get recent posts
export async function getRecentPosts(limit: number = 6): Promise<BlogPost[]> {
  return client.fetch(
    groq`
      *[_type == "blogPost" && publishedAt <= now()]
      | order(publishedAt desc)
      [0...${limit}] {
        ${blogPostFields}
      }
    `
  )
}

// Get related posts based on categories and tags
export async function getRelatedPosts(
  currentPostId: string,
  categories: string[] = [],
  tags: string[] = [],
  limit: number = 3
): Promise<BlogPost[]> {
  const categoryFilter = categories.length > 0 
    ? `count((categories[]->slug.current)[@ in [${categories.map(c => `"${c}"`).join(', ')}]]) > 0`
    : 'false'
  
  const tagFilter = tags.length > 0
    ? `count(tags[@ in [${tags.map(t => `"${t}"`).join(', ')}]]) > 0`
    : 'false'

  return client.fetch(
    groq`
      *[_type == "blogPost" && _id != $currentPostId && publishedAt <= now() && (${categoryFilter} || ${tagFilter})]
      | order(publishedAt desc)
      [0...${limit}] {
        ${blogPostFields}
      }
    `,
    { currentPostId }
  )
}

// Get all categories
export async function getCategories(): Promise<Category[]> {
  return client.fetch(
    groq`
      *[_type == "category"] | order(title asc) {
        _id,
        title,
        "slug": slug.current,
        description,
        color,
        "postCount": count(*[_type == "blogPost" && references(^._id) && publishedAt <= now()])
      }
    `
  )
}

// Get all authors
export async function getAuthors(): Promise<Author[]> {
  return client.fetch(
    groq`
      *[_type == "author"] | order(name asc) {
        _id,
        name,
        "slug": slug.current,
        image,
        bio,
        email,
        twitter,
        linkedin,
        github,
        website,
        "postCount": count(*[_type == "blogPost" && references(^._id) && publishedAt <= now()])
      }
    `
  )
}

// Get posts by category
export async function getPostsByCategory(categorySlug: string, limit: number = 10): Promise<BlogPost[]> {
  return client.fetch(
    groq`
      *[_type == "blogPost" && $categorySlug in categories[]->slug.current && publishedAt <= now()]
      | order(publishedAt desc)
      [0...${limit}] {
        ${blogPostFields}
      }
    `,
    { categorySlug }
  )
}

// Get posts by author
export async function getPostsByAuthor(authorSlug: string, limit: number = 10): Promise<BlogPost[]> {
  return client.fetch(
    groq`
      *[_type == "blogPost" && author->slug.current == $authorSlug && publishedAt <= now()]
      | order(publishedAt desc)
      [0...${limit}] {
        ${blogPostFields}
      }
    `,
    { authorSlug }
  )
}

// Get posts by tag
export async function getPostsByTag(tag: string, limit: number = 10): Promise<BlogPost[]> {
  return client.fetch(
    groq`
      *[_type == "blogPost" && $tag in tags && publishedAt <= now()]
      | order(publishedAt desc)
      [0...${limit}] {
        ${blogPostFields}
      }
    `,
    { tag }
  )
}

// Search posts
export async function searchPosts(searchTerm: string, limit: number = 10): Promise<BlogPost[]> {
  return client.fetch(
    groq`
      *[_type == "blogPost" && publishedAt <= now() && (
        title match "*${searchTerm}*" ||
        excerpt match "*${searchTerm}*" ||
        $searchTerm in tags
      )]
      | order(publishedAt desc)
      [0...${limit}] {
        ${blogPostFields}
      }
    `,
    { searchTerm }
  )
}

// Get all unique tags
export async function getAllTags(): Promise<string[]> {
  const result = await client.fetch(
    groq`
      array::unique(*[_type == "blogPost" && publishedAt <= now()].tags[])
    `
  )
  return result || []
} 
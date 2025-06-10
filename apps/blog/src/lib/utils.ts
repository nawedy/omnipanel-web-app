// src/lib/utils.ts
// Utility functions for the blog app

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date for display
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'MMMM d, yyyy')
}

// Format date for datetime attribute
export function formatDatetime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'yyyy-MM-dd')
}

// Calculate reading time based on content
export function calculateReadingTime(content: any[]): number {
  if (!content || !Array.isArray(content)) return 1

  const wordsPerMinute = 200
  let wordCount = 0

  const countWords = (blocks: any[]): void => {
    blocks.forEach((block) => {
      if (block._type === 'block' && block.children) {
        block.children.forEach((child: any) => {
          if (child.text) {
            wordCount += child.text.split(/\s+/).length
          }
        })
      } else if (block._type === 'codeBlock' && block.code) {
        // Count code blocks as fewer words since they're scanned differently
        wordCount += Math.ceil(block.code.split(/\s+/).length * 0.5)
      }
    })
  }

  countWords(content)
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
}

// Generate excerpt from content
export function generateExcerpt(content: any[], maxLength: number = 160): string {
  if (!content || !Array.isArray(content)) return ''

  let excerpt = ''

  for (const block of content) {
    if (block._type === 'block' && block.children) {
      for (const child of block.children) {
        if (child.text) {
          excerpt += child.text + ' '
          if (excerpt.length >= maxLength) {
            break
          }
        }
      }
      if (excerpt.length >= maxLength) {
        break
      }
    }
  }

  if (excerpt.length > maxLength) {
    excerpt = excerpt.substring(0, maxLength).trim() + '...'
  }

  return excerpt.trim()
}

// Slugify text
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

// Get color classes for categories
export function getCategoryColorClasses(color: string): {
  bg: string
  text: string
  border: string
} {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/20',
      text: 'text-blue-800 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-800',
    },
    green: {
      bg: 'bg-green-100 dark:bg-green-900/20',
      text: 'text-green-800 dark:text-green-300',
      border: 'border-green-200 dark:border-green-800',
    },
    red: {
      bg: 'bg-red-100 dark:bg-red-900/20',
      text: 'text-red-800 dark:text-red-300',
      border: 'border-red-200 dark:border-red-800',
    },
    yellow: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/20',
      text: 'text-yellow-800 dark:text-yellow-300',
      border: 'border-yellow-200 dark:border-yellow-800',
    },
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-900/20',
      text: 'text-purple-800 dark:text-purple-300',
      border: 'border-purple-200 dark:border-purple-800',
    },
    pink: {
      bg: 'bg-pink-100 dark:bg-pink-900/20',
      text: 'text-pink-800 dark:text-pink-300',
      border: 'border-pink-200 dark:border-pink-800',
    },
    indigo: {
      bg: 'bg-indigo-100 dark:bg-indigo-900/20',
      text: 'text-indigo-800 dark:text-indigo-300',
      border: 'border-indigo-200 dark:border-indigo-800',
    },
    gray: {
      bg: 'bg-gray-100 dark:bg-gray-900/20',
      text: 'text-gray-800 dark:text-gray-300',
      border: 'border-gray-200 dark:border-gray-800',
    },
  }

  return colorMap[color] || colorMap.gray
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

// Generate social sharing URLs
export function generateSocialUrls(url: string, title: string) {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  return {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
  }
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Generate table of contents from content
export function generateTableOfContents(content: any[]): Array<{
  id: string
  title: string
  level: number
}> {
  if (!content || !Array.isArray(content)) return []

  const headings: Array<{ id: string; title: string; level: number }> = []

  content.forEach((block) => {
    if (block._type === 'block' && ['h1', 'h2', 'h3', 'h4'].includes(block.style)) {
      const title = block.children
        ?.map((child: any) => child.text)
        .join('')
        .trim()

      if (title) {
        const level = parseInt(block.style.replace('h', ''))
        const id = slugify(title)
        headings.push({ id, title, level })
      }
    }
  })

  return headings
}

// Get estimated read time text
export function getReadTimeText(minutes: number): string {
  if (minutes < 1) return 'Less than 1 min read'
  if (minutes === 1) return '1 min read'
  return `${minutes} min read`
} 
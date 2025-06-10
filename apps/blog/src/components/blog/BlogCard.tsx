// src/components/blog/BlogCard.tsx
// Blog card component for post previews and lists

"use client";

import Link from 'next/link'
import Image from 'next/image'
import type { BlogPost } from '@/types/blog'
import { Badge } from '@/components/ui/Badge'
import { formatDate, calculateReadingTime, generateExcerpt } from '@/lib/utils'
import { Calendar, Clock, User } from 'lucide-react'

interface BlogCardProps {
  post: BlogPost
  variant?: 'default' | 'featured' | 'compact'
  showCategory?: boolean
  showExcerpt?: boolean
  className?: string
}

export function BlogCard({ 
  post, 
  variant = 'default', 
  showCategory = true, 
  showExcerpt = true,
  className = '' 
}: BlogCardProps): JSX.Element {
  const readingTime = calculateReadingTime(post.content)
  const excerpt = generateExcerpt(post.content, 150)

  const baseClasses = 'group bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden hover:border-slate-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10'
  
  if (variant === 'featured') {
    return (
      <article className={`${baseClasses} md:flex ${className}`}>
        {post.featuredImage?.url && (
          <div className="md:w-1/2 relative overflow-hidden">
            <Image
              src={post.featuredImage.url}
              alt={post.title}
              width={600}
              height={400}
              className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {showCategory && post.categories && post.categories[0] && (
              <Badge 
                variant="outline" 
                className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-sm"
              >
                {post.categories[0].title}
              </Badge>
            )}
          </div>
        )}
        <div className="md:w-1/2 p-6 flex flex-col justify-between">
          <div>
            <Link href={`/posts/${post.slug}`}>
              <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors line-clamp-2">
                {post.title}
              </h2>
            </Link>
            {showExcerpt && (
              <p className="text-slate-400 mb-4 line-clamp-3">
                {post.excerpt || excerpt}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between text-sm text-slate-500">
            <div className="flex items-center space-x-4">
              {post.author && (
                <div className="flex items-center space-x-1">
                  <User size={14} />
                  <span>{post.author.name}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Calendar size={14} />
                <time dateTime={post.publishedAt}>
                  {formatDate(post.publishedAt)}
                </time>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Clock size={14} />
              <span>{readingTime} min read</span>
            </div>
          </div>
        </div>
      </article>
    )
  }

  if (variant === 'compact') {
    return (
      <article className={`${baseClasses} p-4 ${className}`}>
        <div className="flex space-x-4">
          {post.featuredImage?.url && (
            <div className="flex-shrink-0">
              <Image
                src={post.featuredImage.url}
                alt={post.title}
                width={80}
                height={80}
                className="w-20 h-20 object-cover rounded-lg"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <Link href={`/posts/${post.slug}`}>
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                {post.title}
              </h3>
            </Link>
            <div className="flex items-center space-x-3 text-xs text-slate-500">
              <time dateTime={post.publishedAt}>
                {formatDate(post.publishedAt)}
              </time>
              <span>{readingTime} min read</span>
            </div>
          </div>
        </div>
      </article>
    )
  }

  // Default variant
  return (
    <article className={`${baseClasses} ${className}`}>
      {post.featuredImage?.url && (
        <div className="relative overflow-hidden">
          <Image
            src={post.featuredImage.url}
            alt={post.title}
            width={400}
            height={250}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {showCategory && post.categories && post.categories[0] && (
            <Badge 
              variant="outline" 
              className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-sm"
            >
              {post.categories[0].title}
            </Badge>
          )}
        </div>
      )}
      <div className="p-6">
        <Link href={`/posts/${post.slug}`}>
          <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>
        {showExcerpt && (
          <p className="text-slate-400 mb-4 line-clamp-3">
            {post.excerpt || excerpt}
          </p>
        )}
        <div className="flex items-center justify-between text-sm text-slate-500">
          <div className="flex items-center space-x-4">
            {post.author && (
              <div className="flex items-center space-x-1">
                <User size={14} />
                <span>{post.author.name}</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Calendar size={14} />
              <time dateTime={post.publishedAt}>
                {formatDate(post.publishedAt)}
              </time>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Clock size={14} />
            <span>{readingTime} min read</span>
          </div>
        </div>
        {post.tags && post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" size="sm">
                {tag}
              </Badge>
            ))}
            {post.tags.length > 3 && (
              <Badge variant="outline" size="sm">
                +{post.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </div>
    </article>
  )
} 
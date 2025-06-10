// src/app/posts/[slug]/page.tsx
// Individual blog post page with content and related articles

import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { BlogCard } from '@/components/blog/BlogCard'
import { NewsletterSignup } from '@/components/blog/NewsletterSignup'
import { client } from '@/lib/sanity'
import { getPostBySlug, getAllPosts } from '@/lib/queries'
import { getDemoPost, getDemoPosts } from '@/lib/demo-data'
import { formatDate, calculateReadingTime, generateTableOfContents, generateSocialUrls } from '@/lib/utils'
import type { BlogPost } from '@/types/blog'
import { Calendar, Clock, User, Share2, Twitter, Linkedin, Facebook } from 'lucide-react'
import { PortableText } from '@portabletext/react'

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    // Try to fetch from Sanity first
    const post = await getPostBySlug(slug)
    
    if (post) {
      return post
    }

    // Fall back to demo data
    console.log('Using demo data for post:', slug)
    return await getDemoPost(slug)
  } catch (error) {
    console.error('Error fetching post, using demo data:', error)
    // Fall back to demo data on any error
    return await getDemoPost(slug)
  }
}

async function getRelatedPosts(currentPostId: string, limit: number = 3): Promise<BlogPost[]> {
  try {
    const posts = await getAllPosts({ limit: 20 })
    return posts.filter((post: BlogPost) => post._id !== currentPostId).slice(0, limit)
  } catch (error) {
    console.error('Error fetching related posts:', error)
    return []
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getPost(params.slug)

  if (!post) {
    return {
      title: 'Post Not Found - OmniPanel Blog',
      description: 'The requested blog post could not be found.'
    }
  }

  return {
    title: `${post.title} - OmniPanel Blog`,
    description: post.excerpt || `Read ${post.title} on the OmniPanel blog`,
    openGraph: {
      title: post.title,
      description: post.excerpt || '',
      type: 'article',
      publishedTime: post.publishedAt,
      authors: post.author ? [post.author.name] : [],
      images: post.featuredImage?.url ? [{ url: post.featuredImage.url, alt: post.title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || '',
      images: post.featuredImage?.url ? [post.featuredImage.url] : [],
    }
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps): Promise<JSX.Element> {
  const post = await getPost(params.slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = await getRelatedPosts(post._id, 3)
  const readingTime = calculateReadingTime(post.content)
  const tableOfContents = generateTableOfContents(post.content)
  const socialUrls = generateSocialUrls(
    `${process.env.NEXT_PUBLIC_BLOG_URL || 'https://blog.omnipanel.com'}/posts/${post.slug}`,
    post.title
  )

  return (
    <div className="min-h-screen bg-app-primary">
      <Header />

      <article className="py-8">
        {/* Hero Section */}
        <section className="py-16 bg-slate-950">
          <div className="container mx-auto px-4 max-w-4xl">
            {/* Breadcrumb */}
            <nav className="mb-8">
              <ol className="flex items-center space-x-2 text-sm text-slate-400">
                <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                <li>/</li>
                <li><Link href="/posts" className="hover:text-white transition-colors">Articles</Link></li>
                <li>/</li>
                <li className="text-slate-300">{post.title}</li>
              </ol>
            </nav>

            {/* Category Badge */}
            {post.categories && post.categories[0] && (
              <Badge variant="outline" className="mb-6">
                {post.categories[0].title}
              </Badge>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                {post.excerpt}
              </p>
            )}

            {/* Author and Meta */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
              <div className="flex items-center space-x-6 text-slate-400 mb-4 sm:mb-0">
                {post.author && (
                  <div className="flex items-center space-x-2">
                    <User size={16} />
                    <span>{post.author.name}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Calendar size={16} />
                  <time dateTime={post.publishedAt}>
                    {formatDate(post.publishedAt)}
                  </time>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock size={16} />
                  <span>{readingTime} min read</span>
                </div>
              </div>

              {/* Social Share */}
              <div className="flex items-center space-x-2">
                <span className="text-slate-400 text-sm mr-2">Share:</span>
                <a
                  href={socialUrls.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  aria-label="Share on Twitter"
                >
                  <Twitter size={16} />
                </a>
                <a
                  href={socialUrls.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  aria-label="Share on LinkedIn"
                >
                  <Linkedin size={16} />
                </a>
                <a
                  href={socialUrls.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  aria-label="Share on Facebook"
                >
                  <Facebook size={16} />
                </a>
              </div>
            </div>

            {/* Cover Image */}
            {post.featuredImage?.url && (
              <div className="relative aspect-video rounded-lg overflow-hidden mb-8">
                <Image
                  src={post.featuredImage.url}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Table of Contents (Desktop) */}
              {tableOfContents.length > 0 && (
                <aside className="lg:w-64 lg:flex-shrink-0 order-2 lg:order-1">
                  <div className="sticky top-24">
                    <h3 className="text-lg font-semibold text-white mb-4">Table of Contents</h3>
                    <nav className="space-y-2">
                      {tableOfContents.map((item, index) => (
                        <a
                          key={index}
                          href={`#${item.id}`}
                          className="block text-sm text-slate-400 hover:text-white transition-colors py-1"
                          style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
                        >
                          {item.title}
                        </a>
                      ))}
                    </nav>
                  </div>
                </aside>
              )}

              {/* Article Content */}
              <div className="flex-1 order-1 lg:order-2">
                <div className="prose prose-slate prose-invert max-w-none">
                  <PortableText value={post.content} />
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-slate-800">
                    <h3 className="text-lg font-semibold text-white mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Campaign CTA */}
                {post.campaignIntegration?.ctaText && post.campaignIntegration?.ctaUrl && (
                  <div className="mt-12 p-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Ready to Get Started?
                    </h3>
                    <p className="text-slate-300 mb-4">
                      Experience the security and productivity of OmniPanel for yourself.
                    </p>
                    <Button asChild>
                      <Link href={post.campaignIntegration.ctaUrl}>
                        {post.campaignIntegration.ctaText}
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-16 bg-slate-950">
          <div className="container mx-auto px-4 max-w-2xl">
            <NewsletterSignup 
              campaignId={post.campaignIntegration?.relatedCampaign || 'blog-post'}
              variant="default"
            />
          </div>
        </section>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <section className="py-16">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-white mb-8 text-center">
                Related Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {relatedPosts.map((relatedPost) => (
                  <BlogCard 
                    key={relatedPost._id} 
                    post={relatedPost} 
                    showExcerpt={false}
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </article>

      <Footer />
    </div>
  )
} 
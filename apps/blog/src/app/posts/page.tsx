// src/app/posts/page.tsx
// Blog posts listing page with pagination and filtering

import { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BlogCard } from '@/components/blog/BlogCard'
import { NewsletterSignup } from '@/components/blog/NewsletterSignup'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { getDemoPosts, getDemoCategories } from '@/lib/demo-data'
import type { BlogPost, Category } from '@/types/blog'
import Link from 'next/link'
import { Search, Filter } from 'lucide-react'

export const metadata: Metadata = {
  title: 'All Articles - OmniPanel Blog',
  description: 'Discover insights on AI development security, privacy-first coding practices, and developer productivity tools.',
  openGraph: {
    title: 'All Articles - OmniPanel Blog',
    description: 'Discover insights on AI development security, privacy-first coding practices, and developer productivity tools.',
    type: 'website',
  },
}

interface PostsPageProps {
  searchParams: {
    category?: string
    page?: string
    search?: string
  }
}

async function getPostsData(
  category?: string, 
  page: number = 1, 
  search?: string
): Promise<{ posts: BlogPost[], categories: Category[], totalPages: number }> {
  try {
    console.log('Loading demo data for posts page')
    const [posts, categories] = await Promise.all([
      getDemoPosts(),
      getDemoCategories()
    ])

    let filteredPosts = posts || []

    // Filter by category
    if (category) {
      filteredPosts = filteredPosts.filter((post: BlogPost) => 
        post.category?.slug === category
      )
    }

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase()
      filteredPosts = filteredPosts.filter((post: BlogPost) =>
        post.title.toLowerCase().includes(searchLower) ||
        post.excerpt?.toLowerCase().includes(searchLower) ||
        post.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // Pagination
    const postsPerPage = 9
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage)
    const startIndex = (page - 1) * postsPerPage
    const paginatedPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage)

    return {
      posts: paginatedPosts,
      categories: categories || [],
      totalPages
    }
  } catch (error) {
    console.error('Error loading demo data for posts:', error)
    return { posts: [], categories: [], totalPages: 0 }
  }
}

export default async function PostsPage({ searchParams }: PostsPageProps): Promise<JSX.Element> {
  const page = Number(searchParams.page) || 1
  const category = searchParams.category
  const search = searchParams.search

  const { posts, categories, totalPages } = await getPostsData(category, page, search)

  const selectedCategory = categories.find(cat => cat.slug === category)

  return (
    <div className="min-h-screen bg-app-primary">
      <Header />

      <main className="py-8">
        {/* Page Header */}
        <section className="py-16 bg-slate-950">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {selectedCategory ? selectedCategory.title : 'All Articles'}
              </h1>
              <p className="text-xl text-slate-300 mb-8">
                {selectedCategory 
                  ? selectedCategory.description 
                  : 'Discover insights on AI development security, privacy-first coding practices, and developer productivity.'
                }
              </p>

              {/* Search and Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    defaultValue={search}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <Button variant="outline" className="flex items-center">
                  <Filter size={20} className="mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Filter */}
        <section className="py-8 bg-slate-900/50">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/posts">
                <Badge 
                  variant={!category ? "default" : "outline"}
                  className="cursor-pointer hover:bg-slate-700 transition-colors"
                >
                  All Articles
                </Badge>
              </Link>
              {categories.map((cat) => (
                <Link key={cat._id} href={`/posts?category=${cat.slug}`}>
                  <Badge 
                    variant={category === cat.slug ? "default" : "outline"}
                    className="cursor-pointer hover:bg-slate-700 transition-colors"
                  >
                    {cat.title}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Posts Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {posts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {posts.map((post, index) => (
                    <BlogCard 
                      key={post._id} 
                      post={post} 
                      variant={index === 0 && page === 1 ? "featured" : "default"}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-4">
                    {page > 1 && (
                      <Link 
                        href={`/posts?${new URLSearchParams({ 
                          ...(category && { category }), 
                          ...(search && { search }),
                          page: String(page - 1) 
                        })}`}
                      >
                        <Button variant="outline">Previous</Button>
                      </Link>
                    )}
                    
                    <div className="flex space-x-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <Link 
                          key={pageNum}
                          href={`/posts?${new URLSearchParams({ 
                            ...(category && { category }), 
                            ...(search && { search }),
                            page: String(pageNum) 
                          })}`}
                        >
                          <Button 
                            variant={pageNum === page ? "primary" : "ghost"}
                            size="sm"
                          >
                            {pageNum}
                          </Button>
                        </Link>
                      ))}
                    </div>

                    {page < totalPages && (
                      <Link 
                        href={`/posts?${new URLSearchParams({ 
                          ...(category && { category }), 
                          ...(search && { search }),
                          page: String(page + 1) 
                        })}`}
                      >
                        <Button variant="outline">Next</Button>
                      </Link>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-2xl font-semibold text-white mb-4">No articles found</h3>
                <p className="text-slate-400 mb-8">
                  {search 
                    ? `No articles match your search for "${search}"`
                    : category 
                    ? `No articles found in the ${selectedCategory?.title} category`
                    : 'No articles available'
                  }
                </p>
                <Link href="/posts">
                  <Button>View All Articles</Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-16 bg-slate-950">
          <div className="container mx-auto px-4 max-w-2xl">
            <NewsletterSignup 
              campaignId="posts-page-newsletter"
              showDescription={true}
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
} 
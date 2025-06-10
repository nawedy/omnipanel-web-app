import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { BlogCard } from '@/components/blog/BlogCard'
import { NewsletterSignup } from '@/components/blog/NewsletterSignup'
import Link from 'next/link'
import { getDemoPosts } from '@/lib/demo-data'
import type { BlogPost } from '@/types/blog'
import { ArrowRight, Shield, Zap, Users } from 'lucide-react'

// Use only demo data for now to avoid Sanity connection issues
async function getStaticData(): Promise<{ posts: BlogPost[] }> {
  try {
    console.log('Loading demo data for homepage')
    const demoPosts = await getDemoPosts()
    return { posts: demoPosts }
  } catch (error) {
    console.error('Error loading demo data:', error)
    return { posts: [] }
  }
}

export default async function HomePage(): Promise<JSX.Element> {
  const { posts } = await getStaticData()
  const featuredPost = posts.find(post => post.featured) || posts[0]
  const recentPosts = posts.filter(post => !post.featured).slice(0, 3)

  return (
    <div className="min-h-screen bg-app-primary">
      <Header />

      <main className="pb-12">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-20">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20"></div>
          <div className="relative container mx-auto px-4 text-center">
            <Badge variant="outline" className="mb-6 inline-flex">
              <Zap className="w-4 h-4 mr-2" />
              Latest insights on AI development security
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 max-w-4xl mx-auto">
              The Future of 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"> Secure </span>
              AI Development
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Discover how to build AI applications without compromising on security, privacy, or developer productivity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/posts">
                  Read Latest Articles
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="https://omnipanel.com/early-access">
                  Get Early Access
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Article */}
        {featuredPost && (
          <section className="py-16 bg-slate-950">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white">Featured Article</h2>
                <Link 
                  href="/posts" 
                  className="text-blue-400 hover:text-blue-300 transition-colors flex items-center"
                >
                  View all articles
                  <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </div>
              <BlogCard post={featuredPost} variant="featured" />
            </div>
          </section>
        )}

        {/* Recent Articles */}
        {recentPosts.length > 0 && (
          <section className="py-16">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-white mb-8">Latest Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recentPosts.map((post) => (
                  <BlogCard key={post._id} post={post} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Topics Section */}
        <section className="py-16 bg-slate-950">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Explore Topics</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Deep dive into the most important areas of secure AI development
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Link 
                href="/posts?category=security" 
                className="group bg-slate-900/50 border border-slate-800 rounded-lg p-6 hover:border-slate-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
              >
                <Shield className="w-12 h-12 text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  Security & Privacy
                </h3>
                <p className="text-slate-400">
                  Learn how to protect your code, data, and AI models from threats while maintaining productivity.
                </p>
              </Link>

              <Link 
                href="/posts?category=ai" 
                className="group bg-slate-900/50 border border-slate-800 rounded-lg p-6 hover:border-slate-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
              >
                <Zap className="w-12 h-12 text-green-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-green-400 transition-colors">
                  AI Development
                </h3>
                <p className="text-slate-400">
                  Best practices for building, testing, and deploying AI applications in secure environments.
                </p>
              </Link>

              <Link 
                href="/posts?category=tools" 
                className="group bg-slate-900/50 border border-slate-800 rounded-lg p-6 hover:border-slate-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
              >
                <Users className="w-12 h-12 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                  Developer Tools
                </h3>
                <p className="text-slate-400">
                  Reviews and tutorials on development tools, IDEs, and productivity solutions for AI developers.
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <NewsletterSignup 
              campaignId="homepage-newsletter"
              showDescription={true}
            />
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-slate-950">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Code Securely?
            </h2>
            <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
              Join thousands of developers using OmniPanel to build AI applications without compromising on security.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="https://omnipanel.com/download">
                  Download OmniPanel
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="https://omnipanel.com/docs">
                  View Documentation
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

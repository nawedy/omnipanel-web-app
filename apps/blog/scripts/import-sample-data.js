// scripts/import-sample-data.js
// Script to import sample data into Sanity CMS

const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

// Sanity client configuration
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false
});

// Sample authors
const authors = [
  {
    _id: 'author-alex-chen',
    _type: 'author',
    name: 'Alex Chen',
    slug: { current: 'alex-chen' },
    bio: 'Security researcher and privacy advocate with 8+ years in cybersecurity. Passionate about making AI development more secure and transparent.',
    image: {
      _type: 'image',
      alt: 'Alex Chen'
    }
  },
  {
    _id: 'author-sarah-rodriguez', 
    _type: 'author',
    name: 'Sarah Rodriguez',
    slug: { current: 'sarah-rodriguez' },
    bio: 'AI ethics researcher and software engineer. Focuses on responsible AI development and privacy-preserving technologies.',
    image: {
      _type: 'image',
      alt: 'Sarah Rodriguez'
    }
  },
  {
    _id: 'author-marcus-kim',
    _type: 'author', 
    name: 'Marcus Kim',
    slug: { current: 'marcus-kim' },
    bio: 'Developer tools architect and open-source contributor. Builds secure development environments for AI teams.',
    image: {
      _type: 'image',
      alt: 'Marcus Kim'
    }
  }
];

// Sample categories
const categories = [
  {
    _id: 'category-security-privacy',
    _type: 'category',
    title: 'Security & Privacy',
    slug: { current: 'security-privacy' },
    description: 'Best practices for secure AI development and data privacy'
  },
  {
    _id: 'category-ai-development',
    _type: 'category', 
    title: 'AI Development',
    slug: { current: 'ai-development' },
    description: 'Tools, techniques, and insights for AI/ML development'
  },
  {
    _id: 'category-developer-tools',
    _type: 'category',
    title: 'Developer Tools', 
    slug: { current: 'developer-tools' },
    description: 'Reviews and guides for development tools and workflows'
  },
  {
    _id: 'category-industry-insights',
    _type: 'category',
    title: 'Industry Insights',
    slug: { current: 'industry-insights' },
    description: 'Analysis of trends and developments in the tech industry'
  },
  {
    _id: 'category-community',
    _type: 'category',
    title: 'Community',
    slug: { current: 'community' },
    description: 'Community updates, events, and contributor spotlights'
  }
];

// Sample blog posts
const blogPosts = [
  {
    _id: 'post-privacy-crisis-ai-tools',
    _type: 'blogPost',
    title: 'The Hidden Privacy Crisis in AI Development Tools',
    slug: { current: 'privacy-crisis-ai-development-tools' },
    excerpt: 'Most AI development platforms are silently collecting your code, data, and intellectual property. Here\'s what you need to know and how to protect yourself.',
    content: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'The rapid adoption of AI-powered development tools has created an unprecedented privacy crisis that most developers are completely unaware of. From code completion to chat interfaces, these tools are silently collecting, analyzing, and potentially sharing your most sensitive intellectual property.'
          }
        ]
      },
      {
        _type: 'block',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: 'The Scope of Data Collection'
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'Popular AI development platforms routinely collect:'
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '• Your complete codebase and commit history\n• API keys, database credentials, and configuration files\n• Internal documentation and comments\n• Error logs and debugging information\n• Usage patterns and workflow data'
          }
        ]
      },
      {
        _type: 'block', 
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: 'Why This Matters for Your Business'
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'This data collection poses serious risks to competitive advantage, intellectual property protection, and regulatory compliance. Companies using these tools unknowingly expose their trade secrets to potential competitors and create liability under data protection regulations.'
          }
        ]
      }
    ],
    author: { _ref: 'author-alex-chen' },
    category: { _ref: 'category-security-privacy' },
    publishedAt: '2024-01-15T10:00:00.000Z',
    featured: true,
    readingTime: 8,
    campaignId: 'privacy-awareness-2024',
    ctaText: 'Protect Your Code with OmniPanel',
    ctaUrl: 'https://omnipanel.ai/signup?utm_campaign=privacy-awareness',
    seo: {
      title: 'The Hidden Privacy Crisis in AI Development Tools - OmniPanel Blog',
      description: 'Discover how AI development platforms collect your code and IP. Learn to protect your business with privacy-first alternatives.',
      keywords: ['AI privacy', 'code security', 'developer tools', 'intellectual property']
    }
  },
  {
    _id: 'post-local-ai-revolution',
    _type: 'blogPost', 
    title: 'Why Local AI Models Are Revolutionizing Enterprise Development',
    slug: { current: 'local-ai-models-enterprise-development' },
    excerpt: 'Local AI models offer unprecedented control, privacy, and customization for enterprise development teams. Here\'s why forward-thinking companies are making the switch.',
    content: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'The enterprise software landscape is experiencing a fundamental shift toward local AI models. Companies that once relied entirely on cloud-based AI services are discovering the transformative benefits of running AI models within their own infrastructure.'
          }
        ]
      },
      {
        _type: 'block',
        style: 'h2', 
        children: [
          {
            _type: 'span',
            text: 'Complete Data Sovereignty'
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'Local AI models ensure that sensitive code, proprietary algorithms, and confidential business logic never leave your infrastructure. This level of control is essential for companies in regulated industries or those handling sensitive intellectual property.'
          }
        ]
      }
    ],
    author: { _ref: 'author-sarah-rodriguez' },
    category: { _ref: 'category-ai-development' },
    publishedAt: '2024-01-10T14:30:00.000Z',
    featured: false,
    readingTime: 6,
    campaignId: 'local-ai-education',
    ctaText: 'Explore Local AI with OmniPanel',
    ctaUrl: 'https://omnipanel.ai/local-ai?utm_campaign=local-ai-education',
    seo: {
      title: 'Local AI Models for Enterprise Development - Benefits & Implementation',
      description: 'Learn why enterprises choose local AI models for development. Privacy, control, and customization advantages explained.',
      keywords: ['local AI', 'enterprise AI', 'on-premise AI', 'AI privacy']
    }
  },
  {
    _id: 'post-choosing-development-environment',
    _type: 'blogPost',
    title: 'Choosing the Right AI Development Environment in 2024',
    slug: { current: 'choosing-ai-development-environment-2024' },
    excerpt: 'A comprehensive guide to evaluating AI development platforms based on security, performance, and team collaboration features.',
    content: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'Selecting the right AI development environment is one of the most critical decisions your team will make this year. The choice impacts everything from development velocity to security compliance and long-term scalability.'
          }
        ]
      },
      {
        _type: 'block',
        style: 'h2',
        children: [
          {
            _type: 'span', 
            text: 'Key Evaluation Criteria'
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'When evaluating AI development platforms, consider these essential factors: security and privacy controls, model variety and performance, collaboration features, integration capabilities, and total cost of ownership.'
          }
        ]
      }
    ],
    author: { _ref: 'author-marcus-kim' },
    category: { _ref: 'category-developer-tools' },
    publishedAt: '2024-01-05T09:15:00.000Z',
    featured: false,
    readingTime: 10,
    campaignId: 'platform-comparison',
    ctaText: 'Try OmniPanel Free',
    ctaUrl: 'https://omnipanel.ai/trial?utm_campaign=platform-comparison',
    seo: {
      title: 'Best AI Development Environment 2024 - Complete Buyer\'s Guide',
      description: 'Compare AI development platforms. Security, features, and pricing analysis to help you choose the right solution.',
      keywords: ['AI development platform', 'development environment', 'AI tools comparison']
    }
  }
];

async function importData() {
  try {
    console.log('🚀 Starting data import to Sanity project:', process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
    
    // Check if we can connect to Sanity
    const projectInfo = await client.request({
      url: '/projects/' + process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
    });
    console.log('✅ Connected to Sanity project:', projectInfo.displayName || projectInfo.name);

    // Import authors
    console.log('📝 Importing authors...');
    for (const author of authors) {
      await client.createOrReplace(author);
      console.log(`   ✅ Created author: ${author.name}`);
    }

    // Import categories  
    console.log('📂 Importing categories...');
    for (const category of categories) {
      await client.createOrReplace(category);
      console.log(`   ✅ Created category: ${category.title}`);
    }

    // Import blog posts
    console.log('📄 Importing blog posts...');
    for (const post of blogPosts) {
      await client.createOrReplace(post);
      console.log(`   ✅ Created post: ${post.title}`);
    }

    console.log('\n🎉 Sample data import completed successfully!');
    console.log('🔗 Visit your Sanity Studio at: http://localhost:3333');
    console.log('🌐 Visit your blog at: http://localhost:3001');
    
  } catch (error) {
    console.error('❌ Error importing data:', error.message);
    
    if (error.statusCode === 401) {
      console.error('🔑 Authentication failed. Please check your SANITY_API_TOKEN in .env.local');
    } else if (error.statusCode === 404) {
      console.error('🏗️ Project not found. Please check your NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local');
    } else {
      console.error('📋 Full error:', error);
    }
    
    process.exit(1);
  }
}

// Run the import
importData(); 
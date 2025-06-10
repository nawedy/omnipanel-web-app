// scripts/export-demo-data.js
// Script to export demo data to Sanity NDJSON format

const fs = require('fs');
const path = require('path');

// Import demo data (you'll need to adjust this path if needed)
const { getDemoPosts, getDemoAuthors, getDemoCategories } = require('../src/lib/demo-data');

function generateSanityDocument(type, data) {
  const now = new Date().toISOString();
  
  return {
    _id: data._id,
    _type: type,
    _createdAt: now,
    _updatedAt: now,
    _rev: 'initial',
    ...data
  };
}

async function exportDemoData() {
  try {
    console.log('🚀 Exporting demo data to Sanity format...');
    
    // Get demo data
    const [posts, authors, categories] = await Promise.all([
      getDemoPosts(),
      getDemoAuthors(), 
      getDemoCategories()
    ]);
    
    const documents = [];
    
    // Convert categories
    categories.forEach(category => {
      documents.push(generateSanityDocument('category', {
        _id: category._id,
        title: category.title,
        slug: { current: category.slug },
        description: category.description,
        color: category.color
      }));
    });
    
    // Convert authors
    authors.forEach(author => {
      documents.push(generateSanityDocument('author', {
        _id: author._id,
        name: author.name,
        slug: { current: author.slug },
        bio: author.bio,
        image: author.image,
        social: author.social
      }));
    });
    
    // Convert blog posts
    posts.forEach(post => {
      documents.push(generateSanityDocument('blogPost', {
        _id: post._id,
        title: post.title,
        slug: { current: post.slug },
        excerpt: post.excerpt,
        content: post.content,
        author: { _type: 'reference', _ref: post.author._id },
        category: { _type: 'reference', _ref: post.category._id },
        tags: post.tags,
        publishedAt: post.publishedAt,
        featured: post.featured,
        readingTime: post.readingTime,
        featuredImage: post.featuredImage,
        seo: post.seo,
        campaignIntegration: post.campaignIntegration
      }));
    });
    
    // Write NDJSON file
    const outputPath = path.join(__dirname, '..', 'demo-export.ndjson');
    const ndjsonContent = documents.map(doc => JSON.stringify(doc)).join('\n');
    
    fs.writeFileSync(outputPath, ndjsonContent);
    
    console.log('✅ Demo data exported successfully!');
    console.log(`📁 File location: ${outputPath}`);
    console.log(`📊 Exported ${documents.length} documents:`);
    console.log(`   - ${categories.length} categories`);
    console.log(`   - ${authors.length} authors`);
    console.log(`   - ${posts.length} blog posts`);
    console.log('');
    console.log('🚀 Next steps:');
    console.log('1. Run: npx sanity dataset import demo-export.ndjson production');
    console.log('2. Update your .env.local with real Sanity credentials');
    console.log('3. Restart your dev server');
    
  } catch (error) {
    console.error('❌ Error exporting demo data:', error);
    process.exit(1);
  }
}

// Run the export
exportDemoData(); 
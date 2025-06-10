# 🎨 Sanity CMS Setup Guide for OmniPanel Blog

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- A Sanity account (free at https://sanity.io)

## Step 1: Create a Sanity Account and Project

1. **Visit https://sanity.io and sign up** (if you haven't already)
2. **Create a new project** with these settings:
   - Project name: `OmniPanel Blog`
   - Use schema template: `Blog (schema)`
   - Add sample data: `Yes` (recommended for testing)

## Step 2: Initialize Sanity in Your Blog Directory

```bash
# Navigate to the blog directory
cd omnipanel-core/apps/blog

# Initialize Sanity (this will create sanity.config.ts and schemas)
npx sanity@latest init

# When prompted:
# - Select your existing project: "OmniPanel Blog"
# - Use TypeScript: Yes
# - Use default dataset configuration: Yes
# - Add sample data: Yes (recommended)
```

## Step 3: Install Required Dependencies

```bash
# Install Sanity Studio dependencies
npm install @sanity/vision @sanity/cli

# Verify installation
npx sanity --version
```

## Step 4: Configure Environment Variables

Create a `.env.local` file in the blog directory with your project credentials:

```bash
# Get these values from https://sanity.io/manage
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_api_token_here
```

### How to get your credentials:

1. **Project ID**: 
   - Go to https://sanity.io/manage
   - Select your "OmniPanel Blog" project
   - Copy the Project ID from the project settings

2. **API Token**:
   - In your project dashboard, go to "API" tab
   - Click "Add API token"
   - Name: `Blog CMS Token`
   - Permissions: `Editor`
   - Copy the generated token

## Step 5: Update Sanity Client Configuration

Update `src/lib/sanity.ts` with your real project credentials:

```typescript
// src/lib/sanity.ts
import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'your_project_id',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
  token: process.env.SANITY_API_TOKEN,
})
```

## Step 6: Configure Sanity Studio

Update your `sanity.config.ts` file:

```typescript
// sanity.config.ts
import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './src/sanity/schemaTypes'

export default defineConfig({
  name: 'omnipanel-blog',
  title: 'OmniPanel Blog',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  
  plugins: [
    deskTool(),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
  
  // Studio customization
  theme: {
    primary: '#3b82f6', // Blue theme to match OmniPanel
  },
})
```

## Step 7: Deploy Sanity Studio

```bash
# Build and deploy your Sanity Studio
npx sanity deploy

# When prompted, choose a studio hostname like:
# omnipanel-blog-studio
```

This will create a hosted studio at: `https://omnipanel-blog-studio.sanity.studio`

## Step 8: Test the Integration

1. **Start your blog**:
   ```bash
   npm run dev
   ```

2. **Visit your blog** at http://localhost:3001
   - Should now load content from Sanity instead of demo data

3. **Access Sanity Studio**:
   ```bash
   npx sanity dev --port 3333
   ```
   - Or visit your deployed studio URL
   - Create/edit blog posts and see them appear on your blog

## Step 9: Content Migration (Optional)

If you want to migrate the demo data to Sanity:

```bash
# Export demo data to Sanity format
npm run export-demo-data

# Import to Sanity
npx sanity dataset import demo-export.ndjson production
```

## Studio Management Commands

```bash
# Start local studio development
npx sanity dev --port 3333

# Deploy studio updates
npx sanity deploy

# Manage datasets
npx sanity dataset list
npx sanity dataset create staging

# Export/Import data
npx sanity dataset export production backup.tar.gz
npx sanity dataset import backup.tar.gz production
```

## Content Types Available

Your blog now supports:

### 📝 **Blog Posts**
- Title, slug, content (rich text)
- Author, category, tags
- Featured image, SEO metadata
- Marketing campaign integration
- Publication scheduling

### 👥 **Authors**
- Name, bio, profile image
- Social media links
- Author archive pages

### 🏷️ **Categories**
- Organized content topics
- Category archive pages
- Color-coded organization

### 🎯 **Marketing Integration**
- Campaign tracking
- UTM parameter support
- CTA customization per post
- Newsletter signup integration

## Security & Access Control

### Production Recommendations:
1. **Use environment-specific datasets**:
   - `production` for live content
   - `staging` for testing
   - `development` for local development

2. **Implement proper access control**:
   - Create specific API tokens for different environments
   - Use read-only tokens for production frontend
   - Limit studio access to content team only

3. **Content validation**:
   - All content is validated through Sanity schemas
   - Required fields enforced at CMS level
   - SEO metadata automatically validated

## Support & Documentation

- **Sanity Documentation**: https://www.sanity.io/docs
- **Schema Reference**: See `src/sanity/schemaTypes/` directory
- **Blog Integration**: All queries are in `src/lib/queries.ts`
- **Demo Content**: Available in `src/lib/demo-data.ts` as fallback

---

## 🚀 Next Steps

Once Sanity is configured:

1. **Create your first blog post** in the studio
2. **Configure your content strategy** (categories, tags)
3. **Set up your author profiles**
4. **Plan your content calendar**
5. **Optimize for SEO** using built-in meta fields

Your OmniPanel blog is now ready for professional content management! 🎉 
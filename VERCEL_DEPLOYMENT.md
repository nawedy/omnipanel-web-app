# 🚀 Vercel Deployment Guide

## Prerequisites

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login
```

## Step-by-Step Deployment

### 1. Deploy Main Web Application (Workspace)

```bash
# Navigate to web app
cd apps/web

# Initialize Vercel project
vercel

# Follow prompts:
# - Project name: omnipanel-workspace
# - Framework: Next.js (auto-detected)
# - Build command: npm run build
# - Output directory: .next
# - Root directory: apps/web

# Deploy to production
vercel --prod

# Expected URL: https://omnipanel-workspace.vercel.app
# Custom domain: workspace.omnipanel.app
```

### 2. Deploy Documentation Site

```bash
# Navigate to docs app
cd ../docs

# Initialize and deploy
vercel
vercel --prod

# Expected URL: https://omnipanel-docs.vercel.app
# Custom domain: docs.omnipanel.app
```

### 3. Deploy Marketing Website

```bash
# Navigate to website app
cd ../website

# Initialize and deploy
vercel
vercel --prod

# Expected URL: https://omnipanel-website.vercel.app
# Custom domain: omnipanel.app (main domain)
```

### 4. Deploy Plugin Marketplace

```bash
# Navigate to marketplace app
cd ../marketplace

# Initialize and deploy
vercel
vercel --prod

# Expected URL: https://omnipanel-marketplace.vercel.app
# Custom domain: marketplace.omnipanel.app
```

## Environment Variables Configuration

### Web App Environment Variables (apps/web)

```bash
# Add to Vercel project settings or .env.local

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# LLM API Keys (Optional)
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# App Configuration
NEXT_PUBLIC_APP_URL=https://workspace.omnipanel.app
NEXT_PUBLIC_API_URL=https://workspace.omnipanel.app/api

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
```

### Documentation Environment Variables (apps/docs)

```bash
NEXT_PUBLIC_APP_URL=https://docs.omnipanel.app
NEXT_PUBLIC_WORKSPACE_URL=https://workspace.omnipanel.app
NEXT_PUBLIC_WEBSITE_URL=https://omnipanel.app
```

### Website Environment Variables (apps/website)

```bash
NEXT_PUBLIC_APP_URL=https://omnipanel.app
NEXT_PUBLIC_WORKSPACE_URL=https://workspace.omnipanel.app
NEXT_PUBLIC_DOCS_URL=https://docs.omnipanel.app
NEXT_PUBLIC_MARKETPLACE_URL=https://marketplace.omnipanel.app

# Newsletter/Email
MAILCHIMP_API_KEY=your-mailchimp-key
MAILCHIMP_LIST_ID=your-list-id

# Analytics
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

## Custom Domains Configuration

### Purchase Domain (if needed)
- Recommended: `omnipanel.app` or `omnipanel.ai`
- Alternative: `omnipanel.io`, `omnipanel.dev`

### DNS Configuration (Cloudflare/Your Provider)

```dns
# A Record for root domain
omnipanel.app → 76.76.21.21 (Vercel IP)

# CNAME Records for subdomains
workspace.omnipanel.app → cname.vercel-dns.com
docs.omnipanel.app → cname.vercel-dns.com
marketplace.omnipanel.app → cname.vercel-dns.com
```

### Vercel Domain Settings

In each Vercel project dashboard:
1. Go to Settings → Domains
2. Add custom domain
3. Verify DNS configuration
4. Enable SSL (automatic)

## Build Configuration

### Web App (apps/web/next.config.js)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@omnipanel/core']
  },
  webpack: (config) => {
    config.externals = [...config.externals, 'canvas', 'jsdom'];
    return config;
  }
}

module.exports = nextConfig
```

### Package.json Scripts

Ensure these scripts exist in each app:

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "dev": "next dev",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

## Deployment Automation

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        app: [web, docs, website, marketplace]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build packages
        run: npm run build
      
      - name: Deploy ${{ matrix.app }}
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID_${{ matrix.app }} }}
          working-directory: ./apps/${{ matrix.app }}
```

## Post-Deployment Checklist

### 1. Verify All Apps
- [ ] Web App: https://workspace.omnipanel.app
- [ ] Documentation: https://docs.omnipanel.app
- [ ] Website: https://omnipanel.app
- [ ] Marketplace: https://marketplace.omnipanel.app

### 2. Test Core Features
- [ ] User authentication works
- [ ] Real-time sync functional
- [ ] LLM integrations working
- [ ] File operations functional
- [ ] Theme system operational

### 3. Performance Checks
- [ ] Core Web Vitals green
- [ ] Page load times < 3s
- [ ] API response times < 200ms
- [ ] Real-time sync < 100ms

### 4. SEO & Analytics
- [ ] Meta tags correct
- [ ] Open Graph images
- [ ] Analytics tracking
- [ ] Sitemap generated

## Monitoring & Maintenance

### Vercel Analytics
Enable in each project dashboard:
- Real user monitoring
- Performance insights
- Error tracking
- Usage analytics

### Custom Monitoring
```javascript
// Add to apps for custom tracking
import { track } from '@vercel/analytics';

// Track feature usage
track('workspace_opened');
track('llm_query', { provider: 'openai', model: 'gpt-4' });
```

## Troubleshooting

### Common Issues

1. **Build Failures**:
   ```bash
   # Check build locally
   npm run build
   # Fix TypeScript errors
   npm run type-check
   ```

2. **Environment Variables**:
   - Verify all required vars are set
   - Check variable names match exactly
   - Restart deployment after changes

3. **Domain Issues**:
   - Wait 24-48h for DNS propagation
   - Verify DNS records with `dig` command
   - Check SSL certificate status

### Support Contacts
- Vercel Support: https://vercel.com/help
- Domain Provider: Check your registrar
- DNS Provider: Cloudflare, etc.

---

**After successful Vercel deployment, proceed to mobile and desktop app builds!** 
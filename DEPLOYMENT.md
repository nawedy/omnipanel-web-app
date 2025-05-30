# 🚀 OmniPanel Deployment Guide

This guide covers deploying all OmniPanel applications to production environments.

## 🌐 Vercel Deployment (Recommended)

### Prerequisites
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login
```

### 1. Deploy Web Application (Main Workspace)

```bash
# Navigate to web app
cd apps/web

# Configure for deployment
vercel

# Follow prompts:
# - Project name: omnipanel-workspace
# - Framework: Next.js
# - Build command: npm run build
# - Output directory: .next
# - Root directory: apps/web

# Deploy to production
vercel --prod
```

**Live URL**: `https://workspace.omnipanel.app`

### 2. Deploy Documentation Site

```bash
# Navigate to docs app
cd apps/docs

# Configure and deploy
vercel

# Production deployment
vercel --prod
```

**Live URL**: `https://docs.omnipanel.app`

### 3. Deploy Marketing Website

```bash
# Navigate to website app
cd apps/website

# Configure and deploy
vercel

# Production deployment  
vercel --prod
```

**Live URL**: `https://omnipanel.app`

### 4. Deploy Plugin Marketplace

```bash
# Navigate to marketplace app
cd apps/marketplace

# Configure and deploy
vercel

# Production deployment
vercel --prod
```

**Live URL**: `https://marketplace.omnipanel.app`

## 🔧 Environment Configuration

### Environment Variables

Create `.env.local` files for each app:

#### Web App (`apps/web/.env.local`)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key

# OpenAI (optional)
OPENAI_API_KEY=your_openai_api_key

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id

# App Configuration
NEXT_PUBLIC_APP_URL=https://workspace.omnipanel.app
NEXT_PUBLIC_API_URL=https://workspace.omnipanel.app/api
```

#### Documentation (`apps/docs/.env.local`)
```bash
NEXT_PUBLIC_APP_URL=https://docs.omnipanel.app
NEXT_PUBLIC_WORKSPACE_URL=https://workspace.omnipanel.app
```

#### Website (`apps/website/.env.local`)
```bash
NEXT_PUBLIC_APP_URL=https://omnipanel.app
NEXT_PUBLIC_WORKSPACE_URL=https://workspace.omnipanel.app
NEXT_PUBLIC_DOCS_URL=https://docs.omnipanel.app

# Email/Newsletter
MAILCHIMP_API_KEY=your_mailchimp_key
MAILCHIMP_LIST_ID=your_list_id

# Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

### Vercel Project Settings

For each deployment, configure in Vercel dashboard:

1. **Build & Output Settings**:
   - Build Command: `npm run build`
   - Output Directory: `.next` (for Next.js apps)
   - Install Command: `npm install`

2. **Environment Variables**: Add all required env vars

3. **Domains**: Configure custom domains
   - `omnipanel.app` → website
   - `workspace.omnipanel.app` → web app
   - `docs.omnipanel.app` → documentation
   - `marketplace.omnipanel.app` → marketplace

## 🔗 Domain Configuration

### DNS Setup

Configure your DNS provider (Cloudflare, etc.):

```dns
# A Record
omnipanel.app → 76.76.21.21 (Vercel IP)

# CNAME Records
workspace.omnipanel.app → cname.vercel-dns.com
docs.omnipanel.app → cname.vercel-dns.com
marketplace.omnipanel.app → cname.vercel-dns.com
```

### SSL Certificates

Vercel automatically provides SSL certificates for all domains.

## 📱 Mobile App Distribution

### Android APK Hosting

Host APK files for direct download:

```bash
# Build Android APK
cd apps/mobile
npx eas build --platform android --profile preview

# Upload to web app public folder
mkdir -p ../web/public/downloads
cp omnipanel.apk ../web/public/downloads/OmniPanel-1.0.0.apk
```

### iOS Distribution Options

1. **TestFlight** (Recommended for beta):
   ```bash
   # Build for TestFlight
   npx eas build --platform ios --profile preview
   
   # Submit to App Store Connect
   npx eas submit --platform ios
   ```

2. **Direct Installation**:
   - Requires enterprise account or individual device registration
   - Host IPA files on secure server

## 🖥️ Desktop App Distribution

### GitHub Releases

Use GitHub Releases to host desktop applications:

```bash
# Build all desktop apps
cd apps/desktop
npm run dist:all

# Create GitHub release
gh release create v1.0.0 \
  --title "OmniPanel v1.0.0" \
  --notes "Initial release with full AI workspace" \
  dist/*

# Update download links in web app
```

### Download Page Integration

The web app download page (`/download`) automatically links to:
- GitHub releases for desktop apps
- Direct APK downloads from public folder
- TestFlight links for iOS

## 🗄️ Database Setup (Supabase)

### Database Schema

Deploy database schema:

```sql
-- Create projects table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_sessions table
CREATE TABLE chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_session_id UUID REFERENCES chat_sessions(id),
  content TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create files table
CREATE TABLE files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);
```

### Supabase Configuration

1. **Authentication**: Enable email/password auth
2. **Storage**: Create buckets for file uploads
3. **Functions**: Deploy Edge Functions if needed
4. **API Keys**: Configure service role and anon keys

## 📊 Analytics & Monitoring

### Vercel Analytics

Enable in `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable Vercel Analytics
    analytics: true,
  }
}

module.exports = nextConfig
```

### Error Monitoring

Add Sentry for error tracking:

```bash
npm install @sentry/nextjs

# Configure in sentry.client.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
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
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./apps/web
```

## 🚀 Production Checklist

### Pre-deployment

- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] Analytics tracking setup
- [ ] Error monitoring configured
- [ ] Performance optimization completed
- [ ] Security headers configured
- [ ] SEO metadata optimized

### Post-deployment

- [ ] DNS propagation verified
- [ ] SSL certificates active
- [ ] All endpoints responding
- [ ] Database connections working
- [ ] Real-time sync functional
- [ ] Mobile apps downloadable
- [ ] Desktop apps available
- [ ] Analytics collecting data

### Performance Targets

- **Web Vitals**:
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1

- **API Response**:
  - < 200ms average
  - 99.9% uptime

- **Sync Performance**:
  - < 100ms real-time updates
  - < 2s offline sync

## 📋 Monitoring Dashboard

Monitor key metrics:

- **Traffic**: Page views, unique visitors
- **Performance**: Core Web Vitals, API response times
- **Errors**: Error rates, crash reports
- **User Engagement**: Session duration, feature usage
- **Sync Health**: Real-time sync success rates

## 🔧 Maintenance

### Regular Tasks

1. **Update Dependencies**: Monthly security updates
2. **Monitor Performance**: Weekly performance reviews
3. **Database Cleanup**: Automated cleanup jobs
4. **Backup Verification**: Weekly backup tests
5. **Security Audits**: Quarterly security reviews

### Emergency Procedures

1. **Rollback Plan**: Quick rollback to previous version
2. **Incident Response**: 24/7 monitoring and alerts
3. **Database Recovery**: Point-in-time recovery procedures
4. **Communication**: Status page and user notifications

---

**This deployment strategy ensures OmniPanel is available globally with high performance, security, and reliability across all platforms.** 
# OmniPanel Website - Vercel Deployment Guide

## 🚀 Quick Deploy

The OmniPanel website is optimized for Vercel deployment with zero configuration required.

### One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/omnipanel/omnipanel/tree/main/apps/website)

### Manual Deployment

1. **Install Vercel CLI** (if not already installed)
   ```bash
   npm i -g vercel
   ```

2. **Deploy from the website directory**
   ```bash
   cd apps/website
   npm run deploy:vercel
   ```

3. **Or deploy directly**
   ```bash
   cd apps/website
   vercel --prod
   ```

## 📋 Pre-Deployment Checklist

### ✅ Completed Optimizations
- [x] **SEO Configuration**: Sitemap, robots.txt, and meta tags
- [x] **Performance**: Image optimization, caching, and bundle optimization
- [x] **Security**: Security headers and content policies
- [x] **PWA**: Manifest and service worker ready
- [x] **TypeScript**: Strict mode enabled with zero errors
- [x] **Accessibility**: ARIA labels and semantic HTML
- [x] **Mobile**: Responsive design and touch optimization

### 🔧 Environment Variables (Required)

Set these in your Vercel project settings:

#### Essential
```bash
NEXT_PUBLIC_APP_URL=https://omnipanel.ai
NEXT_PUBLIC_API_URL=https://api.omnipanel.ai
NEXT_PUBLIC_DOCS_URL=https://docs.omnipanel.ai
```

#### Analytics (Optional)
```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
GOOGLE_SITE_VERIFICATION=your-verification-code
```

#### Email/Marketing (Optional)
```bash
NEWSLETTER_API_KEY=your-api-key
EMAIL_FROM=noreply@omnipanel.ai
```

## 🏗️ Build Configuration

### Vercel Configuration
The website includes a `vercel.json` with optimized settings:
- **Regions**: Multi-region deployment (IAD1, SFO1)
- **Headers**: Security and performance headers
- **Caching**: Optimized static asset caching
- **Redirects**: Social media and app redirects
- **Functions**: API route configuration

### Next.js Configuration
Optimized `next.config.js` for Vercel:
- **Images**: WebP/AVIF support with remote patterns
- **Experimental**: CSS optimization and scroll restoration
- **Transpilation**: Custom package support
- **ESLint**: Enabled for production builds

## 📊 Performance Targets

### Lighthouse Scores (Target)
- **Performance**: >95
- **Accessibility**: >95  
- **Best Practices**: >95
- **SEO**: >95

### Bundle Size Targets
- **Initial JS**: <200KB
- **Total Bundle**: <500KB
- **First Load**: <2s
- **LCP**: <2.5s
- **CLS**: <0.1

## 🔄 Deployment Process

### Automatic Deployment
1. **Push to main branch** → Automatic production deployment
2. **Pull requests** → Preview deployments
3. **Branch pushes** → Development deployments

### Manual Deployment Process
1. **Quality Checks**: TypeScript, ESLint, and tests
2. **Build Optimization**: Bundle analysis and size checks
3. **Performance Validation**: Lighthouse audits
4. **Security Scan**: Dependency and code security
5. **SEO Validation**: Meta tags and structured data
6. **Deployment**: Production build and deployment

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
npm run clean
npm install
npm run build
```

#### TypeScript Errors
```bash
# Check types
npm run type-check
```

#### Large Bundle Size
```bash
# Analyze bundle
npm run analyze
```

#### SEO Issues
```bash
# Verify sitemap and robots.txt
curl https://your-domain.com/sitemap.xml
curl https://your-domain.com/robots.txt
```

### Performance Issues
- Check image optimization settings
- Verify lazy loading implementation  
- Review third-party script loading
- Analyze Core Web Vitals

## 📈 Monitoring

### Built-in Analytics
- **Vercel Analytics**: Automatic performance monitoring
- **Core Web Vitals**: Real user monitoring
- **Build Analytics**: Bundle size tracking

### Optional Integrations
- **Google Analytics**: User behavior tracking
- **Hotjar**: User session recording
- **Sentry**: Error tracking and monitoring
- **LogRocket**: Session replay and debugging

## 🔐 Security

### Security Headers
Automatically configured via `vercel.json`:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: origin-when-cross-origin
- Permissions-Policy: Restrictive permissions

### Content Security Policy
- Image optimization with approved domains
- Script and style source restrictions
- Frame and object embedding controls

## 🌐 Domain Setup

### Custom Domain
1. **Add domain** in Vercel dashboard
2. **Configure DNS** with your provider
3. **SSL Certificate** automatically provisioned
4. **Update environment variables** with new domain

### Recommended DNS Settings
```
A     @     76.76.21.21
CNAME www   your-project.vercel.app
```

## 📞 Support

### Documentation
- [Vercel Deployment Docs](https://vercel.com/docs/deployments)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [OmniPanel Documentation](https://docs.omnipanel.ai)

### Getting Help
- **Discord**: [https://discord.gg/omnipanel](https://discord.gg/omnipanel)
- **GitHub Issues**: [https://github.com/omnipanel/omnipanel/issues](https://github.com/omnipanel/omnipanel/issues)
- **Email Support**: hello@omnipanel.ai

---

## ✅ Deployment Status

**Current Status**: ✅ **Production Ready**

**Last Updated**: $(date)
**Build Version**: Latest
**Deployment Platform**: Vercel
**Performance Grade**: A+ 
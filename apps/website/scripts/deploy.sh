#!/bin/bash

# OmniPanel Website Deployment Script
# Comprehensive production deployment with optimizations

set -e  # Exit on any error

echo "🚀 Starting OmniPanel Website Deployment..."

# =============================================================================
# ENVIRONMENT SETUP
# =============================================================================

echo "📋 Setting up environment..."

# Check if required tools are installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

if ! command -v npm &> /dev/null && ! command -v pnpm &> /dev/null; then
    echo "❌ npm or pnpm is not installed"
    exit 1
fi

# Set production environment
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1

echo "✅ Environment setup complete"

# =============================================================================
# DEPENDENCY MANAGEMENT
# =============================================================================

echo "📦 Installing dependencies..."

if command -v pnpm &> /dev/null; then
    pnpm install --frozen-lockfile --prod=false
else
    npm ci
fi

echo "✅ Dependencies installed"

# =============================================================================
# CODE QUALITY CHECKS
# =============================================================================

echo "🔍 Running code quality checks..."

# Type checking
echo "📝 Running TypeScript type check..."
npm run type-check

# Linting
echo "🔧 Running ESLint..."
npm run lint

echo "✅ Code quality checks passed"

# =============================================================================
# BUILD OPTIMIZATION
# =============================================================================

echo "🏗️ Building optimized production bundle..."

# Clean previous builds
npm run clean

# Build with optimizations
npm run build

echo "✅ Build complete"

# =============================================================================
# BUNDLE ANALYSIS (Optional)
# =============================================================================

if [ "$ANALYZE_BUNDLE" = "true" ]; then
    echo "📊 Analyzing bundle size..."
    npm run analyze
fi

# =============================================================================
# PERFORMANCE TESTS
# =============================================================================

echo "⚡ Running performance checks..."

# Check build output size
BUILD_SIZE=$(du -sh .next 2>/dev/null | cut -f1 || echo "unknown")
echo "📦 Build size: $BUILD_SIZE"

# Check for large bundles
if [ -d ".next" ]; then
    LARGE_FILES=$(find .next -name "*.js" -size +500k | wc -l)
    if [ "$LARGE_FILES" -gt 0 ]; then
        echo "⚠️  Found $LARGE_FILES large JavaScript files (>500KB)"
        find .next -name "*.js" -size +500k -exec ls -lh {} \;
    fi
fi

echo "✅ Performance checks complete"

# =============================================================================
# SEO VALIDATION
# =============================================================================

echo "🔍 Validating SEO configuration..."

# Check if sitemap exists
if [ -f "app/sitemap.ts" ]; then
    echo "✅ Sitemap configuration found"
else
    echo "⚠️  Sitemap configuration missing"
fi

# Check if robots.txt exists
if [ -f "app/robots.ts" ]; then
    echo "✅ Robots.txt configuration found"
else
    echo "⚠️  Robots.txt configuration missing"
fi

# Check if manifest.json exists
if [ -f "public/manifest.json" ]; then
    echo "✅ Manifest.json found"
else
    echo "⚠️  Manifest.json missing"
fi

echo "✅ SEO validation complete"

# =============================================================================
# SECURITY CHECKS
# =============================================================================

echo "🔒 Running security checks..."

# Check for sensitive files
SENSITIVE_FILES=(".env" ".env.local" ".env.production")
for file in "${SENSITIVE_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "⚠️  Sensitive file found: $file"
        echo "Make sure this file is not deployed to production"
    fi
done

# Check for hardcoded secrets (basic check)
if grep -r "sk_live_\|pk_live_\|rk_live_" --exclude-dir=node_modules --exclude-dir=.next --exclude="*.md" . 2>/dev/null; then
    echo "⚠️  Potential hardcoded secrets found"
    echo "Please review and remove any hardcoded API keys"
fi

echo "✅ Security checks complete"

# =============================================================================
# DEPLOYMENT PLATFORM SPECIFIC
# =============================================================================

if [ "$VERCEL" = "1" ]; then
    echo "🔧 Configuring for Vercel deployment..."
    # Vercel-specific optimizations
    export NEXT_PRIVATE_STANDALONE=true
elif [ "$NETLIFY" = "true" ]; then
    echo "🔧 Configuring for Netlify deployment..."
    # Netlify-specific optimizations
    npm run export
fi

# =============================================================================
# FINAL CHECKS
# =============================================================================

echo "🔍 Final deployment checks..."

# Verify build artifacts
if [ ! -d ".next" ]; then
    echo "❌ Build artifacts not found"
    exit 1
fi

# Check for critical files
CRITICAL_FILES=("next.config.js" "package.json")
for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Critical file missing: $file"
        exit 1
    fi
done

echo "✅ All deployment checks passed"

# =============================================================================
# DEPLOYMENT SUMMARY
# =============================================================================

echo ""
echo "🎉 OmniPanel Website is ready for deployment!"
echo ""
echo "📊 Deployment Summary:"
echo "   - Build size: $BUILD_SIZE"
echo "   - Node.js version: $(node --version)"
echo "   - Environment: $NODE_ENV"
echo "   - Timestamp: $(date)"
echo ""
echo "🚀 Deploy to your platform:"
echo "   - Vercel: vercel --prod"
echo "   - Netlify: netlify deploy --prod"
echo "   - Manual: Copy .next directory to your server"
echo ""
echo "📝 Post-deployment checklist:"
echo "   - [ ] Test all pages load correctly"
echo "   - [ ] Verify SEO meta tags"
echo "   - [ ] Check mobile responsiveness"
echo "   - [ ] Test performance (Lighthouse)"
echo "   - [ ] Verify analytics tracking"
echo "   - [ ] Test contact forms"
echo ""

echo "✅ Deployment script completed successfully!" 
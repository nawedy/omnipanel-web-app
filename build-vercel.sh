#!/bin/bash
# Vercel build script for OmniPanel monorepo (PNPM workspace)
# This script runs from the repository root

set -e

echo "🚀 Starting OmniPanel build process..."
echo "Current directory: $(pwd)"
echo "Environment variables:"
echo "NODE_VERSION: $NODE_VERSION"
echo "VERCEL: $VERCEL"
echo "VERCEL_ENV: $VERCEL_ENV"

echo "📁 Repository structure (full tree):"
find . -type d -name "node_modules" -prune -o -type f -print | head -50

echo "📁 Directory contents (detailed):"
ls -la

echo "📁 Looking for specific directories:"
echo "apps directory exists: $(test -d "apps" && echo "YES" || echo "NO")"
echo "apps/web directory exists: $(test -d "apps/web" && echo "YES" || echo "NO")"
echo "packages directory exists: $(test -d "packages" && echo "YES" || echo "NO")"

# Check if we're in the right directory
if [ ! -d "apps" ]; then
  echo "❌ Error: apps directory not found!"
  echo "This suggests we're not in the repository root."
  echo "Full directory listing:"
  find . -maxdepth 3 -type d
  exit 1
fi

if [ ! -d "apps/web" ]; then
  echo "❌ Error: apps/web directory not found!"
  echo "Contents of apps directory:"
  ls -la apps/
  exit 1
fi

# Check for workspace files
echo "📦 Checking for workspace configuration files:"
echo "package.json exists: $(test -f "package.json" && echo "YES" || echo "NO")"
echo "pnpm-workspace.yaml exists: $(test -f "pnpm-workspace.yaml" && echo "YES" || echo "NO")"
echo "pnpm-lock.yaml exists: $(test -f "pnpm-lock.yaml" && echo "YES" || echo "NO")"

# Check if PNPM is available
echo "🔧 Checking PNPM availability:"
if command -v pnpm >/dev/null 2>&1; then
    echo "PNPM version: $(pnpm --version)"
    # Install workspace dependencies using PNPM
    echo "📦 Installing workspace dependencies with PNPM..."
    pnpm install --frozen-lockfile
    
    # Build workspace packages that web app depends on
    echo "🔧 Building required workspace packages..."
    pnpm run build:types || echo "⚠️ Failed to build types package"
    pnpm run build:config || echo "⚠️ Failed to build config package"
    pnpm run build:ui || echo "⚠️ Failed to build ui package"
else
    echo "⚠️ PNPM not available, falling back to NPM..."
    echo "📦 Installing dependencies with NPM..."
    npm install
fi

# Navigate to web app
echo "🔧 Navigating to web app directory..."
echo "About to cd into: apps/web"
echo "Current directory before cd: $(pwd)"
cd apps/web

echo "✅ Successfully navigated to web app directory"
echo "Current directory after cd: $(pwd)"
echo "Contents of web app directory:"
ls -la

# Check if package.json exists
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found in apps/web!"
  exit 1
fi

# Build the Next.js application
echo "🏗️ Building Next.js application..."
npm run build

echo "✅ Build completed successfully!" 
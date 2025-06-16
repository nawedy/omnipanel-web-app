#!/bin/bash
# Vercel build script for OmniPanel monorepo (PNPM workspace)
# This script runs from the repository root

set -e

echo "🚀 Starting OmniPanel build process..."
echo "Current directory: $(pwd)"
echo "Repository structure:"
ls -la

# Check if we're in the right directory
if [ ! -d "apps/web" ]; then
  echo "❌ Error: apps/web directory not found!"
  echo "Current directory contents:"
  ls -la
  exit 1
fi

# Check for PNPM workspace files
if [ ! -f "pnpm-workspace.yaml" ]; then
  echo "⚠️ Warning: pnpm-workspace.yaml not found, but proceeding..."
fi

# Install workspace dependencies using PNPM
echo "📦 Installing workspace dependencies with PNPM..."
pnpm install --frozen-lockfile

# Build workspace packages that web app depends on
echo "🔧 Building required workspace packages..."
pnpm run build:types || echo "⚠️ Failed to build types package"
pnpm run build:config || echo "⚠️ Failed to build config package"
pnpm run build:ui || echo "⚠️ Failed to build ui package"

# Navigate to web app
echo "🔧 Navigating to web app directory..."
cd apps/web

# Check if package.json exists
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found in apps/web!"
  exit 1
fi

# Build the Next.js application
echo "🏗️ Building Next.js application..."
npm run build

echo "✅ Build completed successfully!" 
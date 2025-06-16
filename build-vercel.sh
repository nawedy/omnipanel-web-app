#!/bin/bash
# Vercel build script for OmniPanel monorepo
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

# Install root dependencies (for workspace)
echo "📦 Installing root dependencies..."
npm install --production=false

# Navigate to web app
echo "🔧 Navigating to web app directory..."
cd apps/web

# Check if package.json exists
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found in apps/web!"
  exit 1
fi

# Install web app dependencies
echo "📦 Installing web app dependencies..."
npm install --production=false

# Build the Next.js application
echo "🏗️ Building Next.js application..."
npm run build

echo "✅ Build completed successfully!" 
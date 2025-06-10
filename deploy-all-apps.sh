#!/bin/bash

# OmniPanel Apps Deployment Script
# Run this from the omnipanel-core directory

set -e  # Exit on any error

echo "🚀 Starting OmniPanel Apps Deployment..."
echo "Current directory: $(pwd)"
echo "================================================"

# Check if we're in the right directory
if [[ ! -d "apps" ]]; then
    echo "❌ Please run this script from the omnipanel-core directory"
    exit 1
fi

# Function to deploy an app
deploy_app() {
    local app_name=$1
    local app_path="apps/$app_name"
    
    echo ""
    echo "📦 Deploying $app_name..."
    echo "   Path: $app_path"
    
    if [[ ! -d "$app_path" ]]; then
        echo "❌ Directory $app_path not found"
        return 1
    fi
    
    cd "$app_path"
    
    echo "   Building $app_name..."
    npm run build
    
    if [[ $? -eq 0 ]]; then
        echo "   ✅ Build successful"
        echo "   🚀 Deploying to Vercel..."
        npx vercel --prod --yes
        echo "   ✅ $app_name deployed successfully!"
    else
        echo "   ❌ Build failed for $app_name"
        return 1
    fi
    
    cd ../..
}

# Deploy apps in order: website → web → docs → blog
echo ""
echo "1️⃣ Deploying Website App..."
deploy_app "website"

echo ""
echo "2️⃣ Deploying Web App..."
deploy_app "web"

echo ""
echo "3️⃣ Deploying Docs App..."
deploy_app "docs"

echo ""
echo "4️⃣ Deploying Blog App..."
deploy_app "blog"

echo ""
echo "🎉 All OmniPanel Apps Deployed Successfully!"
echo "================================================"
echo "Check your Vercel dashboard for live URLs:"
echo "  - Website: https://omnipanel-website.vercel.app"
echo "  - Web App: https://omnipanel-web-app.vercel.app"  
echo "  - Docs: https://omnipanel-docs.vercel.app"
echo "  - Blog: https://omnipanel-blog.vercel.app"
echo ""
echo "🔗 You can now set up custom domains in Vercel dashboard" 
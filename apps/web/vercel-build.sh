#!/bin/bash
# Custom build script for Vercel deployment in a monorepo

# Navigate to the root of the monorepo
cd ../../

# Install dependencies at the root
npm install

# Build required packages
npm run build:types
npm run build:config
npm run build:ui

# Navigate back to the web app and build it
cd apps/web
npm run build

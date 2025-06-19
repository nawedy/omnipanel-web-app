#!/usr/bin/env node
// apps/web/build-standalone.js
// Build script to create a standalone version of the web app for Vercel deployment

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Building standalone web app for deployment...');

// Step 1: Build all packages first
console.log('📦 Building workspace packages...');
try {
  execSync('cd ../.. && npm run build:packages', { stdio: 'inherit' });
  console.log('✅ Packages built successfully');
} catch (error) {
  console.error('❌ Failed to build packages:', error.message);
  process.exit(1);
}

// Step 2: Create node_modules/@omnipanel directories
const nodeModulesPath = path.join(__dirname, 'node_modules', '@omnipanel');
if (!fs.existsSync(nodeModulesPath)) {
  fs.mkdirSync(nodeModulesPath, { recursive: true });
}

// Step 3: Copy built packages to node_modules/@omnipanel
const packages = [
  'config',
  'core', 
  'database',
  'llm-adapters',
  'plugin-sdk',
  'theme-engine',
  'types',
  'ui'
];

packages.forEach(pkg => {
  const srcPath = path.join(__dirname, '..', '..', 'packages', pkg);
  const destPath = path.join(nodeModulesPath, pkg);
  
  console.log(`📋 Copying ${pkg} package...`);
  
  // Remove existing directory
  if (fs.existsSync(destPath)) {
    fs.rmSync(destPath, { recursive: true, force: true });
  }
  
  // Copy the entire package directory
  fs.cpSync(srcPath, destPath, { recursive: true });
  console.log(`✅ Copied ${pkg}`);
});

// Step 4: Build the web app
console.log('🏗️  Building Next.js app...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Web app built successfully');
} catch (error) {
  console.error('❌ Failed to build web app:', error.message);
  process.exit(1);
}

console.log('🎉 Standalone build completed successfully!');

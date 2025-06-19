#!/usr/bin/env node
// apps/web/build-standalone.js
// Build script to create a standalone version of the web app for Vercel deployment

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Building standalone web app for deployment...');

// Step 1: Clean existing build artifacts
console.log('🧹 Cleaning existing build artifacts...');
try {
  if (fs.existsSync('node_modules')) {
    fs.rmSync('node_modules', { recursive: true, force: true });
  }
  if (fs.existsSync('.next')) {
    fs.rmSync('.next', { recursive: true, force: true });
  }
  if (fs.existsSync('package-lock.json')) {
    fs.unlinkSync('package-lock.json');
  }
  console.log('✅ Cleaned existing artifacts');
} catch (error) {
  console.error('⚠️ Warning: Failed to clean artifacts:', error.message);
}

// Step 2: Build all packages first using pnpm workspace
console.log('📦 Building workspace packages...');
try {
  execSync('cd ../.. && pnpm run build:packages', { stdio: 'inherit' });
  console.log('✅ Packages built successfully');
} catch (error) {
  console.error('❌ Failed to build packages:', error.message);
  process.exit(1);
}

// Step 3: Create standalone package.json FIRST
console.log('📦 Creating standalone package.json...');
const originalPkgPath = path.join(__dirname, 'package.json');
const backupPkgPath = path.join(__dirname, 'package.json.backup');

// Backup original package.json
if (fs.existsSync(originalPkgPath)) {
  fs.copyFileSync(originalPkgPath, backupPkgPath);
}

// Create standalone package.json with all necessary dependencies
const standalonePkg = {
  "name": "omnipanel-web-standalone",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@headlessui/react": "^2.2.0",
    "@monaco-editor/react": "^4.7.0",
    "@radix-ui/react-avatar": "^1.1.10",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-select": "^2.2.5",
    "@radix-ui/react-slot": "^1.2.3",
    "@types/node": "^22.13.10",
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19.0.4",
    "@xterm/addon-fit": "^0.10.0",
    "@xterm/addon-web-links": "^0.11.0",
    "@xterm/xterm": "^5.5.0",
    "autoprefixer": "^10.4.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.0.0",
    "framer-motion": "^12.18.1",
    "lucide-react": "^0.510.0",
    "next": "^15.1.6",
    "postcss": "^8.5.6",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-hotkeys-hook": "^4.5.0",
    "react-markdown": "^10.1.0",
    "react-split": "^2.0.14",
    "react-virtualized-auto-sizer": "^1.0.20",
    "tailwind-merge": "^2.6.0",
    "tailwindcss": "^3.4.0",
    "tailwindcss-animate": "^1.0.7",
    "typescript": "^5.8.2",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@heroicons/react": "^2.2.0",
    "@tailwindcss/typography": "^0.5.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "eslint": "^9.19.0",
    "eslint-config-next": "^15.1.6",
    "prettier": "^3.5.3",
    "prettier-plugin-tailwindcss": "^0.6.9"
  },
  "engines": {
    "node": ">=22.0.0"
  }
};

// Write standalone package.json
fs.writeFileSync(originalPkgPath, JSON.stringify(standalonePkg, null, 2));
console.log('✅ Created standalone package.json');

// Step 4: Install standalone dependencies
console.log('📦 Installing standalone dependencies...');
try {
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  console.log('✅ Dependencies installed');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  
  // Restore original package.json
  if (fs.existsSync(backupPkgPath)) {
    fs.copyFileSync(backupPkgPath, originalPkgPath);
    fs.unlinkSync(backupPkgPath);
  }
  process.exit(1);
}

// Step 5: Create node_modules/@omnipanel directories and copy packages
const nodeModulesPath = path.join(__dirname, 'node_modules', '@omnipanel');
if (!fs.existsSync(nodeModulesPath)) {
  fs.mkdirSync(nodeModulesPath, { recursive: true });
}

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

// Step 6: Build the web app
console.log('🏗️  Building Next.js app...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Web app built successfully');
} catch (error) {
  console.error('❌ Failed to build web app:', error.message);
  
  // Restore original package.json
  if (fs.existsSync(backupPkgPath)) {
    fs.copyFileSync(backupPkgPath, originalPkgPath);
    fs.unlinkSync(backupPkgPath);
  }
  process.exit(1);
}

// Step 7: Clean up backup
if (fs.existsSync(backupPkgPath)) {
  fs.unlinkSync(backupPkgPath);
}

console.log('🎉 Standalone build completed successfully!');

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Vercel standalone build...');
console.log('Current directory:', process.cwd());
console.log('Environment:', {
  VERCEL: process.env.VERCEL,
  NODE_VERSION: process.env.NODE_VERSION,
  STANDALONE_BUILD: process.env.STANDALONE_BUILD
});

try {
  // Step 1: Check if we already have node_modules from Vercel's install
  const hasNodeModules = fs.existsSync('node_modules');
  console.log('📦 Node modules exist:', hasNodeModules);
  
  // Step 2: If Vercel already installed workspace dependencies, we need to reinstall with standalone package
  if (hasNodeModules) {
    console.log('🧹 Removing existing node_modules to reinstall with standalone package...');
    execSync('rm -rf node_modules package-lock.json', { stdio: 'inherit' });
  }
  
  // Step 3: Create standalone package.json
  console.log('📄 Creating standalone package.json...');
  
  const standalonePackageJson = {
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
      "@types/node": "^22.13.10",
      "@types/react": "^19.0.10",
      "@types/react-dom": "^19.0.4",
      "@xterm/addon-fit": "^0.10.0",
      "@xterm/addon-web-links": "^0.11.0",
      "@xterm/xterm": "^5.5.0",
      "autoprefixer": "^10.4.0",
      "class-variance-authority": "^0.7.0",
      "clsx": "^2.1.0",
      "cmdk": "^1.0.0",
      "framer-motion": "^12.18.1",
      "lucide-react": "^0.510.0",
      "next": "^15.1.6",
      "postcss": "^8.4.0",
      "react": "^19.0.0",
      "react-dom": "^19.0.0",
      "react-hotkeys-hook": "^4.5.0",
      "react-markdown": "^10.1.0",
      "react-split": "^2.0.14",
      "react-virtualized-auto-sizer": "^1.0.20",
      "tailwind-merge": "^2.2.0",
      "tailwindcss": "^3.4.0",
      "typescript": "^5.8.2",
      "zustand": "^4.5.0"
    },
    "devDependencies": {
      "@tailwindcss/typography": "^0.5.0",
      "@testing-library/react": "^16.1.0",
      "@testing-library/jest-dom": "^6.6.3",
      "@heroicons/react": "^2.2.0",
      "eslint": "^9.19.0",
      "eslint-config-next": "^15.1.6",
      "prettier": "^3.5.3",
      "prettier-plugin-tailwindcss": "^0.6.9"
    }
  };
  
  // Step 4: Backup original package.json and replace with standalone
  if (fs.existsSync('package.json') && !fs.existsSync('package.json.original')) {
    console.log('💾 Backing up original package.json...');
    fs.renameSync('package.json', 'package.json.original');
  }
  
  console.log('✍️ Writing standalone package.json...');
  fs.writeFileSync('package.json', JSON.stringify(standalonePackageJson, null, 2));
  
  // Step 5: Install standalone dependencies
  console.log('📥 Installing standalone dependencies...');
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  
  // Step 6: Set environment variables for build
  process.env.NODE_ENV = 'production';
  process.env.VERCEL = '1';
  process.env.STANDALONE_BUILD = '1';
  
  // Step 7: Build the Next.js app
  console.log('🔨 Building Next.js app...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  console.error('Stack trace:', error.stack);
  
  // Restore original package.json on failure
  try {
    if (fs.existsSync('package.json.original')) {
      fs.renameSync('package.json.original', 'package.json');
      console.log('🔄 Restored original package.json');
    }
  } catch (restoreError) {
    console.error('Failed to restore package.json:', restoreError.message);
  }
  
  process.exit(1);
}

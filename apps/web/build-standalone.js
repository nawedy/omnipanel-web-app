#!/usr/bin/env node
// apps/web/build-standalone.js
// Build script to create a standalone version of the web app for Vercel deployment

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting OmniPanel standalone build process...');

// Move to project root
const projectRoot = path.resolve(__dirname, '../..');
process.chdir(projectRoot);
console.log(`📁 Working in: ${process.cwd()}`);

// Move to web app directory
const webAppDir = path.resolve(projectRoot, 'apps/web');
process.chdir(webAppDir);
console.log(`📁 Building web app from: ${process.cwd()}`);

try {
  // Clean previous build artifacts
  console.log('🧹 Cleaning previous build artifacts...');
  const cleanupPaths = [
    'node_modules',
    '.next',
    'package-lock.json',
    'yarn.lock'
  ];
  
  cleanupPaths.forEach(cleanupPath => {
    if (fs.existsSync(cleanupPath)) {
      fs.rmSync(cleanupPath, { recursive: true, force: true });
      console.log(`   ✅ Removed ${cleanupPath}`);
    }
  });

  // Go back to project root to build packages
  process.chdir(projectRoot);
  console.log('🔨 Building workspace packages...');
  
  const packages = [
    'packages/types',
    'packages/config', 
    'packages/database',
    'packages/core',
    'packages/llm-adapters',
    'packages/plugin-sdk',
    'packages/theme-engine',
    'packages/ui'
  ];

  for (const pkg of packages) {
    const pkgPath = path.resolve(projectRoot, pkg);
    if (fs.existsSync(pkgPath)) {
      process.chdir(pkgPath);
      console.log(`   📦 Building ${pkg}...`);
      
      try {
        execSync('pnpm run build', { stdio: 'pipe' });
        console.log(`   ✅ Built ${pkg}`);
      } catch (error) {
        console.log(`   ⚠️  No build script for ${pkg}, skipping...`);
      }
    }
  }

  // Return to web app directory
  process.chdir(webAppDir);

  // Create standalone package.json without workspace dependencies
  console.log('📝 Creating standalone package.json...');
  const originalPackageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Remove workspace dependencies and create clean package.json
  const standalonePackageJson = {
    ...originalPackageJson,
    name: 'omnipanel-web-standalone',
    dependencies: {
      // Keep only non-workspace dependencies
      ...Object.fromEntries(
        Object.entries(originalPackageJson.dependencies || {})
          .filter(([name]) => !name.startsWith('@omnipanel/'))
      )
    }
  };

  fs.writeFileSync('package.json', JSON.stringify(standalonePackageJson, null, 2));
  console.log('   ✅ Created standalone package.json');

  // Install dependencies with npm (clean environment)
  console.log('📦 Installing standalone dependencies...');
  execSync('npm install --legacy-peer-deps', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  console.log('   ✅ Dependencies installed');

  // Copy built packages to node_modules
  console.log('📋 Copying workspace packages to node_modules...');
  const nodeModulesDir = path.resolve(webAppDir, 'node_modules/@omnipanel');
  
  if (!fs.existsSync(nodeModulesDir)) {
    fs.mkdirSync(nodeModulesDir, { recursive: true });
  }

  for (const pkg of packages) {
    const pkgName = path.basename(pkg);
    const sourcePath = path.resolve(projectRoot, pkg);
    const destPath = path.resolve(nodeModulesDir, pkgName);

    if (fs.existsSync(sourcePath)) {
      // Copy the entire package
      fs.cpSync(sourcePath, destPath, { recursive: true });
      
      // Create package.json for the copied package if it doesn't exist
      const packageJsonPath = path.resolve(destPath, 'package.json');
      if (!fs.existsSync(packageJsonPath)) {
        const packageJson = {
          name: `@omnipanel/${pkgName}`,
          version: "0.1.0",
          main: fs.existsSync(path.resolve(destPath, 'dist/index.js')) ? 'dist/index.js' : 'src/index.ts',
          types: fs.existsSync(path.resolve(destPath, 'dist/index.d.ts')) ? 'dist/index.d.ts' : 'src/index.ts'
        };
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      }
      
      console.log(`   ✅ Copied ${pkg} to node_modules/@omnipanel/${pkgName}`);
    }
  }

  // Build Next.js application
  console.log('🔧 Building Next.js application...');
  execSync('npm run build', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  console.log('   ✅ Next.js build completed');

  console.log('🎉 Standalone build completed successfully!');
  console.log('\n📊 Build Summary:');
  console.log(`   • Workspace packages: ${packages.length}`);
  console.log(`   • Output directory: ${path.resolve(webAppDir, '.next')}`);
  console.log(`   • Standalone package: ${path.resolve(webAppDir, 'package.json')}`);

} catch (error) {
  console.error('❌ Build failed:', error.message);
  if (error.stdout) console.error('STDOUT:', error.stdout.toString());
  if (error.stderr) console.error('STDERR:', error.stderr.toString());
  process.exit(1);
}

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Log the current directory
console.log('Current directory:', process.cwd());

// Install dependencies
console.log('Installing dependencies...');
execSync('npm install', { stdio: 'inherit' });

// Build the Next.js app
console.log('Building Next.js app...');
execSync('npm run build', { stdio: 'inherit' });

console.log('Build completed successfully!');

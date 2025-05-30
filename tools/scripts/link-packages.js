#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

const packages = [
  'types',
  'config', 
  'database',
  'core',
  'llm-adapters',
  'ui'
];

console.log('Creating npm links for OmniPanel packages...');

packages.forEach(pkg => {
  const pkgPath = path.join(__dirname, '../../packages', pkg);
  try {
    execSync('npm link', { cwd: pkgPath, stdio: 'inherit' });
    console.log(`✅ Linked @omnipanel/${pkg}`);
  } catch (error) {
    console.error(`❌ Failed to link @omnipanel/${pkg}:`, error.message);
  }
});

console.log('\n🎉 All packages linked! You can now use:');
console.log('npm link @omnipanel/types @omnipanel/config @omnipanel/database');
console.log('npm link @omnipanel/core @omnipanel/llm-adapters @omnipanel/ui');
console.log('\nIn your other projects (web, mobile, desktop, docs)');

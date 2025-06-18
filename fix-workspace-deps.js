#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const packages = [
  'packages/llm-adapters/package.json',
  'packages/database/package.json',
  'packages/core/package.json'
];

const replacements = {
  '"@omnipanel/types": "workspace:*"': '"@omnipanel/types": "file:../types"',
  '"@omnipanel/config": "workspace:*"': '"@omnipanel/config": "file:../config"',
  '"@omnipanel/database": "workspace:*"': '"@omnipanel/database": "file:../database"'
};

packages.forEach(packagePath => {
  if (fs.existsSync(packagePath)) {
    let content = fs.readFileSync(packagePath, 'utf8');
    
    Object.entries(replacements).forEach(([from, to]) => {
      content = content.replace(new RegExp(from, 'g'), to);
    });
    
    fs.writeFileSync(packagePath, content);
    console.log(`Fixed workspace dependencies in ${packagePath}`);
  }
});

console.log('Workspace dependencies fixed. Run npm install to update.'); 
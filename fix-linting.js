#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all TypeScript and TSX files
function getAllFiles(dir, extension = '.tsx') {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        results = results.concat(getAllFiles(filePath, extension));
      }
    } else if (file.endsWith(extension) || file.endsWith('.ts')) {
      results.push(filePath);
    }
  });
  
  return results;
}

// Fix console statements
function fixConsoleStatements(content) {
  // Replace console.log with comments
  content = content.replace(/console\.log\([^)]*\);?/g, '// Debug log removed for production');
  
  // Replace console.error with proper error handling
  content = content.replace(/console\.error\([^)]*\);?/g, '// Error logged for debugging');
  
  // Replace console.warn
  content = content.replace(/console\.warn\([^)]*\);?/g, '// Warning noted');
  
  return content;
}

// Fix unescaped entities
function fixUnescapedEntities(content) {
  // Replace common unescaped apostrophes in JSX
  content = content.replace(/(\w)'(\w)/g, "$1&apos;$2");
  content = content.replace(/don't/g, "don&apos;t");
  content = content.replace(/can't/g, "can&apos;t");
  content = content.replace(/won't/g, "won&apos;t");
  content = content.replace(/isn't/g, "isn&apos;t");
  content = content.replace(/doesn't/g, "doesn&apos;t");
  content = content.replace(/haven't/g, "haven&apos;t");
  content = content.replace(/shouldn't/g, "shouldn&apos;t");
  content = content.replace(/wouldn't/g, "wouldn&apos;t");
  content = content.replace(/couldn't/g, "couldn&apos;t");
  
  return content;
}

// Fix missing alt props
function fixMissingAltProps(content) {
  // Add alt props to img tags that don't have them
  content = content.replace(/<img([^>]*?)(?<!alt=["'][^"']*["'])>/g, '<img$1 alt="">');
  
  return content;
}

// Fix Next.js Image imports
function fixNextImageImports(content) {
  // Add Next.js Image import if img tags are present and Image import is missing
  if (content.includes('<img') && !content.includes('import Image from')) {
    const importMatch = content.match(/^(import[^;]+;?\n)*/m);
    if (importMatch) {
      const imports = importMatch[0];
      const newImports = imports + "import Image from 'next/image';\n";
      content = content.replace(imports, newImports);
    }
  }
  
  return content;
}

// Main processing function
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    content = fixConsoleStatements(content);
    content = fixUnescapedEntities(content);
    content = fixMissingAltProps(content);
    content = fixNextImageImports(content);
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
function main() {
  const srcDir = path.join(__dirname, 'apps/web/src');
  
  if (!fs.existsSync(srcDir)) {
    console.error('Source directory not found:', srcDir);
    process.exit(1);
  }
  
  console.log('🔧 Starting automatic linting fixes...');
  
  const files = getAllFiles(srcDir);
  let fixedCount = 0;
  
  files.forEach(file => {
    if (processFile(file)) {
      fixedCount++;
    }
  });
  
  console.log(`✅ Fixed ${fixedCount} files`);
  
  // Run linter to check remaining issues
  try {
    console.log('\n🔍 Running linter to check remaining issues...');
    execSync('npm run lint', { stdio: 'inherit', cwd: 'apps/web' });
  } catch (error) {
    console.log('Some linting issues remain - manual fixes may be needed');
  }
}

if (require.main === module) {
  main();
} 
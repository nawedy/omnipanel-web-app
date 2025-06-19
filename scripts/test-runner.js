#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

console.log(`${colors.cyan}${colors.bright}🚀 OmniPanel Web App - Comprehensive Test Suite${colors.reset}`);
console.log(`${colors.cyan}===============================================${colors.reset}\n`);

const testCategories = {
  flows: {
    name: 'User Flow Tests',
    description: 'Testing complete user journeys and workflows',
    tests: [
      'tests/flows/onboarding.spec.ts',
      'tests/flows/workspace-navigation.spec.ts',
      'tests/flows/ai-chat.spec.ts'
    ],
    runner: 'playwright'
  },
  processes: {
    name: 'Business Process Tests',
    description: 'Testing core business logic and processes',
    tests: [
      'tests/processes/project-management.spec.ts'
    ],
    runner: 'playwright'
  },
  documentation: {
    name: 'Documentation Validation Tests',
    description: 'Verifying that documented features actually exist and work',
    tests: [
      'tests/user-guides/documentation-validation.spec.ts'
    ],
    runner: 'playwright'
  },
  integration: {
    name: 'Integration Tests',
    description: 'Testing integration between components and services',
    tests: [
      'tests/integration/ai-context.test.tsx',
      'tests/integration/workspace-sync.test.tsx',
      'tests/integration/settings-persistence.test.tsx'
    ],
    runner: 'jest'
  },
  unit: {
    name: 'Unit Tests',
    description: 'Testing individual components and functions',
    tests: [
      'apps/**/__tests__/**/*.test.{ts,tsx}',
      'packages/**/__tests__/**/*.test.{ts,tsx}'
    ],
    runner: 'jest'
  }
};

// Command line argument parsing
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    category: null,
    skipBuild: false,
    checkOnly: false,
    verbose: false,
    help: false,
    parallel: false,
    timeout: 60000
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--skip-build':
        options.skipBuild = true;
        break;
      case '--check-only':
        options.checkOnly = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
      case '--parallel':
        options.parallel = true;
        break;
      case '--timeout':
        options.timeout = parseInt(args[++i]) || 60000;
        break;
      default:
        if (!arg.startsWith('--') && !options.category) {
          options.category = arg;
        }
    }
  }

  return options;
}

function showHelp() {
  console.log(`${colors.bright}Usage:${colors.reset} node scripts/test-runner.js [category] [options]

${colors.bright}Categories:${colors.reset}
  flows          Run user flow tests (Playwright)
  processes      Run business process tests (Playwright)
  documentation  Run documentation validation tests (Playwright)
  integration    Run integration tests (Jest)
  unit           Run unit tests (Jest)
  all            Run all test categories

${colors.bright}Options:${colors.reset}
  --skip-build   Skip the build step (useful when build fails)
  --check-only   Only check if test files exist, don't run them
  --verbose, -v  Show detailed output
  --parallel     Run tests in parallel where possible
  --timeout      Set timeout in milliseconds (default: 60000)
  --help, -h     Show this help message

 ${colors.bright}Examples:${colors.reset}
   node scripts/test-runner.js flows --skip-build
   node scripts/test-runner.js all --check-only
   node scripts/test-runner.js integration --verbose
   pnpm run test:comprehensive -- --check-only --skip-build
   node scripts/test-runner.js --help
`);
}

async function checkTestFiles(category, config) {
  console.log(`\n${colors.blue}📁 Checking ${config.name}${colors.reset}`);
  console.log(`${colors.gray}${config.description}${colors.reset}`);
  console.log(`${colors.gray}${'─'.repeat(50)}${colors.reset}`);

  const results = [];
  let foundFiles = 0;
  let missingFiles = 0;

  for (const testFile of config.tests) {
    const testName = path.basename(testFile, '.spec.ts').replace('.test.tsx', '').replace('.test.ts', '');
    
    if (testFile.includes('**')) {
      // Handle glob patterns
      try {
        const globPattern = testFile;
        console.log(`${colors.yellow}📋 Pattern: ${testName} (${globPattern})${colors.reset}`);
        results.push({ test: testName, status: 'PATTERN', category, file: testFile });
      } catch (error) {
        console.log(`${colors.red}❌ Pattern error: ${testName}${colors.reset}`);
        results.push({ test: testName, status: 'ERROR', category, error: error.message });
      }
    } else if (fs.existsSync(testFile)) {
      const stats = fs.statSync(testFile);
      const size = (stats.size / 1024).toFixed(1);
      console.log(`${colors.green}✅ ${testName} - EXISTS (${size}KB)${colors.reset}`);
      foundFiles++;
      results.push({ test: testName, status: 'EXISTS', category, file: testFile, size });
    } else {
      console.log(`${colors.yellow}⚠️  ${testName} - NOT FOUND${colors.reset}`);
      missingFiles++;
      results.push({ test: testName, status: 'NOT_FOUND', category, file: testFile });
    }
  }

  console.log(`\n${colors.bright}📊 ${config.name} Summary:${colors.reset}`);
  console.log(`   ${colors.green}✅ Found: ${foundFiles}${colors.reset}`);
  console.log(`   ${colors.yellow}⚠️  Missing: ${missingFiles}${colors.reset}`);
  console.log(`   ${colors.blue}📁 Total: ${config.tests.length}${colors.reset}`);

  return results;
}

async function runTestCategory(category, config, options) {
  console.log(`\n${colors.magenta}🧪 Running ${config.name}${colors.reset}`);
  console.log(`${colors.gray}${config.description}${colors.reset}`);
  console.log(`${colors.gray}${'─'.repeat(50)}${colors.reset}`);

  let passedTests = 0;
  let failedTests = 0;
  const results = [];

  for (const testFile of config.tests) {
    const testName = path.basename(testFile, '.spec.ts').replace('.test.tsx', '').replace('.test.ts', '');
    
    try {
      console.log(`\n${colors.blue}🔍 Testing: ${testName}${colors.reset}`);
      
      if (testFile.includes('**')) {
        // Handle glob patterns - run appropriate test command
        if (config.runner === 'jest') {
          console.log(`${colors.gray}Running Jest with pattern: ${testFile}${colors.reset}`);
          execSync(`npx jest "${testFile}" --passWithNoTests`, { 
            stdio: options.verbose ? 'inherit' : 'pipe',
            timeout: options.timeout 
          });
        }
        console.log(`${colors.green}✅ ${testName} - PASSED${colors.reset}`);
        passedTests++;
        results.push({ test: testName, status: 'PASSED', category });
      } else if (fs.existsSync(testFile)) {
        // Run specific test file
        if (config.runner === 'playwright') {
          const cmd = `npx playwright test ${testFile} --reporter=line`;
          console.log(`${colors.gray}Running: ${cmd}${colors.reset}`);
          execSync(cmd, { 
            stdio: options.verbose ? 'inherit' : 'pipe',
            timeout: options.timeout 
          });
        } else if (config.runner === 'jest') {
          const cmd = `npx jest ${testFile} --verbose`;
          console.log(`${colors.gray}Running: ${cmd}${colors.reset}`);
          execSync(cmd, { 
            stdio: options.verbose ? 'inherit' : 'pipe',
            timeout: options.timeout 
          });
        }
        
        console.log(`${colors.green}✅ ${testName} - PASSED${colors.reset}`);
        passedTests++;
        results.push({ test: testName, status: 'PASSED', category });
      } else {
        console.log(`${colors.yellow}⚠️  ${testName} - FILE NOT FOUND${colors.reset}`);
        results.push({ test: testName, status: 'NOT_FOUND', category });
      }
    } catch (error) {
      console.log(`${colors.red}❌ ${testName} - FAILED${colors.reset}`);
      if (options.verbose) {
        console.log(`${colors.red}   Error: ${error.message}${colors.reset}`);
      }
      failedTests++;
      results.push({ test: testName, status: 'FAILED', category, error: error.message });
    }
  }

  console.log(`\n${colors.bright}📊 ${config.name} Summary:${colors.reset}`);
  console.log(`   ${colors.green}✅ Passed: ${passedTests}${colors.reset}`);
  console.log(`   ${colors.red}❌ Failed: ${failedTests}${colors.reset}`);
  console.log(`   ${colors.blue}📁 Total: ${config.tests.length}${colors.reset}`);

  return results;
}

async function generateReport(allResults, options) {
  console.log(`\n\n${colors.bright}${colors.cyan}📈 COMPREHENSIVE TEST REPORT${colors.reset}`);
  console.log(`${colors.cyan}${'═'.repeat(60)}${colors.reset}`);

  const summary = {
    total: 0,
    passed: 0,
    failed: 0,
    notFound: 0,
    exists: 0,
    patterns: 0,
    byCategory: {}
  };

  // Calculate summary statistics
  allResults.forEach(result => {
    summary.total++;
    
    switch (result.status) {
      case 'PASSED': summary.passed++; break;
      case 'FAILED': summary.failed++; break;
      case 'NOT_FOUND': summary.notFound++; break;
      case 'EXISTS': summary.exists++; break;
      case 'PATTERN': summary.patterns++; break;
    }

    if (!summary.byCategory[result.category]) {
      summary.byCategory[result.category] = { 
        passed: 0, failed: 0, notFound: 0, exists: 0, patterns: 0, total: 0 
      };
    }
    summary.byCategory[result.category].total++;
    summary.byCategory[result.category][result.status.toLowerCase()]++;
  });

  // Overall Summary
  console.log(`\n${colors.bright}🎯 OVERALL SUMMARY:${colors.reset}`);
  console.log(`   Total Tests: ${summary.total}`);
  
  if (options.checkOnly) {
    console.log(`   ${colors.green}✅ Found: ${summary.exists} (${Math.round((summary.exists / summary.total) * 100)}%)${colors.reset}`);
    console.log(`   ${colors.blue}📋 Patterns: ${summary.patterns} (${Math.round((summary.patterns / summary.total) * 100)}%)${colors.reset}`);
    console.log(`   ${colors.yellow}⚠️  Missing: ${summary.notFound} (${Math.round((summary.notFound / summary.total) * 100)}%)${colors.reset}`);
  } else {
    console.log(`   ${colors.green}✅ Passed: ${summary.passed} (${Math.round((summary.passed / summary.total) * 100)}%)${colors.reset}`);
    console.log(`   ${colors.red}❌ Failed: ${summary.failed} (${Math.round((summary.failed / summary.total) * 100)}%)${colors.reset}`);
    console.log(`   ${colors.yellow}⚠️  Not Found: ${summary.notFound} (${Math.round((summary.notFound / summary.total) * 100)}%)${colors.reset}`);
  }

  // Category Breakdown
  console.log(`\n${colors.bright}📊 BY CATEGORY:${colors.reset}`);
  Object.entries(summary.byCategory).forEach(([category, stats]) => {
    console.log(`   ${colors.bright}${category.toUpperCase()}:${colors.reset}`);
    if (options.checkOnly) {
      console.log(`     ${colors.green}✅ ${stats.exists} found${colors.reset}`);
      if (stats.patterns > 0) console.log(`     ${colors.blue}📋 ${stats.patterns} patterns${colors.reset}`);
      if (stats.notFound > 0) console.log(`     ${colors.yellow}⚠️  ${stats.notFound} missing${colors.reset}`);
    } else {
      const successRate = stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0;
      console.log(`     ${colors.green}✅ ${stats.passed}/${stats.total} passed (${successRate}%)${colors.reset}`);
      if (stats.failed > 0) console.log(`     ${colors.red}❌ ${stats.failed} failed${colors.reset}`);
      if (stats.notFound > 0) console.log(`     ${colors.yellow}⚠️  ${stats.notFound} not found${colors.reset}`);
    }
  });

  // Failed Tests Details
  if (!options.checkOnly) {
    const failedTests = allResults.filter(r => r.status === 'FAILED');
    if (failedTests.length > 0) {
      console.log(`\n${colors.red}❌ FAILED TESTS:${colors.reset}`);
      failedTests.forEach(test => {
        console.log(`   • ${test.test} (${test.category})`);
        if (test.error && options.verbose) {
          console.log(`     ${colors.gray}└─ ${test.error.substring(0, 100)}...${colors.reset}`);
        }
      });
    }
  }

  // Missing Tests
  const missingTests = allResults.filter(r => r.status === 'NOT_FOUND');
  if (missingTests.length > 0) {
    console.log(`\n${colors.yellow}⚠️  MISSING TEST FILES:${colors.reset}`);
    missingTests.forEach(test => {
      console.log(`   • ${test.test} (${test.category})`);
      if (test.file) {
        console.log(`     ${colors.gray}└─ ${test.file}${colors.reset}`);
      }
    });
  }

  // Generate JSON report
  const reportData = {
    timestamp: new Date().toISOString(),
    options,
    summary,
    results: allResults,
    environment: {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      cwd: process.cwd()
    }
  };

  const reportFile = options.checkOnly ? 'test-check-report.json' : 'test-report.json';
  fs.writeFileSync(reportFile, JSON.stringify(reportData, null, 2));
  console.log(`\n${colors.blue}📄 Detailed report saved to: ${reportFile}${colors.reset}`);

  // Exit with appropriate code
  if (!options.checkOnly && summary.failed > 0) {
    console.log(`\n${colors.red}💥 Some tests failed. Please review and fix issues.${colors.reset}`);
    process.exit(1);
  } else if (summary.notFound > 0) {
    console.log(`\n${colors.yellow}⚠️  Some test files are missing. Consider implementing them.${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`\n${colors.green}🎉 All tests ${options.checkOnly ? 'found' : 'passed'}! Great job!${colors.reset}`);
    process.exit(0);
  }
}

async function setupTestEnvironment(options) {
  if (options.skipBuild) {
    console.log(`${colors.yellow}⚠️  Skipping build step as requested${colors.reset}`);
    return;
  }

  console.log(`${colors.blue}🔧 Setting up test environment...${colors.reset}`);
  
  try {
    // Install dependencies if needed
    if (!fs.existsSync('node_modules')) {
      console.log(`${colors.blue}📦 Installing dependencies...${colors.reset}`);
      execSync('pnpm install', { stdio: 'inherit' });
    }

    // Build the project
    console.log(`${colors.blue}🏗️  Building project...${colors.reset}`);
    execSync('pnpm run build', { stdio: 'inherit' });

    // Install Playwright browsers if needed
    console.log(`${colors.blue}🎭 Setting up Playwright...${colors.reset}`);
    execSync('npx playwright install', { stdio: 'inherit' });

    console.log(`${colors.green}✅ Test environment ready!${colors.reset}`);
  } catch (error) {
    console.log(`${colors.red}❌ Failed to setup test environment: ${error.message}${colors.reset}`);
    console.log(`${colors.yellow}💡 Build failed with TypeScript errors. Recommendations:${colors.reset}`);
    console.log(`${colors.yellow}   1. Run with --skip-build to bypass build issues${colors.reset}`);
    console.log(`${colors.yellow}   2. Use --check-only to verify test files exist${colors.reset}`);
    console.log(`${colors.yellow}   3. Fix TypeScript errors before running tests${colors.reset}`);
    console.log(`${colors.cyan}   Example: node scripts/test-runner.js all --check-only --skip-build${colors.reset}`);
    process.exit(1);
  }
}

async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    return;
  }

  // Setup test environment
  await setupTestEnvironment(options);

  let allResults = [];

  if (options.category && testCategories[options.category]) {
    // Run specific category
    const config = testCategories[options.category];
    const results = options.checkOnly 
      ? await checkTestFiles(options.category, config)
      : await runTestCategory(options.category, config, options);
    allResults = results;
  } else if (options.category === 'all' || !options.category) {
    // Run all categories
    for (const [categoryName, config] of Object.entries(testCategories)) {
      const results = options.checkOnly
        ? await checkTestFiles(categoryName, config)
        : await runTestCategory(categoryName, config, options);
      allResults = allResults.concat(results);
    }
  } else {
    console.log(`${colors.red}❌ Invalid category. Available categories:${colors.reset}`);
    Object.keys(testCategories).forEach(cat => {
      console.log(`   • ${cat}`);
    });
    console.log('   • all (run all categories)');
    console.log(`\nUse --help for more information.`);
    process.exit(1);
  }

  // Generate comprehensive report
  await generateReport(allResults, options);
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.log(`\n${colors.red}💥 Uncaught Exception: ${error.message}${colors.reset}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.log(`\n${colors.red}💥 Unhandled Rejection at:${colors.reset}`, promise, `${colors.red}reason:${colors.reset}`, reason);
  process.exit(1);
});

// Run the test suite
main().catch(error => {
  console.log(`\n${colors.red}💥 Test runner failed: ${error.message}${colors.reset}`);
  process.exit(1);
}); 
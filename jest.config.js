/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // Module resolution
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/apps/web/src/$1',
    '^@omnipanel/types$': '<rootDir>/packages/types/src',
    '^@omnipanel/ui$': '<rootDir>/packages/ui/src',
    '^@omnipanel/config$': '<rootDir>/packages/config/src',
    '^@omnipanel/database$': '<rootDir>/packages/database/src',
    '^@omnipanel/llm-adapters$': '<rootDir>/packages/llm-adapters/src',
    '^@omnipanel/core$': '<rootDir>/packages/core/src',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/tests/__mocks__/fileMock.js'
  },

  // Coverage configuration
  collectCoverageFrom: [
    'apps/**/src/**/*.{ts,tsx}',
    'packages/**/src/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/*.stories.{ts,tsx}',
    '!**/__tests__/**',
    '!**/coverage/**',
    '!**/dist/**'
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Package-specific thresholds
    './packages/types/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    './packages/llm-adapters/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    './packages/ui/': {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75,
    }
  },

  // Test discovery
  testMatch: [
    '<rootDir>/tests/**/*.test.{ts,tsx}',
    '<rootDir>/apps/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/packages/**/__tests__/**/*.{ts,tsx}'
  ],

  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/apps/**/dist/',
    '<rootDir>/packages/**/dist/',
    '<rootDir>/apps/**/build/',
    '<rootDir>/tests/e2e/'
  ],

  // Transform configuration
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Global settings
  verbose: true,
  clearMocks: true,
  restoreMocks: true,

  // Test environment options
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  },

  // Parallel execution
  maxWorkers: '50%',

  // Timeouts
  testTimeout: 10000,

  // Projects for multi-package testing
  projects: [
    {
      displayName: 'Web App',
      testMatch: ['<rootDir>/apps/web/**/*.test.{ts,tsx}'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup-web.ts']
    },
    {
      displayName: 'Desktop App',
      testMatch: ['<rootDir>/apps/desktop/**/*.test.{ts,tsx}'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup-desktop.ts']
    },
    {
      displayName: 'Mobile App', 
      testMatch: ['<rootDir>/apps/mobile/**/*.test.{ts,tsx}'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup-mobile.ts']
    },
    {
      displayName: 'Packages',
      testMatch: ['<rootDir>/packages/**/*.test.{ts,tsx}'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup-packages.ts']
    },
    {
      displayName: 'Integration',
      testMatch: ['<rootDir>/tests/integration/**/*.test.{ts,tsx}'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup-integration.ts']
    }
  ]
}; 
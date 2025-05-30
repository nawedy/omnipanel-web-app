/**
 * CLI Types for Theme Management
 */

// CLI Command
export interface CLICommand {
  name: string;
  description: string;
  usage: string;
  options: CLIOption[];
  examples: string[];
  handler: (args: CLIArgs) => Promise<void>;
}

// CLI Option
export interface CLIOption {
  name: string;
  alias?: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  required?: boolean;
  default?: any;
  choices?: string[];
}

// CLI Arguments
export interface CLIArgs {
  command: string;
  subcommand?: string;
  options: Record<string, any>;
  positional: string[];
}

// CLI Configuration
export interface CLIConfig {
  name: string;
  version: string;
  description: string;
  author: string;
  homepage: string;
  repository: string;
  commands: CLICommand[];
  globalOptions: CLIOption[];
  aliases: Record<string, string>;
}

// Theme Project
export interface ThemeProject {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  main: string;
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  themeConfig: ThemeProjectConfig;
}

// Theme Project Configuration
export interface ThemeProjectConfig {
  entry: string;
  output: string;
  assets: string;
  watch: string[];
  build: {
    minify: boolean;
    sourcemap: boolean;
    target: string[];
  };
  dev: {
    port: number;
    host: string;
    open: boolean;
    hot: boolean;
  };
  marketplace: {
    apiKey?: string;
    endpoint: string;
    autoPublish: boolean;
  };
}

// Build Result
export interface BuildResult {
  success: boolean;
  output: string;
  size: number;
  duration: number;
  warnings: string[];
  errors: string[];
  assets: BuildAsset[];
}

// Build Asset
export interface BuildAsset {
  name: string;
  size: number;
  type: 'theme' | 'css' | 'image' | 'font' | 'other';
  path: string;
}

// Dev Server
export interface DevServer {
  port: number;
  host: string;
  url: string;
  status: 'starting' | 'running' | 'stopped' | 'error';
  watchers: string[];
}

// Template
export interface ThemeTemplate {
  name: string;
  description: string;
  author: string;
  version: string;
  tags: string[];
  files: TemplateFile[];
  variables: TemplateVariable[];
  hooks: TemplateHook[];
}

// Template File
export interface TemplateFile {
  path: string;
  content: string;
  template: boolean;
  binary: boolean;
}

// Template Variable
export interface TemplateVariable {
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'choice';
  default?: any;
  choices?: string[];
  required: boolean;
}

// Template Hook
export interface TemplateHook {
  name: string;
  script: string;
  when: 'before' | 'after';
}

// Validation Report
export interface ValidationReport {
  valid: boolean;
  score: number;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
  performance: PerformanceMetrics;
  accessibility: AccessibilityMetrics;
}

// Validation Error
export interface ValidationError {
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  path: string;
  line?: number;
  column?: number;
  fix?: string;
}

// Validation Warning
export interface ValidationWarning {
  code: string;
  message: string;
  path: string;
  line?: number;
  column?: number;
  suggestion?: string;
}

// Validation Suggestion
export interface ValidationSuggestion {
  code: string;
  message: string;
  path: string;
  improvement: string;
  impact: 'low' | 'medium' | 'high';
}

// Performance Metrics
export interface PerformanceMetrics {
  size: number;
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  complexity: number;
  score: number;
}

// Accessibility Metrics
export interface AccessibilityMetrics {
  contrastRatio: number;
  colorBlindnessSupport: boolean;
  keyboardNavigation: boolean;
  screenReaderSupport: boolean;
  score: number;
}

// Package Info
export interface PackageInfo {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  size: number;
  files: string[];
  dependencies: string[];
  metadata: Record<string, any>;
}

// Publish Options
export interface PublishOptions {
  registry: string;
  tag: string;
  access: 'public' | 'private';
  dryRun: boolean;
  force: boolean;
  skipValidation: boolean;
  skipTests: boolean;
}

// Publish Result
export interface PublishResult {
  success: boolean;
  packageId: string;
  version: string;
  url: string;
  size: number;
  warnings: string[];
  errors: string[];
}

// Update Check
export interface UpdateCheck {
  hasUpdates: boolean;
  current: string;
  latest: string;
  changelog: string;
  breaking: boolean;
  security: boolean;
}

// Migration
export interface Migration {
  from: string;
  to: string;
  description: string;
  breaking: boolean;
  automatic: boolean;
  steps: MigrationStep[];
}

// Migration Step
export interface MigrationStep {
  name: string;
  description: string;
  type: 'transform' | 'add' | 'remove' | 'rename' | 'manual';
  path?: string;
  from?: string;
  to?: string;
  transform?: (content: string) => string;
}

// Analytics Data
export interface AnalyticsData {
  usage: UsageMetrics;
  performance: PerformanceData;
  errors: ErrorData[];
  features: FeatureUsage[];
}

// Usage Metrics
export interface UsageMetrics {
  totalCommands: number;
  popularCommands: { command: string; count: number }[];
  averageSessionTime: number;
  userCount: number;
  projectCount: number;
}

// Performance Data
export interface PerformanceData {
  averageBuildTime: number;
  averageValidationTime: number;
  averagePublishTime: number;
  cacheHitRate: number;
}

// Error Data
export interface ErrorData {
  command: string;
  error: string;
  count: number;
  lastOccurred: string;
}

// Feature Usage
export interface FeatureUsage {
  feature: string;
  usage: number;
  trend: 'up' | 'down' | 'stable';
} 
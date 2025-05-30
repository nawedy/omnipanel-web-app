import { MarketplaceTheme, ThemeSubmission, MarketplaceCategory } from './types';
import { Theme } from '../types';
import { ThemeValidator } from '../validator';

/**
 * Marketplace Utilities
 * Helper functions for theme marketplace operations
 */

/**
 * Validate a theme for marketplace submission
 */
export function validateMarketplaceTheme(theme: Theme): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const validator = new ThemeValidator();
  const validation = validator.validate(theme);
  
  const errors: string[] = [];
  const warnings: string[] = [];

  // Add validation errors
  if (!validation.valid) {
    errors.push(...validation.errors.map(e => e.message));
  }

  // Marketplace-specific validations
  if (!theme.name || theme.name.trim().length < 3) {
    errors.push('Theme name must be at least 3 characters long');
  }

  if (!theme.description || theme.description.trim().length < 10) {
    errors.push('Theme description must be at least 10 characters long');
  }

  if (!theme.author) {
    errors.push('Theme must have an author');
  }

  if (!theme.version) {
    errors.push('Theme must have a version');
  }

  // Check for required colors
  const requiredColors = ['primary', 'secondary', 'surface', 'text'];
  for (const colorKey of requiredColors) {
    if (!theme.colors[colorKey]) {
      errors.push(`Theme must define ${colorKey} colors`);
    }
  }

  // Warnings for best practices
  if (!theme.metadata?.preview) {
    warnings.push('Consider adding a preview image for better discovery');
  }

  if (!theme.metadata?.tags?.length) {
    warnings.push('Consider adding tags for better searchability');
  }

  if (theme.name.length > 50) {
    warnings.push('Theme name is quite long, consider shortening it');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Format theme file size for display
 */
export function formatThemeSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

/**
 * Check theme compatibility with current system
 */
export function getThemeCompatibility(theme: MarketplaceTheme): {
  compatible: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Check version compatibility
  const minVersion = theme.metadata.compatibility?.minVersion;
  const maxVersion = theme.metadata.compatibility?.maxVersion;
  
  if (minVersion) {
    // In a real implementation, you'd check against current OmniPanel version
    // For now, we'll assume compatibility
  }

  // Check feature requirements
  const requiredFeatures = theme.metadata.compatibility?.requiredFeatures || [];
  const availableFeatures = [
    'dark-mode',
    'light-mode',
    'animations',
    'glassmorphism',
    'custom-fonts'
  ]; // In real implementation, get from system

  for (const feature of requiredFeatures) {
    if (!availableFeatures.includes(feature)) {
      issues.push(`Required feature "${feature}" is not available`);
    }
  }

  // Performance suggestions
  const themeSize = calculateThemeSize(theme);
  if (themeSize > 1024 * 1024) { // 1MB
    suggestions.push('Large theme size may impact performance');
  }

  const animationCount = countAnimations(theme);
  if (animationCount > 20) {
    suggestions.push('Many animations may impact performance on slower devices');
  }

  return {
    compatible: issues.length === 0,
    issues,
    suggestions
  };
}

/**
 * Calculate estimated theme size
 */
function calculateThemeSize(theme: MarketplaceTheme): number {
  // Rough estimation based on JSON size
  const jsonSize = JSON.stringify(theme).length;
  
  // Add estimated size for preview images and assets
  const assetsSize = theme.metadata.preview ? 100 * 1024 : 0; // Assume 100KB for preview
  
  return jsonSize + assetsSize;
}

/**
 * Count animations in theme
 */
function countAnimations(theme: MarketplaceTheme): number {
  let count = 0;
  
  // Count transitions
  if (theme.animations?.transitions) {
    count += Object.keys(theme.animations.transitions).length;
  }

  // Count keyframes
  if (theme.animations?.keyframes) {
    count += Object.keys(theme.animations.keyframes).length;
  }

  return count;
}

/**
 * Get popular categories for suggestions
 */
export function getPopularCategories(): MarketplaceCategory[] {
  return [
    'professional',
    'dark',
    'light',
    'minimal',
    'creative',
    'accessibility'
  ];
}

/**
 * Generate theme tags based on content
 */
export function generateThemeTags(theme: Theme): string[] {
  const tags: string[] = [];

  // Add color-based tags
  if (theme.colors.primary) {
    const primaryHue = getPrimaryHue(theme.colors.primary);
    if (primaryHue) {
      tags.push(primaryHue);
    }
  }

  // Add style-based tags
  if (theme.animations?.transitions) {
    tags.push('animated');
  }

  if (theme.typography?.fontFamily?.includes('mono')) {
    tags.push('developer');
  }

  if (theme.spacing?.base && parseFloat(theme.spacing.base) > 8) {
    tags.push('spacious');
  }

  // Add theme mood tags
  const isDark = isThemeDark(theme);
  tags.push(isDark ? 'dark' : 'light');

  return tags;
}

/**
 * Get primary color hue name
 */
function getPrimaryHue(primaryColor: any): string | null {
  if (typeof primaryColor === 'object' && primaryColor[500]) {
    const color = primaryColor[500];
    // Simple color detection (in real implementation, use proper color analysis)
    if (color.includes('blue')) return 'blue';
    if (color.includes('red')) return 'red';
    if (color.includes('green')) return 'green';
    if (color.includes('purple')) return 'purple';
  }
  return null;
}

/**
 * Determine if theme is dark or light
 */
function isThemeDark(theme: Theme): boolean {
  const bgColor = theme.colors.surface?.background || '#ffffff';
  // Simple luminance check (in real implementation, use proper color analysis)
  return bgColor.toLowerCase().includes('dark') || 
         bgColor === '#000000' || 
         bgColor.startsWith('#0') || 
         bgColor.startsWith('#1') || 
         bgColor.startsWith('#2');
}

/**
 * Create theme submission from theme
 */
export function createThemeSubmission(
  theme: Theme,
  metadata: {
    category: MarketplaceCategory;
    pricing: 'free' | 'premium';
    price?: number;
    tags?: string[];
  }
): ThemeSubmission {
  return {
    id: `submission-${Date.now()}`,
    theme,
    category: metadata.category,
    pricing: metadata.pricing,
    price: metadata.price || 0,
    tags: metadata.tags || generateThemeTags(theme),
    submittedBy: 'current-user', // In real implementation, get from auth
    submittedAt: new Date().toISOString(),
    status: 'submitted',
    reviewNotes: []
  };
} 
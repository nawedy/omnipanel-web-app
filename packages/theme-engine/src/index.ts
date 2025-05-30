// Core theme engine
export { ThemeEngine } from './engine';
export { ThemeBuilder } from './builder';
export { ThemeValidator } from './validator';
export { ThemeCompiler } from './compiler';

// Types
export * from './types';

// Utilities
export * from './utils';

// React integration
export * from './react';

// CSS utilities
export * from './css';

// Marketplace functionality
export * from './marketplace';

// Version information
export const VERSION = '1.0.0';

// Default exports for convenience
export { createTheme } from './builder';
export { validateTheme } from './validator';
export { compileTheme } from './compiler';

/**
 * Complete theme engine with marketplace support
 * Provides everything needed for a full theme system
 */

// Utility exports
export * from './utils/colors';
export * from './utils/typography';
export * from './utils/spacing';
export * from './utils/layout';
export * from './utils/components';
export * from './utils/animations';
export * from './utils/validation';
export * from './utils/theme';

// CSS generation exports (specific exports to avoid conflicts)
export { 
  CSSUtils,
  generateThemeCSS,
  generateUtilityClasses,
  minifyCSS
} from './css';

// Phase 3: Marketplace & Community exports
export * from './marketplace/types';
export * from './marketplace/client';
export * from './marketplace/installer';
export * from './community/types';
export * from './community/manager';

// Marketplace utilities
export { getMarketplaceClient, initializeMarketplace } from './marketplace/client';

// Community utilities
export { getCommunityManager, initializeCommunity } from './community/manager';

// Pre-built themes
export { defaultTheme } from './themes/default';
export { darkTheme } from './themes/dark';
export { lightTheme } from './themes/light';
export { neonTheme } from './themes/neon';
export { minimalTheme } from './themes/minimal';
export { glassmorphismTheme } from './themes/glassmorphism';
export { highContrastTheme } from './themes/high-contrast'; 
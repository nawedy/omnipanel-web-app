import { Theme, ThemeMetadata } from '../types';

/**
 * Theme Marketplace Types
 */

// Marketplace Theme (extends base Theme with marketplace-specific data)
export interface MarketplaceTheme extends Theme {
  marketplace: MarketplaceMetadata;
}

// Marketplace Metadata
export interface MarketplaceMetadata {
  id: string;
  submittedBy: string;
  submittedAt: string;
  status: ThemeStatus;
  pricing: ThemePricing;
  stats: ThemeStats;
  reviews: ThemeReview[];
  versions: ThemeVersion[];
  categories: MarketplaceCategory[];
  featured: boolean;
  verified: boolean;
  lastUpdated: string;
}

// Theme Status in Marketplace
export type ThemeStatus = 
  | 'draft'
  | 'submitted'
  | 'under-review'
  | 'approved'
  | 'rejected'
  | 'published'
  | 'deprecated'
  | 'removed';

// Theme Pricing
export interface ThemePricing {
  type: 'free' | 'premium' | 'freemium';
  price?: number;
  currency?: string;
  subscription?: {
    monthly?: number;
    yearly?: number;
  };
  trial?: {
    duration: number;
    unit: 'days' | 'weeks' | 'months';
  };
}

// Theme Statistics
export interface ThemeStats {
  downloads: number;
  activeInstalls: number;
  rating: number;
  reviewCount: number;
  views: number;
  likes: number;
  forks: number;
  lastDownload: string;
}

// Theme Review
export interface ThemeReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
  helpful: number;
  verified: boolean;
  response?: {
    authorId: string;
    authorName: string;
    message: string;
    createdAt: string;
  };
}

// Theme Version
export interface ThemeVersion {
  version: string;
  changelog: string;
  releaseDate: string;
  downloadUrl: string;
  size: number;
  compatibility: string[];
  deprecated?: boolean;
  securityIssues?: SecurityIssue[];
}

// Security Issue
export interface SecurityIssue {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  fixedInVersion?: string;
  reportedAt: string;
}

// Marketplace Categories
export type MarketplaceCategory = 
  | 'official'
  | 'dark'
  | 'light'
  | 'colorful'
  | 'minimal'
  | 'professional'
  | 'creative'
  | 'seasonal'
  | 'accessibility'
  | 'gaming'
  | 'productivity'
  | 'developer'
  | 'designer';

// Theme Submission
export interface ThemeSubmission {
  theme: Theme;
  metadata: Partial<MarketplaceMetadata>;
  submissionNotes?: string;
  testResults?: TestResult[];
  screenshots: string[];
  demoUrl?: string;
}

// Test Result
export interface TestResult {
  test: string;
  status: 'passed' | 'failed' | 'warning';
  message?: string;
  details?: any;
}

// Theme Collection
export interface ThemeCollection {
  id: string;
  name: string;
  description: string;
  author: string;
  themes: string[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  coverImage?: string;
}

// User Profile (for marketplace)
export interface MarketplaceUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar?: string;
  bio?: string;
  website?: string;
  social?: {
    github?: string;
    twitter?: string;
    dribbble?: string;
    behance?: string;
  };
  stats: {
    themesPublished: number;
    totalDownloads: number;
    averageRating: number;
    followers: number;
    following: number;
  };
  badges: UserBadge[];
  joinedAt: string;
  lastActive: string;
  verified: boolean;
}

// User Badge
export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Marketplace Search
export interface MarketplaceSearchQuery {
  query?: string;
  categories?: MarketplaceCategory[];
  pricing?: ('free' | 'premium')[];
  rating?: number;
  sortBy?: 'relevance' | 'downloads' | 'rating' | 'newest' | 'updated';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  featured?: boolean;
  verified?: boolean;
}

// Search Results
export interface MarketplaceSearchResult {
  themes: MarketplaceTheme[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  facets: {
    categories: { category: MarketplaceCategory; count: number }[];
    pricing: { type: string; count: number }[];
    ratings: { rating: number; count: number }[];
  };
}

// Theme Installation
export interface ThemeInstallation {
  themeId: string;
  version: string;
  installedAt: string;
  installedBy: string;
  source: 'marketplace' | 'local' | 'url' | 'git';
  autoUpdate: boolean;
  customizations?: Record<string, any>;
}

// Marketplace Configuration
export interface MarketplaceConfig {
  apiUrl: string;
  cdnUrl: string;
  uploadUrl: string;
  maxFileSize: number;
  allowedFormats: string[];
  reviewProcess: {
    autoApprove: boolean;
    requireManualReview: boolean;
    reviewTimeoutDays: number;
  };
  pricing: {
    commissionRate: number;
    minimumPrice: number;
    supportedCurrencies: string[];
  };
  features: {
    reviews: boolean;
    collections: boolean;
    social: boolean;
    analytics: boolean;
  };
} 
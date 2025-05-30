import { 
  MarketplaceTheme, 
  ThemeSearchFilters, 
  ThemeSearchResult,
  ThemeDownloadInfo,
  MarketplaceUser,
  ThemeReview,
  ThemeSubmission,
  ThemeCategory,
  ThemeTag,
  MarketplaceConfig,
  MarketplaceError,
  MarketplaceStats,
  ApiResponse 
} from './types';
import { Theme } from '../types';
import { getThemeEngine } from '../engine';

/**
 * OmniPanel Theme Marketplace Client
 * 
 * Provides comprehensive access to the theme marketplace including:
 * - Theme discovery and search
 * - Theme installation and management
 * - User reviews and ratings
 * - Theme submission and publishing
 * - Community features and social interactions
 */
export class MarketplaceClient {
  private baseUrl: string;
  private apiKey?: string;
  private userId?: string;
  private cache = new Map<string, any>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor(config: MarketplaceConfig) {
    this.baseUrl = config.baseUrl || 'https://marketplace.omnipanel.ai';
    this.apiKey = config.apiKey;
    this.userId = config.userId;
  }

  /**
   * Theme Discovery & Search
   */
  async searchThemes(filters: ThemeSearchFilters = {}): Promise<ThemeSearchResult[]> {
    const cacheKey = `search:${JSON.stringify(filters)}`;
    const cached = this.getFromCache<ThemeSearchResult[]>(cacheKey);
    if (cached) return cached;

    try {
      const params = new URLSearchParams();
      
      if (filters.query) params.append('q', filters.query);
      if (filters.category) params.append('category', filters.category);
      if (filters.tags?.length) params.append('tags', filters.tags.join(','));
      if (filters.author) params.append('author', filters.author);
      if (filters.sortBy) params.append('sort', filters.sortBy);
      if (filters.sortOrder) params.append('order', filters.sortOrder);
      if (filters.minRating) params.append('min_rating', filters.minRating.toString());
      if (filters.maxPrice) params.append('max_price', filters.maxPrice.toString());
      if (filters.isPremium !== undefined) params.append('premium', filters.isPremium.toString());
      if (filters.isOfficial !== undefined) params.append('official', filters.isOfficial.toString());
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await this.makeRequest<ApiResponse<ThemeSearchResult[]>>(`/api/themes/search?${params}`);
      
      if (response.success && response.data) {
        this.setCache(cacheKey, response.data);
        return response.data;
      }
      
      throw new Error(response.error || 'Failed to search themes');
    } catch (error) {
      throw this.handleError(error, 'Failed to search themes');
    }
  }

  async getFeaturedThemes(): Promise<MarketplaceTheme[]> {
    const cacheKey = 'featured-themes';
    const cached = this.getFromCache<MarketplaceTheme[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<ApiResponse<MarketplaceTheme[]>>('/api/themes/featured');
      
      if (response.success && response.data) {
        this.setCache(cacheKey, response.data);
        return response.data;
      }
      
      throw new Error(response.error || 'Failed to get featured themes');
    } catch (error) {
      throw this.handleError(error, 'Failed to get featured themes');
    }
  }

  async getPopularThemes(period: 'day' | 'week' | 'month' | 'all' = 'week'): Promise<MarketplaceTheme[]> {
    const cacheKey = `popular-themes:${period}`;
    const cached = this.getFromCache<MarketplaceTheme[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<ApiResponse<MarketplaceTheme[]>>(`/api/themes/popular?period=${period}`);
      
      if (response.success && response.data) {
        this.setCache(cacheKey, response.data);
        return response.data;
      }
      
      throw new Error(response.error || 'Failed to get popular themes');
    } catch (error) {
      throw this.handleError(error, 'Failed to get popular themes');
    }
  }

  async getRecentThemes(limit: number = 20): Promise<MarketplaceTheme[]> {
    const cacheKey = `recent-themes:${limit}`;
    const cached = this.getFromCache<MarketplaceTheme[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<ApiResponse<MarketplaceTheme[]>>(`/api/themes/recent?limit=${limit}`);
      
      if (response.success && response.data) {
        this.setCache(cacheKey, response.data);
        return response.data;
      }
      
      throw new Error(response.error || 'Failed to get recent themes');
    } catch (error) {
      throw this.handleError(error, 'Failed to get recent themes');
    }
  }

  /**
   * Theme Details & Information
   */
  async getTheme(themeId: string): Promise<MarketplaceTheme> {
    const cacheKey = `theme:${themeId}`;
    const cached = this.getFromCache<MarketplaceTheme>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<ApiResponse<MarketplaceTheme>>(`/api/themes/${themeId}`);
      
      if (response.success && response.data) {
        this.setCache(cacheKey, response.data);
        return response.data;
      }
      
      throw new Error(response.error || 'Theme not found');
    } catch (error) {
      throw this.handleError(error, 'Failed to get theme details');
    }
  }

  async getThemeDownloadInfo(themeId: string): Promise<ThemeDownloadInfo> {
    try {
      const response = await this.makeRequest<ApiResponse<ThemeDownloadInfo>>(`/api/themes/${themeId}/download`, {
        headers: this.getAuthHeaders()
      });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.error || 'Failed to get download info');
    } catch (error) {
      throw this.handleError(error, 'Failed to get theme download info');
    }
  }

  /**
   * Theme Installation & Management
   */
  async installTheme(themeId: string, options: { 
    version?: string; 
    overwrite?: boolean; 
    activate?: boolean;
  } = {}): Promise<Theme> {
    try {
      // Get download information
      const downloadInfo = await this.getThemeDownloadInfo(themeId);
      
      // Download theme package
      const themeData = await this.downloadThemePackage(downloadInfo.downloadUrl, downloadInfo.accessToken);
      
      // Install to theme engine
      const engine = getThemeEngine();
      
      if (options.overwrite || !engine.getTheme(themeData.id)) {
        engine.addTheme(themeData);
        
        if (options.activate) {
          await engine.setTheme(themeData.id);
        }
        
        // Track installation
        await this.trackThemeInstallation(themeId);
        
        return themeData;
      } else {
        throw new Error('Theme already installed. Use overwrite option to replace.');
      }
    } catch (error) {
      throw this.handleError(error, 'Failed to install theme');
    }
  }

  async uninstallTheme(themeId: string): Promise<void> {
    try {
      const engine = getThemeEngine();
      const theme = engine.getTheme(themeId);
      
      if (!theme) {
        throw new Error('Theme not found in local installation');
      }
      
      // Check if it's the current theme
      if (engine.getCurrentTheme()?.id === themeId) {
        throw new Error('Cannot uninstall currently active theme. Switch to another theme first.');
      }
      
      engine.removeTheme(themeId);
      
      // Track uninstallation
      await this.trackThemeUninstallation(themeId);
    } catch (error) {
      throw this.handleError(error, 'Failed to uninstall theme');
    }
  }

  async updateTheme(themeId: string): Promise<Theme> {
    try {
      const marketplaceTheme = await this.getTheme(themeId);
      const engine = getThemeEngine();
      const localTheme = engine.getTheme(themeId);
      
      if (!localTheme) {
        throw new Error('Theme not installed locally');
      }
      
      // Check if update is available
      if (this.compareVersions(marketplaceTheme.version, localTheme.version) <= 0) {
        throw new Error('No update available');
      }
      
      // Install updated version
      return await this.installTheme(themeId, { overwrite: true });
    } catch (error) {
      throw this.handleError(error, 'Failed to update theme');
    }
  }

  /**
   * Reviews & Ratings
   */
  async getThemeReviews(themeId: string, page: number = 1, limit: number = 10): Promise<ThemeReview[]> {
    const cacheKey = `reviews:${themeId}:${page}:${limit}`;
    const cached = this.getFromCache<ThemeReview[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<ApiResponse<ThemeReview[]>>(`/api/themes/${themeId}/reviews?page=${page}&limit=${limit}`);
      
      if (response.success && response.data) {
        this.setCache(cacheKey, response.data, 2 * 60 * 1000); // 2 minutes for reviews
        return response.data;
      }
      
      throw new Error(response.error || 'Failed to get reviews');
    } catch (error) {
      throw this.handleError(error, 'Failed to get theme reviews');
    }
  }

  async submitReview(themeId: string, review: {
    rating: number;
    title: string;
    content: string;
    pros?: string[];
    cons?: string[];
  }): Promise<ThemeReview> {
    try {
      if (!this.userId) {
        throw new Error('Authentication required to submit review');
      }
      
      const response = await this.makeRequest<ApiResponse<ThemeReview>>(`/api/themes/${themeId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify(review)
      });
      
      if (response.success && response.data) {
        // Clear reviews cache
        this.clearCacheByPattern(`reviews:${themeId}:`);
        return response.data;
      }
      
      throw new Error(response.error || 'Failed to submit review');
    } catch (error) {
      throw this.handleError(error, 'Failed to submit review');
    }
  }

  /**
   * Theme Submission & Publishing
   */
  async submitTheme(theme: Theme, submission: ThemeSubmission): Promise<string> {
    try {
      if (!this.userId) {
        throw new Error('Authentication required to submit theme');
      }
      
      const formData = new FormData();
      formData.append('theme', JSON.stringify(theme));
      formData.append('submission', JSON.stringify(submission));
      
      // Add preview images if provided
      if (submission.previewImages) {
        submission.previewImages.forEach((image, index) => {
          formData.append(`preview_${index}`, image);
        });
      }
      
      // Add theme package
      if (submission.packageFile) {
        formData.append('package', submission.packageFile);
      }
      
      const response = await this.makeRequest<ApiResponse<{ submissionId: string }>>('/api/themes/submit', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: formData
      });
      
      if (response.success && response.data) {
        return response.data.submissionId;
      }
      
      throw new Error(response.error || 'Failed to submit theme');
    } catch (error) {
      throw this.handleError(error, 'Failed to submit theme');
    }
  }

  /**
   * User & Community Features
   */
  async getUserProfile(userId?: string): Promise<MarketplaceUser> {
    const targetUserId = userId || this.userId;
    if (!targetUserId) {
      throw new Error('User ID required');
    }
    
    const cacheKey = `user:${targetUserId}`;
    const cached = this.getFromCache<MarketplaceUser>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<ApiResponse<MarketplaceUser>>(`/api/users/${targetUserId}`);
      
      if (response.success && response.data) {
        this.setCache(cacheKey, response.data);
        return response.data;
      }
      
      throw new Error(response.error || 'User not found');
    } catch (error) {
      throw this.handleError(error, 'Failed to get user profile');
    }
  }

  async getMarketplaceStats(): Promise<MarketplaceStats> {
    const cacheKey = 'marketplace-stats';
    const cached = this.getFromCache<MarketplaceStats>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<ApiResponse<MarketplaceStats>>('/api/stats');
      
      if (response.success && response.data) {
        this.setCache(cacheKey, response.data, 10 * 60 * 1000); // 10 minutes for stats
        return response.data;
      }
      
      throw new Error(response.error || 'Failed to get marketplace stats');
    } catch (error) {
      throw this.handleError(error, 'Failed to get marketplace stats');
    }
  }

  /**
   * Categories & Tags
   */
  async getCategories(): Promise<ThemeCategory[]> {
    const cacheKey = 'categories';
    const cached = this.getFromCache<ThemeCategory[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<ApiResponse<ThemeCategory[]>>('/api/categories');
      
      if (response.success && response.data) {
        this.setCache(cacheKey, response.data, 30 * 60 * 1000); // 30 minutes for categories
        return response.data;
      }
      
      throw new Error(response.error || 'Failed to get categories');
    } catch (error) {
      throw this.handleError(error, 'Failed to get categories');
    }
  }

  async getTags(): Promise<ThemeTag[]> {
    const cacheKey = 'tags';
    const cached = this.getFromCache<ThemeTag[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<ApiResponse<ThemeTag[]>>('/api/tags');
      
      if (response.success && response.data) {
        this.setCache(cacheKey, response.data, 30 * 60 * 1000); // 30 minutes for tags
        return response.data;
      }
      
      throw new Error(response.error || 'Failed to get tags');
    } catch (error) {
      throw this.handleError(error, 'Failed to get tags');
    }
  }

  /**
   * Utility Methods
   */
  private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    const fullUrl = `${this.baseUrl}${url}`;
    
    const defaultHeaders: Record<string, string> = {
      'User-Agent': 'OmniPanel-ThemeEngine/1.0'
    };
    
    if (this.apiKey) {
      defaultHeaders['X-API-Key'] = this.apiKey;
    }

    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new MarketplaceError(`HTTP ${response.status}: ${response.statusText}`, response.status);
    }

    return response.json();
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    
    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }
    
    if (this.userId) {
      headers['X-User-ID'] = this.userId;
    }
    
    return headers;
  }

  private async downloadThemePackage(url: string, accessToken?: string): Promise<Theme> {
    const headers: Record<string, string> = {};
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`Failed to download theme package: ${response.statusText}`);
    }

    return response.json();
  }

  private async trackThemeInstallation(themeId: string): Promise<void> {
    try {
      await this.makeRequest('/api/analytics/install', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify({ themeId, action: 'install' })
      });
    } catch (error) {
      // Silently fail analytics tracking
      console.warn('Failed to track theme installation:', error);
    }
  }

  private async trackThemeUninstallation(themeId: string): Promise<void> {
    try {
      await this.makeRequest('/api/analytics/install', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify({ themeId, action: 'uninstall' })
      });
    } catch (error) {
      // Silently fail analytics tracking
      console.warn('Failed to track theme uninstallation:', error);
    }
  }

  private compareVersions(version1: string, version2: string): number {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;
      
      if (v1Part > v2Part) return 1;
      if (v1Part < v2Part) return -1;
    }
    
    return 0;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any, timeout?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      timeout: timeout || this.cacheTimeout
    });
  }

  private clearCacheByPattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  private handleError(error: any, context: string): MarketplaceError {
    if (error instanceof MarketplaceError) {
      return error;
    }
    
    const message = error instanceof Error ? error.message : String(error);
    return new MarketplaceError(`${context}: ${message}`);
  }
}

/**
 * Default marketplace client instance
 */
let defaultClient: MarketplaceClient | null = null;

/**
 * Get the default marketplace client
 */
export function getMarketplaceClient(config?: MarketplaceConfig): MarketplaceClient {
  if (!defaultClient) {
    defaultClient = new MarketplaceClient(config || {
      baseUrl: 'https://marketplace.omnipanel.ai'
    });
  }
  return defaultClient;
}

/**
 * Initialize marketplace client with configuration
 */
export function initializeMarketplace(config: MarketplaceConfig): MarketplaceClient {
  defaultClient = new MarketplaceClient(config);
  return defaultClient;
} 
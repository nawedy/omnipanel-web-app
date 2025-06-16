import { MarketplaceTheme, ThemeSubmission, ThemeReview, MarketplaceSearchQuery, ThemeStats } from './types';

/**
 * Marketplace API Service
 * Handles all backend interactions for the theme marketplace
 */
export class MarketplaceAPI {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  /**
   * Submit a theme to the marketplace
   */
  async submitTheme(submission: ThemeSubmission): Promise<{ submissionId: string; status: string }> {
    const response = await this.request('/api/themes/submit', {
      method: 'POST',
      body: JSON.stringify(submission)
    });

    return response.data;
  }

  /**
   * Get theme submissions by user
   */
  async getUserSubmissions(userId: string): Promise<ThemeSubmission[]> {
    const response = await this.request(`/api/users/${userId}/submissions`);
    return response.data;
  }

  /**
   * Update theme submission
   */
  async updateSubmission(submissionId: string, updates: Partial<ThemeSubmission>): Promise<void> {
    await this.request(`/api/submissions/${submissionId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  /**
   * Submit a review for a theme
   */
  async submitReview(themeId: string, review: Omit<ThemeReview, 'id' | 'createdAt'>): Promise<ThemeReview> {
    const response = await this.request(`/api/themes/${themeId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(review)
    });

    return response.data;
  }

  /**
   * Get reviews for a theme
   */
  async getThemeReviews(themeId: string, limit = 10, offset = 0): Promise<{ reviews: ThemeReview[]; total: number }> {
    const response = await this.request(`/api/themes/${themeId}/reviews?limit=${limit}&offset=${offset}`);
    return response.data;
  }

  /**
   * Like/unlike a theme
   */
  async toggleThemeLike(themeId: string): Promise<{ liked: boolean; likeCount: number }> {
    const response = await this.request(`/api/themes/${themeId}/like`, {
      method: 'POST'
    });

    return response.data;
  }

  /**
   * Get theme statistics
   */
  async getThemeStats(themeId: string): Promise<ThemeStats> {
    const response = await this.request(`/api/themes/${themeId}/stats`);
    return response.data;
  }

  /**
   * Report a theme
   */
  async reportTheme(themeId: string, reason: string, description?: string): Promise<void> {
    await this.request(`/api/themes/${themeId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason, description })
    });
  }

  /**
   * Search themes in marketplace
   */
  async searchThemes(query: MarketplaceSearchQuery): Promise<{
    themes: MarketplaceTheme[];
    total: number;
    hasMore: boolean;
  }> {
    const params = new URLSearchParams();
    
    if (query.query) params.append('q', query.query);
    if (query.category) params.append('category', query.category);
    if (query.tags?.length) params.append('tags', query.tags.join(','));
    if (query.pricing) params.append('pricing', query.pricing.join(','));
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);
    if (query.featured !== undefined) params.append('featured', query.featured.toString());
    if (query.verified !== undefined) params.append('verified', query.verified.toString());
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());

    const response = await this.request(`/api/themes/search?${params.toString()}`);
    return response.data;
  }

  /**
   * Get featured themes
   */
  async getFeaturedThemes(limit = 6): Promise<MarketplaceTheme[]> {
    const response = await this.request(`/api/themes/featured?limit=${limit}`);
    return response.data;
  }

  /**
   * Get trending themes
   */
  async getTrendingThemes(period: 'day' | 'week' | 'month' = 'week', limit = 10): Promise<MarketplaceTheme[]> {
    const response = await this.request(`/api/themes/trending?period=${period}&limit=${limit}`);
    return response.data;
  }

  /**
   * Private request helper
   */
  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>)
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Set API key for authenticated requests
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Clear API key
   */
  clearApiKey(): void {
    this.apiKey = undefined;
  }
}

/**
 * Create marketplace API instance
 */
export function createMarketplaceAPI(baseUrl: string, apiKey?: string): MarketplaceAPI {
  return new MarketplaceAPI(baseUrl, apiKey);
} 
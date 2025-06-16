import {
  CommunityTheme,
  UserProfile,
  ThemeCollection,
  CommunityStats,
  SocialInteraction,
  CommunityEvent,
  ThemeContribution,
  CollaborationRequest,
  CommunityNotification,
  ThemeChallenge,
  CommunityForum,
  ForumPost,
  ThemeShowcase,
  UserBadge,
  CommunityConfig,
  CommunityError
} from './types';

/**
 * OmniPanel Theme Community Manager
 * 
 * Manages community features including:
 * - Theme sharing and collaboration
 * - User profiles and social interactions
 * - Community events and challenges
 * - Forums and discussions
 * - Theme showcases and collections
 * - Badge and achievement systems
 */
export class CommunityManager {
  private config: CommunityConfig;
  private cache = new Map<string, any>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private eventListeners = new Map<string, Function[]>();

  constructor(config: CommunityConfig) {
    this.config = config;
  }

  /**
   * User Profile Management
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    const cacheKey = `profile:${userId}`;
    const cached = this.getFromCache<UserProfile>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<UserProfile>(`/api/community/users/${userId}`);
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to get user profile');
    }
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await this.makeRequest<UserProfile>(`/api/community/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify(updates)
      });

      // Update cache
      this.setCache(`profile:${userId}`, response);
      
      // Emit profile update event
      this.emit('profileUpdated', { userId, profile: response });
      
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to update user profile');
    }
  }

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    const cacheKey = `badges:${userId}`;
    const cached = this.getFromCache<UserBadge[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<UserBadge[]>(`/api/community/users/${userId}/badges`);
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to get user badges');
    }
  }

  /**
   * Theme Sharing & Collaboration
   */
  async shareTheme(themeId: string, options: {
    visibility: 'public' | 'unlisted' | 'private';
    allowCollaboration?: boolean;
    description?: string;
    tags?: string[];
  }): Promise<CommunityTheme> {
    try {
      const response = await this.makeRequest<CommunityTheme>('/api/community/themes/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify({
          themeId,
          ...options
        })
      });

      // Emit theme shared event
      this.emit('themeShared', { theme: response });
      
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to share theme');
    }
  }

  async forkTheme(themeId: string, options: {
    name: string;
    description?: string;
    visibility?: 'public' | 'unlisted' | 'private';
  }): Promise<CommunityTheme> {
    try {
      const response = await this.makeRequest<CommunityTheme>(`/api/community/themes/${themeId}/fork`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify(options)
      });

      // Emit theme forked event
      this.emit('themeForked', { originalTheme: themeId, newTheme: response });
      
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to fork theme');
    }
  }

  async requestCollaboration(themeId: string, message: string): Promise<CollaborationRequest> {
    try {
      const response = await this.makeRequest<CollaborationRequest>('/api/community/collaboration/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify({
          themeId,
          message
        })
      });

      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to request collaboration');
    }
  }

  async respondToCollaboration(requestId: string, response: 'accept' | 'decline', message?: string): Promise<void> {
    try {
      await this.makeRequest(`/api/community/collaboration/${requestId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify({
          response,
          message
        })
      });

      // Emit collaboration response event
      this.emit('collaborationResponse', { requestId, response });
    } catch (error) {
      throw this.handleError(error, 'Failed to respond to collaboration request');
    }
  }

  /**
   * Theme Collections
   */
  async createCollection(collection: {
    name: string;
    description: string;
    visibility: 'public' | 'unlisted' | 'private';
    tags?: string[];
  }): Promise<ThemeCollection> {
    try {
      const response = await this.makeRequest<ThemeCollection>('/api/community/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify(collection)
      });

      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to create collection');
    }
  }

  async addToCollection(collectionId: string, themeId: string): Promise<void> {
    try {
      await this.makeRequest(`/api/community/collections/${collectionId}/themes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify({ themeId })
      });

      // Clear collection cache
      this.clearCacheByPattern(`collection:${collectionId}`);
    } catch (error) {
      throw this.handleError(error, 'Failed to add theme to collection');
    }
  }

  async getUserCollections(userId: string): Promise<ThemeCollection[]> {
    const cacheKey = `collections:${userId}`;
    const cached = this.getFromCache<ThemeCollection[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<ThemeCollection[]>(`/api/community/users/${userId}/collections`);
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to get user collections');
    }
  }

  /**
   * Social Interactions
   */
  async likeTheme(themeId: string): Promise<void> {
    try {
      await this.makeRequest(`/api/community/themes/${themeId}/like`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      // Emit like event
      this.emit('themeLiked', { themeId });
    } catch (error) {
      throw this.handleError(error, 'Failed to like theme');
    }
  }

  async unlikeTheme(themeId: string): Promise<void> {
    try {
      await this.makeRequest(`/api/community/themes/${themeId}/like`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      // Emit unlike event
      this.emit('themeUnliked', { themeId });
    } catch (error) {
      throw this.handleError(error, 'Failed to unlike theme');
    }
  }

  async followUser(userId: string): Promise<void> {
    try {
      await this.makeRequest(`/api/community/users/${userId}/follow`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      // Emit follow event
      this.emit('userFollowed', { userId });
    } catch (error) {
      throw this.handleError(error, 'Failed to follow user');
    }
  }

  async unfollowUser(userId: string): Promise<void> {
    try {
      await this.makeRequest(`/api/community/users/${userId}/follow`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      // Emit unfollow event
      this.emit('userUnfollowed', { userId });
    } catch (error) {
      throw this.handleError(error, 'Failed to unfollow user');
    }
  }

  async getSocialInteractions(userId: string): Promise<SocialInteraction[]> {
    const cacheKey = `interactions:${userId}`;
    const cached = this.getFromCache<SocialInteraction[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<SocialInteraction[]>(`/api/community/users/${userId}/interactions`);
      this.setCache(cacheKey, response, 2 * 60 * 1000); // 2 minutes for interactions
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to get social interactions');
    }
  }

  /**
   * Community Events & Challenges
   */
  async getCommunityEvents(): Promise<CommunityEvent[]> {
    const cacheKey = 'community-events';
    const cached = this.getFromCache<CommunityEvent[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<CommunityEvent[]>('/api/community/events');
      this.setCache(cacheKey, response, 10 * 60 * 1000); // 10 minutes for events
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to get community events');
    }
  }

  async getThemeChallenges(): Promise<ThemeChallenge[]> {
    const cacheKey = 'theme-challenges';
    const cached = this.getFromCache<ThemeChallenge[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<ThemeChallenge[]>('/api/community/challenges');
      this.setCache(cacheKey, response, 10 * 60 * 1000); // 10 minutes for challenges
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to get theme challenges');
    }
  }

  async participateInChallenge(challengeId: string, themeId: string): Promise<void> {
    try {
      await this.makeRequest(`/api/community/challenges/${challengeId}/participate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify({ themeId })
      });

      // Emit participation event
      this.emit('challengeParticipation', { challengeId, themeId });
    } catch (error) {
      throw this.handleError(error, 'Failed to participate in challenge');
    }
  }

  /**
   * Community Forums
   */
  async getForumCategories(): Promise<CommunityForum[]> {
    const cacheKey = 'forum-categories';
    const cached = this.getFromCache<CommunityForum[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<CommunityForum[]>('/api/community/forums');
      this.setCache(cacheKey, response, 30 * 60 * 1000); // 30 minutes for categories
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to get forum categories');
    }
  }

  async getForumPosts(forumId: string, page: number = 1, limit: number = 20): Promise<ForumPost[]> {
    const cacheKey = `forum-posts:${forumId}:${page}:${limit}`;
    const cached = this.getFromCache<ForumPost[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<ForumPost[]>(`/api/community/forums/${forumId}/posts?page=${page}&limit=${limit}`);
      this.setCache(cacheKey, response, 5 * 60 * 1000); // 5 minutes for posts
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to get forum posts');
    }
  }

  async createForumPost(forumId: string, post: {
    title: string;
    content: string;
    tags?: string[];
    themeId?: string;
  }): Promise<ForumPost> {
    try {
      const response = await this.makeRequest<ForumPost>(`/api/community/forums/${forumId}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify(post)
      });

      // Clear forum posts cache
      this.clearCacheByPattern(`forum-posts:${forumId}:`);
      
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to create forum post');
    }
  }

  /**
   * Theme Showcases
   */
  async getFeaturedShowcases(): Promise<ThemeShowcase[]> {
    const cacheKey = 'featured-showcases';
    const cached = this.getFromCache<ThemeShowcase[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<ThemeShowcase[]>('/api/community/showcases/featured');
      this.setCache(cacheKey, response, 15 * 60 * 1000); // 15 minutes for showcases
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to get featured showcases');
    }
  }

  async submitShowcase(showcase: {
    themeId: string;
    title: string;
    description: string;
    images: File[];
    category: string;
  }): Promise<ThemeShowcase> {
    try {
      const formData = new FormData();
      formData.append('themeId', showcase.themeId);
      formData.append('title', showcase.title);
      formData.append('description', showcase.description);
      formData.append('category', showcase.category);
      
      showcase.images.forEach((image, index) => {
        formData.append(`image_${index}`, image);
      });

      const response = await this.makeRequest<ThemeShowcase>('/api/community/showcases', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: formData
      });

      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to submit showcase');
    }
  }

  /**
   * Notifications
   */
  async getNotifications(page: number = 1, limit: number = 20): Promise<CommunityNotification[]> {
    try {
      const response = await this.makeRequest<CommunityNotification[]>(`/api/community/notifications?page=${page}&limit=${limit}`, {
        headers: this.getAuthHeaders()
      });

      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to get notifications');
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await this.makeRequest(`/api/community/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      // Emit notification read event
      this.emit('notificationRead', { notificationId });
    } catch (error) {
      throw this.handleError(error, 'Failed to mark notification as read');
    }
  }

  /**
   * Community Statistics
   */
  async getCommunityStats(): Promise<CommunityStats> {
    const cacheKey = 'community-stats';
    const cached = this.getFromCache<CommunityStats>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<CommunityStats>('/api/community/stats');
      this.setCache(cacheKey, response, 15 * 60 * 1000); // 15 minutes for stats
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to get community stats');
    }
  }

  /**
   * Event System
   */
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  /**
   * Utility Methods
   */
  private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    const fullUrl = `${this.config.baseUrl}${url}`;
    
    const defaultHeaders: Record<string, string> = {
      'User-Agent': 'OmniPanel-Community/1.0'
    };
    
    if (this.config.apiKey) {
      defaultHeaders['X-API-Key'] = this.config.apiKey;
    }

    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new CommunityError(`HTTP ${response.status}: ${response.statusText}`, response.status.toString());
    }

    return response.json();
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    
    if (this.config.apiKey) {
      headers['X-API-Key'] = this.config.apiKey;
    }
    
    if (this.config.userId) {
      headers['X-User-ID'] = this.config.userId;
    }
    
    return headers;
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

  private handleError(error: any, context: string): CommunityError {
    if (error instanceof CommunityError) {
      return error;
    }
    
    const message = error instanceof Error ? error.message : String(error);
    return new CommunityError(`${context}: ${message}`);
  }
}

/**
 * Default community manager instance
 */
let defaultManager: CommunityManager | null = null;

/**
 * Get the default community manager
 */
export function getCommunityManager(config?: Partial<CommunityConfig>): CommunityManager {
  if (!defaultManager) {
    const defaultConfig: CommunityConfig = {
      baseUrl: 'https://community.omnipanel.ai',
      features: {
        posts: true,
        showcases: true,
        tutorials: true,
        challenges: true,
        comments: true,
        reactions: true,
        notifications: true,
        following: true
      },
      moderation: {
        autoModeration: true,
        requireApproval: false,
        bannedWords: [],
        maxPostLength: 5000,
        maxCommentLength: 1000
      },
      gamification: {
        badges: true,
        points: true,
        leaderboards: true,
        achievements: true
      },
      limits: {
        maxPostsPerDay: 10,
        maxCommentsPerDay: 50,
        maxFollowsPerDay: 20,
        maxTagsPerPost: 5
      },
      ...config
    };
    
    defaultManager = new CommunityManager(defaultConfig);
  }
  
  return defaultManager;
}

/**
 * Initialize community manager with full configuration
 */
export function initializeCommunity(config: CommunityConfig): CommunityManager {
  const manager = new CommunityManager(config);
  defaultManager = manager;
  return manager;
} 
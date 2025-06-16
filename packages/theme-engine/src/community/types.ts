import { Theme } from '../types';
import { MarketplaceUser } from '../marketplace/types';

/**
 * Community Types for Theme Sharing and Collaboration
 */

// Re-export common types for convenience
export interface CommunityTheme extends Theme {
  community?: CommunityMetadata;
}

export interface CommunityMetadata {
  featured: boolean;
  showcased: boolean;
  likes: number;
  downloads: number;
  forks: number;
  comments: number;
}

export interface UserProfile extends MarketplaceUser {
  preferences: UserPreferences;
  activity: UserActivity[];
  contributions: UserContribution[];
}

export interface UserPreferences {
  theme: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  mentions: boolean;
  follows: boolean;
  likes: boolean;
  comments: boolean;
}

export interface PrivacySettings {
  profileVisible: boolean;
  activityVisible: boolean;
  emailVisible: boolean;
}

export interface UserContribution {
  type: 'theme' | 'post' | 'comment' | 'tutorial' | 'showcase';
  id: string;
  title: string;
  createdAt: string;
  stats: ContributionStats;
}

export interface ContributionStats {
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

export interface ThemeCollection {
  id: string;
  name: string;
  description: string;
  themes: string[];
  author: MarketplaceUser;
  createdAt: string;
  updatedAt: string;
  featured: boolean;
  stats: CollectionStats;
}

export interface CollectionStats {
  views: number;
  likes: number;
  follows: number;
  themes: number;
}

export interface SocialInteraction {
  id: string;
  type: 'like' | 'follow' | 'share' | 'comment' | 'mention';
  userId: string;
  targetId: string;
  targetType: 'theme' | 'post' | 'user' | 'collection';
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface CommunityEvent {
  id: string;
  type: 'challenge' | 'contest' | 'workshop' | 'showcase' | 'announcement';
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  organizer: MarketplaceUser;
  participants: string[];
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
}

export interface ThemeContribution {
  themeId: string;
  contributorId: string;
  type: 'code' | 'design' | 'testing' | 'documentation';
  contribution: string;
  approved: boolean;
  createdAt: string;
}

export interface CollaborationRequest {
  id: string;
  projectId: string;
  requesterId: string;
  targetId: string;
  type: 'theme' | 'collection' | 'tutorial';
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface CommunityNotification extends Notification {
  community?: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface ThemeChallenge extends CommunityChallenge {
  theme?: Theme;
  requirements: ChallengeRequirement[];
}

export interface CommunityForum {
  id: string;
  name: string;
  description: string;
  category: string;
  posts: CommunityPost[];
  moderators: MarketplaceUser[];
  rules: string[];
  stats: ForumStats;
}

export interface ForumStats {
  posts: number;
  topics: number;
  members: number;
  activeMembers: number;
}

export interface ForumPost extends CommunityPost {
  forumId: string;
  topic: string;
  sticky: boolean;
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export class CommunityError extends Error {
  public code: string;
  public context?: Record<string, any>;
  public recoverable: boolean;

  constructor(
    message: string,
    code?: string,
    context?: Record<string, any>,
    recoverable: boolean = true
  ) {
    super(message);
    this.name = 'CommunityError';
    this.code = code || 'UNKNOWN';
    this.context = context;
    this.recoverable = recoverable;
  }
}

// Community Post
export interface CommunityPost {
  id: string;
  type: 'theme-share' | 'showcase' | 'tutorial' | 'question' | 'discussion';
  title: string;
  content: string;
  author: MarketplaceUser;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  attachments: PostAttachment[];
  stats: PostStats;
  comments: Comment[];
  reactions: Reaction[];
  featured: boolean;
  pinned: boolean;
  locked: boolean;
}

// Post Attachment
export interface PostAttachment {
  id: string;
  type: 'image' | 'video' | 'theme' | 'code' | 'link';
  url: string;
  title?: string;
  description?: string;
  metadata?: Record<string, any>;
}

// Post Statistics
export interface PostStats {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  bookmarks: number;
}

// Comment
export interface Comment {
  id: string;
  content: string;
  author: MarketplaceUser;
  createdAt: string;
  updatedAt: string;
  parentId?: string; // For nested comments
  reactions: Reaction[];
  edited: boolean;
  deleted: boolean;
}

// Reaction
export interface Reaction {
  id: string;
  type: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';
  userId: string;
  createdAt: string;
}

// Theme Showcase
export interface ThemeShowcase {
  id: string;
  theme: Theme;
  title: string;
  description: string;
  author: MarketplaceUser;
  screenshots: string[];
  demoUrl?: string;
  sourceUrl?: string;
  createdAt: string;
  updatedAt: string;
  featured: boolean;
  stats: ShowcaseStats;
  tags: string[];
  category: ShowcaseCategory;
}

// Showcase Statistics
export interface ShowcaseStats {
  views: number;
  likes: number;
  downloads: number;
  forks: number;
  comments: number;
}

// Showcase Category
export type ShowcaseCategory = 
  | 'workspace'
  | 'dashboard'
  | 'editor'
  | 'mobile'
  | 'desktop'
  | 'web'
  | 'concept'
  | 'experiment';

// Tutorial
export interface Tutorial {
  id: string;
  title: string;
  description: string;
  content: TutorialStep[];
  author: MarketplaceUser;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  tags: string[];
  prerequisites: string[];
  createdAt: string;
  updatedAt: string;
  published: boolean;
  stats: TutorialStats;
  resources: TutorialResource[];
}

// Tutorial Step
export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  code?: string;
  images?: string[];
  video?: string;
  order: number;
  duration?: number; // in minutes
}

// Tutorial Statistics
export interface TutorialStats {
  views: number;
  completions: number;
  likes: number;
  bookmarks: number;
  difficulty_rating: number;
  helpfulness_rating: number;
}

// Tutorial Resource
export interface TutorialResource {
  id: string;
  title: string;
  type: 'link' | 'file' | 'theme' | 'tool';
  url: string;
  description?: string;
}

// Community Challenge
export interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  rules: string[];
  startDate: string;
  endDate: string;
  organizer: MarketplaceUser;
  prizes: ChallengePrize[];
  submissions: ChallengeSubmission[];
  judges: MarketplaceUser[];
  status: 'upcoming' | 'active' | 'judging' | 'completed' | 'cancelled';
  tags: string[];
  requirements: ChallengeRequirement[];
}

// Challenge Prize
export interface ChallengePrize {
  position: number;
  title: string;
  description: string;
  value?: number;
  currency?: string;
  sponsor?: string;
}

// Challenge Submission
export interface ChallengeSubmission {
  id: string;
  challengeId: string;
  theme: Theme;
  title: string;
  description: string;
  author: MarketplaceUser;
  submittedAt: string;
  screenshots: string[];
  demoUrl?: string;
  sourceUrl?: string;
  votes: number;
  comments: Comment[];
  disqualified: boolean;
  winner?: boolean;
  position?: number;
}

// Challenge Requirement
export interface ChallengeRequirement {
  id: string;
  title: string;
  description: string;
  required: boolean;
  type: 'feature' | 'design' | 'technical' | 'accessibility';
}

// User Activity
export interface UserActivity {
  id: string;
  userId: string;
  type: ActivityType;
  targetId: string;
  targetType: 'theme' | 'post' | 'comment' | 'user' | 'challenge';
  metadata?: Record<string, any>;
  createdAt: string;
}

// Activity Type
export type ActivityType = 
  | 'theme_published'
  | 'theme_updated'
  | 'theme_liked'
  | 'theme_downloaded'
  | 'post_created'
  | 'post_liked'
  | 'comment_created'
  | 'user_followed'
  | 'challenge_joined'
  | 'challenge_won'
  | 'tutorial_completed'
  | 'showcase_featured';

// Community Feed
export interface CommunityFeed {
  items: FeedItem[];
  hasMore: boolean;
  nextCursor?: string;
}

// Feed Item
export interface FeedItem {
  id: string;
  type: 'post' | 'showcase' | 'tutorial' | 'challenge' | 'activity';
  content: CommunityPost | ThemeShowcase | Tutorial | CommunityChallenge | UserActivity;
  createdAt: string;
  priority: number;
  seen: boolean;
}

// Notification
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

// Notification Type
export type NotificationType = 
  | 'theme_approved'
  | 'theme_rejected'
  | 'theme_featured'
  | 'comment_reply'
  | 'post_liked'
  | 'user_followed'
  | 'challenge_started'
  | 'challenge_ended'
  | 'tutorial_published'
  | 'system_announcement';

// Community Statistics
export interface CommunityStats {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  totalThemes: number;
  totalTutorials: number;
  activeChallenges: number;
  topContributors: MarketplaceUser[];
  trendingTags: { tag: string; count: number }[];
  recentActivity: UserActivity[];
}

// Community Search
export interface CommunitySearchQuery {
  query?: string;
  type?: ('post' | 'showcase' | 'tutorial' | 'user' | 'challenge')[];
  tags?: string[];
  author?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  sortBy?: 'relevance' | 'date' | 'popularity' | 'rating';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Search Results
export interface CommunitySearchResult {
  posts: CommunityPost[];
  showcases: ThemeShowcase[];
  tutorials: Tutorial[];
  users: MarketplaceUser[];
  challenges: CommunityChallenge[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Community Configuration
export interface CommunityConfig {
  baseUrl?: string;
  apiKey?: string;
  userId?: string;
  features: {
    posts: boolean;
    showcases: boolean;
    tutorials: boolean;
    challenges: boolean;
    comments: boolean;
    reactions: boolean;
    notifications: boolean;
    following: boolean;
  };
  moderation: {
    autoModeration: boolean;
    requireApproval: boolean;
    bannedWords: string[];
    maxPostLength: number;
    maxCommentLength: number;
  };
  gamification: {
    badges: boolean;
    points: boolean;
    leaderboards: boolean;
    achievements: boolean;
  };
  limits: {
    maxPostsPerDay: number;
    maxCommentsPerDay: number;
    maxFollowsPerDay: number;
    maxTagsPerPost: number;
  };
} 
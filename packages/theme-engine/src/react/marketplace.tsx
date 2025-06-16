import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MarketplaceTheme, MarketplaceSearchQuery, MarketplaceSearchResult } from '../marketplace/types';
import { MarketplaceClient } from '../marketplace/client';
import { useTheme, useThemeColors } from './hooks';

/**
 * Marketplace Header with OmniPanel Branding
 */
export interface MarketplaceHeaderProps {
  onSearch?: (query: string) => void;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  onUserClick?: () => void;
}

export const MarketplaceHeader: React.FC<MarketplaceHeaderProps> = ({
  onSearch,
  user,
  onUserClick
}) => {
  const { colors } = useThemeColors();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  }, [searchQuery, onSearch]);

  return (
    <header 
      style={{
        backgroundColor: colors?.surface?.background || '#ffffff',
        borderBottom: `1px solid ${colors?.semantic?.border?.default || '#e2e8f0'}`,
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* OmniPanel Logo and Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <img 
          src="/assets/OmniPanel-logo.png" 
          alt="OmniPanel" 
          style={{ 
            height: '32px', 
            width: 'auto',
            objectFit: 'contain'
          }} 
        />
        <div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '1.5rem', 
            fontWeight: 600,
            color: colors?.semantic?.text?.primary || '#1a202c'
          }}>
            Theme Marketplace
          </h1>
          <p style={{ 
            margin: 0, 
            fontSize: '0.875rem', 
            color: colors?.semantic?.text?.secondary || '#718096'
          }}>
            Discover and share beautiful themes for OmniPanel
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: '400px', margin: '0 2rem' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search themes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: `1px solid ${colors?.semantic?.border?.default || '#e2e8f0'}`,
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              backgroundColor: colors?.surface?.foreground || '#ffffff',
              color: colors?.semantic?.text?.primary || '#1a202c'
            }}
          />
          <button
            type="submit"
            style={{
              position: 'absolute',
              right: '0.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: colors?.semantic?.text?.secondary || '#718096',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            🔍
          </button>
        </div>
      </form>

      {/* User Profile */}
      {user && (
        <div 
          onClick={onUserClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            transition: 'background-color 0.2s'
          }}
        >
          {user.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.name}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: colors?.primary?.[500] || '#3182ce',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: 600
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <span style={{ 
            fontSize: '0.875rem', 
            color: colors?.semantic?.text?.primary || '#1a202c',
            fontWeight: 500
          }}>
            {user.name}
          </span>
        </div>
      )}
    </header>
  );
};

/**
 * Theme Card Component
 */
export interface ThemeCardProps {
  theme: MarketplaceTheme;
  onInstall: (themeId: string) => void;
  onPreview: ((theme: MarketplaceTheme) => void) | (() => void);
  onLike: (themeId: string) => void;
  isInstalling?: boolean;
}

export function ThemeCard({ theme, onInstall, onPreview, onLike, isInstalling }: ThemeCardProps) {
  const { colors } = useThemeColors();

  return (
    <div 
      className="theme-card"
      style={{
        backgroundColor: colors?.surface?.card,
        borderColor: colors?.semantic?.border?.default,
        color: colors?.semantic?.text?.primary
      }}
    >
      <div className="theme-preview">
        <img 
          src={theme.metadata.screenshots?.[0] || theme.metadata.preview} 
          alt={theme.name}
          onClick={() => onPreview(theme)}
        />
      </div>
      
      <div className="theme-info">
        <h3>{theme.name}</h3>
        <p>{theme.description}</p>
        
        <div className="theme-meta">
          <span>{theme.metadata.stats?.downloads || theme.metadata.downloads || 0} downloads</span>
          <span>⭐ {theme.metadata.stats?.rating || theme.metadata.rating || 0}</span>
        </div>
        
        <div className="theme-tags">
          {(theme.metadata.categories || theme.metadata.tags || []).map((category: string) => (
            <span key={category} className="tag">{category}</span>
          ))}
        </div>
      </div>
      
      <div className="theme-actions">
        <button 
          onClick={() => onInstall(theme.id)}
          disabled={isInstalling}
          className="install-btn"
        >
          {isInstalling ? 'Installing...' : 'Install'}
        </button>
        
        <button 
          onClick={() => onLike(theme.id)}
          className="like-btn"
        >
          ❤️ {theme.metadata.stats?.likes || 0}
        </button>
      </div>
    </div>
  );
}

/**
 * Marketplace Grid Component
 */
export interface MarketplaceGridProps {
  client: MarketplaceClient;
  searchQuery?: MarketplaceSearchQuery;
  onThemeInstall?: (themeId: string) => void;
  onThemePreview?: (themeId: string) => void;
  onThemeLike?: (themeId: string) => void;
}

export const MarketplaceGrid: React.FC<MarketplaceGridProps> = ({
  client,
  searchQuery,
  onThemeInstall,
  onThemePreview,
  onThemeLike
}) => {
  const { colors } = useThemeColors();
  const [themes, setThemes] = useState<MarketplaceTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const loadThemes = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const query: MarketplaceSearchQuery = {
        ...searchQuery,
        page: reset ? 1 : page,
        limit: 12
      };

      const result = await client.searchThemes(query);
      
      // Handle the actual result structure
      if (result && typeof result === 'object' && 'themes' in result) {
        const searchResult = result as any;
        if (reset) {
          setThemes(searchResult.themes || []);
          setPage(2);
        } else {
          setThemes(prev => [...prev, ...(searchResult.themes || [])]);
          setPage(prev => prev + 1);
        }
        setHasMore(searchResult.hasMore || false);
      } else {
        // If result is directly an array of themes
        const themes = Array.isArray(result) ? result as unknown as MarketplaceTheme[] : [];
        if (reset) {
          setThemes(themes);
          setPage(2);
        } else {
          setThemes(prev => [...prev, ...themes]);
          setPage(prev => prev + 1);
        }
        setHasMore(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load themes');
    } finally {
      setLoading(false);
    }
  }, [client, searchQuery, page]);

  useEffect(() => {
    loadThemes(true);
  }, [searchQuery]);

  if (loading && themes.length === 0) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        color: colors?.semantic?.text?.secondary || '#718096'
      }}>
        Loading themes...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        color: '#ef4444' // Use direct color since error color path doesn't exist
      }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem',
        padding: '2rem'
      }}>
        {themes.map(theme => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            onInstall={onThemeInstall || (() => {})}
            onPreview={onThemePreview ? (theme) => onThemePreview(theme.id) : () => {}}
            onLike={onThemeLike || (() => {})}
          />
        ))}
      </div>

      {hasMore && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <button
            onClick={() => loadThemes(false)}
            disabled={loading}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: colors?.primary?.[500] || '#3182ce',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Complete Marketplace Component
 */
export interface MarketplaceProps {
  client: MarketplaceClient;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  onThemeInstall?: (themeId: string) => void;
  onThemePreview?: (themeId: string) => void;
  onThemeLike?: (themeId: string) => void;
  onUserClick?: () => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({
  client,
  user,
  onThemeInstall,
  onThemePreview,
  onThemeLike,
  onUserClick
}) => {
  const { colors } = useThemeColors();
  const [searchQuery, setSearchQuery] = useState<MarketplaceSearchQuery>({});

  const handleSearch = useCallback((query: string) => {
    setSearchQuery({ query });
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors?.surface?.background || '#f7fafc'
    }}>
      <MarketplaceHeader
        onSearch={handleSearch}
        user={user}
        onUserClick={onUserClick}
      />
      
      <MarketplaceGrid
        client={client}
        searchQuery={searchQuery}
        onThemeInstall={onThemeInstall}
        onThemePreview={onThemePreview}
        onThemeLike={onThemeLike}
      />
    </div>
  );
};

// Theme Gallery Component
interface ThemeGalleryProps {
  client: MarketplaceClient;
  onThemeInstall?: (theme: MarketplaceTheme) => void;
  onThemePreview?: (theme: MarketplaceTheme) => void;
}

export function ThemeGallery({ client, onThemeInstall, onThemePreview }: ThemeGalleryProps) {
  const [themes, setThemes] = useState<MarketplaceTheme[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [installingThemes, setInstallingThemes] = useState<Set<string>>(new Set());
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadThemes = useCallback(async (filters: any = {}, reset = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const searchFilters = {
        ...filters,
        page: reset ? 1 : page,
        limit: 12
      };
      
      const results = await client.searchThemes(searchFilters);
      
      // Handle the actual result structure
      if (results && typeof results === 'object' && 'themes' in results) {
        const searchResult = results as any;
        if (reset) {
          setThemes(searchResult.themes || []);
          setPage(1);
        } else {
          setThemes(prev => [...prev, ...(searchResult.themes || [])]);
        }
        setHasMore(searchResult.hasMore || false);
      } else {
        // If results is directly an array of themes
        const themes = Array.isArray(results) ? results as unknown as MarketplaceTheme[] : [];
        if (reset) {
          setThemes(themes);
          setPage(1);
        } else {
          setThemes(prev => [...prev, ...themes]);
        }
        setHasMore(false);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load themes');
    } finally {
      setIsLoading(false);
    }
  }, [client, page]);

  const handleInstall = useCallback(async (themeId: string) => {
    try {
      setInstallingThemes(prev => new Set([...prev, themeId]));
      
      const theme = await client.installTheme(themeId);
      
      if (onThemeInstall) {
        onThemeInstall(theme as MarketplaceTheme);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to install theme');
    } finally {
      setInstallingThemes(prev => {
        const newSet = new Set(prev);
        newSet.delete(themeId);
        return newSet;
      });
    }
  }, [client, onThemeInstall]);

  const handleLike = useCallback(async (themeId: string) => {
    try {
      // TODO: Implement theme liking
      console.log('Like theme:', themeId);
    } catch (err) {
      console.error('Failed to like theme:', err);
    }
  }, []);

  const handlePreview = useCallback((theme: MarketplaceTheme) => {
    if (onThemePreview) {
      onThemePreview(theme);
    }
  }, [onThemePreview]);

  // Provide default handlers to avoid undefined errors
  const safeInstallHandler = onThemeInstall ? handleInstall : () => {};
  const safeLikeHandler = handleLike;
  const safePreviewHandler = onThemePreview ? handlePreview : () => {};

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
      loadThemes({}, false);
    }
  }, [isLoading, hasMore, loadThemes]);

  // Initial load
  useEffect(() => {
    loadThemes({}, true);
  }, []);

  // Load more when page changes
  useEffect(() => {
    if (page > 1) {
      loadThemes({}, false);
    }
  }, [page]);

  return (
    <div className="theme-gallery">
      <div>Search functionality will be implemented</div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="themes-grid">
        {themes.map(theme => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            onInstall={safeInstallHandler}
            onPreview={safePreviewHandler}
            onLike={safeLikeHandler}
            isInstalling={installingThemes.has(theme.id)}
          />
        ))}
      </div>
      
      {hasMore && (
        <div className="load-more">
          <button onClick={loadMore} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
} 
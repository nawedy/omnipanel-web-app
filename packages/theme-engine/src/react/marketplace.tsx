import React, { useState, useEffect, useCallback } from 'react';
import { MarketplaceTheme, MarketplaceSearchQuery, MarketplaceSearchResult } from '../marketplace/types';
import { MarketplaceClient } from '../marketplace/client';
import { useTheme } from './hooks';

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
  const { colors } = useTheme();
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
            color: colors?.text?.primary || '#1a202c'
          }}>
            Theme Marketplace
          </h1>
          <p style={{ 
            margin: 0, 
            fontSize: '0.875rem', 
            color: colors?.text?.secondary || '#718096'
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
              color: colors?.text?.primary || '#1a202c'
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
              color: colors?.text?.secondary || '#718096',
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
            color: colors?.text?.primary || '#1a202c',
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
  onInstall?: (themeId: string) => void;
  onPreview?: (themeId: string) => void;
  onLike?: (themeId: string) => void;
  installed?: boolean;
  liked?: boolean;
}

export const ThemeCard: React.FC<ThemeCardProps> = ({
  theme,
  onInstall,
  onPreview,
  onLike,
  installed = false,
  liked = false
}) => {
  const { colors } = useTheme();

  return (
    <div style={{
      backgroundColor: colors?.surface?.foreground || '#ffffff',
      border: `1px solid ${colors?.semantic?.border?.default || '#e2e8f0'}`,
      borderRadius: '0.75rem',
      overflow: 'hidden',
      transition: 'all 0.2s',
      cursor: 'pointer'
    }}>
      {/* Theme Preview */}
      <div style={{ position: 'relative' }}>
        <img 
          src={theme.metadata.preview || '/assets/theme-placeholder.png'}
          alt={theme.name}
          style={{
            width: '100%',
            height: '200px',
            objectFit: 'cover'
          }}
        />
        <div style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          display: 'flex',
          gap: '0.5rem'
        }}>
          {theme.marketplace.featured && (
            <span style={{
              backgroundColor: 'rgba(255, 193, 7, 0.9)',
              color: '#000',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              fontSize: '0.75rem',
              fontWeight: 600
            }}>
              Featured
            </span>
          )}
          {theme.marketplace.verified && (
            <span style={{
              backgroundColor: 'rgba(34, 197, 94, 0.9)',
              color: '#fff',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              fontSize: '0.75rem',
              fontWeight: 600
            }}>
              ✓ Verified
            </span>
          )}
        </div>
      </div>

      {/* Theme Info */}
      <div style={{ padding: '1rem' }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <h3 style={{
            margin: 0,
            fontSize: '1.125rem',
            fontWeight: 600,
            color: colors?.text?.primary || '#1a202c'
          }}>
            {theme.name}
          </h3>
          <p style={{
            margin: 0,
            fontSize: '0.875rem',
            color: colors?.text?.secondary || '#718096'
          }}>
            by {theme.author}
          </p>
        </div>

        <p style={{
          margin: '0.5rem 0',
          fontSize: '0.875rem',
          color: colors?.text?.secondary || '#718096',
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {theme.description}
        </p>

        {/* Stats */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          margin: '0.75rem 0',
          fontSize: '0.75rem',
          color: colors?.text?.secondary || '#718096'
        }}>
          <span>⭐ {theme.marketplace.stats.rating.toFixed(1)}</span>
          <span>📥 {theme.marketplace.stats.downloads.toLocaleString()}</span>
          <span>💬 {theme.marketplace.stats.reviewCount}</span>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginTop: '1rem'
        }}>
          <button
            onClick={() => onInstall?.(theme.id)}
            disabled={installed}
            style={{
              flex: 1,
              padding: '0.5rem 1rem',
              backgroundColor: installed 
                ? colors?.semantic?.border?.default || '#e2e8f0'
                : colors?.primary?.[500] || '#3182ce',
              color: installed ? colors?.text?.secondary || '#718096' : '#ffffff',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: installed ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {installed ? 'Installed' : 'Install'}
          </button>
          
          <button
            onClick={() => onPreview?.(theme.id)}
            style={{
              padding: '0.5rem',
              backgroundColor: 'transparent',
              color: colors?.text?.secondary || '#718096',
              border: `1px solid ${colors?.semantic?.border?.default || '#e2e8f0'}`,
              borderRadius: '0.375rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            👁️
          </button>
          
          <button
            onClick={() => onLike?.(theme.id)}
            style={{
              padding: '0.5rem',
              backgroundColor: 'transparent',
              color: liked ? '#ef4444' : colors?.text?.secondary || '#718096',
              border: `1px solid ${colors?.semantic?.border?.default || '#e2e8f0'}`,
              borderRadius: '0.375rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {liked ? '❤️' : '🤍'}
          </button>
        </div>
      </div>
    </div>
  );
};

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
  const { colors } = useTheme();
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
      
      if (reset) {
        setThemes(result.themes);
        setPage(2);
      } else {
        setThemes(prev => [...prev, ...result.themes]);
        setPage(prev => prev + 1);
      }
      
      setHasMore(result.hasMore);
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
        color: colors?.text?.secondary || '#718096'
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
        color: colors?.semantic?.error || '#ef4444'
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
            onInstall={onThemeInstall}
            onPreview={onThemePreview}
            onLike={onThemeLike}
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
  const { colors } = useTheme();
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
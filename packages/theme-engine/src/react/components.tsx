import React, { useState, useCallback, useMemo } from 'react';
import { Theme, ColorPalette, ThemeCategory } from '../types';
import { useTheme, useThemeColors, useColorPalette } from './hooks';
import { ColorUtils } from '../utils/colors';

/**
 * Color picker component with theme integration
 */
export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
  showAlpha?: boolean;
  showPalette?: boolean;
  className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  disabled = false,
  showAlpha = true,
  showPalette = true,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();
  const colors = useThemeColors();

  const handleColorChange = useCallback((newColor: string) => {
    onChange(newColor);
  }, [onChange]);

  const colorSwatches = useMemo(() => {
    if (!showPalette || !theme) return [];
    
    const swatches: string[] = [];
    
    // Add primary colors
    if (theme.colors.primary) {
      swatches.push(...Object.values(theme.colors.primary));
    }
    
    // Add secondary colors
    if (theme.colors.secondary) {
      swatches.push(...Object.values(theme.colors.secondary));
    }
    
    // Add accent colors
    if (theme.colors.accent) {
      swatches.push(...Object.values(theme.colors.accent));
    }
    
    return [...new Set(swatches)]; // Remove duplicates
  }, [theme, showPalette]);

  return (
    <div className={`color-picker ${className}`}>
      <button
        type="button"
        className="color-picker-trigger"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        style={{
          backgroundColor: value,
          border: `2px solid ${colors?.semantic?.border?.default || '#e2e8f0'}`,
          borderRadius: '6px',
          width: '40px',
          height: '40px',
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
      />
      
      {isOpen && (
        <div className="color-picker-popover">
          <input
            type="color"
            value={value}
            onChange={(e) => handleColorChange(e.target.value)}
            disabled={disabled}
            className="color-picker-input"
          />
          
          {showPalette && colorSwatches.length > 0 && (
            <div className="color-picker-palette">
              {colorSwatches.map((color, index) => (
                <button
                  key={index}
                  type="button"
                  className="color-swatch"
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(color)}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Theme selector component
 */
export interface ThemeSelectorProps {
  themes: Theme[];
  currentTheme: string;
  onThemeChange: (themeId: string) => void;
  showPreviews?: boolean;
  categories?: ThemeCategory[];
  className?: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  themes,
  currentTheme,
  onThemeChange,
  showPreviews = true,
  categories,
  className = ''
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ThemeCategory | 'all'>('all');
  
  const filteredThemes = useMemo(() => {
    if (selectedCategory === 'all') return themes;
    return themes.filter(theme => theme.category === selectedCategory);
  }, [themes, selectedCategory]);

  const themeCategories = useMemo(() => {
    if (categories) return categories;
    const cats = [...new Set(themes.map(theme => theme.category))];
    return cats as ThemeCategory[];
  }, [themes, categories]);

  return (
    <div className={`theme-selector ${className}`}>
      {themeCategories.length > 1 && (
        <div className="theme-categories">
          <button
            type="button"
            className={selectedCategory === 'all' ? 'active' : ''}
            onClick={() => setSelectedCategory('all')}
          >
            All Themes
          </button>
          {themeCategories.map(category => (
            <button
              key={category}
              type="button"
              className={selectedCategory === category ? 'active' : ''}
              onClick={() => setSelectedCategory(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      )}
      
      <div className="theme-list">
        {filteredThemes.map(theme => (
          <div
            key={theme.id}
            className={`theme-card ${currentTheme === theme.id ? 'selected' : ''}`}
            onClick={() => onThemeChange(theme.id)}
          >
            {showPreviews && (
              <div className="theme-preview">
                <div 
                  className="preview-surface"
                  style={{ backgroundColor: theme.colors.surface?.background }}
                >
                  <div 
                    className="preview-primary"
                    style={{ backgroundColor: theme.colors.primary?.[500] }}
                  />
                  <div 
                    className="preview-secondary"
                    style={{ backgroundColor: theme.colors.secondary?.[500] }}
                  />
                  <div 
                    className="preview-accent"
                    style={{ backgroundColor: theme.colors.accent?.[500] }}
                  />
                </div>
              </div>
            )}
            
            <div className="theme-info">
              <h3 className="theme-name">{theme.name}</h3>
              <p className="theme-description">{theme.description}</p>
              <span className="theme-category">{theme.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Color palette display component
 */
export interface ThemePaletteProps {
  palette: ColorPalette;
  name: string;
  onColorClick?: (color: string, shade: string) => void;
  showShadeLabels?: boolean;
  className?: string;
}

export const ThemePalette: React.FC<ThemePaletteProps> = ({
  palette,
  name,
  onColorClick,
  showShadeLabels = true,
  className = ''
}) => {
  const handleColorClick = useCallback((shade: string, color: string) => {
    if (onColorClick) {
      onColorClick(color, shade);
    }
  }, [onColorClick]);

  return (
    <div className={`theme-palette ${className}`}>
      <h4 className="palette-name">{name}</h4>
      <div className="palette-colors">
        {Object.entries(palette).map(([shade, color]) => (
          <div
            key={shade}
            className="palette-color"
            onClick={() => handleColorClick(shade, color)}
            style={{
              backgroundColor: color,
              cursor: onColorClick ? 'pointer' : 'default'
            }}
            title={`${name}-${shade}: ${color}`}
          >
            {showShadeLabels && (
              <span 
                className="shade-label"
                style={{
                  color: ColorUtils.getContrastRatio(color, '#ffffff') > 
                         ColorUtils.getContrastRatio(color, '#000000') ? 
                         '#ffffff' : '#000000'
                }}
              >
                {shade}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Theme color overview component
 */
export interface ThemeColorsProps {
  theme: Theme;
  onColorEdit?: (path: string, color: string) => void;
  editable?: boolean;
  className?: string;
}

export const ThemeColors: React.FC<ThemeColorsProps> = ({
  theme,
  onColorEdit,
  editable = false,
  className = ''
}) => {
  const handleColorEdit = useCallback((path: string, color: string) => {
    if (onColorEdit) {
      onColorEdit(path, color);
    }
  }, [onColorEdit]);

  return (
    <div className={`theme-colors ${className}`}>
      <div className="color-section">
        <h3>Main Palettes</h3>
        
        {theme.colors.primary && (
          <ThemePalette
            palette={theme.colors.primary}
            name="Primary"
            onColorClick={editable ? (color, shade) => 
              handleColorEdit(`colors.primary.${shade}`, color) : undefined}
          />
        )}
        
        {theme.colors.secondary && (
          <ThemePalette
            palette={theme.colors.secondary}
            name="Secondary"
            onColorClick={editable ? (color, shade) => 
              handleColorEdit(`colors.secondary.${shade}`, color) : undefined}
          />
        )}
        
        {theme.colors.accent && (
          <ThemePalette
            palette={theme.colors.accent}
            name="Accent"
            onColorClick={editable ? (color, shade) => 
              handleColorEdit(`colors.accent.${shade}`, color) : undefined}
          />
        )}
        
        {theme.colors.neutral && (
          <ThemePalette
            palette={theme.colors.neutral}
            name="Neutral"
            onColorClick={editable ? (color, shade) => 
              handleColorEdit(`colors.neutral.${shade}`, color) : undefined}
          />
        )}
      </div>

      {theme.colors.semantic && (
        <div className="color-section">
          <h3>Semantic Colors</h3>
          <div className="semantic-colors">
            {theme.colors.semantic.text && (
              <div className="semantic-group">
                <h4>Text</h4>
                {Object.entries(theme.colors.semantic.text).map(([key, color]) => (
                  <div key={key} className="semantic-color">
                    <div 
                      className="color-swatch"
                      style={{ backgroundColor: color }}
                      onClick={editable ? () => 
                        handleColorEdit(`colors.semantic.text.${key}`, color) : undefined}
                    />
                    <span className="color-label">{key}</span>
                    <span className="color-value">{color}</span>
                  </div>
                ))}
              </div>
            )}
            
            {theme.colors.semantic.border && (
              <div className="semantic-group">
                <h4>Border</h4>
                {Object.entries(theme.colors.semantic.border).map(([key, color]) => (
                  <div key={key} className="semantic-color">
                    <div 
                      className="color-swatch"
                      style={{ backgroundColor: color }}
                      onClick={editable ? () => 
                        handleColorEdit(`colors.semantic.border.${key}`, color) : undefined}
                    />
                    <span className="color-label">{key}</span>
                    <span className="color-value">{color}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Typography preview component
 */
export interface TypographyPreviewProps {
  theme: Theme;
  className?: string;
}

export const TypographyPreview: React.FC<TypographyPreviewProps> = ({
  theme,
  className = ''
}) => {
  const typography = theme.typography;
  
  if (!typography) return null;

  return (
    <div className={`typography-preview ${className}`}>
      <h3>Typography System</h3>
      
      {typography.fonts && (
        <div className="font-families">
          <h4>Font Families</h4>
          {Object.entries(typography.fonts).map(([key, fontStack]) => (
            <div key={key} className="font-family">
              <span className="font-label">{key}:</span>
              <span 
                className="font-preview"
                style={{ fontFamily: fontStack }}
              >
                The quick brown fox jumps over the lazy dog
              </span>
            </div>
          ))}
        </div>
      )}
      
      {typography.sizes && (
        <div className="font-sizes">
          <h4>Font Sizes</h4>
          {Object.entries(typography.sizes).map(([key, size]) => (
            <div key={key} className="font-size">
              <span className="size-label">{key} ({size})</span>
              <div 
                className="size-preview"
                style={{ fontSize: size }}
              >
                Sample text in {key} size
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Theme preview component showing all aspects
 */
export interface ThemePreviewProps {
  theme: Theme;
  compact?: boolean;
  className?: string;
}

export const ThemePreview: React.FC<ThemePreviewProps> = ({
  theme,
  compact = false,
  className = ''
}) => {
  return (
    <div className={`theme-preview ${compact ? 'compact' : ''} ${className}`}>
      <div className="preview-surface" style={{
        backgroundColor: theme.colors.surface?.background,
        color: theme.colors.semantic?.text?.primary,
        padding: compact ? '12px' : '24px',
        borderRadius: '8px',
        border: `1px solid ${theme.colors.semantic?.border?.default}`
      }}>
        <h2 style={{ 
          color: theme.colors.primary?.[600],
          fontSize: theme.typography?.sizes?.lg
        }}>
          {theme.name}
        </h2>
        
        <p style={{ 
          color: theme.colors.semantic?.text?.secondary,
          fontSize: theme.typography?.sizes?.sm 
        }}>
          {theme.description}
        </p>
        
        <div className="preview-buttons" style={{ 
          display: 'flex', 
          gap: compact ? '8px' : '12px',
          marginTop: compact ? '12px' : '16px'
        }}>
          <button style={{
            backgroundColor: theme.colors.primary?.[500],
            color: '#ffffff',
            border: 'none',
            padding: compact ? '6px 12px' : '8px 16px',
            borderRadius: '6px',
            fontSize: theme.typography?.sizes?.sm
          }}>
            Primary
          </button>
          
          <button style={{
            backgroundColor: theme.colors.secondary?.[500],
            color: '#ffffff',
            border: 'none',
            padding: compact ? '6px 12px' : '8px 16px',
            borderRadius: '6px',
            fontSize: theme.typography?.sizes?.sm
          }}>
            Secondary
          </button>
          
          <button style={{
            backgroundColor: 'transparent',
            color: theme.colors.semantic?.text?.primary,
            border: `1px solid ${theme.colors.semantic?.border?.default}`,
            padding: compact ? '6px 12px' : '8px 16px',
            borderRadius: '6px',
            fontSize: theme.typography?.sizes?.sm
          }}>
            Outline
          </button>
        </div>
        
        {!compact && (
          <div className="preview-card" style={{
            backgroundColor: theme.colors.surface?.card,
            border: `1px solid ${theme.colors.semantic?.border?.default}`,
            borderRadius: '8px',
            padding: '16px',
            marginTop: '16px'
          }}>
            <h4 style={{ color: theme.colors.semantic?.text?.primary }}>
              Card Component
            </h4>
            <p style={{ color: theme.colors.semantic?.text?.secondary }}>
              This is a preview of how cards would look in this theme.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}; 
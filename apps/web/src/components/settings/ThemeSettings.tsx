// apps/web/src/components/settings/ThemeSettings.tsx
// Comprehensive theme settings with custom color schemes and font selection

'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { configService } from '@/services/configService';
import { useMonitoring } from '@/components/providers/MonitoringProvider';
import { 
  Palette, 
  Monitor, 
  Sun, 
  Moon, 
  Type, 
  Sliders,
  Check,
  RotateCcw,
  Download,
  Upload,
  Eye,
  Contrast
} from 'lucide-react';

// Define available color schemes
const COLOR_SCHEMES = {
  default: {
    name: 'Default',
    primary: '#3b82f6',
    secondary: '#6b7280',
    accent: '#8b5cf6',
    description: 'Classic blue theme'
  },
  emerald: {
    name: 'Emerald',
    primary: '#10b981',
    secondary: '#6b7280',
    accent: '#06b6d4',
    description: 'Fresh green theme'
  },
  rose: {
    name: 'Rose',
    primary: '#f43f5e',
    secondary: '#6b7280',
    accent: '#ec4899',
    description: 'Elegant pink theme'
  },
  amber: {
    name: 'Amber',
    primary: '#f59e0b',
    secondary: '#6b7280',
    accent: '#eab308',
    description: 'Warm orange theme'
  },
  violet: {
    name: 'Violet',
    primary: '#8b5cf6',
    secondary: '#6b7280',
    accent: '#a855f7',
    description: 'Deep purple theme'
  },
  slate: {
    name: 'Slate',
    primary: '#64748b',
    secondary: '#94a3b8',
    accent: '#475569',
    description: 'Neutral gray theme'
  }
};

// Available fonts
const FONT_OPTIONS = [
  { value: 'inter', name: 'Inter', description: 'Modern sans-serif' },
  { value: 'system', name: 'System', description: 'System default' },
  { value: 'mono', name: 'JetBrains Mono', description: 'Monospace coding font' },
  { value: 'roboto', name: 'Roboto', description: 'Google Roboto' },
  { value: 'opensans', name: 'Open Sans', description: 'Friendly sans-serif' }
];

// Border radius options
const BORDER_RADIUS_OPTIONS = [
  { value: 'none', name: 'Sharp', description: 'No rounded corners' },
  { value: 'sm', name: 'Small', description: 'Slightly rounded' },
  { value: 'md', name: 'Medium', description: 'Moderately rounded' },
  { value: 'lg', name: 'Large', description: 'Very rounded' },
  { value: 'full', name: 'Pill', description: 'Fully rounded' }
];

// Density options
const DENSITY_OPTIONS = [
  { value: 'compact', name: 'Compact', description: 'Tight spacing' },
  { value: 'comfortable', name: 'Comfortable', description: 'Balanced spacing' },
  { value: 'spacious', name: 'Spacious', description: 'Loose spacing' }
];

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  const { captureMessage, captureError } = useMonitoring();
  
  // Local state for theme configuration
  const [themeConfig, setThemeConfig] = useState(() => configService.getThemeConfig());
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Load theme config on mount
  useEffect(() => {
    const config = configService.getThemeConfig();
    setThemeConfig(config);
  }, []);

  // Track changes
  useEffect(() => {
    const currentConfig = configService.getThemeConfig();
    const hasChanged = JSON.stringify(themeConfig) !== JSON.stringify(currentConfig);
    setHasChanges(hasChanged);
  }, [themeConfig]);

  const handleModeChange = (newMode: 'light' | 'dark' | 'system') => {
    setThemeConfig(prev => ({ ...prev, mode: newMode }));
    
    // Apply theme immediately for light/dark
    if (newMode !== 'system') {
      setTheme(newMode);
    } else {
      // For system, detect preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  };

  const handleColorSchemeChange = (schemeKey: string) => {
    const scheme = COLOR_SCHEMES[schemeKey as keyof typeof COLOR_SCHEMES];
    if (scheme) {
      setThemeConfig(prev => ({
        ...prev,
        primaryColor: scheme.primary,
        accentColor: scheme.accent
      }));
    }
  };

  const handleCustomColorChange = (colorType: 'primaryColor' | 'accentColor', color: string) => {
    setThemeConfig(prev => ({ ...prev, [colorType]: color }));
  };

  const handleFontChange = (fontFamily: string) => {
    setThemeConfig(prev => ({ ...prev, fontFamily: fontFamily as any }));
  };

  const handleBorderRadiusChange = (borderRadius: string) => {
    setThemeConfig(prev => ({ ...prev, borderRadius: borderRadius as any }));
  };

  const handleDensityChange = (density: string) => {
    setThemeConfig(prev => ({ ...prev, density: density as any }));
  };

  const saveChanges = async () => {
    try {
      setIsLoading(true);
      
      // Update config service
      configService.updateThemeConfig(themeConfig);
      
      // Apply theme changes to CSS variables
      applyThemeToCSS(themeConfig);
      
      captureMessage('Theme settings saved successfully', 'info', {
        component: 'ThemeSettings',
        mode: themeConfig.mode,
        primaryColor: themeConfig.primaryColor
      });
      
      setHasChanges(false);
    } catch (error) {
      captureError(error instanceof Error ? error : new Error('Failed to save theme'), {
        component: 'ThemeSettings',
        operation: 'saveChanges'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetToDefaults = () => {
    const defaultConfig = {
      mode: 'dark' as const,
      primaryColor: '#3b82f6',
      accentColor: '#8b5cf6',
      borderRadius: 'md' as const,
      density: 'comfortable' as const,
      fontFamily: 'inter' as const
    };
    
    setThemeConfig(defaultConfig);
    setTheme('dark');
  };

  const exportTheme = () => {
    const themeData = {
      name: 'Custom Theme',
      config: themeConfig,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(themeData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'omnipanel-theme.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const themeData = JSON.parse(e.target?.result as string);
        if (themeData.config) {
          setThemeConfig(themeData.config);
          captureMessage('Theme imported successfully', 'info');
        }
      } catch (error) {
        captureError(new Error('Invalid theme file'), {
          component: 'ThemeSettings',
          operation: 'importTheme'
        });
      }
    };
    reader.readAsText(file);
  };

  const applyThemeToCSS = (config: typeof themeConfig) => {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    root.style.setProperty('--primary-color', config.primaryColor);
    root.style.setProperty('--accent-color', config.accentColor);
    
    // Apply font family
    root.style.setProperty('--font-family', getFontFamily(config.fontFamily));
    
    // Apply border radius
    root.style.setProperty('--border-radius', getBorderRadiusValue(config.borderRadius));
    
    // Apply density spacing
    root.style.setProperty('--spacing-scale', getDensityScale(config.density));
  };

  const getFontFamily = (font: string) => {
    const fontMap = {
      inter: '"Inter", sans-serif',
      system: 'system-ui, -apple-system, sans-serif',
      mono: '"JetBrains Mono", monospace',
      roboto: '"Roboto", sans-serif',
      opensans: '"Open Sans", sans-serif'
    };
    return fontMap[font as keyof typeof fontMap] || fontMap.inter;
  };

  const getBorderRadiusValue = (radius: string) => {
    const radiusMap = {
      none: '0px',
      sm: '0.25rem',
      md: '0.5rem',
      lg: '1rem',
      full: '9999px'
    };
    return radiusMap[radius as keyof typeof radiusMap] || radiusMap.md;
  };

  const getDensityScale = (density: string) => {
    const scaleMap = {
      compact: '0.8',
      comfortable: '1',
      spacious: '1.2'
    };
    return scaleMap[density as keyof typeof scaleMap] || scaleMap.comfortable;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Palette className="w-6 h-6" />
            Theme Settings
          </h2>
          <p className="text-muted-foreground mt-1">
            Customize the appearance and feel of your workspace
          </p>
        </div>
        
        {hasChanges && (
          <div className="flex items-center gap-2">
            <button
              onClick={resetToDefaults}
              className="px-3 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={saveChanges}
              disabled={isLoading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Theme Mode */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Monitor className="w-5 h-5" />
          Theme Mode
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'light', icon: Sun, label: 'Light', description: 'Light theme' },
            { value: 'dark', icon: Moon, label: 'Dark', description: 'Dark theme' },
            { value: 'system', icon: Monitor, label: 'System', description: 'Follow system' }
          ].map(({ value, icon: Icon, label, description }) => (
            <button
              key={value}
              onClick={() => handleModeChange(value as any)}
              className={`p-4 border rounded-lg text-left transition-colors ${
                themeConfig.mode === value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:bg-muted'
              }`}
            >
              <Icon className="w-5 h-5 mb-2" />
              <div className="font-medium">{label}</div>
              <div className="text-sm text-muted-foreground">{description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Color Schemes */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Color Scheme
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(COLOR_SCHEMES).map(([key, scheme]) => (
            <button
              key={key}
              onClick={() => handleColorSchemeChange(key)}
              className={`p-4 border rounded-lg text-left transition-colors ${
                themeConfig.primaryColor === scheme.primary
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:bg-muted'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: scheme.primary }}
                />
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: scheme.accent }}
                />
              </div>
              <div className="font-medium">{scheme.name}</div>
              <div className="text-sm text-muted-foreground">{scheme.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Colors */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Custom Colors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Primary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={themeConfig.primaryColor}
                onChange={(e) => handleCustomColorChange('primaryColor', e.target.value)}
                className="w-12 h-10 border border-border rounded cursor-pointer"
              />
              <input
                type="text"
                value={themeConfig.primaryColor}
                onChange={(e) => handleCustomColorChange('primaryColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-border rounded-md bg-background"
                placeholder="#3b82f6"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Accent Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={themeConfig.accentColor}
                onChange={(e) => handleCustomColorChange('accentColor', e.target.value)}
                className="w-12 h-10 border border-border rounded cursor-pointer"
              />
              <input
                type="text"
                value={themeConfig.accentColor}
                onChange={(e) => handleCustomColorChange('accentColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-border rounded-md bg-background"
                placeholder="#8b5cf6"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Type className="w-5 h-5" />
          Typography
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {FONT_OPTIONS.map((font) => (
            <button
              key={font.value}
              onClick={() => handleFontChange(font.value)}
              className={`p-3 border rounded-lg text-left transition-colors ${
                themeConfig.fontFamily === font.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:bg-muted'
              }`}
            >
              <div className="font-medium" style={{ fontFamily: getFontFamily(font.value) }}>
                {font.name}
              </div>
              <div className="text-sm text-muted-foreground">{font.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Interface Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Border Radius */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Border Radius</h3>
          <div className="space-y-2">
            {BORDER_RADIUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleBorderRadiusChange(option.value)}
                className={`w-full p-3 border rounded-lg text-left transition-colors ${
                  themeConfig.borderRadius === option.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:bg-muted'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{option.name}</div>
                    <div className="text-sm text-muted-foreground">{option.description}</div>
                  </div>
                  <div 
                    className="w-6 h-6 bg-primary/20 border border-primary/40"
                    style={{ borderRadius: getBorderRadiusValue(option.value) }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Density */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Interface Density</h3>
          <div className="space-y-2">
            {DENSITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleDensityChange(option.value)}
                className={`w-full p-3 border rounded-lg text-left transition-colors ${
                  themeConfig.density === option.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:bg-muted'
                }`}
              >
                <div className="font-medium">{option.name}</div>
                <div className="text-sm text-muted-foreground">{option.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Import/Export */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Theme Management</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={exportTheme}
            className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Theme
          </button>
          <label className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            Import Theme
            <input
              type="file"
              accept=".json"
              onChange={importTheme}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Preview
        </h3>
        <div className="p-6 border border-border rounded-lg bg-card">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold">Sample Interface</h4>
              <button className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm">
                Primary Button
              </button>
            </div>
            <p className="text-muted-foreground">
              This is how your interface will look with the current theme settings.
            </p>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary rounded" />
              <span className="text-sm">Primary color</span>
              <div className="w-4 h-4 bg-accent rounded ml-4" />
              <span className="text-sm">Accent color</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
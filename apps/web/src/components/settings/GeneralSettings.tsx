// apps/web/src/components/settings/GeneralSettings.tsx
// Enhanced general settings with font selection, language, timezone, and interface preferences

'use client';

import React, { useState, useEffect } from 'react';
import { configService } from '@/services/configService';
import { useMonitoring } from '@/components/providers/MonitoringProvider';
import { 
  Settings, 
  Globe, 
  Clock, 
  Type, 
  Monitor, 
  Palette,
  Save,
  RotateCcw,
  Check,
  AlertCircle,
  Info
} from 'lucide-react';

// Available languages for i18n preparation
const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' }
];

// Font options with detailed information
const FONT_OPTIONS = [
  { 
    value: 'inter', 
    name: 'Inter', 
    description: 'Modern sans-serif optimized for UI',
    preview: 'The quick brown fox jumps over the lazy dog',
    category: 'Sans-serif'
  },
  { 
    value: 'system', 
    name: 'System Default', 
    description: 'Use your operating system\'s default font',
    preview: 'The quick brown fox jumps over the lazy dog',
    category: 'System'
  },
  { 
    value: 'mono', 
    name: 'JetBrains Mono', 
    description: 'Monospace font designed for developers',
    preview: 'const hello = "world"; // Code example',
    category: 'Monospace'
  },
  { 
    value: 'roboto', 
    name: 'Roboto', 
    description: 'Google\'s signature font family',
    preview: 'The quick brown fox jumps over the lazy dog',
    category: 'Sans-serif'
  },
  { 
    value: 'opensans', 
    name: 'Open Sans', 
    description: 'Friendly and readable humanist font',
    preview: 'The quick brown fox jumps over the lazy dog',
    category: 'Sans-serif'
  }
];

// Font size options
const FONT_SIZE_OPTIONS = [
  { value: 'xs', name: 'Extra Small', size: '12px', description: 'Compact interface' },
  { value: 'sm', name: 'Small', size: '14px', description: 'Smaller text' },
  { value: 'base', name: 'Medium', size: '16px', description: 'Default size' },
  { value: 'lg', name: 'Large', size: '18px', description: 'Larger text' },
  { value: 'xl', name: 'Extra Large', size: '20px', description: 'Maximum readability' }
];

// Date format options
const DATE_FORMAT_OPTIONS = [
  { value: 'YYYY-MM-DD', name: 'ISO 8601', example: '2024-01-15' },
  { value: 'MM/DD/YYYY', name: 'US Format', example: '01/15/2024' },
  { value: 'DD/MM/YYYY', name: 'European Format', example: '15/01/2024' },
  { value: 'DD.MM.YYYY', name: 'German Format', example: '15.01.2024' },
  { value: 'YYYY年MM月DD日', name: 'Japanese Format', example: '2024年01月15日' }
];

// Get available timezones - using predefined list for better compatibility
const getTimezones = () => {
  // Common timezones grouped by region for better UX
  const timezoneGroups: Record<string, string[]> = {
    America: [
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'America/Toronto',
      'America/Vancouver',
      'America/Mexico_City',
      'America/Sao_Paulo',
      'America/Buenos_Aires'
    ],
    Europe: [
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Europe/Rome',
      'Europe/Madrid',
      'Europe/Amsterdam',
      'Europe/Stockholm',
      'Europe/Moscow',
      'Europe/Istanbul'
    ],
    Asia: [
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Asia/Hong_Kong',
      'Asia/Singapore',
      'Asia/Seoul',
      'Asia/Mumbai',
      'Asia/Dubai',
      'Asia/Bangkok',
      'Asia/Jakarta'
    ],
    Australia: [
      'Australia/Sydney',
      'Australia/Melbourne',
      'Australia/Brisbane',
      'Australia/Perth',
      'Australia/Adelaide'
    ],
    Africa: [
      'Africa/Cairo',
      'Africa/Lagos',
      'Africa/Johannesburg',
      'Africa/Casablanca'
    ],
    Pacific: [
      'Pacific/Auckland',
      'Pacific/Honolulu',
      'Pacific/Fiji'
    ]
  };
  
  return timezoneGroups;
};

export function GeneralSettings() {
  const { captureMessage, captureError } = useMonitoring();
  
  // Local state for general configuration
  const [generalConfig, setGeneralConfig] = useState(() => configService.getGeneralConfig());
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [timezones] = useState(() => getTimezones());
  const [selectedTimezoneRegion, setSelectedTimezoneRegion] = useState(() => {
    const [region] = generalConfig.timezone.split('/');
    return region;
  });

  // Track changes
  useEffect(() => {
    const currentConfig = configService.getGeneralConfig();
    const hasChanged = JSON.stringify(generalConfig) !== JSON.stringify(currentConfig);
    setHasChanges(hasChanged);
  }, [generalConfig]);

  const handleLanguageChange = (language: string) => {
    setGeneralConfig(prev => ({ ...prev, language }));
  };

  const handleTimezoneChange = (timezone: string) => {
    setGeneralConfig(prev => ({ ...prev, timezone }));
  };

  const handleDateFormatChange = (dateFormat: string) => {
    setGeneralConfig(prev => ({ ...prev, dateFormat }));
  };

  const handleFontSizeChange = (fontSize: 'xs' | 'sm' | 'base' | 'lg' | 'xl') => {
    setGeneralConfig(prev => ({ ...prev, fontSize }));
    
    // Apply font size immediately for preview
    document.documentElement.style.setProperty('--font-size-base', 
      FONT_SIZE_OPTIONS.find(opt => opt.value === fontSize)?.size || '16px'
    );
  };

  const handleFontFamilyChange = (fontFamily: 'inter' | 'system' | 'mono') => {
    setGeneralConfig(prev => ({ ...prev, fontFamily }));
    
    // Apply font family immediately for preview
    const fontMap = {
      inter: '"Inter", sans-serif',
      system: 'system-ui, -apple-system, sans-serif',
      mono: '"JetBrains Mono", monospace'
    };
    
    document.documentElement.style.setProperty('--font-family-base', 
      fontMap[fontFamily] || fontMap.inter
    );
  };

  const saveChanges = async () => {
    try {
      setIsLoading(true);
      
      // Update config service
      configService.updateGeneralConfig(generalConfig);
      
      // Apply changes to document
      applySettingsToDocument(generalConfig);
      
      captureMessage('General settings saved successfully', 'info', {
        component: 'GeneralSettings',
        language: generalConfig.language,
        timezone: generalConfig.timezone,
        fontSize: generalConfig.fontSize,
        fontFamily: generalConfig.fontFamily
      });
      
      setHasChanges(false);
    } catch (error) {
      captureError(error instanceof Error ? error : new Error('Failed to save general settings'), {
        component: 'GeneralSettings',
        operation: 'saveChanges'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetToDefaults = () => {
    const defaultConfig = {
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      dateFormat: 'YYYY-MM-DD',
      fontSize: 'base' as const,
      fontFamily: 'inter' as const
    };
    
    setGeneralConfig(defaultConfig);
    applySettingsToDocument(defaultConfig);
    
    const [region] = defaultConfig.timezone.split('/');
    setSelectedTimezoneRegion(region);
  };

  const applySettingsToDocument = (config: typeof generalConfig) => {
    const root = document.documentElement;
    
    // Apply font size
    const fontSize = FONT_SIZE_OPTIONS.find(opt => opt.value === config.fontSize)?.size || '16px';
    root.style.setProperty('--font-size-base', fontSize);
    
    // Apply font family
    const fontMap = {
      inter: '"Inter", sans-serif',
      system: 'system-ui, -apple-system, sans-serif',
      mono: '"JetBrains Mono", monospace'
    };
    root.style.setProperty('--font-family-base', fontMap[config.fontFamily] || fontMap.inter);
    
    // Set language attribute
    document.documentElement.lang = config.language;
  };

  const formatExampleDate = (format: string) => {
    const now = new Date();
    try {
      // Simple format replacement for preview
      return format
        .replace('YYYY', now.getFullYear().toString())
        .replace('MM', (now.getMonth() + 1).toString().padStart(2, '0'))
        .replace('DD', now.getDate().toString().padStart(2, '0'))
        .replace('年', '年')
        .replace('月', '月')
        .replace('日', '日');
    } catch {
      return format;
    }
  };

  const getCurrentTime = () => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: generalConfig.timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    }).format(new Date());
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            General Settings
          </h2>
          <p className="text-muted-foreground mt-1">
            Configure language, timezone, fonts, and interface preferences
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
              <Save className="w-4 h-4" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Language Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Language & Region
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-medium">Interface Language</label>
            <select
              value={generalConfig.language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Choose your preferred language for the interface
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Date Format</label>
            <select
              value={generalConfig.dateFormat}
              onChange={(e) => handleDateFormatChange(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
            >
              {DATE_FORMAT_OPTIONS.map((format) => (
                <option key={format.value} value={format.value}>
                  {format.name} - {format.example}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Preview: {formatExampleDate(generalConfig.dateFormat)}
            </p>
          </div>
        </div>
      </div>

      {/* Timezone Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Timezone
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-medium">Region</label>
            <select
              value={selectedTimezoneRegion}
              onChange={(e) => setSelectedTimezoneRegion(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
            >
              {Object.keys(timezones).sort().map((region) => (
                <option key={region} value={region}>
                  {region.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">City/Area</label>
            <select
              value={generalConfig.timezone}
              onChange={(e) => handleTimezoneChange(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
            >
              {timezones[selectedTimezoneRegion]?.map((tz: string) => (
                <option key={tz} value={tz}>
                  {tz.split('/')[1]?.replace('_', ' ') || tz}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4" />
            <span className="font-medium">Current time:</span>
            <span className="font-mono">{getCurrentTime()}</span>
          </div>
        </div>
      </div>

      {/* Typography Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Type className="w-5 h-5" />
          Typography
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Font Family */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Font Family</label>
            <div className="space-y-2">
              {FONT_OPTIONS.map((font) => (
                <button
                  key={font.value}
                  onClick={() => handleFontFamilyChange(font.value as any)}
                  className={`w-full p-4 border rounded-lg text-left transition-colors ${
                    generalConfig.fontFamily === font.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium">{font.name}</div>
                      <div className="text-sm text-muted-foreground">{font.category}</div>
                    </div>
                    {generalConfig.fontFamily === font.value && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {font.description}
                  </div>
                  <div 
                    className="text-sm p-2 bg-muted/50 rounded font-preview"
                    style={{ 
                      fontFamily: font.value === 'inter' ? '"Inter", sans-serif' :
                                 font.value === 'system' ? 'system-ui, -apple-system, sans-serif' :
                                 font.value === 'mono' ? '"JetBrains Mono", monospace' :
                                 font.value === 'roboto' ? '"Roboto", sans-serif' :
                                 font.value === 'opensans' ? '"Open Sans", sans-serif' : 'inherit'
                    }}
                  >
                    {font.preview}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Font Size</label>
            <div className="space-y-2">
              {FONT_SIZE_OPTIONS.map((size) => (
                <button
                  key={size.value}
                  onClick={() => handleFontSizeChange(size.value as any)}
                  className={`w-full p-3 border rounded-lg text-left transition-colors ${
                    generalConfig.fontSize === size.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{size.name}</div>
                      <div className="text-sm text-muted-foreground">{size.description}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{size.size}</span>
                      {generalConfig.fontSize === size.value && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Monitor className="w-5 h-5" />
          Preview
        </h3>
        
        <div className="p-6 border border-border rounded-lg bg-card">
          <div className="space-y-4">
            <h4 className="text-xl font-semibold">Sample Interface</h4>
            <p className="text-muted-foreground">
              This is how text will appear with your current settings. The interface will use 
              the {FONT_OPTIONS.find(f => f.value === generalConfig.fontFamily)?.name} font 
              at {FONT_SIZE_OPTIONS.find(s => s.value === generalConfig.fontSize)?.name.toLowerCase()} size.
            </p>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded">
                Primary Button
              </button>
              <button className="px-4 py-2 border border-border rounded">
                Secondary Button
              </button>
            </div>
            <div className="text-sm text-muted-foreground">
              Sample date: {formatExampleDate(generalConfig.dateFormat)} • 
              Time: {getCurrentTime()}
            </div>
          </div>
        </div>
      </div>

      {/* Information */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="font-medium mb-2">About Language Support</h4>
            <p className="text-sm text-muted-foreground">
              Language selection prepares the interface for internationalization. 
              Full translations will be available in future updates. Currently, 
              the interface remains in English with localized date and time formatting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 
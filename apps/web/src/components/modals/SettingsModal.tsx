import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  User, 
  Palette, 
  Keyboard, 
  Monitor, 
  Save,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Moon,
  Sun,
  Laptop
} from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspace';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, setTheme } = useWorkspaceStore();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      autoSave: true,
      autoComplete: true,
      fontSize: 14,
      wordWrap: true,
      lineNumbers: true,
      minimap: true,
    },
    ai: {
      defaultModel: 'gpt-4o',
      provider: 'openai',
      temperature: 0.7,
      maxTokens: 2048,
      enableCodeCompletion: true,
      enableChat: true,
    },
    interface: {
      theme: theme,
      sidebarPosition: 'left',
      showFileTree: true,
      showTerminal: false,
      terminalHeight: 200,
      enableAnimations: true,
    },
    keyboard: {
      scheme: 'vscode',
      customShortcuts: {},
    },
    privacy: {
      telemetry: false,
      crashReports: true,
      usageAnalytics: false,
    },
    openai: {
      enabled: false,
      apiKey: '',
      baseUrl: 'https://api.openai.com/v1',
      defaultModel: 'gpt-4o',
      timeout: 30000,
    },
  });

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'interface', label: 'Interface', icon: Monitor },
    { id: 'ai', label: 'AI & Models', icon: RefreshCw },
    { id: 'keyboard', label: 'Keyboard', icon: Keyboard },
    { id: 'privacy', label: 'Privacy', icon: User },
    { id: 'themes', label: 'Themes', icon: Palette },
  ];

  const handleSave = () => {
    // Apply settings
    setTheme(settings.interface.theme);
    
    // Show success message
    console.log('Settings saved successfully');
    onClose();
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      // Reset to defaults
      setSettings({
        general: {
          autoSave: true,
          autoComplete: true,
          fontSize: 14,
          wordWrap: true,
          lineNumbers: true,
          minimap: true,
        },
        ai: {
          defaultModel: 'gpt-4o',
          provider: 'openai',
          temperature: 0.7,
          maxTokens: 2048,
          enableCodeCompletion: true,
          enableChat: true,
        },
        interface: {
          theme: 'dark',
          sidebarPosition: 'left',
          showFileTree: true,
          showTerminal: false,
          terminalHeight: 200,
          enableAnimations: true,
        },
        keyboard: {
          scheme: 'vscode',
          customShortcuts: {},
        },
        privacy: {
          telemetry: false,
          crashReports: true,
          usageAnalytics: false,
        },
        openai: {
          enabled: false,
          apiKey: '',
          baseUrl: 'https://api.openai.com/v1',
          defaultModel: 'gpt-4o',
          timeout: 30000,
        },
      });
    }
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'omnipanel-settings.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          setSettings(importedSettings);
          console.log('Settings imported successfully');
        } catch (error) {
          console.error('Failed to import settings:', error);
          alert('Failed to import settings. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex h-[600px]">
          {/* Sidebar */}
          <div className="w-64 bg-accent/30 border-r border-border p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">General Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Auto Save</label>
                      <p className="text-xs text-muted-foreground">Automatically save changes</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.general.autoSave}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        general: { ...prev.general, autoSave: e.target.checked }
                      }))}
                      className="rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Auto Complete</label>
                      <p className="text-xs text-muted-foreground">Enable code auto-completion</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.general.autoComplete}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        general: { ...prev.general, autoComplete: e.target.checked }
                      }))}
                      className="rounded"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Font Size</label>
                    <input
                      type="range"
                      min="10"
                      max="24"
                      value={settings.general.fontSize}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        general: { ...prev.general, fontSize: parseInt(e.target.value) }
                      }))}
                      className="w-full mt-2"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {settings.general.fontSize}px
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'interface' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Interface Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-2">Theme</label>
                    <div className="flex gap-2">
                      {[
                        { value: 'light', label: 'Light', icon: Sun },
                        { value: 'dark', label: 'Dark', icon: Moon },
                        { value: 'system', label: 'System', icon: Laptop },
                      ].map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={() => {
                            setSettings(prev => ({
                              ...prev,
                              interface: { ...prev.interface, theme: value as any }
                            }));
                            setTheme(value as any);
                          }}
                          className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${
                            settings.interface.theme === value
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:bg-accent'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Show File Tree</label>
                      <p className="text-xs text-muted-foreground">Display file explorer</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.interface.showFileTree}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        interface: { ...prev.interface, showFileTree: e.target.checked }
                      }))}
                      className="rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Enable Animations</label>
                      <p className="text-xs text-muted-foreground">Enable UI animations</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.interface.enableAnimations}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        interface: { ...prev.interface, enableAnimations: e.target.checked }
                      }))}
                      className="rounded"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">AI & Models</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-2">Default Model</label>
                    <select
                      value={settings.ai.defaultModel}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        ai: { ...prev.ai, defaultModel: e.target.value }
                      }))}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md"
                    >
                      <option value="gpt-4o">GPT-4o</option>
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-4-turbo">GPT-4 Turbo</option>
                      <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                      <option value="llama-2-70b">Llama 2 70B</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">Temperature</label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={settings.ai.temperature}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        ai: { ...prev.ai, temperature: parseFloat(e.target.value) }
                      }))}
                      className="w-full"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {settings.ai.temperature} (creativity level)
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">Max Tokens</label>
                    <input
                      type="number"
                      min="100"
                      max="8192"
                      value={settings.ai.maxTokens}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        ai: { ...prev.ai, maxTokens: parseInt(e.target.value) }
                      }))}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'themes' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Themes</h3>
                <p className="text-muted-foreground">Customize the appearance of OmniPanel</p>
                
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: 'Dark Pro', preview: 'bg-gray-900', active: theme === 'dark' },
                    { name: 'Light Clean', preview: 'bg-gray-50', active: theme === 'light' },
                    { name: 'Midnight Blue', preview: 'bg-blue-900', active: false },
                    { name: 'Forest Green', preview: 'bg-green-800', active: false },
                  ].map((theme) => (
                    <div
                      key={theme.name}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        theme.active
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className={`w-full h-20 rounded ${theme.preview} mb-2`} />
                      <h4 className="font-medium">{theme.name}</h4>
                      {theme.active && (
                        <span className="text-xs text-primary">Current</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportSettings}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <label className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={handleImportSettings}
                className="hidden"
              />
            </label>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors text-red-600"
            >
              <Trash2 className="w-4 h-4" />
              Reset
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm hover:bg-accent rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
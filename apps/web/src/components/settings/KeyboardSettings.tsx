// apps/web/src/components/settings/KeyboardSettings.tsx
// Comprehensive keyboard shortcuts settings with customization and conflict detection

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  DEFAULT_SHORTCUTS, 
  SHORTCUT_CATEGORIES,
  getShortcutsByCategory,
  formatShortcutKeys,
  isShortcutConflict,
  type KeyboardShortcut,
  type ShortcutCategoryType 
} from '@/data/keyboardShortcuts';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useMonitoring } from '@/components/providers/MonitoringProvider';
import { 
  Keyboard, 
  Search, 
  RotateCcw, 
  AlertTriangle, 
  Check, 
  X,
  Edit3,
  Filter,
  Download,
  Upload,
  Settings,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface KeyCaptureModalProps {
  isOpen: boolean;
  shortcut: KeyboardShortcut | null;
  onClose: () => void;
  onSave: (keys: string[]) => void;
}

function KeyCaptureModal({ isOpen, shortcut, onClose, onSave }: KeyCaptureModalProps) {
  const [capturedKeys, setCapturedKeys] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [conflicts, setConflicts] = useState<KeyboardShortcut[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setCapturedKeys([]);
      setIsCapturing(false);
      setConflicts([]);
    }
  }, [isOpen]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isCapturing) return;

    event.preventDefault();
    event.stopPropagation();

    const modifiers = [];
    if (event.ctrlKey) modifiers.push('Ctrl');
    if (event.metaKey) modifiers.push('Cmd');
    if (event.altKey) modifiers.push('Alt');
    if (event.shiftKey) modifiers.push('Shift');

    const key = event.key === ' ' ? 'Space' : event.key;
    const keyCombo = [...modifiers, key].join('+');
    
    setCapturedKeys([keyCombo]);
    setIsCapturing(false);

    // Check for conflicts
    const conflictingShortcuts = DEFAULT_SHORTCUTS.filter(s => 
      s.id !== shortcut?.id && isShortcutConflict(
        { ...shortcut!, keys: [keyCombo] },
        s
      )
    );
    setConflicts(conflictingShortcuts);
  }, [isCapturing, shortcut]);

  useEffect(() => {
    if (isCapturing) {
      document.addEventListener('keydown', handleKeyDown, true);
      return () => document.removeEventListener('keydown', handleKeyDown, true);
    }
  }, [isCapturing, handleKeyDown]);

  const startCapture = () => {
    setCapturedKeys([]);
    setConflicts([]);
    setIsCapturing(true);
  };

  const handleSave = () => {
    if (capturedKeys.length > 0) {
      onSave(capturedKeys);
      onClose();
    }
  };

  if (!isOpen || !shortcut) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          Customize Shortcut: {shortcut.name}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Current Shortcut</label>
            <div className="px-3 py-2 bg-muted rounded border text-sm">
              {formatShortcutKeys(shortcut.keys)}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">New Shortcut</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 bg-muted rounded border text-sm min-h-[40px] flex items-center">
                {capturedKeys.length > 0 ? (
                  <span className="font-mono">{capturedKeys[0]}</span>
                ) : (
                  <span className="text-muted-foreground">
                    {isCapturing ? 'Press keys...' : 'Click capture to set'}
                  </span>
                )}
              </div>
              <button
                onClick={startCapture}
                disabled={isCapturing}
                className="px-3 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
              >
                {isCapturing ? 'Capturing...' : 'Capture'}
              </button>
            </div>
          </div>

          {conflicts.length > 0 && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Conflicts Detected</span>
              </div>
              <div className="text-sm text-amber-600 dark:text-amber-400">
                This shortcut conflicts with:
                <ul className="mt-1 space-y-1">
                  {conflicts.map(conflict => (
                    <li key={conflict.id} className="ml-4">
                      • {conflict.name} ({SHORTCUT_CATEGORIES[conflict.category].name})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-border rounded hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={capturedKeys.length === 0}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function KeyboardSettings() {
  const { 
    getShortcutKeys, 
    updateShortcut, 
    resetShortcut, 
    resetAllShortcuts,
    enabled 
  } = useKeyboardShortcuts();
  const { captureMessage } = useMonitoring();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ShortcutCategoryType | 'all'>('all');
  const [showCustomOnly, setShowCustomOnly] = useState(false);
  const [editingShortcut, setEditingShortcut] = useState<KeyboardShortcut | null>(null);
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>(DEFAULT_SHORTCUTS);

  // Update shortcuts when they change
  useEffect(() => {
    const updatedShortcuts = DEFAULT_SHORTCUTS.map(shortcut => ({
      ...shortcut,
      keys: getShortcutKeys(shortcut.id)
    }));
    setShortcuts(updatedShortcuts);
  }, [getShortcutKeys]);

  // Filter shortcuts based on search and category
  const filteredShortcuts = shortcuts.filter(shortcut => {
    const matchesSearch = searchQuery === '' || 
      shortcut.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shortcut.keys.some(key => key.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || shortcut.category === selectedCategory;

    const matchesCustomFilter = !showCustomOnly || 
      JSON.stringify(shortcut.keys) !== JSON.stringify(shortcut.defaultKeys);

    return matchesSearch && matchesCategory && matchesCustomFilter;
  });

  // Group shortcuts by category
  const groupedShortcuts = filteredShortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<ShortcutCategoryType, KeyboardShortcut[]>);

  const handleEditShortcut = (shortcut: KeyboardShortcut) => {
    if (!shortcut.customizable) return;
    setEditingShortcut(shortcut);
  };

  const handleSaveShortcut = (keys: string[]) => {
    if (editingShortcut) {
      updateShortcut(editingShortcut.id, keys);
      captureMessage('Keyboard shortcut updated', 'info', {
        shortcutId: editingShortcut.id,
        newKeys: keys.join(', ')
      });
    }
  };

  const handleResetShortcut = (shortcut: KeyboardShortcut) => {
    resetShortcut(shortcut.id);
    captureMessage('Keyboard shortcut reset', 'info', {
      shortcutId: shortcut.id
    });
  };

  const handleResetAll = () => {
    if (confirm('Are you sure you want to reset all keyboard shortcuts to their defaults?')) {
      resetAllShortcuts();
      captureMessage('All keyboard shortcuts reset', 'info');
    }
  };

  const exportShortcuts = () => {
    const exportData = {
      shortcuts: shortcuts.reduce((acc, shortcut) => {
        acc[shortcut.id] = shortcut.keys;
        return acc;
      }, {} as Record<string, string[]>),
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omnipanel-shortcuts-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importShortcuts = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);
        if (importData.shortcuts) {
          Object.entries(importData.shortcuts).forEach(([id, keys]) => {
            updateShortcut(id, keys as string[]);
          });
          captureMessage('Keyboard shortcuts imported', 'info');
        }
      } catch (error) {
        captureMessage('Failed to import shortcuts', 'error');
      }
    };
    reader.readAsText(file);
  };

  const customShortcutsCount = shortcuts.filter(s => 
    JSON.stringify(s.keys) !== JSON.stringify(s.defaultKeys)
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Keyboard className="w-6 h-6" />
            Keyboard Shortcuts
          </h2>
          <p className="text-muted-foreground mt-1">
            Customize keyboard shortcuts to match your workflow
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportShortcuts}
            className="px-3 py-2 border border-border rounded-md hover:bg-muted transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <label className="px-3 py-2 border border-border rounded-md hover:bg-muted transition-colors flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            Import
            <input
              type="file"
              accept=".json"
              onChange={importShortcuts}
              className="hidden"
            />
          </label>
          <button
            onClick={handleResetAll}
            className="px-3 py-2 border border-border rounded-md hover:bg-muted transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset All
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${enabled ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm font-medium">
              Shortcuts {enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            {customShortcutsCount} customized shortcuts
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {filteredShortcuts.length} of {shortcuts.length} shortcuts shown
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search shortcuts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as ShortcutCategoryType | 'all')}
          className="px-3 py-2 border border-border rounded-md bg-background"
        >
          <option value="all">All Categories</option>
          {Object.entries(SHORTCUT_CATEGORIES).map(([key, category]) => (
            <option key={key} value={key}>
              {category.name}
            </option>
          ))}
        </select>

        <button
          onClick={() => setShowCustomOnly(!showCustomOnly)}
          className={`px-3 py-2 border rounded-md transition-colors flex items-center gap-2 ${
            showCustomOnly 
              ? 'bg-primary text-primary-foreground border-primary' 
              : 'border-border hover:bg-muted'
          }`}
        >
          <Filter className="w-4 h-4" />
          Custom Only
        </button>
      </div>

      {/* Shortcuts List */}
      <div className="space-y-6">
        {Object.entries(groupedShortcuts).map(([categoryKey, categoryShortcuts]) => {
          const category = SHORTCUT_CATEGORIES[categoryKey as ShortcutCategoryType];
          
          return (
            <div key={categoryKey} className="space-y-3">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <span>{category.name}</span>
                <span className="text-sm text-muted-foreground">
                  ({categoryShortcuts.length})
                </span>
              </h3>
              
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut) => {
                  const isCustomized = JSON.stringify(shortcut.keys) !== JSON.stringify(shortcut.defaultKeys);
                  
                  return (
                    <div
                      key={shortcut.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{shortcut.name}</span>
                          {isCustomized && (
                            <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                              Custom
                            </span>
                          )}
                          {!shortcut.customizable && (
                            <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded">
                              System
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {shortcut.description}
                        </p>
                        {shortcut.context && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-muted-foreground">Context:</span>
                            {shortcut.context.map(ctx => (
                              <span key={ctx} className="text-xs bg-muted px-1 rounded">
                                {ctx}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-mono text-sm bg-muted px-2 py-1 rounded">
                            {formatShortcutKeys(shortcut.keys)}
                          </div>
                          {isCustomized && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Default: {formatShortcutKeys(shortcut.defaultKeys)}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {shortcut.customizable && (
                            <button
                              onClick={() => handleEditShortcut(shortcut)}
                              className="p-2 hover:bg-muted rounded transition-colors"
                              title="Edit shortcut"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                          
                          {isCustomized && (
                            <button
                              onClick={() => handleResetShortcut(shortcut)}
                              className="p-2 hover:bg-muted rounded transition-colors"
                              title="Reset to default"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {filteredShortcuts.length === 0 && (
        <div className="text-center py-12">
          <Keyboard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No shortcuts found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Key Capture Modal */}
      <KeyCaptureModal
        isOpen={editingShortcut !== null}
        shortcut={editingShortcut}
        onClose={() => setEditingShortcut(null)}
        onSave={handleSaveShortcut}
      />
    </div>
  );
} 
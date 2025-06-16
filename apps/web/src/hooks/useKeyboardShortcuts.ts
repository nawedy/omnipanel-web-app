// apps/web/src/hooks/useKeyboardShortcuts.ts
// Global keyboard shortcuts hook with customization support

'use client';

import { useEffect, useCallback, useRef } from 'react';
import { 
  DEFAULT_SHORTCUTS, 
  formatShortcutKeys, 
  parseShortcutKey,
  type KeyboardShortcut 
} from '@/data/keyboardShortcuts';
import { configService } from '@/services/configService';
import { useMonitoring } from '@/components/providers/MonitoringProvider';

interface ShortcutHandler {
  (event: KeyboardEvent): void | boolean;
}

interface UseKeyboardShortcutsOptions {
  context?: string;
  enabled?: boolean;
  preventDefault?: boolean;
}

interface ShortcutRegistration {
  id: string;
  keys: string[];
  handler: ShortcutHandler;
  context?: string;
  preventDefault: boolean;
}

// Global shortcuts registry
const globalShortcuts = new Map<string, ShortcutRegistration>();
const contextShortcuts = new Map<string, Map<string, ShortcutRegistration>>();

export function useKeyboardShortcuts(
  shortcuts: Record<string, ShortcutHandler> = {},
  options: UseKeyboardShortcutsOptions = {}
) {
  const { context, enabled = true, preventDefault = true } = options;
  const { captureMessage, captureError } = useMonitoring();
  const shortcutsRef = useRef(shortcuts);
  const optionsRef = useRef(options);

  // Update refs when props change
  shortcutsRef.current = shortcuts;
  optionsRef.current = options;

  // Get user's custom shortcuts
  const getCustomShortcuts = useCallback(() => {
    const keyboardConfig = configService.getKeyboardShortcutsConfig();
    return keyboardConfig.customShortcuts || {};
  }, []);

  // Register a shortcut
  const registerShortcut = useCallback((
    id: string,
    keys: string[],
    handler: ShortcutHandler,
    shortcutContext?: string,
    preventDefaultAction = true
  ) => {
    const registration: ShortcutRegistration = {
      id,
      keys,
      handler,
      context: shortcutContext,
      preventDefault: preventDefaultAction
    };

    if (shortcutContext) {
      if (!contextShortcuts.has(shortcutContext)) {
        contextShortcuts.set(shortcutContext, new Map());
      }
      contextShortcuts.get(shortcutContext)!.set(id, registration);
    } else {
      globalShortcuts.set(id, registration);
    }
  }, []);

  // Unregister a shortcut
  const unregisterShortcut = useCallback((id: string, shortcutContext?: string) => {
    if (shortcutContext) {
      const contextMap = contextShortcuts.get(shortcutContext);
      if (contextMap) {
        contextMap.delete(id);
        if (contextMap.size === 0) {
          contextShortcuts.delete(shortcutContext);
        }
      }
    } else {
      globalShortcuts.delete(id);
    }
  }, []);

  // Check if key combination matches
  const matchesShortcut = useCallback((event: KeyboardEvent, keys: string[]): boolean => {
    const eventKey = event.key.toLowerCase();
    const eventCode = event.code.toLowerCase();
    
    for (const keyCombo of keys) {
      const { modifiers, key } = parseShortcutKey(keyCombo);
      
      // Check modifiers
      const requiredModifiers = {
        cmd: modifiers.includes('Cmd'),
        ctrl: modifiers.includes('Ctrl'),
        alt: modifiers.includes('Alt'),
        shift: modifiers.includes('Shift'),
        meta: modifiers.includes('Meta')
      };

      const eventModifiers = {
        cmd: event.metaKey,
        ctrl: event.ctrlKey,
        alt: event.altKey,
        shift: event.shiftKey,
        meta: event.metaKey
      };

      // On Mac, Cmd and Meta are the same
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      if (isMac) {
        requiredModifiers.ctrl = requiredModifiers.cmd || requiredModifiers.ctrl;
        eventModifiers.ctrl = eventModifiers.cmd || eventModifiers.ctrl;
      }

      // Check if all required modifiers match
      const modifiersMatch = Object.keys(requiredModifiers).every(mod => 
        requiredModifiers[mod as keyof typeof requiredModifiers] === 
        eventModifiers[mod as keyof typeof eventModifiers]
      );

      if (!modifiersMatch) continue;

      // Check main key
      const normalizedKey = key.toLowerCase();
      const keyMatches = 
        eventKey === normalizedKey ||
        eventCode === normalizedKey ||
        eventCode === `key${normalizedKey}` ||
        (normalizedKey === 'enter' && eventKey === 'enter') ||
        (normalizedKey === 'space' && eventKey === ' ') ||
        (normalizedKey === 'tab' && eventKey === 'tab') ||
        (normalizedKey === 'escape' && eventKey === 'escape') ||
        (normalizedKey === '`' && (eventKey === '`' || eventKey === 'backquote'));

      if (keyMatches) return true;
    }

    return false;
  }, []);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    try {
      // Get current context shortcuts
      const currentContextShortcuts = context ? contextShortcuts.get(context) : null;
      
      // Check context-specific shortcuts first
      if (currentContextShortcuts) {
        for (const [id, registration] of currentContextShortcuts) {
          if (matchesShortcut(event, registration.keys)) {
            const result = registration.handler(event);
            if (registration.preventDefault && result !== false) {
              event.preventDefault();
              event.stopPropagation();
            }
            
            captureMessage('Keyboard shortcut executed', 'info', {
              shortcutId: id,
              context: context || 'global',
              keys: registration.keys.join(', ')
            });
            
            return;
          }
        }
      }

      // Check global shortcuts
      for (const [id, registration] of globalShortcuts) {
        if (matchesShortcut(event, registration.keys)) {
          const result = registration.handler(event);
          if (registration.preventDefault && result !== false) {
            event.preventDefault();
            event.stopPropagation();
          }
          
          captureMessage('Keyboard shortcut executed', 'info', {
            shortcutId: id,
            context: 'global',
            keys: registration.keys.join(', ')
          });
          
          return;
        }
      }

      // Check user-defined shortcuts
      const userShortcuts = shortcutsRef.current;
      for (const [shortcutId, handler] of Object.entries(userShortcuts)) {
        const shortcutDef = DEFAULT_SHORTCUTS.find((s: any) => s.id === shortcutId);
        if (!shortcutDef) continue;

        // Get custom keys or use defaults
        const customShortcuts = getCustomShortcuts();
        const keys = customShortcuts[shortcutId] || shortcutDef.keys;
        
        // Ensure keys is always an array
        const keyArray = Array.isArray(keys) ? keys : [keys];

        if (matchesShortcut(event, keyArray)) {
          const result = handler(event);
          if (optionsRef.current.preventDefault && result !== false) {
            event.preventDefault();
            event.stopPropagation();
          }
          
          captureMessage('User shortcut executed', 'info', {
            shortcutId,
            context: optionsRef.current.context || 'user',
            keys: keyArray.join(', ')
          });
          
          return;
        }
      }
    } catch (error) {
      captureError(error instanceof Error ? error : new Error('Keyboard shortcut error'), {
        component: 'useKeyboardShortcuts',
        context: context || 'global'
      });
    }
  }, [enabled, context, matchesShortcut, getCustomShortcuts, captureMessage, captureError]);

  // Set up event listeners
  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown, true);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [enabled, handleKeyDown]);

  // Register default shortcuts on mount
  useEffect(() => {
    const customShortcuts = getCustomShortcuts();
    
    // Register all default shortcuts
    DEFAULT_SHORTCUTS.forEach(shortcut => {
      const customKeys = customShortcuts[shortcut.id];
      const keys = customKeys ? (Array.isArray(customKeys) ? customKeys : [customKeys]) : shortcut.keys;
      const handler = (event: KeyboardEvent) => {
        // Default action handling would go here
        // This is where you'd integrate with your app's action system
        console.log(`Default shortcut triggered: ${shortcut.id}`, shortcut.action);
        return true; // Prevent default
      };
      
      registerShortcut(
        shortcut.id,
        keys,
        handler,
        shortcut.context?.[0],
        true
      );
    });

    return () => {
      // Cleanup on unmount
      DEFAULT_SHORTCUTS.forEach(shortcut => {
        unregisterShortcut(shortcut.id, shortcut.context?.[0]);
      });
    };
  }, [registerShortcut, unregisterShortcut, getCustomShortcuts]);

  // Utility functions
  const getShortcutKeys = useCallback((shortcutId: string): string[] => {
    const customShortcuts = getCustomShortcuts();
    const shortcut = DEFAULT_SHORTCUTS.find(s => s.id === shortcutId);
    
    if (!shortcut) return [];
    
    const customKeys = customShortcuts[shortcutId];
    const keys = customKeys ? (Array.isArray(customKeys) ? customKeys : [customKeys]) : shortcut.keys;
    return keys;
  }, [getCustomShortcuts]);

  const getFormattedShortcut = useCallback((shortcutId: string): string => {
    const keys = getShortcutKeys(shortcutId);
    return formatShortcutKeys(keys);
  }, [getShortcutKeys]);

  const updateShortcut = useCallback((shortcutId: string, newKeys: string[]) => {
    const keyboardConfig = configService.getKeyboardShortcutsConfig();
    const customShortcuts = { ...keyboardConfig.customShortcuts };
    
    customShortcuts[shortcutId] = newKeys;
    
    configService.updateKeyboardShortcutsConfig({
      ...keyboardConfig,
      customShortcuts
    });

    // Re-register the shortcut with new keys
    const shortcut = DEFAULT_SHORTCUTS.find((s: any) => s.id === shortcutId);
    if (shortcut) {
      unregisterShortcut(shortcutId, shortcut.context?.[0]);
      
      const handler = (event: KeyboardEvent) => {
        console.log(`Updated shortcut triggered: ${shortcutId}`, shortcut.action);
        return true;
      };
      
      registerShortcut(
        shortcutId,
        newKeys,
        handler,
        shortcut.context?.[0],
        true
      );
    }

    captureMessage('Keyboard shortcut updated', 'info', {
      shortcutId,
      newKeys: newKeys.join(', ')
    });
  }, [registerShortcut, unregisterShortcut, captureMessage]);

  const resetShortcut = useCallback((shortcutId: string) => {
    const shortcut = DEFAULT_SHORTCUTS.find((s: any) => s.id === shortcutId);
    if (!shortcut) return;

    updateShortcut(shortcutId, shortcut.defaultKeys);
  }, [updateShortcut]);

  const resetAllShortcuts = useCallback(() => {
    const keyboardConfig = configService.getKeyboardShortcutsConfig();
    
    configService.updateKeyboardShortcutsConfig({
      ...keyboardConfig,
      customShortcuts: {}
    });

    // Re-register all shortcuts with default keys
    DEFAULT_SHORTCUTS.forEach(shortcut => {
      unregisterShortcut(shortcut.id, shortcut.context?.[0]);
      
      const handler = (event: KeyboardEvent) => {
        console.log(`Reset shortcut triggered: ${shortcut.id}`, shortcut.action);
        return true;
      };
      
      registerShortcut(
        shortcut.id,
        shortcut.defaultKeys,
        handler,
        shortcut.context?.[0],
        true
      );
    });

    captureMessage('All keyboard shortcuts reset to defaults', 'info');
  }, [registerShortcut, unregisterShortcut, captureMessage]);

  return {
    registerShortcut,
    unregisterShortcut,
    getShortcutKeys,
    getFormattedShortcut,
    updateShortcut,
    resetShortcut,
    resetAllShortcuts,
    enabled
  };
}

// Hook for getting shortcut display text
export function useShortcutDisplay(shortcutId: string): string {
  const { getFormattedShortcut } = useKeyboardShortcuts();
  return getFormattedShortcut(shortcutId);
}

// Hook for checking if a shortcut is pressed
export function useShortcutPressed(shortcutId: string, handler: ShortcutHandler) {
  const shortcuts = { [shortcutId]: handler };
  useKeyboardShortcuts(shortcuts);
} 
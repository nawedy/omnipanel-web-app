// apps/web/src/data/keyboardShortcuts.ts
// Comprehensive keyboard shortcuts definitions with customization support

export interface KeyboardShortcut {
  id: string;
  name: string;
  description: string;
  keys: string[];
  category: ShortcutCategoryType;
  context?: string[];
  customizable: boolean;
  defaultKeys: string[];
  action?: string;
}

export type ShortcutCategoryType = 
  | 'general'
  | 'file'
  | 'edit'
  | 'view'
  | 'navigation'
  | 'terminal'
  | 'chat'
  | 'notebook'
  | 'debug'
  | 'ai'
  | 'workspace';

export interface ShortcutCategoryInfo {
  name: string;
  description: string;
  icon: string;
}

export const SHORTCUT_CATEGORIES: Record<ShortcutCategoryType, ShortcutCategoryInfo> = {
  general: {
    name: 'General',
    description: 'Global application shortcuts',
    icon: 'Settings'
  },
  file: {
    name: 'File Operations',
    description: 'File and project management',
    icon: 'File'
  },
  edit: {
    name: 'Editing',
    description: 'Text editing and code manipulation',
    icon: 'Edit'
  },
  view: {
    name: 'View',
    description: 'UI layout and display options',
    icon: 'Eye'
  },
  navigation: {
    name: 'Navigation',
    description: 'Moving around the interface',
    icon: 'Navigation'
  },
  terminal: {
    name: 'Terminal',
    description: 'Terminal and command line',
    icon: 'Terminal'
  },
  chat: {
    name: 'AI Chat',
    description: 'AI assistant and chat features',
    icon: 'MessageSquare'
  },
  notebook: {
    name: 'Notebook',
    description: 'Jupyter notebook operations',
    icon: 'BookOpen'
  },
  debug: {
    name: 'Debug',
    description: 'Debugging and testing',
    icon: 'Bug'
  },
  ai: {
    name: 'AI Features',
    description: 'AI-powered development tools',
    icon: 'Brain'
  },
  workspace: {
    name: 'Workspace',
    description: 'Workspace and project management',
    icon: 'Layout'
  }
};

export const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  // General shortcuts
  {
    id: 'general.command-palette',
    name: 'Command Palette',
    description: 'Open the command palette',
    keys: ['Cmd+Shift+P', 'Ctrl+Shift+P'],
    category: 'general',
    customizable: true,
    defaultKeys: ['Cmd+Shift+P', 'Ctrl+Shift+P'],
    action: 'openCommandPalette'
  },
  {
    id: 'general.settings',
    name: 'Settings',
    description: 'Open application settings',
    keys: ['Cmd+,', 'Ctrl+,'],
    category: 'general',
    customizable: true,
    defaultKeys: ['Cmd+,', 'Ctrl+,'],
    action: 'openSettings'
  },
  {
    id: 'general.toggle-theme',
    name: 'Toggle Theme',
    description: 'Switch between light and dark theme',
    keys: ['Cmd+Shift+T', 'Ctrl+Shift+T'],
    category: 'general',
    customizable: true,
    defaultKeys: ['Cmd+Shift+T', 'Ctrl+Shift+T'],
    action: 'toggleTheme'
  },
  {
    id: 'general.zoom-in',
    name: 'Zoom In',
    description: 'Increase interface zoom level',
    keys: ['Cmd+=', 'Ctrl+='],
    category: 'general',
    customizable: true,
    defaultKeys: ['Cmd+=', 'Ctrl+='],
    action: 'zoomIn'
  },
  {
    id: 'general.zoom-out',
    name: 'Zoom Out',
    description: 'Decrease interface zoom level',
    keys: ['Cmd+-', 'Ctrl+-'],
    category: 'general',
    customizable: true,
    defaultKeys: ['Cmd+-', 'Ctrl+-'],
    action: 'zoomOut'
  },
  {
    id: 'general.reset-zoom',
    name: 'Reset Zoom',
    description: 'Reset interface zoom to default',
    keys: ['Cmd+0', 'Ctrl+0'],
    category: 'general',
    customizable: true,
    defaultKeys: ['Cmd+0', 'Ctrl+0'],
    action: 'resetZoom'
  },

  // File operations
  {
    id: 'file.new-file',
    name: 'New File',
    description: 'Create a new file',
    keys: ['Cmd+N', 'Ctrl+N'],
    category: 'file',
    customizable: true,
    defaultKeys: ['Cmd+N', 'Ctrl+N'],
    action: 'newFile'
  },
  {
    id: 'file.open-file',
    name: 'Open File',
    description: 'Open an existing file',
    keys: ['Cmd+O', 'Ctrl+O'],
    category: 'file',
    customizable: true,
    defaultKeys: ['Cmd+O', 'Ctrl+O'],
    action: 'openFile'
  },
  {
    id: 'file.save',
    name: 'Save',
    description: 'Save the current file',
    keys: ['Cmd+S', 'Ctrl+S'],
    category: 'file',
    customizable: false,
    defaultKeys: ['Cmd+S', 'Ctrl+S'],
    action: 'save'
  },
  {
    id: 'file.save-as',
    name: 'Save As',
    description: 'Save the current file with a new name',
    keys: ['Cmd+Shift+S', 'Ctrl+Shift+S'],
    category: 'file',
    customizable: true,
    defaultKeys: ['Cmd+Shift+S', 'Ctrl+Shift+S'],
    action: 'saveAs'
  },
  {
    id: 'file.close-file',
    name: 'Close File',
    description: 'Close the current file',
    keys: ['Cmd+W', 'Ctrl+W'],
    category: 'file',
    customizable: true,
    defaultKeys: ['Cmd+W', 'Ctrl+W'],
    action: 'closeFile'
  },
  {
    id: 'file.open-project',
    name: 'Open Project',
    description: 'Open a project folder',
    keys: ['Cmd+Shift+O', 'Ctrl+Shift+O'],
    category: 'file',
    customizable: true,
    defaultKeys: ['Cmd+Shift+O', 'Ctrl+Shift+O'],
    action: 'openProject'
  },
  {
    id: 'file.new-project',
    name: 'New Project',
    description: 'Create a new project',
    keys: ['Cmd+Shift+N', 'Ctrl+Shift+N'],
    category: 'file',
    customizable: true,
    defaultKeys: ['Cmd+Shift+N', 'Ctrl+Shift+N'],
    action: 'newProject'
  },

  // Edit operations
  {
    id: 'edit.undo',
    name: 'Undo',
    description: 'Undo the last action',
    keys: ['Cmd+Z', 'Ctrl+Z'],
    category: 'edit',
    customizable: false,
    defaultKeys: ['Cmd+Z', 'Ctrl+Z'],
    action: 'undo'
  },
  {
    id: 'edit.redo',
    name: 'Redo',
    description: 'Redo the last undone action',
    keys: ['Cmd+Shift+Z', 'Ctrl+Y'],
    category: 'edit',
    customizable: false,
    defaultKeys: ['Cmd+Shift+Z', 'Ctrl+Y'],
    action: 'redo'
  },
  {
    id: 'edit.cut',
    name: 'Cut',
    description: 'Cut selected text',
    keys: ['Cmd+X', 'Ctrl+X'],
    category: 'edit',
    customizable: false,
    defaultKeys: ['Cmd+X', 'Ctrl+X'],
    action: 'cut'
  },
  {
    id: 'edit.copy',
    name: 'Copy',
    description: 'Copy selected text',
    keys: ['Cmd+C', 'Ctrl+C'],
    category: 'edit',
    customizable: false,
    defaultKeys: ['Cmd+C', 'Ctrl+C'],
    action: 'copy'
  },
  {
    id: 'edit.paste',
    name: 'Paste',
    description: 'Paste from clipboard',
    keys: ['Cmd+V', 'Ctrl+V'],
    category: 'edit',
    customizable: false,
    defaultKeys: ['Cmd+V', 'Ctrl+V'],
    action: 'paste'
  },
  {
    id: 'edit.select-all',
    name: 'Select All',
    description: 'Select all text',
    keys: ['Cmd+A', 'Ctrl+A'],
    category: 'edit',
    customizable: false,
    defaultKeys: ['Cmd+A', 'Ctrl+A'],
    action: 'selectAll'
  },
  {
    id: 'edit.find',
    name: 'Find',
    description: 'Open find dialog',
    keys: ['Cmd+F', 'Ctrl+F'],
    category: 'edit',
    customizable: true,
    defaultKeys: ['Cmd+F', 'Ctrl+F'],
    action: 'find'
  },
  {
    id: 'edit.replace',
    name: 'Find and Replace',
    description: 'Open find and replace dialog',
    keys: ['Cmd+H', 'Ctrl+H'],
    category: 'edit',
    customizable: true,
    defaultKeys: ['Cmd+H', 'Ctrl+H'],
    action: 'replace'
  },

  // View operations
  {
    id: 'view.toggle-sidebar',
    name: 'Toggle Sidebar',
    description: 'Show or hide the sidebar',
    keys: ['Cmd+B', 'Ctrl+B'],
    category: 'view',
    customizable: true,
    defaultKeys: ['Cmd+B', 'Ctrl+B'],
    action: 'toggleSidebar'
  },
  {
    id: 'view.toggle-terminal',
    name: 'Toggle Terminal',
    description: 'Show or hide the terminal',
    keys: ['Cmd+`', 'Ctrl+`'],
    category: 'view',
    customizable: true,
    defaultKeys: ['Cmd+`', 'Ctrl+`'],
    action: 'toggleTerminal'
  },
  {
    id: 'view.toggle-chat',
    name: 'Toggle Chat',
    description: 'Show or hide the AI chat panel',
    keys: ['Cmd+Shift+C', 'Ctrl+Shift+C'],
    category: 'view',
    customizable: true,
    defaultKeys: ['Cmd+Shift+C', 'Ctrl+Shift+C'],
    action: 'toggleChat'
  },
  {
    id: 'view.toggle-notebook',
    name: 'Toggle Notebook',
    description: 'Show or hide the notebook panel',
    keys: ['Cmd+Shift+J', 'Ctrl+Shift+J'],
    category: 'view',
    customizable: true,
    defaultKeys: ['Cmd+Shift+J', 'Ctrl+Shift+J'],
    action: 'toggleNotebook'
  },
  {
    id: 'view.focus-editor',
    name: 'Focus Editor',
    description: 'Focus the main editor area',
    keys: ['Cmd+1', 'Ctrl+1'],
    category: 'view',
    customizable: true,
    defaultKeys: ['Cmd+1', 'Ctrl+1'],
    action: 'focusEditor'
  },
  {
    id: 'view.focus-terminal',
    name: 'Focus Terminal',
    description: 'Focus the terminal panel',
    keys: ['Cmd+2', 'Ctrl+2'],
    category: 'view',
    customizable: true,
    defaultKeys: ['Cmd+2', 'Ctrl+2'],
    action: 'focusTerminal'
  },
  {
    id: 'view.focus-chat',
    name: 'Focus Chat',
    description: 'Focus the AI chat panel',
    keys: ['Cmd+3', 'Ctrl+3'],
    category: 'view',
    customizable: true,
    defaultKeys: ['Cmd+3', 'Ctrl+3'],
    action: 'focusChat'
  },

  // Navigation
  {
    id: 'nav.go-to-file',
    name: 'Go to File',
    description: 'Quick file navigation',
    keys: ['Cmd+P', 'Ctrl+P'],
    category: 'navigation',
    customizable: true,
    defaultKeys: ['Cmd+P', 'Ctrl+P'],
    action: 'goToFile'
  },
  {
    id: 'nav.go-to-line',
    name: 'Go to Line',
    description: 'Jump to a specific line number',
    keys: ['Cmd+G', 'Ctrl+G'],
    category: 'navigation',
    customizable: true,
    defaultKeys: ['Cmd+G', 'Ctrl+G'],
    action: 'goToLine'
  },
  {
    id: 'nav.next-tab',
    name: 'Next Tab',
    description: 'Switch to the next tab',
    keys: ['Cmd+Shift+]', 'Ctrl+Tab'],
    category: 'navigation',
    customizable: true,
    defaultKeys: ['Cmd+Shift+]', 'Ctrl+Tab'],
    action: 'nextTab'
  },
  {
    id: 'nav.prev-tab',
    name: 'Previous Tab',
    description: 'Switch to the previous tab',
    keys: ['Cmd+Shift+[', 'Ctrl+Shift+Tab'],
    category: 'navigation',
    customizable: true,
    defaultKeys: ['Cmd+Shift+[', 'Ctrl+Shift+Tab'],
    action: 'prevTab'
  },

  // Terminal shortcuts
  {
    id: 'terminal.new-terminal',
    name: 'New Terminal',
    description: 'Open a new terminal instance',
    keys: ['Cmd+Shift+`', 'Ctrl+Shift+`'],
    category: 'terminal',
    context: ['terminal'],
    customizable: true,
    defaultKeys: ['Cmd+Shift+`', 'Ctrl+Shift+`'],
    action: 'newTerminal'
  },
  {
    id: 'terminal.clear',
    name: 'Clear Terminal',
    description: 'Clear the terminal output',
    keys: ['Cmd+K', 'Ctrl+L'],
    category: 'terminal',
    context: ['terminal'],
    customizable: true,
    defaultKeys: ['Cmd+K', 'Ctrl+L'],
    action: 'clearTerminal'
  },
  {
    id: 'terminal.interrupt',
    name: 'Interrupt Process',
    description: 'Send interrupt signal (Ctrl+C)',
    keys: ['Ctrl+C'],
    category: 'terminal',
    context: ['terminal'],
    customizable: false,
    defaultKeys: ['Ctrl+C'],
    action: 'interruptProcess'
  },

  // Chat shortcuts
  {
    id: 'chat.new-conversation',
    name: 'New Conversation',
    description: 'Start a new AI conversation',
    keys: ['Cmd+Shift+Enter', 'Ctrl+Shift+Enter'],
    category: 'chat',
    context: ['chat'],
    customizable: true,
    defaultKeys: ['Cmd+Shift+Enter', 'Ctrl+Shift+Enter'],
    action: 'newConversation'
  },
  {
    id: 'chat.send-message',
    name: 'Send Message',
    description: 'Send the current message',
    keys: ['Enter'],
    category: 'chat',
    context: ['chat'],
    customizable: false,
    defaultKeys: ['Enter'],
    action: 'sendMessage'
  },
  {
    id: 'chat.multiline-mode',
    name: 'Multiline Mode',
    description: 'Add new line in chat input',
    keys: ['Shift+Enter'],
    category: 'chat',
    context: ['chat'],
    customizable: false,
    defaultKeys: ['Shift+Enter'],
    action: 'newLine'
  },
  {
    id: 'chat.clear-conversation',
    name: 'Clear Conversation',
    description: 'Clear the current conversation',
    keys: ['Cmd+Shift+K', 'Ctrl+Shift+K'],
    category: 'chat',
    context: ['chat'],
    customizable: true,
    defaultKeys: ['Cmd+Shift+K', 'Ctrl+Shift+K'],
    action: 'clearConversation'
  },

  // Notebook shortcuts
  {
    id: 'notebook.run-cell',
    name: 'Run Cell',
    description: 'Execute the current notebook cell',
    keys: ['Shift+Enter'],
    category: 'notebook',
    context: ['notebook'],
    customizable: false,
    defaultKeys: ['Shift+Enter'],
    action: 'runCell'
  },
  {
    id: 'notebook.run-all',
    name: 'Run All Cells',
    description: 'Execute all notebook cells',
    keys: ['Cmd+Shift+Enter', 'Ctrl+Shift+Enter'],
    category: 'notebook',
    context: ['notebook'],
    customizable: true,
    defaultKeys: ['Cmd+Shift+Enter', 'Ctrl+Shift+Enter'],
    action: 'runAllCells'
  },
  {
    id: 'notebook.new-cell',
    name: 'New Cell',
    description: 'Insert a new cell below',
    keys: ['Cmd+Shift+N', 'Ctrl+Shift+N'],
    category: 'notebook',
    context: ['notebook'],
    customizable: true,
    defaultKeys: ['Cmd+Shift+N', 'Ctrl+Shift+N'],
    action: 'newCell'
  },
  {
    id: 'notebook.delete-cell',
    name: 'Delete Cell',
    description: 'Delete the current cell',
    keys: ['Cmd+Shift+D', 'Ctrl+Shift+D'],
    category: 'notebook',
    context: ['notebook'],
    customizable: true,
    defaultKeys: ['Cmd+Shift+D', 'Ctrl+Shift+D'],
    action: 'deleteCell'
  },

  // AI features
  {
    id: 'ai.code-completion',
    name: 'Trigger Code Completion',
    description: 'Manually trigger AI code completion',
    keys: ['Cmd+Space', 'Ctrl+Space'],
    category: 'ai',
    customizable: true,
    defaultKeys: ['Cmd+Space', 'Ctrl+Space'],
    action: 'triggerCompletion'
  },
  {
    id: 'ai.explain-code',
    name: 'Explain Code',
    description: 'Ask AI to explain selected code',
    keys: ['Cmd+Shift+E', 'Ctrl+Shift+E'],
    category: 'ai',
    customizable: true,
    defaultKeys: ['Cmd+Shift+E', 'Ctrl+Shift+E'],
    action: 'explainCode'
  },
  {
    id: 'ai.refactor-code',
    name: 'Refactor Code',
    description: 'Ask AI to refactor selected code',
    keys: ['Cmd+Shift+R', 'Ctrl+Shift+R'],
    category: 'ai',
    customizable: true,
    defaultKeys: ['Cmd+Shift+R', 'Ctrl+Shift+R'],
    action: 'refactorCode'
  },
  {
    id: 'ai.generate-tests',
    name: 'Generate Tests',
    description: 'Generate unit tests for selected code',
    keys: ['Cmd+Shift+U', 'Ctrl+Shift+U'],
    category: 'ai',
    customizable: true,
    defaultKeys: ['Cmd+Shift+U', 'Ctrl+Shift+U'],
    action: 'generateTests'
  },

  // Workspace shortcuts
  {
    id: 'workspace.save-layout',
    name: 'Save Layout',
    description: 'Save the current workspace layout',
    keys: ['Cmd+Shift+L', 'Ctrl+Shift+L'],
    category: 'workspace',
    customizable: true,
    defaultKeys: ['Cmd+Shift+L', 'Ctrl+Shift+L'],
    action: 'saveLayout'
  },
  {
    id: 'workspace.reset-layout',
    name: 'Reset Layout',
    description: 'Reset workspace to default layout',
    keys: ['Cmd+Shift+0', 'Ctrl+Shift+0'],
    category: 'workspace',
    customizable: true,
    defaultKeys: ['Cmd+Shift+0', 'Ctrl+Shift+0'],
    action: 'resetLayout'
  }
];

// Helper functions
export const getShortcutsByCategory = (category: ShortcutCategoryType): KeyboardShortcut[] => {
  return DEFAULT_SHORTCUTS.filter(shortcut => shortcut.category === category);
};

export const getShortcutById = (id: string): KeyboardShortcut | undefined => {
  return DEFAULT_SHORTCUTS.find(shortcut => shortcut.id === id);
};

export const getCustomizableShortcuts = (): KeyboardShortcut[] => {
  return DEFAULT_SHORTCUTS.filter(shortcut => shortcut.customizable);
};

export const formatShortcutKeys = (keys: string[]): string => {
  // Return the appropriate key combination based on platform
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  
  return keys.find(key => {
    if (isMac) {
      return key.includes('Cmd');
    } else {
      return key.includes('Ctrl');
    }
  }) || keys[0];
};

export const parseShortcutKey = (key: string): { modifiers: string[]; key: string } => {
  const parts = key.split('+');
  const mainKey = parts.pop() || '';
  const modifiers = parts;
  
  return { modifiers, key: mainKey };
};

export const isShortcutConflict = (shortcut1: KeyboardShortcut, shortcut2: KeyboardShortcut): boolean => {
  // Check if two shortcuts have conflicting key combinations
  for (const key1 of shortcut1.keys) {
    for (const key2 of shortcut2.keys) {
      if (key1 === key2) {
        // Check if they have overlapping contexts
        if (!shortcut1.context && !shortcut2.context) return true;
        if (shortcut1.context && shortcut2.context) {
          const hasOverlap = shortcut1.context.some(ctx => shortcut2.context!.includes(ctx));
          if (hasOverlap) return true;
        }
      }
    }
  }
  return false;
}; 
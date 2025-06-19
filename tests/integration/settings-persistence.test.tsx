import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SettingsProvider } from '@/providers/SettingsProvider';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { ThemeProvider } from '@/components/ThemeProvider';
import { settingsService } from '@/services/settingsService';
import { storageService } from '@/services/storageService';

// Mock services
jest.mock('@/services/settingsService');
jest.mock('@/services/storageService');

const mockSettingsService = jest.mocked(settingsService);
const mockStorageService = jest.mocked(storageService);

describe('Settings Persistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockSettingsService.getSettings.mockResolvedValue({
      theme: 'dark',
      fontSize: 14,
      fontFamily: 'Monaco',
      language: 'en',
      aiModels: {
        openai: { apiKey: 'test-key', model: 'gpt-4' },
        anthropic: { apiKey: '', model: 'claude-3' }
      },
      keyboardShortcuts: {
        commandPalette: 'Ctrl+Shift+P',
        newFile: 'Ctrl+N',
        saveFile: 'Ctrl+S'
      },
      privacy: {
        analytics: true,
        crashReporting: true,
        dataCollection: false
      },
      performance: {
        memoryLimit: 1024,
        cacheSize: 256
      }
    });

    mockStorageService.get.mockImplementation((key) => {
      const storage: Record<string, any> = {
        'omnipanel-settings': {
          theme: 'dark',
          fontSize: 14
        }
      };
      return Promise.resolve(storage[key]);
    });

    mockStorageService.set.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should load settings on application start', async () => {
    const TestApp = () => (
      <SettingsProvider>
        <ThemeProvider>
          <div data-testid="app">App Content</div>
        </ThemeProvider>
      </SettingsProvider>
    );

    render(<TestApp />);

    await waitFor(() => {
      expect(mockSettingsService.getSettings).toHaveBeenCalled();
      expect(mockStorageService.get).toHaveBeenCalledWith('omnipanel-settings');
    });

    // Check if theme is applied
    const app = screen.getByTestId('app');
    expect(app).toHaveClass('dark-theme');
  });

  it('should persist theme changes', async () => {
    const TestApp = () => (
      <SettingsProvider>
        <ThemeProvider>
          <SettingsModal isOpen={true} onClose={() => {}} />
        </ThemeProvider>
      </SettingsProvider>
    );

    render(<TestApp />);

    // Navigate to theme settings
    await waitFor(() => {
      expect(screen.getByTestId('settings-modal')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('settings-tab-theme'));

    // Change theme to light
    fireEvent.click(screen.getByTestId('theme-option-light'));

    // Save settings
    fireEvent.click(screen.getByTestId('save-settings'));

    await waitFor(() => {
      expect(mockSettingsService.saveSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          theme: 'light'
        })
      );
      expect(mockStorageService.set).toHaveBeenCalledWith(
        'omnipanel-settings',
        expect.objectContaining({
          theme: 'light'
        })
      );
    });
  });

  it('should persist AI model settings', async () => {
    const TestApp = () => (
      <SettingsProvider>
        <SettingsModal isOpen={true} onClose={() => {}} />
      </SettingsProvider>
    );

    render(<TestApp />);

    // Navigate to AI settings
    fireEvent.click(screen.getByTestId('settings-tab-ai'));

    // Add new API key
    fireEvent.click(screen.getByTestId('add-api-key-button'));
    fireEvent.change(screen.getByTestId('api-key-input'), {
      target: { value: 'new-api-key-123' }
    });
    fireEvent.change(screen.getByTestId('api-provider-select'), {
      target: { value: 'anthropic' }
    });
    fireEvent.click(screen.getByTestId('save-api-key'));

    await waitFor(() => {
      expect(mockSettingsService.saveSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          aiModels: expect.objectContaining({
            anthropic: expect.objectContaining({
              apiKey: 'new-api-key-123'
            })
          })
        })
      );
    });
  });

  it('should persist keyboard shortcuts', async () => {
    const TestApp = () => (
      <SettingsProvider>
        <SettingsModal isOpen={true} onClose={() => {}} />
      </SettingsProvider>
    );

    render(<TestApp />);

    // Navigate to keyboard settings
    fireEvent.click(screen.getByTestId('settings-tab-keyboard'));

    // Edit a shortcut
    fireEvent.click(screen.getByTestId('edit-shortcut-command-palette'));
    
    // Simulate key combination
    const shortcutInput = screen.getByTestId('shortcut-input');
    fireEvent.keyDown(shortcutInput, { key: 'P', ctrlKey: true, altKey: true });
    
    fireEvent.click(screen.getByTestId('save-shortcut'));

    await waitFor(() => {
      expect(mockSettingsService.saveSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          keyboardShortcuts: expect.objectContaining({
            commandPalette: 'Ctrl+Alt+P'
          })
        })
      );
    });
  });

  it('should handle settings migration', async () => {
    // Mock old settings format
    mockStorageService.get.mockResolvedValue({
      version: '1.0.0',
      theme: 'dark',
      // Missing new fields
    });

    mockSettingsService.migrateSettings.mockResolvedValue({
      version: '1.3.0',
      theme: 'dark',
      fontSize: 14, // Default value
      fontFamily: 'Monaco', // Default value
      // ... other migrated fields
    });

    const TestApp = () => (
      <SettingsProvider>
        <div data-testid="app">App Content</div>
      </SettingsProvider>
    );

    render(<TestApp />);

    await waitFor(() => {
      expect(mockSettingsService.migrateSettings).toHaveBeenCalled();
      expect(mockStorageService.set).toHaveBeenCalledWith(
        'omnipanel-settings',
        expect.objectContaining({
          version: '1.3.0'
        })
      );
    });
  });

  it('should handle settings export', async () => {
    const TestApp = () => (
      <SettingsProvider>
        <SettingsModal isOpen={true} onClose={() => {}} />
      </SettingsProvider>
    );

    render(<TestApp />);

    // Click export button
    fireEvent.click(screen.getByTestId('export-settings-button'));

    // Mock file download
    const mockCreateObjectURL = jest.fn(() => 'blob:mock-url');
    const mockRevokeObjectURL = jest.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    // Confirm export
    fireEvent.click(screen.getByTestId('confirm-export'));

    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(screen.getByText('Settings exported successfully')).toBeInTheDocument();
    });
  });

  it('should handle settings import', async () => {
    const TestApp = () => (
      <SettingsProvider>
        <SettingsModal isOpen={true} onClose={() => {}} />
      </SettingsProvider>
    );

    render(<TestApp />);

    // Click import button
    fireEvent.click(screen.getByTestId('import-settings-button'));

    // Mock file upload
    const importedSettings = {
      theme: 'light',
      fontSize: 16,
      fontFamily: 'Fira Code'
    };

    const file = new File([JSON.stringify(importedSettings)], 'settings.json', {
      type: 'application/json'
    });

    const fileInput = screen.getByTestId('settings-file-input');
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockSettingsService.saveSettings).toHaveBeenCalledWith(
        expect.objectContaining(importedSettings)
      );
      expect(screen.getByText('Settings imported successfully')).toBeInTheDocument();
    });
  });

  it('should handle corrupted settings gracefully', async () => {
    // Mock corrupted settings
    mockStorageService.get.mockRejectedValue(new Error('Storage corrupted'));
    mockSettingsService.getSettings.mockRejectedValue(new Error('Settings corrupted'));

    const TestApp = () => (
      <SettingsProvider>
        <div data-testid="app">App Content</div>
      </SettingsProvider>
    );

    render(<TestApp />);

    await waitFor(() => {
      // Should fall back to default settings
      expect(mockSettingsService.getDefaultSettings).toHaveBeenCalled();
      expect(screen.getByTestId('app')).toBeInTheDocument();
    });
  });

  it('should sync settings across multiple tabs', async () => {
    const TestApp = () => (
      <SettingsProvider>
        <SettingsModal isOpen={true} onClose={() => {}} />
      </SettingsProvider>
    );

    render(<TestApp />);

    // Simulate storage event from another tab
    const storageEvent = new StorageEvent('storage', {
      key: 'omnipanel-settings',
      newValue: JSON.stringify({
        theme: 'light',
        fontSize: 16
      }),
      oldValue: JSON.stringify({
        theme: 'dark',
        fontSize: 14
      })
    });

    fireEvent(window, storageEvent);

    await waitFor(() => {
      // Settings should be updated from storage event
      expect(screen.getByTestId('theme-option-light')).toBeChecked();
    });
  });

  it('should validate settings before saving', async () => {
    const TestApp = () => (
      <SettingsProvider>
        <SettingsModal isOpen={true} onClose={() => {}} />
      </SettingsProvider>
    );

    render(<TestApp />);

    // Navigate to general settings
    fireEvent.click(screen.getByTestId('settings-tab-general'));

    // Enter invalid font size
    fireEvent.change(screen.getByTestId('font-size-input'), {
      target: { value: '-5' }
    });

    fireEvent.click(screen.getByTestId('save-settings'));

    await waitFor(() => {
      expect(screen.getByText('Font size must be between 8 and 72')).toBeInTheDocument();
      expect(mockSettingsService.saveSettings).not.toHaveBeenCalled();
    });
  });

  it('should handle partial settings updates', async () => {
    const TestApp = () => (
      <SettingsProvider>
        <SettingsModal isOpen={true} onClose={() => {}} />
      </SettingsProvider>
    );

    render(<TestApp />);

    // Update only theme
    fireEvent.click(screen.getByTestId('settings-tab-theme'));
    fireEvent.click(screen.getByTestId('theme-option-light'));
    fireEvent.click(screen.getByTestId('save-settings'));

    await waitFor(() => {
      expect(mockSettingsService.saveSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          theme: 'light',
          // Other settings should remain unchanged
          fontSize: 14,
          fontFamily: 'Monaco'
        })
      );
    });
  });
}); 
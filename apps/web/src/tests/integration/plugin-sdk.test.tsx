import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { PluginProvider, usePlugins } from '@/components/providers/PluginProvider';
import * as pluginService from '@/services/pluginService';

// Mock the plugin service
jest.mock('@/services/pluginService', () => ({
  initializePluginSystem: jest.fn(),
  getAllPlugins: jest.fn(),
  getEnabledPlugins: jest.fn(),
  enablePlugin: jest.fn(),
  disablePlugin: jest.fn(),
  installPlugin: jest.fn(),
  uninstallPlugin: jest.fn(),
  loadPlugin: jest.fn(),
}));

// Test component that uses the plugins context
function TestComponent() {
  const { 
    plugins, 
    enabledPlugins, 
    isLoading, 
    error, 
    enablePlugin, 
    disablePlugin,
    installPlugin,
    uninstallPlugin,
    refreshPlugins
  } = usePlugins();
  
  return (
    <div data-testid="plugin-test">
      <div data-testid="loading-status">{isLoading ? 'Loading' : 'Ready'}</div>
      <div data-testid="plugin-count">{plugins.length}</div>
      <div data-testid="enabled-count">{enabledPlugins.length}</div>
      {error && <div data-testid="error-message">{error.message}</div>}
      
      <button onClick={() => enablePlugin('test-plugin')} data-testid="enable-button">
        Enable Plugin
      </button>
      <button onClick={() => disablePlugin('test-plugin')} data-testid="disable-button">
        Disable Plugin
      </button>
      <button onClick={() => installPlugin('https://example.com/plugin')} data-testid="install-button">
        Install Plugin
      </button>
      <button onClick={() => uninstallPlugin('test-plugin')} data-testid="uninstall-button">
        Uninstall Plugin
      </button>
      <button onClick={refreshPlugins} data-testid="refresh-button">
        Refresh Plugins
      </button>
    </div>
  );
}

describe('PluginProvider Integration', () => {
  const mockPlugins = [
    {
      manifest: {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        description: 'A test plugin',
        author: 'Test Author',
        category: 'utilities',
        permissions: ['ui', 'storage'],
        main: 'index.js',
        engines: {
          omnipanel: '>=1.0.0'
        }
      },
      path: '/plugins/test-plugin',
      enabled: true
    },
    {
      manifest: {
        id: 'disabled-plugin',
        name: 'Disabled Plugin',
        version: '1.0.0',
        description: 'A disabled plugin',
        author: 'Test Author',
        category: 'utilities',
        permissions: ['ui'],
        main: 'index.js',
        engines: {
          omnipanel: '>=1.0.0'
        }
      },
      path: '/plugins/disabled-plugin',
      enabled: false
    }
  ];
  
  beforeEach(() => {
    jest.clearAllMocks();
    (pluginService.getAllPlugins as jest.Mock).mockReturnValue(mockPlugins);
    (pluginService.getEnabledPlugins as jest.Mock).mockReturnValue([mockPlugins[0]]);
    (pluginService.initializePluginSystem as jest.Mock).mockResolvedValue(undefined);
  });
  
  test('should initialize with loading state', async () => {
    render(
      <PluginProvider>
        <TestComponent />
      </PluginProvider>
    );
    
    expect(screen.getByTestId('loading-status').textContent).toBe('Loading');
    
    await waitFor(() => {
      expect(pluginService.initializePluginSystem).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('loading-status').textContent).toBe('Ready');
    });
  });
  
  test('should provide plugin counts correctly', async () => {
    render(
      <PluginProvider>
        <TestComponent />
      </PluginProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('plugin-count').textContent).toBe('2');
      expect(screen.getByTestId('enabled-count').textContent).toBe('1');
    });
  });
  
  test('should enable a plugin', async () => {
    (pluginService.enablePlugin as jest.Mock).mockResolvedValue(true);
    
    render(
      <PluginProvider>
        <TestComponent />
      </PluginProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('loading-status').textContent).toBe('Ready');
    });
    
    act(() => {
      screen.getByTestId('enable-button').click();
    });
    
    await waitFor(() => {
      expect(pluginService.enablePlugin).toHaveBeenCalledWith('test-plugin');
    });
  });
  
  test('should disable a plugin', async () => {
    (pluginService.disablePlugin as jest.Mock).mockResolvedValue(true);
    
    render(
      <PluginProvider>
        <TestComponent />
      </PluginProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('loading-status').textContent).toBe('Ready');
    });
    
    act(() => {
      screen.getByTestId('disable-button').click();
    });
    
    await waitFor(() => {
      expect(pluginService.disablePlugin).toHaveBeenCalledWith('test-plugin');
    });
  });
  
  test('should install a plugin', async () => {
    (pluginService.installPlugin as jest.Mock).mockResolvedValue({
      success: true,
      plugin: mockPlugins[0]
    });
    
    render(
      <PluginProvider>
        <TestComponent />
      </PluginProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('loading-status').textContent).toBe('Ready');
    });
    
    act(() => {
      screen.getByTestId('install-button').click();
    });
    
    await waitFor(() => {
      expect(pluginService.installPlugin).toHaveBeenCalledWith('https://example.com/plugin');
    });
  });
  
  test('should handle plugin system initialization errors', async () => {
    const testError = new Error('Initialization failed');
    (pluginService.initializePluginSystem as jest.Mock).mockRejectedValue(testError);
    
    render(
      <PluginProvider>
        <TestComponent />
      </PluginProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('loading-status').textContent).toBe('Ready');
      expect(screen.getByTestId('error-message').textContent).toBe(testError.message);
    });
  });
});

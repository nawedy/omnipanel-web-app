import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { DatabaseProvider } from '@/components/providers/DatabaseProvider';
import { useDatabaseContext } from '@/components/providers/DatabaseProvider';
import * as databaseService from '@/services/databaseService';

// Mock the database service
jest.mock('@/services/databaseService', () => ({
  getOmniPanelDatabaseService: jest.fn(),
  testDatabaseConnection: jest.fn(),
}));

// Test component that uses the database context
function TestComponent() {
  const { databaseService, isConnected, isLoading, error, testConnection } = useDatabaseContext();
  
  return (
    <div data-testid="database-test">
      <div data-testid="connection-status">
        {isLoading ? 'Loading' : isConnected ? 'Connected' : 'Disconnected'}
      </div>
      {error && <div data-testid="error-message">{error.message}</div>}
      <button onClick={testConnection} data-testid="test-button">Test Connection</button>
    </div>
  );
}

describe('DatabaseProvider Integration', () => {
  const mockDatabaseService = {
    healthCheck: jest.fn(),
    reset: jest.fn(),
    getVersion: jest.fn(),
    // Add other methods as needed
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    (databaseService.getOmniPanelDatabaseService as jest.Mock).mockReturnValue(mockDatabaseService);
  });
  
  test('should initialize with loading state', () => {
    (databaseService.testDatabaseConnection as jest.Mock).mockResolvedValue(false);
    
    render(
      <DatabaseProvider>
        <TestComponent />
      </DatabaseProvider>
    );
    
    expect(screen.getByTestId('connection-status').textContent).toBe('Loading');
  });
  
  test('should update state when connection test succeeds', async () => {
    (databaseService.testDatabaseConnection as jest.Mock).mockResolvedValue(true);
    
    render(
      <DatabaseProvider>
        <TestComponent />
      </DatabaseProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('connection-status').textContent).toBe('Connected');
    });
  });
  
  test('should update state when connection test fails', async () => {
    (databaseService.testDatabaseConnection as jest.Mock).mockResolvedValue(false);
    
    render(
      <DatabaseProvider>
        <TestComponent />
      </DatabaseProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('connection-status').textContent).toBe('Disconnected');
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });
  });
  
  test('should retry connection when test button is clicked', async () => {
    (databaseService.testDatabaseConnection as jest.Mock)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    
    render(
      <DatabaseProvider>
        <TestComponent />
      </DatabaseProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('connection-status').textContent).toBe('Disconnected');
    });
    
    // Test connection again
    act(() => {
      screen.getByTestId('test-button').click();
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('connection-status').textContent).toBe('Connected');
      expect(databaseService.testDatabaseConnection).toHaveBeenCalledTimes(2);
    });
  });
  
  test('should handle connection errors', async () => {
    const testError = new Error('Connection failed');
    (databaseService.testDatabaseConnection as jest.Mock).mockRejectedValue(testError);
    
    render(
      <DatabaseProvider>
        <TestComponent />
      </DatabaseProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('connection-status').textContent).toBe('Disconnected');
      expect(screen.getByTestId('error-message').textContent).toBe(testError.message);
    });
  });
});

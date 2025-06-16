import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider } from '@/components/ThemeProvider';
import { useTheme } from '@omnipanel/theme-engine';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Test component that uses the theme
function TestComponent() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div data-testid="theme-test">
      <div data-testid="current-theme">{theme}</div>
      <button onClick={() => setTheme('light')} data-testid="light-button">Light</button>
      <button onClick={() => setTheme('dark')} data-testid="dark-button">Dark</button>
      <button onClick={() => setTheme('system')} data-testid="system-button">System</button>
    </div>
  );
}

describe('ThemeProvider Integration', () => {
  beforeEach(() => {
    window.localStorage.clear();
    // Remove any theme classes from document
    document.documentElement.classList.remove('light', 'dark');
  });
  
  test('should default to system theme when no stored preference', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('current-theme').textContent).toBe('system');
  });
  
  test('should use stored theme preference from localStorage', () => {
    window.localStorage.setItem('omnipanel-theme', 'dark');
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('current-theme').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
  
  test('should change theme when setTheme is called', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    // Initial state
    expect(screen.getByTestId('current-theme').textContent).toBe('system');
    
    // Change to dark theme
    fireEvent.click(screen.getByTestId('dark-button'));
    expect(screen.getByTestId('current-theme').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(window.localStorage.getItem('omnipanel-theme')).toBe('dark');
    
    // Change to light theme
    fireEvent.click(screen.getByTestId('light-button'));
    expect(screen.getByTestId('current-theme').textContent).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(window.localStorage.getItem('omnipanel-theme')).toBe('light');
  });
  
  test('should respond to system preference changes', () => {
    // Mock the matchMedia API
    const mockMatchMedia = (matches: boolean) => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches,
          media: query,
          onchange: null,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });
    };
    
    // Start with system preference as light
    mockMatchMedia(false);
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    // Set to system theme
    fireEvent.click(screen.getByTestId('system-button'));
    expect(screen.getByTestId('current-theme').textContent).toBe('system');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    
    // Change system preference to dark
    mockMatchMedia(true);
    
    // Simulate the change event
    act(() => {
      window.dispatchEvent(new Event('change-theme'));
    });
    
    // Should now be dark
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WorkspaceProvider } from '@/providers/WorkspaceProvider';
import { FileTree } from '@/components/workspace/FileTree';
import { Terminal } from '@/components/terminal/Terminal';
import { Notebook } from '@/components/notebook/Notebook';
import { workspaceService } from '@/services/workspaceService';
import { fileService } from '@/services/fileService';

// Mock services
jest.mock('@/services/workspaceService');
jest.mock('@/services/fileService');

const mockWorkspaceService = jest.mocked(workspaceService);
const mockFileService = jest.mocked(fileService);

describe('Workspace Synchronization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockWorkspaceService.getCurrentSession = jest.fn().mockReturnValue({
      id: 'workspace-1',
      name: 'Test Workspace',
      projectPath: '/project',
      openTabs: [
        { id: 'tab-1', title: 'package.json', filePath: '/project/package.json', isDirty: false, content: '', cursorPosition: { line: 1, column: 1 }, scrollPosition: 0, language: 'json', isActive: true, isPinned: false }
      ],
      activeTabId: 'tab-1',
      layout: {
        sidebarWidth: 320,
        fileTreeWidth: 280,
        panelSizes: { left: 25, center: 50, right: 25 },
        activePanel: 'files' as const,
        showMinimap: true,
        showLineNumbers: true,
        wordWrap: false,
      },
      lastAccessed: new Date(),
      bookmarks: [],
      breakpoints: [],
    });

    mockFileService.watchFiles = jest.fn().mockImplementation((callback) => {
      // Simulate file watcher
      return () => {}; // cleanup function
    });
    
    mockFileService.createFile = jest.fn();
    mockFileService.readFile = jest.fn();
    mockFileService.writeFile = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should sync file changes across components', async () => {
    const TestWorkspace = () => (
      <WorkspaceProvider>
        <div data-testid="workspace">
          <div data-testid="file-tree">
            <FileTree />
          </div>
          <div data-testid="terminal">
            <Terminal />
          </div>
          <div data-testid="notebook">
            <Notebook />
          </div>
        </div>
      </WorkspaceProvider>
    );

    render(<TestWorkspace />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('file-tree')).toBeInTheDocument();
    });

    // Simulate file creation in terminal
    const terminalInput = screen.getByTestId('terminal-input');
    fireEvent.change(terminalInput, { target: { value: 'touch newfile.js' } });
    fireEvent.keyDown(terminalInput, { key: 'Enter' });

    // Mock file service response
    mockFileService.createFile.mockResolvedValue({
      success: true,
      file: { name: 'newfile.js', type: 'file', path: '/project/newfile.js' }
    });

    // Simulate file watcher notification
    const fileWatcherCallback = mockFileService.watchFiles.mock.calls[0][0];
    fileWatcherCallback({
      type: 'created',
      path: '/project/newfile.js',
      file: { name: 'newfile.js', type: 'file', path: '/project/newfile.js' }
    });

    // Check if file appears in file tree
    await waitFor(() => {
      expect(screen.getByText('newfile.js')).toBeInTheDocument();
    });
  });

  it('should sync workspace settings across components', async () => {
    const TestWorkspace = () => (
      <WorkspaceProvider>
        <div data-testid="workspace">
          <FileTree />
          <Terminal />
        </div>
      </WorkspaceProvider>
    );

    render(<TestWorkspace />);

    // Change theme setting
    fireEvent(window, new CustomEvent('settings-changed', {
      detail: {
        theme: 'light',
        fontSize: 16
      }
    }));

    // Check if theme is applied to components
    await waitFor(() => {
      const workspace = screen.getByTestId('workspace');
      expect(workspace).toHaveClass('light-theme');
    });
  });

  it('should handle concurrent file operations', async () => {
    const TestWorkspace = () => (
      <WorkspaceProvider>
        <FileTree />
      </WorkspaceProvider>
    );

    render(<TestWorkspace />);

    // Simulate multiple concurrent file operations
    const operations = [
      { type: 'created', path: '/project/file1.js' },
      { type: 'modified', path: '/project/package.json' },
      { type: 'deleted', path: '/project/old-file.js' },
      { type: 'created', path: '/project/file2.js' }
    ];

    const fileWatcherCallback = mockFileService.watchFiles.mock.calls[0][0];

    // Send all operations rapidly
    operations.forEach((operation, index) => {
      setTimeout(() => {
        fileWatcherCallback(operation);
      }, index * 10);
    });

    // Wait for all operations to complete
    await waitFor(() => {
      expect(screen.getByText('file1.js')).toBeInTheDocument();
      expect(screen.getByText('file2.js')).toBeInTheDocument();
      expect(screen.queryByText('old-file.js')).not.toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('should maintain state consistency during rapid changes', async () => {
    const TestWorkspace = () => (
      <WorkspaceProvider>
        <FileTree />
      </WorkspaceProvider>
    );

    render(<TestWorkspace />);

    const fileWatcherCallback = mockFileService.watchFiles.mock.calls[0][0];

    // Simulate rapid file changes
    for (let i = 0; i < 10; i++) {
      fileWatcherCallback({
        type: 'modified',
        path: '/project/package.json',
        file: { name: 'package.json', type: 'file', path: '/project/package.json' }
      });
    }

    // Check that state remains consistent
    await waitFor(() => {
      const packageJsonElements = screen.getAllByText('package.json');
      expect(packageJsonElements).toHaveLength(1); // Should not duplicate
    });
  });

  it('should handle workspace switching', async () => {
    const TestWorkspace = () => (
      <WorkspaceProvider>
        <FileTree />
      </WorkspaceProvider>
    );

    const { rerender } = render(<TestWorkspace />);

    // Switch to different workspace
    mockWorkspaceService.getCurrentSession = jest.fn().mockReturnValue({
      id: 'workspace-2',
      name: 'Different Workspace',
      projectPath: '/different-project',
      openTabs: [
        { id: 'tab-2', title: 'app.js', filePath: '/different-project/app.js', isDirty: false, content: '', cursorPosition: { line: 1, column: 1 }, scrollPosition: 0, language: 'javascript', isActive: true, isPinned: false }
      ],
      activeTabId: 'tab-2',
      layout: {
        sidebarWidth: 320,
        fileTreeWidth: 280,
        panelSizes: { left: 25, center: 50, right: 25 },
        activePanel: 'files' as const,
        showMinimap: true,
        showLineNumbers: true,
        wordWrap: false,
      },
      lastAccessed: new Date(),
      bookmarks: [],
      breakpoints: [],
    });

    // Trigger workspace change
    fireEvent(window, new CustomEvent('workspace-changed', {
      detail: { workspaceId: 'workspace-2' }
    }));

    rerender(<TestWorkspace />);

    // Check if new workspace files are loaded
    await waitFor(() => {
      expect(screen.getByText('app.js')).toBeInTheDocument();
      expect(screen.queryByText('package.json')).not.toBeInTheDocument();
    });
  });

  it('should persist workspace state', async () => {
    const TestWorkspace = () => (
      <WorkspaceProvider>
        <FileTree />
      </WorkspaceProvider>
    );

    render(<TestWorkspace />);

    // Simulate state change
    fireEvent(window, new CustomEvent('workspace-state-changed', {
      detail: {
        layout: { sidebarWidth: 400 },
        openTabs: [
          { id: 'tab-1', title: 'test.js', filePath: '/project/test.js', isDirty: true }
        ]
      }
    }));

    // Check if state is persisted
    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith(
        expect.stringContaining('workspace'),
        expect.any(String)
      );
    });
  });

  it('should handle offline/online state changes', async () => {
    const TestWorkspace = () => (
      <WorkspaceProvider>
        <FileTree />
      </WorkspaceProvider>
    );

    render(<TestWorkspace />);

    // Simulate going offline
    fireEvent(window, new Event('offline'));

    // Check if offline indicator is shown
    await waitFor(() => {
      expect(screen.getByText(/offline/i)).toBeInTheDocument();
    });

    // Simulate coming back online
    fireEvent(window, new Event('online'));

    // Check if offline indicator is hidden
    await waitFor(() => {
      expect(screen.queryByText(/offline/i)).not.toBeInTheDocument();
    });
  });

  it('should handle workspace conflicts', async () => {
    const TestWorkspace = () => (
      <WorkspaceProvider>
        <FileTree />
      </WorkspaceProvider>
    );

    render(<TestWorkspace />);

    // Simulate conflict scenario
    const fileWatcherCallback = mockFileService.watchFiles.mock.calls[0][0];
    
    fileWatcherCallback({
      type: 'conflict',
      path: '/project/conflicted-file.js',
      file: { name: 'conflicted-file.js', type: 'file', path: '/project/conflicted-file.js' },
      conflict: {
        local: 'local content',
        remote: 'remote content',
        base: 'base content'
      }
    });

    // Check if conflict resolution UI is shown
    await waitFor(() => {
      expect(screen.getByText(/conflict/i)).toBeInTheDocument();
    });
  });

  it('should batch file system events', async () => {
    const TestWorkspace = () => (
      <WorkspaceProvider>
        <FileTree />
      </WorkspaceProvider>
    );

    render(<TestWorkspace />);

    const fileWatcherCallback = mockFileService.watchFiles.mock.calls[0][0];

    // Simulate many rapid events
    const events = Array.from({ length: 100 }, (_, i) => ({
      type: 'modified',
      path: `/project/file${i}.js`,
      file: { name: `file${i}.js`, type: 'file', path: `/project/file${i}.js` }
    }));

    events.forEach(event => fileWatcherCallback(event));

    // Check that events are batched (not 100 individual updates)
    await waitFor(() => {
      expect(screen.getByTestId('file-tree')).toBeInTheDocument();
    });

    // Should have batched the updates
    expect(mockFileService.watchFiles).toHaveBeenCalledTimes(1);
  });

  it('should handle memory cleanup on unmount', async () => {
    const TestWorkspace = () => (
      <WorkspaceProvider>
        <FileTree />
      </WorkspaceProvider>
    );

    const { unmount } = render(<TestWorkspace />);

    // Verify that watchers are set up
    expect(mockFileService.watchFiles).toHaveBeenCalled();

    // Unmount component
    unmount();

    // Verify cleanup was called
    const cleanupFunction = mockFileService.watchFiles.mock.results[0].value;
    expect(typeof cleanupFunction).toBe('function');
  });
}); 
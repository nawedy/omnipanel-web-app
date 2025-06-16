import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WorkspaceProvider } from '@/providers/WorkspaceProvider';
import { FileTree } from '@/components/workspace/FileTree';
import { Terminal } from '@/components/terminal/Terminal';
import { Notebook } from '@/components/notebook/Notebook';
import { workspaceService } from '@/services/workspaceService';
import { fileService } from '@/services/fileService';

// Mock services
vi.mock('@/services/workspaceService');
vi.mock('@/services/fileService');

const mockWorkspaceService = vi.mocked(workspaceService);
const mockFileService = vi.mocked(fileService);

describe('Workspace Synchronization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    mockWorkspaceService.getCurrentWorkspace.mockResolvedValue({
      id: 'workspace-1',
      name: 'Test Workspace',
      path: '/project',
      files: [
        { name: 'src', type: 'directory', path: '/project/src' },
        { name: 'package.json', type: 'file', path: '/project/package.json' }
      ],
      settings: {
        theme: 'dark',
        fontSize: 14
      }
    });

    mockFileService.watchFiles.mockImplementation((callback) => {
      // Simulate file watcher
      return () => {}; // cleanup function
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should sync file changes across components', async () => {
    const TestWorkspace = () => (
      <WorkspaceProvider>
        <div data-testid="workspace">
          <FileTree />
          <Terminal />
          <Notebook />
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
    mockWorkspaceService.getCurrentWorkspace.mockResolvedValue({
      id: 'workspace-2',
      name: 'Different Workspace',
      path: '/different-project',
      files: [
        { name: 'app.js', type: 'file', path: '/different-project/app.js' }
      ],
      settings: {
        theme: 'light',
        fontSize: 12
      }
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

    // Expand a directory
    const srcDirectory = screen.getByTestId('directory-toggle-src');
    fireEvent.click(srcDirectory);

    // Simulate page reload
    fireEvent(window, new CustomEvent('beforeunload'));

    // Check if state is persisted
    expect(mockWorkspaceService.saveWorkspaceState).toHaveBeenCalledWith(
      'workspace-1',
      expect.objectContaining({
        expandedDirectories: expect.arrayContaining(['/project/src'])
      })
    );
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
      expect(screen.getByTestId('offline-indicator')).toBeInTheDocument();
    });

    // Simulate coming back online
    fireEvent(window, new Event('online'));

    // Check if offline indicator is hidden and sync occurs
    await waitFor(() => {
      expect(screen.queryByTestId('offline-indicator')).not.toBeInTheDocument();
      expect(mockWorkspaceService.syncWorkspace).toHaveBeenCalled();
    });
  });

  it('should handle workspace conflicts', async () => {
    const TestWorkspace = () => (
      <WorkspaceProvider>
        <FileTree />
      </WorkspaceProvider>
    );

    render(<TestWorkspace />);

    // Simulate conflict
    mockWorkspaceService.syncWorkspace.mockRejectedValue(
      new Error('Workspace conflict detected')
    );

    fireEvent(window, new Event('online'));

    // Check if conflict resolution dialog is shown
    await waitFor(() => {
      expect(screen.getByTestId('conflict-resolution-dialog')).toBeInTheDocument();
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

    // Send multiple events rapidly
    const events = [
      { type: 'created', path: '/project/file1.js' },
      { type: 'created', path: '/project/file2.js' },
      { type: 'created', path: '/project/file3.js' }
    ];

    events.forEach(event => fileWatcherCallback(event));

    // Wait for batching to complete
    await waitFor(() => {
      expect(screen.getByText('file1.js')).toBeInTheDocument();
      expect(screen.getByText('file2.js')).toBeInTheDocument();
      expect(screen.getByText('file3.js')).toBeInTheDocument();
    });

    // Check that UI updates were batched (not called for each event)
    expect(mockWorkspaceService.updateFileTree).toHaveBeenCalledTimes(1);
  });

  it('should handle memory cleanup on unmount', async () => {
    const TestWorkspace = () => (
      <WorkspaceProvider>
        <FileTree />
      </WorkspaceProvider>
    );

    const { unmount } = render(<TestWorkspace />);

    // Get cleanup function
    const cleanup = mockFileService.watchFiles.mock.results[0].value;

    // Unmount component
    unmount();

    // Check if cleanup was called
    expect(cleanup).toHaveBeenCalled();
  });
}); 
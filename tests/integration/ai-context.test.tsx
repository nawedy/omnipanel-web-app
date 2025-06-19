import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { ContextProvider } from '@/providers/ContextProvider';
import { contextService } from '@/services/contextService';
import { aiService } from '@/services/aiService';

// Mock services
jest.mock('@/services/contextService');
jest.mock('@/services/aiService');

const mockContextService = jest.mocked(contextService);
const mockAiService = jest.mocked(aiService);

describe('AI Context Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockContextService.getWorkspaceContext.mockResolvedValue({
      currentFile: '/project/src/index.js',
      openFiles: ['/project/src/index.js', '/project/package.json'],
      recentFiles: ['/project/src/utils.js'],
      projectStructure: {
        name: 'test-project',
        files: ['src/index.js', 'package.json', 'README.md']
      },
      terminalHistory: ['npm install', 'npm start'],
      notebookCells: []
    });

    mockAiService.sendMessage.mockResolvedValue({
      content: 'AI response based on context',
      metadata: {
        tokensUsed: 150,
        model: 'gpt-4',
        contextUsed: true
      }
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should provide workspace context to AI service', async () => {
    render(
      <ContextProvider>
        <ChatInterface />
      </ContextProvider>
    );

    const input = screen.getByTestId('chat-input');
    const sendButton = screen.getByTestId('send-button');

    // Send a message
    fireEvent.change(input, { target: { value: 'Help me with this file' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockContextService.getWorkspaceContext).toHaveBeenCalled();
      expect(mockAiService.sendMessage).toHaveBeenCalledWith(
        'Help me with this file',
        expect.objectContaining({
          context: expect.objectContaining({
            currentFile: '/project/src/index.js',
            openFiles: expect.arrayContaining(['/project/src/index.js']),
            projectStructure: expect.any(Object)
          })
        })
      );
    });
  });

  it('should update context when files change', async () => {
    const { rerender } = render(
      <ContextProvider>
        <ChatInterface />
      </ContextProvider>
    );

    // Simulate file change
    mockContextService.getWorkspaceContext.mockResolvedValue({
      currentFile: '/project/src/utils.js',
      openFiles: ['/project/src/utils.js'],
      recentFiles: ['/project/src/index.js'],
      projectStructure: {
        name: 'test-project',
        files: ['src/index.js', 'src/utils.js', 'package.json']
      },
      terminalHistory: ['npm install', 'npm start'],
      notebookCells: []
    });

    // Trigger context update
    fireEvent(window, new CustomEvent('file-changed', {
      detail: { file: '/project/src/utils.js' }
    }));

    rerender(
      <ContextProvider>
        <ChatInterface />
      </ContextProvider>
    );

    const input = screen.getByTestId('chat-input');
    const sendButton = screen.getByTestId('send-button');

    fireEvent.change(input, { target: { value: 'Analyze this new file' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockAiService.sendMessage).toHaveBeenCalledWith(
        'Analyze this new file',
        expect.objectContaining({
          context: expect.objectContaining({
            currentFile: '/project/src/utils.js'
          })
        })
      );
    });
  });

  it('should include terminal history in context', async () => {
    mockContextService.getWorkspaceContext.mockResolvedValue({
      currentFile: null,
      openFiles: [],
      recentFiles: [],
      projectStructure: { name: 'test-project', files: [] },
      terminalHistory: [
        'npm install express',
        'npm run build',
        'Error: Module not found'
      ],
      notebookCells: []
    });

    render(
      <ContextProvider>
        <ChatInterface />
      </ContextProvider>
    );

    const input = screen.getByTestId('chat-input');
    const sendButton = screen.getByTestId('send-button');

    fireEvent.change(input, { target: { value: 'Help me fix this error' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockAiService.sendMessage).toHaveBeenCalledWith(
        'Help me fix this error',
        expect.objectContaining({
          context: expect.objectContaining({
            terminalHistory: expect.arrayContaining([
              'npm install express',
              'npm run build',
              'Error: Module not found'
            ])
          })
        })
      );
    });
  });

  it('should include notebook cells in context', async () => {
    mockContextService.getWorkspaceContext.mockResolvedValue({
      currentFile: null,
      openFiles: [],
      recentFiles: [],
      projectStructure: { name: 'test-project', files: [] },
      terminalHistory: [],
      notebookCells: [
        {
          id: 'cell-1',
          type: 'code',
          content: 'console.log("Hello World");',
          language: 'javascript'
        },
        {
          id: 'cell-2',
          type: 'markdown',
          content: '# My Analysis',
          language: 'markdown'
        }
      ]
    });

    render(
      <ContextProvider>
        <ChatInterface />
      </ContextProvider>
    );

    const input = screen.getByTestId('chat-input');
    const sendButton = screen.getByTestId('send-button');

    fireEvent.change(input, { target: { value: 'Explain my notebook' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockAiService.sendMessage).toHaveBeenCalledWith(
        'Explain my notebook',
        expect.objectContaining({
          context: expect.objectContaining({
            notebookCells: expect.arrayContaining([
              expect.objectContaining({
                content: 'console.log("Hello World");',
                language: 'javascript'
              })
            ])
          })
        })
      );
    });
  });

  it('should handle context service errors gracefully', async () => {
    mockContextService.getWorkspaceContext.mockRejectedValue(
      new Error('Context service unavailable')
    );

    render(
      <ContextProvider>
        <ChatInterface />
      </ContextProvider>
    );

    const input = screen.getByTestId('chat-input');
    const sendButton = screen.getByTestId('send-button');

    fireEvent.change(input, { target: { value: 'Help me' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      // Should still send message but without context
      expect(mockAiService.sendMessage).toHaveBeenCalledWith(
        'Help me',
        expect.objectContaining({
          context: null
        })
      );
    });
  });

  it('should cache context for performance', async () => {
    render(
      <ContextProvider>
        <ChatInterface />
      </ContextProvider>
    );

    const input = screen.getByTestId('chat-input');
    const sendButton = screen.getByTestId('send-button');

    // Send first message
    fireEvent.change(input, { target: { value: 'First message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockContextService.getWorkspaceContext).toHaveBeenCalledTimes(1);
    });

    // Send second message quickly
    fireEvent.change(input, { target: { value: 'Second message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      // Should use cached context, not call service again
      expect(mockContextService.getWorkspaceContext).toHaveBeenCalledTimes(1);
    });
  });

  it('should invalidate context cache when workspace changes', async () => {
    render(
      <ContextProvider>
        <ChatInterface />
      </ContextProvider>
    );

    const input = screen.getByTestId('chat-input');
    const sendButton = screen.getByTestId('send-button');

    // Send first message
    fireEvent.change(input, { target: { value: 'First message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockContextService.getWorkspaceContext).toHaveBeenCalledTimes(1);
    });

    // Simulate workspace change
    fireEvent(window, new CustomEvent('workspace-changed'));

    // Send second message
    fireEvent.change(input, { target: { value: 'Second message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      // Should fetch fresh context
      expect(mockContextService.getWorkspaceContext).toHaveBeenCalledTimes(2);
    });
  });

  it('should provide context-aware suggestions', async () => {
    mockAiService.getSuggestions.mockResolvedValue([
      'Fix the import error in index.js',
      'Add error handling to the API call',
      'Update the package.json dependencies'
    ]);

    render(
      <ContextProvider>
        <ChatInterface />
      </ContextProvider>
    );

    // Trigger suggestions
    fireEvent(window, new CustomEvent('request-suggestions'));

    await waitFor(() => {
      expect(mockAiService.getSuggestions).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            currentFile: '/project/src/index.js'
          })
        })
      );
    });

    // Check if suggestions are displayed
    await waitFor(() => {
      expect(screen.getByText('Fix the import error in index.js')).toBeInTheDocument();
    });
  });
}); 
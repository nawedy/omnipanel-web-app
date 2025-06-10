import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { mockData } from '../../fixtures/mock-data';

// Mock the CodeBlock component
jest.mock('@/components/ui/CodeBlock', () => {
  return function MockCodeBlock({ children, language }: any) {
    return (
      <div data-testid="code-block" data-language={language}>
        {children}
      </div>
    );
  };
});

// Mock the Avatar component
jest.mock('@/components/ui/Avatar', () => {
  return function MockAvatar({ src, alt }: any) {
    return <img data-testid="avatar" src={src} alt={alt} />;
  };
});

describe('ChatMessage Component', () => {
  const defaultProps = {
    message: mockData.messages[0],
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onCopy: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Messages', () => {
    it('renders user message correctly', () => {
      render(<ChatMessage {...defaultProps} />);
      
      expect(screen.getByText(mockData.messages[0].content)).toBeInTheDocument();
      expect(screen.getByTestId('user-avatar')).toBeInTheDocument();
      expect(screen.getByTestId('message-timestamp')).toBeInTheDocument();
    });

    it('shows user avatar and name', () => {
      render(<ChatMessage {...defaultProps} />);
      
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveAttribute('alt', 'Test User');
    });

    it('allows editing user messages', async () => {
      const user = userEvent.setup();
      render(<ChatMessage {...defaultProps} />);
      
      // Open message menu
      const menuButton = screen.getByTestId('message-menu');
      await user.click(menuButton);
      
      // Click edit option
      const editButton = screen.getByTestId('edit-message');
      await user.click(editButton);
      
      expect(defaultProps.onEdit).toHaveBeenCalledWith(mockData.messages[0].id);
    });
  });

  describe('Assistant Messages', () => {
    const assistantMessage = mockData.messages[1];

    it('renders assistant message correctly', () => {
      render(<ChatMessage {...defaultProps} message={assistantMessage} />);
      
      expect(screen.getByText(assistantMessage.content)).toBeInTheDocument();
      expect(screen.getByTestId('assistant-avatar')).toBeInTheDocument();
    });

    it('shows streaming indicator when message is streaming', () => {
      const streamingMessage = {
        ...assistantMessage,
        streaming: true
      };
      
      render(<ChatMessage {...defaultProps} message={streamingMessage} />);
      
      expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
    });

    it('displays token usage information', () => {
      render(<ChatMessage {...defaultProps} message={assistantMessage} />);
      
      expect(screen.getByTestId('token-usage')).toBeInTheDocument();
      expect(screen.getByText('28 tokens')).toBeInTheDocument();
    });

    it('shows model information', () => {
      render(<ChatMessage {...defaultProps} message={assistantMessage} />);
      
      expect(screen.getByTestId('model-info')).toBeInTheDocument();
      expect(screen.getByText('gpt-4')).toBeInTheDocument();
    });
  });

  describe('Code Blocks', () => {
    const messageWithCode = mockData.messages[3]; // Message with code block

    it('renders code blocks correctly', () => {
      render(<ChatMessage {...defaultProps} message={messageWithCode} />);
      
      const codeBlocks = screen.getAllByTestId('code-block');
      expect(codeBlocks).toHaveLength(1);
      expect(codeBlocks[0]).toHaveAttribute('data-language', 'tsx');
    });

    it('allows copying code to clipboard', async () => {
      const user = userEvent.setup();
      
      // Mock clipboard API
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined),
        },
      });

      render(<ChatMessage {...defaultProps} message={messageWithCode} />);
      
      const copyButton = screen.getByTestId('copy-code-button');
      await user.click(copyButton);
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        messageWithCode.metadata.codeBlocks[0].content
      );
    });

    it('allows copying code to editor', async () => {
      const user = userEvent.setup();
      render(<ChatMessage {...defaultProps} message={messageWithCode} />);
      
      const copyToEditorButton = screen.getByTestId('copy-to-editor-button');
      await user.click(copyToEditorButton);
      
      expect(defaultProps.onCopy).toHaveBeenCalledWith(
        messageWithCode.metadata.codeBlocks[0].content,
        'editor'
      );
    });
  });

  describe('Message Actions', () => {
    it('shows message menu on hover', async () => {
      const user = userEvent.setup();
      render(<ChatMessage {...defaultProps} />);
      
      const messageContainer = screen.getByTestId('message-container');
      await user.hover(messageContainer);
      
      expect(screen.getByTestId('message-actions')).toBeVisible();
    });

    it('allows copying message content', async () => {
      const user = userEvent.setup();
      
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined),
        },
      });

      render(<ChatMessage {...defaultProps} />);
      
      const copyButton = screen.getByTestId('copy-message-button');
      await user.click(copyButton);
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        mockData.messages[0].content
      );
    });

    it('allows deleting messages', async () => {
      const user = userEvent.setup();
      render(<ChatMessage {...defaultProps} />);
      
      const deleteButton = screen.getByTestId('delete-message-button');
      await user.click(deleteButton);
      
      // Confirm deletion in modal
      const confirmButton = screen.getByTestId('confirm-delete');
      await user.click(confirmButton);
      
      expect(defaultProps.onDelete).toHaveBeenCalledWith(mockData.messages[0].id);
    });

    it('allows regenerating assistant responses', async () => {
      const user = userEvent.setup();
      const assistantMessage = mockData.messages[1];
      const onRegenerate = jest.fn();
      
      render(
        <ChatMessage 
          {...defaultProps} 
          message={assistantMessage}
          onRegenerate={onRegenerate}
        />
      );
      
      const regenerateButton = screen.getByTestId('regenerate-button');
      await user.click(regenerateButton);
      
      expect(onRegenerate).toHaveBeenCalledWith(assistantMessage.id);
    });
  });

  describe('Markdown Rendering', () => {
    const messageWithMarkdown = {
      ...mockData.messages[0],
      content: '# Heading\n\n**Bold text** and *italic text*\n\n- List item 1\n- List item 2'
    };

    it('renders markdown content correctly', () => {
      render(<ChatMessage {...defaultProps} message={messageWithMarkdown} />);
      
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Heading');
      expect(screen.getByText('Bold text')).toHaveClass('font-bold');
      expect(screen.getByText('italic text')).toHaveClass('italic');
    });

    it('renders lists correctly', () => {
      render(<ChatMessage {...defaultProps} message={messageWithMarkdown} />);
      
      expect(screen.getByRole('list')).toBeInTheDocument();
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });
  });

  describe('Error Handling', () => {
    it('handles missing message gracefully', () => {
      const { container } = render(
        <ChatMessage {...defaultProps} message={null} />
      );
      
      expect(container.firstChild).toBeNull();
    });

    it('shows error state for failed messages', () => {
      const errorMessage = {
        ...mockData.messages[0],
        error: 'Failed to send message'
      };
      
      render(<ChatMessage {...defaultProps} message={errorMessage} />);
      
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText('Failed to send message')).toBeInTheDocument();
    });

    it('shows retry button for failed messages', async () => {
      const user = userEvent.setup();
      const onRetry = jest.fn();
      const errorMessage = {
        ...mockData.messages[0],
        error: 'Network error'
      };
      
      render(
        <ChatMessage 
          {...defaultProps} 
          message={errorMessage}
          onRetry={onRetry}
        />
      );
      
      const retryButton = screen.getByTestId('retry-button');
      await user.click(retryButton);
      
      expect(onRetry).toHaveBeenCalledWith(errorMessage.id);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<ChatMessage {...defaultProps} />);
      
      const messageContainer = screen.getByTestId('message-container');
      expect(messageContainer).toHaveAttribute('role', 'article');
      expect(messageContainer).toHaveAttribute('aria-label');
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<ChatMessage {...defaultProps} />);
      
      const messageContainer = screen.getByTestId('message-container');
      messageContainer.focus();
      
      // Test keyboard interaction
      await user.keyboard('{Enter}');
      
      // Should open message menu
      expect(screen.getByTestId('message-actions')).toBeVisible();
    });

    it('has proper focus management', async () => {
      const user = userEvent.setup();
      render(<ChatMessage {...defaultProps} />);
      
      const menuButton = screen.getByTestId('message-menu');
      await user.tab();
      
      expect(menuButton).toHaveFocus();
    });
  });

  describe('Performance', () => {
    it('memoizes expensive operations', () => {
      const { rerender } = render(<ChatMessage {...defaultProps} />);
      
      // Spy on expensive operations
      const processContentSpy = jest.spyOn(
        require('@/utils/markdown'), 
        'processMarkdown'
      );
      
      // Rerender with same props
      rerender(<ChatMessage {...defaultProps} />);
      
      // Should not call expensive operations again
      expect(processContentSpy).toHaveBeenCalledTimes(1);
    });

    it('lazy loads code highlighting', async () => {
      const messageWithCode = mockData.messages[3];
      
      render(<ChatMessage {...defaultProps} message={messageWithCode} />);
      
      // Code block should be present but highlighting should load asynchronously
      const codeBlock = screen.getByTestId('code-block');
      expect(codeBlock).toBeInTheDocument();
      
      // Wait for syntax highlighting to load
      await screen.findByTestId('syntax-highlighted');
    });
  });
}); 
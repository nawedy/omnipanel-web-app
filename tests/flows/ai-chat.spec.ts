import { test, expect } from '@playwright/test';

test.describe('AI Chat Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/workspace');
    await page.click('[data-testid="tool-chat"]');
  });

  test('should initialize chat interface correctly', async ({ page }) => {
    // Verify chat interface is loaded
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
    await expect(page.locator('[data-testid="chat-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="chat-messages"]')).toBeVisible();
    await expect(page.locator('[data-testid="chat-send-button"]')).toBeVisible();
    
    // Check AI model selector
    await expect(page.locator('[data-testid="ai-model-selector"]')).toBeVisible();
    
    // Verify default welcome message
    await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="welcome-message"]')).toContainText('Hello! I\'m your AI assistant');
  });

  test('should send and receive messages', async ({ page }) => {
    const testMessage = 'Hello, can you help me with JavaScript?';
    
    // Type message
    await page.fill('[data-testid="chat-input"]', testMessage);
    
    // Send message
    await page.click('[data-testid="chat-send-button"]');
    
    // Verify user message appears
    await expect(page.locator('[data-testid="user-message"]').last()).toContainText(testMessage);
    
    // Verify AI response appears
    await expect(page.locator('[data-testid="ai-response"]').last()).toBeVisible();
    await expect(page.locator('[data-testid="typing-indicator"]')).toBeVisible();
    
    // Wait for response completion
    await page.waitForSelector('[data-testid="typing-indicator"]', { state: 'hidden' });
    await expect(page.locator('[data-testid="ai-response"]').last()).toContainText(/JavaScript/i);
  });

  test('should support keyboard shortcuts for chat', async ({ page }) => {
    // Test Enter to send
    await page.fill('[data-testid="chat-input"]', 'Test message 1');
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-testid="user-message"]').last()).toContainText('Test message 1');
    
    // Test Shift+Enter for new line
    await page.fill('[data-testid="chat-input"]', 'Line 1');
    await page.keyboard.press('Shift+Enter');
    await page.type('[data-testid="chat-input"]', 'Line 2');
    await expect(page.locator('[data-testid="chat-input"]')).toHaveValue('Line 1\nLine 2');
    
    // Test Escape to clear input
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="chat-input"]')).toHaveValue('');
    
    // Test Ctrl+L to clear chat
    await page.keyboard.press('Control+l');
    await expect(page.locator('[data-testid="user-message"]')).toHaveCount(0);
  });

  test('should switch between AI models', async ({ page }) => {
    // Open model selector
    await page.click('[data-testid="ai-model-selector"]');
    await expect(page.locator('[data-testid="model-dropdown"]')).toBeVisible();
    
    // Verify available models
    const models = ['GPT-4', 'GPT-3.5', 'Claude', 'Llama 2', 'Local Model'];
    for (const model of models) {
      await expect(page.locator(`[data-testid="model-${model.toLowerCase().replace(/[^a-z0-9]/g, '-')}"]`)).toBeVisible();
    }
    
    // Switch to different model
    await page.click('[data-testid="model-claude"]');
    await expect(page.locator('[data-testid="current-model"]')).toContainText('Claude');
    
    // Verify model switch notification
    await expect(page.locator('[data-testid="model-switch-notification"]')).toBeVisible();
    await expect(page.locator('[data-testid="model-switch-notification"]')).toContainText('Switched to Claude');
  });

  test('should handle conversation context', async ({ page }) => {
    // Send initial message
    await page.fill('[data-testid="chat-input"]', 'My name is John');
    await page.click('[data-testid="chat-send-button"]');
    await page.waitForSelector('[data-testid="typing-indicator"]', { state: 'hidden' });
    
    // Send follow-up message
    await page.fill('[data-testid="chat-input"]', 'What is my name?');
    await page.click('[data-testid="chat-send-button"]');
    await page.waitForSelector('[data-testid="typing-indicator"]', { state: 'hidden' });
    
    // Verify AI remembers context
    await expect(page.locator('[data-testid="ai-response"]').last()).toContainText(/John/i);
    
    // Test context limit
    for (let i = 0; i < 20; i++) {
      await page.fill('[data-testid="chat-input"]', `Message ${i}`);
      await page.click('[data-testid="chat-send-button"]');
      await page.waitForSelector('[data-testid="typing-indicator"]', { state: 'hidden' });
    }
    
    // Verify context window management
    await expect(page.locator('[data-testid="context-indicator"]')).toBeVisible();
  });

  test('should support file uploads and attachments', async ({ page }) => {
    // Test file upload button
    await expect(page.locator('[data-testid="file-upload-button"]')).toBeVisible();
    
    // Mock file upload
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('[data-testid="file-upload-button"]');
    const fileChooser = await fileChooserPromise;
    
    // Simulate file selection
    await fileChooser.setFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('This is a test file content')
    });
    
    // Verify file attachment
    await expect(page.locator('[data-testid="file-attachment"]')).toBeVisible();
    await expect(page.locator('[data-testid="file-attachment"]')).toContainText('test.txt');
    
    // Send message with attachment
    await page.fill('[data-testid="chat-input"]', 'Please analyze this file');
    await page.click('[data-testid="chat-send-button"]');
    
    // Verify message includes file reference
    await expect(page.locator('[data-testid="user-message"]').last()).toContainText('test.txt');
  });

  test('should support code blocks and syntax highlighting', async ({ page }) => {
    // Send message requesting code
    await page.fill('[data-testid="chat-input"]', 'Show me a JavaScript function to sort an array');
    await page.click('[data-testid="chat-send-button"]');
    await page.waitForSelector('[data-testid="typing-indicator"]', { state: 'hidden' });
    
    // Verify code block appears
    await expect(page.locator('[data-testid="code-block"]')).toBeVisible();
    await expect(page.locator('[data-testid="code-block"] .language-javascript')).toBeVisible();
    
    // Test copy code functionality
    await page.hover('[data-testid="code-block"]');
    await expect(page.locator('[data-testid="copy-code-button"]')).toBeVisible();
    
    await page.click('[data-testid="copy-code-button"]');
    await expect(page.locator('[data-testid="copy-success"]')).toBeVisible();
    
    // Test run code functionality
    await expect(page.locator('[data-testid="run-code-button"]')).toBeVisible();
    await page.click('[data-testid="run-code-button"]');
    await expect(page.locator('[data-testid="code-output"]')).toBeVisible();
  });

  test('should handle streaming responses', async ({ page }) => {
    // Send message
    await page.fill('[data-testid="chat-input"]', 'Write a long explanation about React hooks');
    await page.click('[data-testid="chat-send-button"]');
    
    // Verify streaming indicator
    await expect(page.locator('[data-testid="typing-indicator"]')).toBeVisible();
    
    // Monitor response building up
    const responseLocator = page.locator('[data-testid="ai-response"]').last();
    
    // Wait for first content
    await expect(responseLocator).toContainText(/React/i);
    
    // Verify content continues to build
    await page.waitForTimeout(1000);
    const initialLength = await responseLocator.textContent();
    
    await page.waitForTimeout(2000);
    const laterLength = await responseLocator.textContent();
    
    expect(laterLength!.length).toBeGreaterThan(initialLength!.length);
    
    // Test stop generation
    await page.click('[data-testid="stop-generation-button"]');
    await expect(page.locator('[data-testid="typing-indicator"]')).toBeHidden();
  });

  test('should support conversation management', async ({ page }) => {
    // Create new conversation
    await page.click('[data-testid="new-conversation-button"]');
    await expect(page.locator('[data-testid="chat-messages"]').locator('[data-testid="user-message"]')).toHaveCount(0);
    
    // Send message in new conversation
    await page.fill('[data-testid="chat-input"]', 'Hello in new conversation');
    await page.click('[data-testid="chat-send-button"]');
    
    // Verify conversation appears in sidebar
    await expect(page.locator('[data-testid="conversation-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="conversation-item"]')).toHaveCount(2);
    
    // Switch between conversations
    await page.click('[data-testid="conversation-item"]').first();
    await expect(page.locator('[data-testid="user-message"]')).toContainText('Hello in new conversation');
    
    // Test conversation renaming
    await page.click('[data-testid="conversation-menu"]');
    await page.click('[data-testid="rename-conversation"]');
    await page.fill('[data-testid="conversation-name-input"]', 'My Custom Conversation');
    await page.click('[data-testid="save-conversation-name"]');
    
    await expect(page.locator('[data-testid="conversation-title"]')).toContainText('My Custom Conversation');
    
    // Test conversation deletion
    await page.click('[data-testid="conversation-menu"]');
    await page.click('[data-testid="delete-conversation"]');
    await page.click('[data-testid="confirm-delete"]');
    
    await expect(page.locator('[data-testid="conversation-item"]')).toHaveCount(1);
  });

  test('should handle AI model errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/chat', route => route.abort());
    
    // Send message
    await page.fill('[data-testid="chat-input"]', 'Test message');
    await page.click('[data-testid="chat-send-button"]');
    
    // Verify error handling
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Failed to send message');
    
    // Test retry functionality
    await page.click('[data-testid="retry-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    
    // Test error recovery
    await page.unroute('**/api/chat');
    await page.click('[data-testid="retry-button"]');
    await expect(page.locator('[data-testid="ai-response"]')).toBeVisible();
  });

  test('should support workspace context integration', async ({ page }) => {
    // Open file in code editor first
    await page.click('[data-testid="tool-code-editor"]');
    await page.click('[data-testid="file-tree-file-Button.tsx"]');
    
    // Return to chat
    await page.click('[data-testid="tool-chat"]');
    
    // Send message about current file
    await page.fill('[data-testid="chat-input"]', 'Explain the current file I have open');
    await page.click('[data-testid="chat-send-button"]');
    
    // Verify AI has context about the file
    await expect(page.locator('[data-testid="ai-response"]').last()).toContainText(/Button\.tsx/i);
    
    // Test terminal context
    await page.click('[data-testid="tool-terminal"]');
    await page.type('[data-testid="terminal-input"]', 'npm run dev');
    await page.keyboard.press('Enter');
    
    await page.click('[data-testid="tool-chat"]');
    await page.fill('[data-testid="chat-input"]', 'What command did I just run?');
    await page.click('[data-testid="chat-send-button"]');
    
    await expect(page.locator('[data-testid="ai-response"]').last()).toContainText(/npm run dev/i);
  });
}); 
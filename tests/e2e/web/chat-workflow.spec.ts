import { test, expect } from '@playwright/test';

test.describe('Chat Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Mock authentication
    await page.evaluate(() => {
      localStorage.setItem('omnipanel_auth_token', 'mock-token');
      localStorage.setItem('omnipanel_user', JSON.stringify({
        id: 'user-test-123',
        email: 'test@omnipanel.dev',
        name: 'Test User'
      }));
    });
    
    // Reload to apply auth state
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('complete chat session with code generation', async ({ page }) => {
    // Verify dashboard loads
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
    
    // Create new project
    await page.click('[data-testid="new-project-btn"]');
    await page.fill('[data-testid="project-name-input"]', 'E2E Test Project');
    await page.selectOption('[data-testid="project-type-select"]', 'general');
    await page.click('[data-testid="create-project-btn"]');
    
    // Wait for project to be created and navigate to it
    await expect(page.locator('[data-testid="project-dashboard"]')).toBeVisible();
    
    // Start new chat
    await page.click('[data-testid="new-chat-btn"]');
    
    // Configure AI provider
    await page.click('[data-testid="provider-selector"]');
    await page.click('[data-testid="provider-openai"]');
    await page.selectOption('[data-testid="model-select"]', 'gpt-4');
    
    // Verify chat interface loads
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
    await expect(page.locator('[data-testid="chat-input"]')).toBeVisible();
    
    // Send first message
    const firstMessage = 'Write a React component for a button with variants';
    await page.fill('[data-testid="chat-input"]', firstMessage);
    await page.click('[data-testid="send-btn"]');
    
    // Verify user message appears
    await expect(
      page.locator('[data-testid="message-container"]').filter({ hasText: firstMessage })
    ).toBeVisible();
    
    // Wait for AI response
    await expect(page.locator('[data-testid="assistant-message"]')).toBeVisible();
    
    // Verify response contains code block
    await expect(page.locator('[data-testid="code-block"]')).toBeVisible();
    
    // Test code block functionality
    const codeBlock = page.locator('[data-testid="code-block"]').first();
    await expect(codeBlock).toContainText('Button');
    await expect(codeBlock).toHaveAttribute('data-language', 'tsx');
    
    // Copy code to editor
    await page.hover('[data-testid="code-block"]');
    await page.click('[data-testid="copy-to-editor-btn"]');
    
    // Switch to code editor tab
    await page.click('[data-testid="code-editor-tab"]');
    
    // Verify code was copied to editor
    await expect(page.locator('[data-testid="monaco-editor"]')).toBeVisible();
    const editorContent = await page.locator('[data-testid="monaco-editor"]').textContent();
    expect(editorContent).toContain('Button');
    
    // Switch back to chat
    await page.click('[data-testid="chat-tab"]');
    
    // Send follow-up message
    const followUpMessage = 'Add TypeScript props for the button component';
    await page.fill('[data-testid="chat-input"]', followUpMessage);
    await page.press('[data-testid="chat-input"]', 'Enter'); // Test keyboard shortcut
    
    // Verify follow-up message and response
    await expect(
      page.locator('[data-testid="message-container"]').filter({ hasText: followUpMessage })
    ).toBeVisible();
    
    // Wait for second AI response
    await expect(page.locator('[data-testid="assistant-message"]').nth(1)).toBeVisible();
    
    // Test message actions
    const firstAssistantMessage = page.locator('[data-testid="assistant-message"]').first();
    await firstAssistantMessage.hover();
    
    // Test copy message
    await page.click('[data-testid="copy-message-btn"]');
    
    // Test regenerate response
    await page.click('[data-testid="regenerate-btn"]');
    await expect(page.locator('[data-testid="typing-indicator"]')).toBeVisible();
    
    // Verify chat history is preserved
    const messages = page.locator('[data-testid="message-container"]');
    await expect(messages).toHaveCount(4); // 2 user + 2 assistant messages
    
    // Test chat settings
    await page.click('[data-testid="chat-settings-btn"]');
    await expect(page.locator('[data-testid="chat-settings-modal"]')).toBeVisible();
    
    // Modify temperature
    await page.fill('[data-testid="temperature-input"]', '0.9');
    await page.click('[data-testid="save-settings-btn"]');
    
    // Test export chat
    await page.click('[data-testid="export-chat-btn"]');
    await page.selectOption('[data-testid="export-format-select"]', 'markdown');
    await page.click('[data-testid="confirm-export-btn"]');
    
    // Verify chat title can be edited
    await page.click('[data-testid="edit-chat-title-btn"]');
    await page.fill('[data-testid="chat-title-input"]', 'Button Component Development');
    await page.press('[data-testid="chat-title-input"]', 'Enter');
    
    await expect(
      page.locator('[data-testid="chat-title"]')
    ).toHaveText('Button Component Development');
  });

  test('handles streaming responses correctly', async ({ page }) => {
    // Navigate to existing chat or create new one
    await page.goto('/');
    await page.click('[data-testid="new-chat-btn"]');
    
    // Send message that triggers streaming
    await page.fill('[data-testid="chat-input"]', 'Explain React hooks in detail');
    await page.click('[data-testid="send-btn"]');
    
    // Verify streaming indicator appears
    await expect(page.locator('[data-testid="typing-indicator"]')).toBeVisible();
    
    // Wait for streaming to start
    const assistantMessage = page.locator('[data-testid="assistant-message"]');
    await expect(assistantMessage).toBeVisible();
    
    // Verify message content updates in real-time
    await expect(assistantMessage).toContainText('React hooks');
    
    // Verify streaming indicator disappears when complete
    await expect(page.locator('[data-testid="typing-indicator"]')).not.toBeVisible();
    
    // Verify final message is complete
    const finalContent = await assistantMessage.textContent();
    expect(finalContent).toBeTruthy();
    expect(finalContent.length).toBeGreaterThan(100);
  });

  test('handles errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/chat/completions', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    await page.goto('/');
    await page.click('[data-testid="new-chat-btn"]');
    
    // Send message
    await page.fill('[data-testid="chat-input"]', 'This should fail');
    await page.click('[data-testid="send-btn"]');
    
    // Verify error message appears
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('server error');
    
    // Test retry functionality
    await page.click('[data-testid="retry-btn"]');
    
    // Verify retry attempt
    await expect(page.locator('[data-testid="typing-indicator"]')).toBeVisible();
  });

  test('keyboard shortcuts work correctly', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="new-chat-btn"]');
    
    const chatInput = page.locator('[data-testid="chat-input"]');
    
    // Test basic input
    await chatInput.fill('Test message');
    
    // Test Enter to send (with Shift+Enter for new line)
    await chatInput.press('Shift+Enter');
    await expect(chatInput).toContainText('\n');
    
    await chatInput.press('Enter');
    await expect(page.locator('[data-testid="message-container"]')).toHaveCount(1);
    
    // Test Escape to clear input
    await chatInput.fill('Clear this text');
    await chatInput.press('Escape');
    await expect(chatInput).toHaveValue('');
    
    // Test keyboard navigation
    await page.keyboard.press('Control+n'); // New chat shortcut
    await expect(page.locator('[data-testid="new-chat-modal"]')).toBeVisible();
    
    await page.keyboard.press('Escape'); // Close modal
    await expect(page.locator('[data-testid="new-chat-modal"]')).not.toBeVisible();
  });

  test('multi-model switching works correctly', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="new-chat-btn"]');
    
    // Start with GPT-4
    await page.selectOption('[data-testid="model-select"]', 'gpt-4');
    await page.fill('[data-testid="chat-input"]', 'Hello from GPT-4');
    await page.click('[data-testid="send-btn"]');
    
    await expect(page.locator('[data-testid="assistant-message"]')).toBeVisible();
    
    // Switch to Claude
    await page.selectOption('[data-testid="model-select"]', 'claude-3-sonnet');
    await page.fill('[data-testid="chat-input"]', 'Hello from Claude');
    await page.click('[data-testid="send-btn"]');
    
    // Verify both messages exist with different model indicators
    const messages = page.locator('[data-testid="assistant-message"]');
    await expect(messages).toHaveCount(2);
    
    // Verify model indicators
    await expect(
      page.locator('[data-testid="model-indicator"]').filter({ hasText: 'gpt-4' })
    ).toBeVisible();
    
    await expect(
      page.locator('[data-testid="model-indicator"]').filter({ hasText: 'claude-3-sonnet' })
    ).toBeVisible();
  });

  test('real-time collaboration features', async ({ page, context }) => {
    // Create a second page to simulate another user
    const secondPage = await context.newPage();
    
    // Both pages login as different users
    await page.goto('/');
    await secondPage.goto('/');
    
    // Share workspace/project between users
    await page.click('[data-testid="share-project-btn"]');
    await page.fill('[data-testid="collaborator-email"]', 'user2@test.com');
    await page.click('[data-testid="add-collaborator-btn"]');
    
    // Start chat on first page
    await page.click('[data-testid="new-chat-btn"]');
    await page.fill('[data-testid="chat-input"]', 'Message from User 1');
    await page.click('[data-testid="send-btn"]');
    
    // Verify message appears on second page in real-time
    await expect(
      secondPage.locator('[data-testid="message-container"]').filter({ hasText: 'Message from User 1' })
    ).toBeVisible({ timeout: 5000 });
    
    // Send message from second page
    await secondPage.fill('[data-testid="chat-input"]', 'Message from User 2');
    await secondPage.click('[data-testid="send-btn"]');
    
    // Verify it appears on first page
    await expect(
      page.locator('[data-testid="message-container"]').filter({ hasText: 'Message from User 2' })
    ).toBeVisible({ timeout: 5000 });
    
    // Test typing indicators
    await page.fill('[data-testid="chat-input"]', 'User 1 is typing...');
    await expect(
      secondPage.locator('[data-testid="user-typing-indicator"]').filter({ hasText: 'User 1' })
    ).toBeVisible();
    
    await secondPage.close();
  });

  test('mobile responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Verify mobile navigation
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
    
    // Test chat interface on mobile
    await page.click('[data-testid="new-chat-btn"]');
    
    // Verify mobile chat layout
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-chat-input"]')).toBeVisible();
    
    // Test mobile gestures
    await page.touchTap('[data-testid="chat-input"]');
    await page.fill('[data-testid="chat-input"]', 'Mobile test message');
    
    // Send via mobile button
    await page.touchTap('[data-testid="mobile-send-btn"]');
    
    // Verify message appears
    await expect(page.locator('[data-testid="message-container"]')).toBeVisible();
    
    // Test swipe gestures on messages
    const message = page.locator('[data-testid="message-container"]').first();
    
    // Swipe left to reveal actions
    await message.hover();
    await page.mouse.down();
    await page.mouse.move(-100, 0);
    await page.mouse.up();
    
    await expect(page.locator('[data-testid="message-actions"]')).toBeVisible();
  });

  test('performance under load', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="new-chat-btn"]');
    
    // Send multiple messages rapidly
    const messages = [
      'First message',
      'Second message', 
      'Third message',
      'Fourth message',
      'Fifth message'
    ];
    
    for (const message of messages) {
      await page.fill('[data-testid="chat-input"]', message);
      await page.click('[data-testid="send-btn"]');
      
      // Wait briefly between messages
      await page.waitForTimeout(100);
    }
    
    // Verify all messages appear
    for (const message of messages) {
      await expect(
        page.locator('[data-testid="message-container"]').filter({ hasText: message })
      ).toBeVisible();
    }
    
    // Verify performance metrics
    const performanceEntries = await page.evaluate(() => {
      return performance.getEntriesByType('navigation')[0];
    });
    
    expect(performanceEntries.loadEventEnd - performanceEntries.loadEventStart).toBeLessThan(3000);
  });
}); 
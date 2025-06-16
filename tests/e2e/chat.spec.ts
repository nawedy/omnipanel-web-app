import { test, expect } from '@playwright/test';

test.describe('Chat Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="workspace-layout"]');
    
    // Navigate to chat tab
    await page.click('[data-testid="tab-chat"]');
    await page.waitForSelector('[data-testid="chat-interface"]');
  });

  test('should display chat interface', async ({ page }) => {
    // Check if chat interface is visible
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
    await expect(page.locator('[data-testid="chat-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="chat-messages"]')).toBeVisible();
  });

  test('should send and receive messages', async ({ page }) => {
    // Mock AI response
    await page.route('**/api/chat/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Hello! How can I help you today?',
          timestamp: new Date().toISOString()
        })
      });
    });

    // Type a message
    const testMessage = 'Hello, can you help me with my code?';
    await page.fill('[data-testid="chat-input"]', testMessage);
    
    // Send message
    await page.click('[data-testid="send-button"]');
    
    // Check if message appears in chat
    await expect(page.locator(`text=${testMessage}`)).toBeVisible();
    
    // Check if AI response appears
    await expect(page.locator('text=Hello! How can I help you today?')).toBeVisible();
  });

  test('should handle streaming responses', async ({ page }) => {
    // Mock streaming response
    await page.route('**/api/chat/stream', (route) => {
      const chunks = [
        'Hello',
        ' there!',
        ' How',
        ' can',
        ' I',
        ' help',
        ' you?'
      ];
      
      let chunkIndex = 0;
      const sendChunk = () => {
        if (chunkIndex < chunks.length) {
          route.fulfill({
            status: 200,
            contentType: 'text/plain',
            body: chunks[chunkIndex++]
          });
          setTimeout(sendChunk, 100);
        }
      };
      sendChunk();
    });

    // Send a message that triggers streaming
    await page.fill('[data-testid="chat-input"]', 'Tell me a story');
    await page.click('[data-testid="send-button"]');
    
    // Wait for streaming to complete
    await page.waitForTimeout(1000);
    
    // Check if full message is displayed
    await expect(page.locator('text=Hello there! How can I help you?')).toBeVisible();
  });

  test('should display chat history', async ({ page }) => {
    // Mock chat history
    await page.route('**/api/chat/history', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          conversations: [
            {
              id: '1',
              title: 'Previous Conversation',
              messages: [
                { role: 'user', content: 'Hello' },
                { role: 'assistant', content: 'Hi there!' }
              ],
              timestamp: new Date().toISOString()
            }
          ]
        })
      });
    });

    // Click on chat history
    await page.click('[data-testid="chat-history-button"]');
    
    // Check if history is displayed
    await expect(page.locator('text=Previous Conversation')).toBeVisible();
  });

  test('should handle file uploads', async ({ page }) => {
    // Create a test file
    const fileContent = 'console.log("Hello World");';
    
    // Mock file upload
    await page.route('**/api/upload', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          fileId: 'test-file-123',
          fileName: 'test.js'
        })
      });
    });

    // Click file upload button
    await page.click('[data-testid="file-upload-button"]');
    
    // Upload file (mock)
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.js',
      mimeType: 'text/javascript',
      buffer: Buffer.from(fileContent)
    });
    
    // Check if file is uploaded
    await expect(page.locator('text=test.js')).toBeVisible();
  });

  test('should handle image uploads', async ({ page }) => {
    // Mock image upload
    await page.route('**/api/upload/image', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          imageId: 'test-image-123',
          imageUrl: '/uploads/test-image.png'
        })
      });
    });

    // Click image upload button
    await page.click('[data-testid="image-upload-button"]');
    
    // Upload image (mock)
    const imageInput = page.locator('input[type="file"][accept*="image"]');
    await imageInput.setInputFiles({
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer: Buffer.from('fake-image-data')
    });
    
    // Check if image is uploaded
    await expect(page.locator('[data-testid="uploaded-image"]')).toBeVisible();
  });

  test('should handle context-aware responses', async ({ page }) => {
    // Mock context-aware API
    await page.route('**/api/chat/context', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Based on your current project structure, I can help you with...',
          context: {
            files: ['src/index.js', 'package.json'],
            currentFile: 'src/index.js'
          }
        })
      });
    });

    // Send a context-aware message
    await page.fill('[data-testid="chat-input"]', 'Help me with this file');
    await page.click('[data-testid="send-button"]');
    
    // Check if context-aware response is displayed
    await expect(page.locator('text=Based on your current project structure')).toBeVisible();
  });

  test('should handle AI model switching', async ({ page }) => {
    // Click on model selector
    await page.click('[data-testid="model-selector"]');
    
    // Check if model options are displayed
    await expect(page.locator('[data-testid="model-option-gpt-4"]')).toBeVisible();
    await expect(page.locator('[data-testid="model-option-claude"]')).toBeVisible();
    
    // Select a different model
    await page.click('[data-testid="model-option-claude"]');
    
    // Check if model is switched
    await expect(page.locator('text=Claude')).toBeVisible();
  });

  test('should handle chat export', async ({ page }) => {
    // Add some messages first
    await page.fill('[data-testid="chat-input"]', 'Test message');
    await page.click('[data-testid="send-button"]');
    
    // Click export button
    await page.click('[data-testid="export-chat-button"]');
    
    // Check if export modal opens
    await expect(page.locator('[data-testid="export-modal"]')).toBeVisible();
    
    // Select export format
    await page.click('[data-testid="export-format-markdown"]');
    
    // Confirm export
    await page.click('[data-testid="confirm-export"]');
    
    // Check if download starts (mock)
    await expect(page.locator('text=Export completed')).toBeVisible();
  });

  test('should handle error states in chat', async ({ page }) => {
    // Mock API error
    await page.route('**/api/chat/**', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'AI service unavailable' })
      });
    });

    // Send a message
    await page.fill('[data-testid="chat-input"]', 'This should fail');
    await page.click('[data-testid="send-button"]');
    
    // Check if error message is displayed
    await expect(page.locator('text=AI service unavailable')).toBeVisible();
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });
}); 
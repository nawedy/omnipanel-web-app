import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display welcome screen for new users', async ({ page }) => {
    // Check if welcome screen is displayed
    await expect(page.locator('[data-testid="welcome-screen"]')).toBeVisible();
    
    // Verify welcome message
    await expect(page.locator('h1')).toContainText('Welcome to OmniPanel');
    
    // Check for getting started button
    await expect(page.locator('[data-testid="get-started-button"]')).toBeVisible();
  });

  test('should guide through initial setup steps', async ({ page }) => {
    // Click get started button
    await page.click('[data-testid="get-started-button"]');
    
    // Step 1: Choose workspace layout
    await expect(page.locator('[data-testid="layout-selection"]')).toBeVisible();
    await page.click('[data-testid="layout-professional"]');
    await page.click('[data-testid="next-button"]');
    
    // Step 2: Configure AI models
    await expect(page.locator('[data-testid="ai-model-setup"]')).toBeVisible();
    await page.fill('[data-testid="openai-api-key"]', 'test-api-key');
    await page.click('[data-testid="next-button"]');
    
    // Step 3: Set up workspace preferences
    await expect(page.locator('[data-testid="workspace-preferences"]')).toBeVisible();
    await page.click('[data-testid="theme-dark"]');
    await page.click('[data-testid="finish-setup"]');
    
    // Verify setup completion
    await expect(page.locator('[data-testid="workspace-main"]')).toBeVisible();
  });

  test('should complete onboarding checklist items', async ({ page }) => {
    // Navigate to onboarding checklist
    await page.goto('/onboarding');
    
    // Verify checklist is displayed
    await expect(page.locator('[data-testid="onboarding-checklist"]')).toBeVisible();
    
    // Check initial checklist items
    const checklistItems = [
      'workspace-setup',
      'ai-model-configuration',
      'first-chat',
      'file-management',
      'terminal-usage',
      'settings-customization'
    ];
    
    for (const item of checklistItems) {
      await expect(page.locator(`[data-testid="checklist-${item}"]`)).toBeVisible();
    }
    
    // Complete workspace setup
    await page.click('[data-testid="complete-workspace-setup"]');
    await expect(page.locator('[data-testid="checklist-workspace-setup"] .completed')).toBeVisible();
    
    // Complete AI model configuration
    await page.click('[data-testid="complete-ai-model-configuration"]');
    await expect(page.locator('[data-testid="checklist-ai-model-configuration"] .completed')).toBeVisible();
  });

  test('should validate workspace initialization', async ({ page }) => {
    // Complete onboarding
    await page.goto('/workspace');
    
    // Verify main workspace components are loaded
    await expect(page.locator('[data-testid="workspace-sidebar"]')).toBeVisible();
    await expect(page.locator('[data-testid="workspace-main-area"]')).toBeVisible();
    await expect(page.locator('[data-testid="workspace-header"]')).toBeVisible();
    
    // Check tool grid is initialized
    await expect(page.locator('[data-testid="tool-grid"]')).toBeVisible();
    
    // Verify default tools are available
    const tools = ['chat', 'terminal', 'notebook', 'code-editor', 'research'];
    for (const tool of tools) {
      await expect(page.locator(`[data-testid="tool-${tool}"]`)).toBeVisible();
    }
    
    // Check sidebar resizing functionality
    const sidebar = page.locator('[data-testid="workspace-sidebar"]');
    const initialWidth = await sidebar.evaluate(el => el.getBoundingClientRect().width);
    
    // Test sidebar resize
    await page.hover('[data-testid="sidebar-resize-handle"]');
    await page.mouse.down();
    await page.mouse.move(400, 0);
    await page.mouse.up();
    
    const newWidth = await sidebar.evaluate(el => el.getBoundingClientRect().width);
    expect(newWidth).not.toBe(initialWidth);
  });

  test('should handle onboarding errors gracefully', async ({ page }) => {
    // Test with invalid API key
    await page.click('[data-testid="get-started-button"]');
    await page.click('[data-testid="next-button"]'); // Skip layout
    
    await page.fill('[data-testid="openai-api-key"]', 'invalid-key');
    await page.click('[data-testid="test-connection"]');
    
    // Verify error handling
    await expect(page.locator('[data-testid="api-key-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="api-key-error"]')).toContainText('Invalid API key');
    
    // Test network error handling
    await page.route('**/api/test-connection', route => route.abort());
    await page.click('[data-testid="test-connection"]');
    
    await expect(page.locator('[data-testid="connection-error"]')).toBeVisible();
  });

  test('should save onboarding progress', async ({ page }) => {
    // Start onboarding
    await page.click('[data-testid="get-started-button"]');
    await page.click('[data-testid="layout-professional"]');
    await page.click('[data-testid="next-button"]');
    
    // Refresh page to simulate interruption
    await page.reload();
    
    // Verify progress is restored
    await expect(page.locator('[data-testid="ai-model-setup"]')).toBeVisible();
    await expect(page.locator('[data-testid="progress-indicator"]')).toContainText('Step 2 of 3');
  });

  test('should provide contextual help during onboarding', async ({ page }) => {
    await page.click('[data-testid="get-started-button"]');
    
    // Test help tooltips
    await page.hover('[data-testid="help-layout-info"]');
    await expect(page.locator('[data-testid="tooltip-layout"]')).toBeVisible();
    
    // Test help documentation links
    await page.click('[data-testid="help-documentation"]');
    await expect(page.locator('[data-testid="help-modal"]')).toBeVisible();
    
    // Verify quick reference is accessible
    await page.click('[data-testid="quick-reference-link"]');
    await expect(page.locator('[data-testid="quick-reference-content"]')).toBeVisible();
  });
}); 
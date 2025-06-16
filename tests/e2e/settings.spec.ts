import { test, expect } from '@playwright/test';

test.describe('Settings Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="workspace-layout"]');
    
    // Navigate to settings
    await page.click('[data-testid="settings-button"]');
    await page.waitForSelector('[data-testid="settings-modal"]');
  });

  test('should display settings modal', async ({ page }) => {
    // Check if settings modal is visible
    await expect(page.locator('[data-testid="settings-modal"]')).toBeVisible();
    await expect(page.locator('text=Settings')).toBeVisible();
    
    // Check for settings categories
    await expect(page.locator('text=General')).toBeVisible();
    await expect(page.locator('text=Theme')).toBeVisible();
    await expect(page.locator('text=AI Models')).toBeVisible();
    await expect(page.locator('text=Keyboard Shortcuts')).toBeVisible();
    await expect(page.locator('text=Privacy')).toBeVisible();
  });

  test('should handle theme settings', async ({ page }) => {
    // Navigate to theme settings
    await page.click('[data-testid="settings-tab-theme"]');
    
    // Check if theme options are visible
    await expect(page.locator('[data-testid="theme-selector"]')).toBeVisible();
    await expect(page.locator('text=Dark')).toBeVisible();
    await expect(page.locator('text=Light')).toBeVisible();
    await expect(page.locator('text=Auto')).toBeVisible();
    
    // Switch to light theme
    await page.click('[data-testid="theme-option-light"]');
    
    // Check if theme is applied
    await expect(page.locator('body')).toHaveClass(/light-theme/);
    
    // Switch back to dark theme
    await page.click('[data-testid="theme-option-dark"]');
    await expect(page.locator('body')).toHaveClass(/dark-theme/);
  });

  test('should handle AI model settings', async ({ page }) => {
    // Navigate to AI settings
    await page.click('[data-testid="settings-tab-ai"]');
    
    // Check if AI settings are visible
    await expect(page.locator('[data-testid="ai-model-settings"]')).toBeVisible();
    await expect(page.locator('text=API Keys')).toBeVisible();
    await expect(page.locator('text=Model Selection')).toBeVisible();
    
    // Add API key
    await page.click('[data-testid="add-api-key-button"]');
    await page.fill('[data-testid="api-key-input"]', 'test-api-key-123');
    await page.selectOption('[data-testid="api-provider-select"]', 'openai');
    await page.click('[data-testid="save-api-key"]');
    
    // Check if API key is saved
    await expect(page.locator('text=OpenAI')).toBeVisible();
    await expect(page.locator('text=test-api-key-123')).toBeVisible();
  });

  test('should handle keyboard shortcuts settings', async ({ page }) => {
    // Navigate to keyboard shortcuts
    await page.click('[data-testid="settings-tab-keyboard"]');
    
    // Check if shortcuts are visible
    await expect(page.locator('[data-testid="keyboard-shortcuts"]')).toBeVisible();
    await expect(page.locator('text=Command Palette')).toBeVisible();
    await expect(page.locator('text=Ctrl+Shift+P')).toBeVisible();
    
    // Test shortcut customization
    await page.click('[data-testid="edit-shortcut-command-palette"]');
    await page.keyboard.press('Control+Alt+P');
    await page.click('[data-testid="save-shortcut"]');
    
    // Check if shortcut is updated
    await expect(page.locator('text=Ctrl+Alt+P')).toBeVisible();
  });

  test('should handle general settings', async ({ page }) => {
    // Navigate to general settings
    await page.click('[data-testid="settings-tab-general"]');
    
    // Check if general settings are visible
    await expect(page.locator('[data-testid="general-settings"]')).toBeVisible();
    await expect(page.locator('text=Language')).toBeVisible();
    await expect(page.locator('text=Font Family')).toBeVisible();
    await expect(page.locator('text=Font Size')).toBeVisible();
    
    // Change font family
    await page.selectOption('[data-testid="font-family-select"]', 'Monaco');
    
    // Change font size
    await page.fill('[data-testid="font-size-input"]', '16');
    
    // Save settings
    await page.click('[data-testid="save-general-settings"]');
    
    // Check if settings are applied
    await expect(page.locator('body')).toHaveCSS('font-family', /Monaco/);
  });

  test('should handle privacy settings', async ({ page }) => {
    // Navigate to privacy settings
    await page.click('[data-testid="settings-tab-privacy"]');
    
    // Check if privacy settings are visible
    await expect(page.locator('[data-testid="privacy-settings"]')).toBeVisible();
    await expect(page.locator('text=Data Collection')).toBeVisible();
    await expect(page.locator('text=Analytics')).toBeVisible();
    await expect(page.locator('text=Crash Reporting')).toBeVisible();
    
    // Toggle analytics
    await page.click('[data-testid="analytics-toggle"]');
    
    // Check if setting is saved
    await expect(page.locator('[data-testid="analytics-toggle"]')).not.toBeChecked();
  });

  test('should handle database settings', async ({ page }) => {
    // Navigate to database settings
    await page.click('[data-testid="settings-tab-database"]');
    
    // Check if database settings are visible
    await expect(page.locator('[data-testid="database-settings"]')).toBeVisible();
    await expect(page.locator('text=Connection String')).toBeVisible();
    await expect(page.locator('text=Test Connection')).toBeVisible();
    
    // Test database connection
    await page.click('[data-testid="test-connection-button"]');
    
    // Mock successful connection
    await page.route('**/api/database/test', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Connection successful' })
      });
    });
    
    // Check if connection test result is displayed
    await expect(page.locator('text=Connection successful')).toBeVisible();
  });

  test('should handle performance settings', async ({ page }) => {
    // Navigate to performance settings
    await page.click('[data-testid="settings-tab-performance"]');
    
    // Check if performance settings are visible
    await expect(page.locator('[data-testid="performance-settings"]')).toBeVisible();
    await expect(page.locator('text=Memory Limit')).toBeVisible();
    await expect(page.locator('text=Cache Size')).toBeVisible();
    
    // Adjust memory limit
    await page.fill('[data-testid="memory-limit-input"]', '2048');
    
    // Adjust cache size
    await page.fill('[data-testid="cache-size-input"]', '512');
    
    // Save performance settings
    await page.click('[data-testid="save-performance-settings"]');
    
    // Check if settings are saved
    await expect(page.locator('text=Settings saved successfully')).toBeVisible();
  });

  test('should handle settings import/export', async ({ page }) => {
    // Test settings export
    await page.click('[data-testid="export-settings-button"]');
    
    // Check if export modal opens
    await expect(page.locator('[data-testid="export-modal"]')).toBeVisible();
    
    // Confirm export
    await page.click('[data-testid="confirm-export"]');
    
    // Test settings import
    await page.click('[data-testid="import-settings-button"]');
    
    // Upload settings file (mock)
    const settingsFile = {
      name: 'omnipanel-settings.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify({
        theme: 'dark',
        fontSize: 14,
        fontFamily: 'Monaco'
      }))
    };
    
    await page.locator('input[type="file"]').setInputFiles(settingsFile);
    
    // Check if import is successful
    await expect(page.locator('text=Settings imported successfully')).toBeVisible();
  });

  test('should handle settings validation', async ({ page }) => {
    // Navigate to AI settings
    await page.click('[data-testid="settings-tab-ai"]');
    
    // Try to save invalid API key
    await page.click('[data-testid="add-api-key-button"]');
    await page.fill('[data-testid="api-key-input"]', 'invalid-key');
    await page.click('[data-testid="save-api-key"]');
    
    // Check if validation error is displayed
    await expect(page.locator('text=Invalid API key format')).toBeVisible();
  });

  test('should persist settings across sessions', async ({ page }) => {
    // Change a setting
    await page.click('[data-testid="settings-tab-theme"]');
    await page.click('[data-testid="theme-option-light"]');
    
    // Close settings
    await page.click('[data-testid="close-settings"]');
    
    // Reload page
    await page.reload();
    await page.waitForSelector('[data-testid="workspace-layout"]');
    
    // Check if theme is persisted
    await expect(page.locator('body')).toHaveClass(/light-theme/);
  });
}); 
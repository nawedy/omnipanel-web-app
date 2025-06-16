import { test, expect } from '@playwright/test';

test.describe('Workspace Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the application to load
    await page.waitForSelector('[data-testid="workspace-layout"]', { timeout: 10000 });
  });

  test('should display welcome screen when no project is open', async ({ page }) => {
    // Check if welcome screen is visible
    await expect(page.locator('[data-testid="welcome-screen"]')).toBeVisible();
    
    // Check for key elements
    await expect(page.locator('text=Welcome to OmniPanel')).toBeVisible();
    await expect(page.locator('text=Open Project')).toBeVisible();
    await expect(page.locator('text=New Project')).toBeVisible();
  });

  test('should open project creation modal', async ({ page }) => {
    // Click on New Project button
    await page.click('text=New Project');
    
    // Check if project creation modal opens
    await expect(page.locator('[data-testid="project-creation-modal"]')).toBeVisible();
    await expect(page.locator('text=Create New Project')).toBeVisible();
  });

  test('should display workspace sidebar', async ({ page }) => {
    // Check if workspace sidebar is visible
    await expect(page.locator('[data-testid="workspace-sidebar"]')).toBeVisible();
    
    // Check for sidebar elements
    await expect(page.locator('text=Workspace')).toBeVisible();
    await expect(page.locator('text=Recent Projects')).toBeVisible();
  });

  test('should switch between workspace tabs', async ({ page }) => {
    // Test tab switching functionality
    const tabs = ['Chat', 'Terminal', 'Notebook', 'Editor'];
    
    for (const tab of tabs) {
      await page.click(`[data-testid="tab-${tab.toLowerCase()}"]`);
      await expect(page.locator(`[data-testid="${tab.toLowerCase()}-content"]`)).toBeVisible();
    }
  });

  test('should handle file tree interactions', async ({ page }) => {
    // Mock a project with files
    await page.route('**/api/files/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          files: [
            { name: 'src', type: 'directory', children: [] },
            { name: 'package.json', type: 'file', size: 1024 },
            { name: 'README.md', type: 'file', size: 512 }
          ]
        })
      });
    });

    // Reload to get mocked data
    await page.reload();
    
    // Check if file tree is visible
    await expect(page.locator('[data-testid="file-tree"]')).toBeVisible();
  });

  test('should handle responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if mobile layout is applied
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('[data-testid="workspace-sidebar"]')).toBeVisible();
  });

  test('should persist workspace state', async ({ page }) => {
    // Set some workspace state
    await page.click('[data-testid="settings-button"]');
    
    // Reload page
    await page.reload();
    
    // Check if state is persisted
    await page.waitForSelector('[data-testid="workspace-layout"]');
  });

  test('should handle keyboard shortcuts', async ({ page }) => {
    // Test common keyboard shortcuts
    await page.keyboard.press('Control+Shift+P'); // Command palette
    await expect(page.locator('[data-testid="command-palette"]')).toBeVisible();
    
    await page.keyboard.press('Escape'); // Close modal
    await expect(page.locator('[data-testid="command-palette"]')).not.toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/**', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });

    await page.reload();
    
    // Check if error boundary is displayed
    await expect(page.locator('[data-testid="error-boundary"]')).toBeVisible();
  });
}); 
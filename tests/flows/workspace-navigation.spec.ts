import { test, expect } from '@playwright/test';

test.describe('Workspace Navigation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Assume user is already onboarded
    await page.goto('/workspace');
  });

  test('should navigate between workspace tools', async ({ page }) => {
    // Test Chat tool navigation
    await page.click('[data-testid="tool-chat"]');
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-tool"]')).toHaveAttribute('data-tool', 'chat');
    
    // Test Terminal tool navigation
    await page.click('[data-testid="tool-terminal"]');
    await expect(page.locator('[data-testid="terminal-interface"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-tool"]')).toHaveAttribute('data-tool', 'terminal');
    
    // Test Code Editor tool navigation
    await page.click('[data-testid="tool-code-editor"]');
    await expect(page.locator('[data-testid="code-editor-interface"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-tool"]')).toHaveAttribute('data-tool', 'code-editor');
    
    // Test Notebook tool navigation
    await page.click('[data-testid="tool-notebook"]');
    await expect(page.locator('[data-testid="notebook-interface"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-tool"]')).toHaveAttribute('data-tool', 'notebook');
    
    // Test Research tool navigation
    await page.click('[data-testid="tool-research"]');
    await expect(page.locator('[data-testid="research-interface"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-tool"]')).toHaveAttribute('data-tool', 'research');
  });

  test('should manage tabs correctly', async ({ page }) => {
    // Open multiple tabs
    await page.click('[data-testid="tool-chat"]');
    await page.click('[data-testid="new-tab-button"]');
    await page.click('[data-testid="tool-terminal"]');
    await page.click('[data-testid="new-tab-button"]');
    await page.click('[data-testid="tool-code-editor"]');
    
    // Verify tab count
    const tabs = page.locator('[data-testid="workspace-tab"]');
    await expect(tabs).toHaveCount(3);
    
    // Test tab switching
    await page.click('[data-testid="tab-0"]');
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
    
    await page.click('[data-testid="tab-1"]');
    await expect(page.locator('[data-testid="terminal-interface"]')).toBeVisible();
    
    await page.click('[data-testid="tab-2"]');
    await expect(page.locator('[data-testid="code-editor-interface"]')).toBeVisible();
    
    // Test tab closing
    await page.click('[data-testid="close-tab-1"]');
    await expect(tabs).toHaveCount(2);
    
    // Test tab reordering
    await page.dragAndDrop('[data-testid="tab-0"]', '[data-testid="tab-1"]');
    const firstTab = page.locator('[data-testid="tab-0"]');
    await expect(firstTab).toContainText('Code Editor');
  });

  test('should handle sidebar navigation', async ({ page }) => {
    // Test file tree navigation
    await page.click('[data-testid="sidebar-file-tree"]');
    await expect(page.locator('[data-testid="file-tree-panel"]')).toBeVisible();
    
    // Test project navigation
    await page.click('[data-testid="sidebar-projects"]');
    await expect(page.locator('[data-testid="projects-panel"]')).toBeVisible();
    
    // Test settings navigation
    await page.click('[data-testid="sidebar-settings"]');
    await expect(page.locator('[data-testid="settings-panel"]')).toBeVisible();
    
    // Test plugin navigation
    await page.click('[data-testid="sidebar-plugins"]');
    await expect(page.locator('[data-testid="plugins-panel"]')).toBeVisible();
    
    // Test sidebar collapse/expand
    await page.click('[data-testid="sidebar-toggle"]');
    await expect(page.locator('[data-testid="workspace-sidebar"]')).toHaveClass(/collapsed/);
    
    await page.click('[data-testid="sidebar-toggle"]');
    await expect(page.locator('[data-testid="workspace-sidebar"]')).not.toHaveClass(/collapsed/);
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Test tool switching with keyboard shortcuts
    await page.keyboard.press('Control+1');
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
    
    await page.keyboard.press('Control+2');
    await expect(page.locator('[data-testid="terminal-interface"]')).toBeVisible();
    
    await page.keyboard.press('Control+3');
    await expect(page.locator('[data-testid="code-editor-interface"]')).toBeVisible();
    
    await page.keyboard.press('Control+4');
    await expect(page.locator('[data-testid="notebook-interface"]')).toBeVisible();
    
    await page.keyboard.press('Control+5');
    await expect(page.locator('[data-testid="research-interface"]')).toBeVisible();
    
    // Test tab navigation
    await page.keyboard.press('Control+Tab');
    await expect(page.locator('[data-testid="active-tab"]')).toHaveAttribute('data-tab-index', '1');
    
    await page.keyboard.press('Control+Shift+Tab');
    await expect(page.locator('[data-testid="active-tab"]')).toHaveAttribute('data-tab-index', '0');
    
    // Test global search
    await page.keyboard.press('Control+k');
    await expect(page.locator('[data-testid="global-search"]')).toBeVisible();
    
    // Test command palette
    await page.keyboard.press('Control+Shift+p');
    await expect(page.locator('[data-testid="command-palette"]')).toBeVisible();
  });

  test('should maintain navigation state across sessions', async ({ page }) => {
    // Set up specific workspace state
    await page.click('[data-testid="tool-chat"]');
    await page.click('[data-testid="new-tab-button"]');
    await page.click('[data-testid="tool-terminal"]');
    
    // Resize sidebar
    await page.hover('[data-testid="sidebar-resize-handle"]');
    await page.mouse.down();
    await page.mouse.move(400, 0);
    await page.mouse.up();
    
    // Reload page
    await page.reload();
    
    // Verify state is restored
    await expect(page.locator('[data-testid="workspace-tab"]')).toHaveCount(2);
    await expect(page.locator('[data-testid="active-tool"]')).toHaveAttribute('data-tool', 'terminal');
    
    const sidebar = page.locator('[data-testid="workspace-sidebar"]');
    const width = await sidebar.evaluate(el => el.getBoundingClientRect().width);
    expect(width).toBeCloseTo(400, 50);
  });

  test('should handle deep linking to specific workspace states', async ({ page }) => {
    // Test direct navigation to specific tool
    await page.goto('/workspace?tool=chat');
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-tool"]')).toHaveAttribute('data-tool', 'chat');
    
    // Test navigation to specific file
    await page.goto('/workspace?tool=code-editor&file=src/app/page.tsx');
    await expect(page.locator('[data-testid="code-editor-interface"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-file"]')).toContainText('page.tsx');
    
    // Test navigation with multiple parameters
    await page.goto('/workspace?tool=terminal&command=npm%20run%20dev');
    await expect(page.locator('[data-testid="terminal-interface"]')).toBeVisible();
    await expect(page.locator('[data-testid="terminal-input"]')).toHaveValue('npm run dev');
  });

  test('should provide breadcrumb navigation', async ({ page }) => {
    // Navigate to nested location
    await page.click('[data-testid="tool-code-editor"]');
    await page.click('[data-testid="file-tree-folder-src"]');
    await page.click('[data-testid="file-tree-folder-components"]');
    await page.click('[data-testid="file-tree-file-Button.tsx"]');
    
    // Verify breadcrumb is displayed
    await expect(page.locator('[data-testid="breadcrumb"]')).toBeVisible();
    await expect(page.locator('[data-testid="breadcrumb"]')).toContainText('src > components > Button.tsx');
    
    // Test breadcrumb navigation
    await page.click('[data-testid="breadcrumb-components"]');
    await expect(page.locator('[data-testid="file-tree-folder-components"]')).toHaveClass(/active/);
    
    await page.click('[data-testid="breadcrumb-src"]');
    await expect(page.locator('[data-testid="file-tree-folder-src"]')).toHaveClass(/active/);
  });

  test('should support multi-panel layout navigation', async ({ page }) => {
    // Enable split view
    await page.click('[data-testid="layout-split-horizontal"]');
    await expect(page.locator('[data-testid="workspace-panel-left"]')).toBeVisible();
    await expect(page.locator('[data-testid="workspace-panel-right"]')).toBeVisible();
    
    // Navigate different tools in each panel
    await page.click('[data-testid="panel-left"] [data-testid="tool-chat"]');
    await page.click('[data-testid="panel-right"] [data-testid="tool-terminal"]');
    
    await expect(page.locator('[data-testid="panel-left"] [data-testid="chat-interface"]')).toBeVisible();
    await expect(page.locator('[data-testid="panel-right"] [data-testid="terminal-interface"]')).toBeVisible();
    
    // Test panel resizing
    await page.hover('[data-testid="panel-resize-handle"]');
    await page.mouse.down();
    await page.mouse.move(100, 0);
    await page.mouse.up();
    
    const leftPanel = page.locator('[data-testid="workspace-panel-left"]');
    const rightPanel = page.locator('[data-testid="workspace-panel-right"]');
    
    const leftWidth = await leftPanel.evaluate(el => el.getBoundingClientRect().width);
    const rightWidth = await rightPanel.evaluate(el => el.getBoundingClientRect().width);
    
    expect(leftWidth).toBeLessThan(rightWidth);
  });

  test('should handle navigation errors gracefully', async ({ page }) => {
    // Test navigation to non-existent tool
    await page.goto('/workspace?tool=invalid-tool');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Tool not found');
    
    // Test navigation to non-existent file
    await page.goto('/workspace?tool=code-editor&file=non-existent.js');
    await expect(page.locator('[data-testid="file-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="file-error"]')).toContainText('File not found');
    
    // Test recovery from navigation errors
    await page.click('[data-testid="return-to-workspace"]');
    await expect(page.locator('[data-testid="workspace-main"]')).toBeVisible();
    await expect(page.locator('[data-testid="tool-chat"]')).toBeVisible();
  });
}); 
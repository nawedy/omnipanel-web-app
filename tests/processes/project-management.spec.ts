import { test, expect } from '@playwright/test';

test.describe('Project Management Process', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/workspace');
  });

  test('should create new project successfully', async ({ page }) => {
    // Open project creation
    await page.click('[data-testid="new-project-button"]');
    await expect(page.locator('[data-testid="project-creation-modal"]')).toBeVisible();
    
    // Fill project details
    await page.fill('[data-testid="project-name"]', 'Test Project');
    await page.fill('[data-testid="project-description"]', 'A test project for automation');
    await page.selectOption('[data-testid="project-template"]', 'react-app');
    
    // Create project
    await page.click('[data-testid="create-project-button"]');
    
    // Verify project creation
    await expect(page.locator('[data-testid="project-created-notification"]')).toBeVisible();
    await expect(page.locator('[data-testid="current-project-name"]')).toContainText('Test Project');
    
    // Verify project structure
    await expect(page.locator('[data-testid="file-tree"]')).toBeVisible();
    await expect(page.locator('[data-testid="file-tree-folder-src"]')).toBeVisible();
    await expect(page.locator('[data-testid="file-tree-file-package.json"]')).toBeVisible();
  });

  test('should open existing project', async ({ page }) => {
    // Open project selector
    await page.click('[data-testid="open-project-button"]');
    await expect(page.locator('[data-testid="project-selector-modal"]')).toBeVisible();
    
    // Select recent project
    await page.click('[data-testid="recent-project-item"]').first();
    
    // Verify project opens
    await expect(page.locator('[data-testid="project-loaded-notification"]')).toBeVisible();
    await expect(page.locator('[data-testid="file-tree"]')).toBeVisible();
    
    // Test project from file system
    await page.click('[data-testid="browse-folder-button"]');
    
    // Mock directory picker
    await page.evaluate(() => {
      // Mock the directory picker API
      window.showDirectoryPicker = async () => ({
        name: 'my-project',
        kind: 'directory',
        entries: async function* () {
          yield ['package.json', { kind: 'file' }];
          yield ['src', { kind: 'directory' }];
        }
      });
    });
    
    await page.click('[data-testid="select-folder-button"]');
    await expect(page.locator('[data-testid="project-loaded-notification"]')).toBeVisible();
  });

  test('should manage project settings', async ({ page }) => {
    // Open project settings
    await page.click('[data-testid="project-menu-button"]');
    await page.click('[data-testid="project-settings"]');
    
    await expect(page.locator('[data-testid="project-settings-modal"]')).toBeVisible();
    
    // Update project name
    await page.fill('[data-testid="settings-project-name"]', 'Updated Project Name');
    
    // Configure build settings
    await page.click('[data-testid="build-settings-tab"]');
    await page.fill('[data-testid="build-command"]', 'npm run build:prod');
    await page.fill('[data-testid="dev-command"]', 'npm run dev:custom');
    
    // Configure environment variables
    await page.click('[data-testid="env-settings-tab"]');
    await page.click('[data-testid="add-env-var"]');
    await page.fill('[data-testid="env-key-0"]', 'API_URL');
    await page.fill('[data-testid="env-value-0"]', 'https://api.example.com');
    
    // Save settings
    await page.click('[data-testid="save-project-settings"]');
    
    // Verify changes applied
    await expect(page.locator('[data-testid="settings-saved-notification"]')).toBeVisible();
    await expect(page.locator('[data-testid="current-project-name"]')).toContainText('Updated Project Name');
  });

  test('should handle project dependencies', async ({ page }) => {
    // Open package manager
    await page.click('[data-testid="package-manager-button"]');
    await expect(page.locator('[data-testid="package-manager-panel"]')).toBeVisible();
    
    // View installed packages
    await expect(page.locator('[data-testid="installed-packages"]')).toBeVisible();
    await expect(page.locator('[data-testid="package-item"]')).toHaveCountGreaterThan(0);
    
    // Search for new package
    await page.fill('[data-testid="package-search"]', 'lodash');
    await page.click('[data-testid="search-packages-button"]');
    
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="package-result-lodash"]')).toBeVisible();
    
    // Install package
    await page.click('[data-testid="install-package-lodash"]');
    await expect(page.locator('[data-testid="installing-notification"]')).toBeVisible();
    await expect(page.locator('[data-testid="package-installed-notification"]')).toBeVisible();
    
    // Verify package appears in installed list
    await page.click('[data-testid="installed-packages-tab"]');
    await expect(page.locator('[data-testid="package-item-lodash"]')).toBeVisible();
    
    // Update package
    await page.click('[data-testid="update-package-lodash"]');
    await expect(page.locator('[data-testid="package-updated-notification"]')).toBeVisible();
    
    // Remove package
    await page.click('[data-testid="remove-package-lodash"]');
    await page.click('[data-testid="confirm-remove"]');
    await expect(page.locator('[data-testid="package-removed-notification"]')).toBeVisible();
  });

  test('should support project templates and scaffolding', async ({ page }) => {
    // Create project from template
    await page.click('[data-testid="new-project-button"]');
    await page.click('[data-testid="template-gallery-tab"]');
    
    // View available templates
    const templates = ['React App', 'Vue App', 'Node.js API', 'Next.js', 'Express'];
    for (const template of templates) {
      await expect(page.locator(`[data-testid="template-${template.toLowerCase().replace(/[^a-z0-9]/g, '-')}"]`)).toBeVisible();
    }
    
    // Select template
    await page.click('[data-testid="template-react-app"]');
    await expect(page.locator('[data-testid="template-preview"]')).toBeVisible();
    
    // Configure template options
    await page.check('[data-testid="option-typescript"]');
    await page.check('[data-testid="option-tailwind"]');
    await page.uncheck('[data-testid="option-testing"]');
    
    // Create from template
    await page.fill('[data-testid="project-name"]', 'React Template Project');
    await page.click('[data-testid="create-from-template"]');
    
    // Verify template scaffolding
    await expect(page.locator('[data-testid="scaffolding-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-created-notification"]')).toBeVisible();
    
    // Verify template-specific files
    await expect(page.locator('[data-testid="file-tree-file-tsconfig.json"]')).toBeVisible();
    await expect(page.locator('[data-testid="file-tree-file-tailwind.config.js"]')).toBeVisible();
    await expect(page.locator('[data-testid="file-tree-folder-tests"]')).not.toBeVisible();
  });

  test('should manage project workspace and tabs', async ({ page }) => {
    // Open multiple files
    await page.click('[data-testid="file-tree-file-package.json"]');
    await page.click('[data-testid="file-tree-file-README.md"]');
    await page.click('[data-testid="file-tree-file-src/index.js"]');
    
    // Verify tabs are created
    await expect(page.locator('[data-testid="workspace-tab"]')).toHaveCount(3);
    
    // Test tab management
    await page.rightClick('[data-testid="tab-1"]');
    await expect(page.locator('[data-testid="tab-context-menu"]')).toBeVisible();
    
    await page.click('[data-testid="close-tab-action"]');
    await expect(page.locator('[data-testid="workspace-tab"]')).toHaveCount(2);
    
    // Test close all tabs
    await page.rightClick('[data-testid="tab-0"]');
    await page.click('[data-testid="close-all-tabs-action"]');
    await expect(page.locator('[data-testid="workspace-tab"]')).toHaveCount(0);
    
    // Test save workspace
    await page.click('[data-testid="file-tree-file-package.json"]');
    await page.click('[data-testid="file-tree-file-README.md"]');
    
    await page.click('[data-testid="workspace-menu"]');
    await page.click('[data-testid="save-workspace"]');
    await page.fill('[data-testid="workspace-name"]', 'My Workspace');
    await page.click('[data-testid="save-workspace-confirm"]');
    
    await expect(page.locator('[data-testid="workspace-saved-notification"]')).toBeVisible();
  });

  test('should support project collaboration features', async ({ page }) => {
    // Open collaboration panel
    await page.click('[data-testid="collaboration-button"]');
    await expect(page.locator('[data-testid="collaboration-panel"]')).toBeVisible();
    
    // Share project
    await page.click('[data-testid="share-project-button"]');
    await expect(page.locator('[data-testid="share-modal"]')).toBeVisible();
    
    // Generate share link
    await page.click('[data-testid="generate-share-link"]');
    await expect(page.locator('[data-testid="share-link"]')).toBeVisible();
    
    // Test copy link
    await page.click('[data-testid="copy-share-link"]');
    await expect(page.locator('[data-testid="link-copied-notification"]')).toBeVisible();
    
    // Configure permissions
    await page.selectOption('[data-testid="share-permissions"]', 'read-write');
    await page.check('[data-testid="allow-comments"]');
    
    // Invite collaborators
    await page.fill('[data-testid="collaborator-email"]', 'test@example.com');
    await page.click('[data-testid="send-invitation"]');
    await expect(page.locator('[data-testid="invitation-sent-notification"]')).toBeVisible();
    
    // View project activity
    await page.click('[data-testid="project-activity-tab"]');
    await expect(page.locator('[data-testid="activity-feed"]')).toBeVisible();
    await expect(page.locator('[data-testid="activity-item"]')).toHaveCountGreaterThan(0);
  });

  test('should handle project import and export', async ({ page }) => {
    // Export project
    await page.click('[data-testid="project-menu-button"]');
    await page.click('[data-testid="export-project"]');
    
    await expect(page.locator('[data-testid="export-modal"]')).toBeVisible();
    
    // Configure export options
    await page.check('[data-testid="include-dependencies"]');
    await page.check('[data-testid="include-git-history"]');
    await page.selectOption('[data-testid="export-format"]', 'zip');
    
    // Start export
    await page.click('[data-testid="start-export"]');
    await expect(page.locator('[data-testid="export-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="export-complete-notification"]')).toBeVisible();
    
    // Import project
    await page.click('[data-testid="import-project-button"]');
    await expect(page.locator('[data-testid="import-modal"]')).toBeVisible();
    
    // Mock file upload
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('[data-testid="select-import-file"]');
    const fileChooser = await fileChooserPromise;
    
    await fileChooser.setFiles({
      name: 'project.zip',
      mimeType: 'application/zip',
      buffer: Buffer.from('mock zip content')
    });
    
    // Start import
    await page.click('[data-testid="start-import"]');
    await expect(page.locator('[data-testid="import-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="import-complete-notification"]')).toBeVisible();
  });

  test('should manage project versions and backups', async ({ page }) => {
    // Open version control
    await page.click('[data-testid="version-control-button"]');
    await expect(page.locator('[data-testid="version-control-panel"]')).toBeVisible();
    
    // Create backup
    await page.click('[data-testid="create-backup-button"]');
    await page.fill('[data-testid="backup-name"]', 'Before major changes');
    await page.click('[data-testid="create-backup-confirm"]');
    
    await expect(page.locator('[data-testid="backup-created-notification"]')).toBeVisible();
    
    // View backup history
    await page.click('[data-testid="backup-history-tab"]');
    await expect(page.locator('[data-testid="backup-item"]')).toHaveCountGreaterThan(0);
    
    // Restore from backup
    await page.click('[data-testid="restore-backup-0"]');
    await page.click('[data-testid="confirm-restore"]');
    
    await expect(page.locator('[data-testid="backup-restored-notification"]')).toBeVisible();
    
    // Auto-backup settings
    await page.click('[data-testid="backup-settings-tab"]');
    await page.check('[data-testid="enable-auto-backup"]');
    await page.selectOption('[data-testid="backup-frequency"]', 'hourly');
    await page.fill('[data-testid="max-backups"]', '10');
    
    await page.click('[data-testid="save-backup-settings"]');
    await expect(page.locator('[data-testid="settings-saved-notification"]')).toBeVisible();
  });

  test('should handle project errors and recovery', async ({ page }) => {
    // Simulate project corruption
    await page.evaluate(() => {
      localStorage.setItem('currentProject', 'invalid-json');
    });
    
    await page.reload();
    
    // Verify error handling
    await expect(page.locator('[data-testid="project-error-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Failed to load project');
    
    // Test recovery options
    await page.click('[data-testid="recover-from-backup"]');
    await expect(page.locator('[data-testid="backup-list"]')).toBeVisible();
    
    await page.click('[data-testid="backup-item-0"]');
    await page.click('[data-testid="restore-backup"]');
    
    await expect(page.locator('[data-testid="project-recovered-notification"]')).toBeVisible();
    
    // Test create new project option
    await page.click('[data-testid="create-new-project-option"]');
    await expect(page.locator('[data-testid="project-creation-modal"]')).toBeVisible();
  });
}); 
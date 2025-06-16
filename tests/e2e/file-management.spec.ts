import { test, expect } from '@playwright/test';

test.describe('File Management Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="workspace-layout"]');
  });

  test('should display file tree', async ({ page }) => {
    // Mock file system data
    await page.route('**/api/files/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          files: [
            {
              name: 'src',
              type: 'directory',
              path: '/project/src',
              children: [
                { name: 'index.js', type: 'file', path: '/project/src/index.js', size: 1024 },
                { name: 'utils.js', type: 'file', path: '/project/src/utils.js', size: 512 }
              ]
            },
            { name: 'package.json', type: 'file', path: '/project/package.json', size: 2048 },
            { name: 'README.md', type: 'file', path: '/project/README.md', size: 1536 }
          ]
        })
      });
    });

    await page.reload();
    
    // Check if file tree is visible
    await expect(page.locator('[data-testid="file-tree"]')).toBeVisible();
    await expect(page.locator('text=src')).toBeVisible();
    await expect(page.locator('text=package.json')).toBeVisible();
    await expect(page.locator('text=README.md')).toBeVisible();
  });

  test('should expand and collapse directories', async ({ page }) => {
    // Mock file system data
    await page.route('**/api/files/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          files: [
            {
              name: 'src',
              type: 'directory',
              path: '/project/src',
              children: [
                { name: 'index.js', type: 'file', path: '/project/src/index.js' }
              ]
            }
          ]
        })
      });
    });

    await page.reload();
    
    // Click to expand directory
    await page.click('[data-testid="directory-toggle-src"]');
    
    // Check if directory contents are visible
    await expect(page.locator('text=index.js')).toBeVisible();
    
    // Click to collapse directory
    await page.click('[data-testid="directory-toggle-src"]');
    
    // Check if directory contents are hidden
    await expect(page.locator('text=index.js')).not.toBeVisible();
  });

  test('should open files in editor', async ({ page }) => {
    // Mock file content
    await page.route('**/api/files/content/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          content: 'console.log("Hello World");',
          language: 'javascript'
        })
      });
    });

    // Click on a file
    await page.click('[data-testid="file-item-index.js"]');
    
    // Check if editor tab opens
    await expect(page.locator('[data-testid="editor-tab-index.js"]')).toBeVisible();
    
    // Check if file content is loaded
    await expect(page.locator('text=console.log("Hello World");')).toBeVisible();
  });

  test('should handle file operations', async ({ page }) => {
    // Right-click on a file
    await page.click('[data-testid="file-item-index.js"]', { button: 'right' });
    
    // Check if context menu appears
    await expect(page.locator('[data-testid="file-context-menu"]')).toBeVisible();
    await expect(page.locator('text=Rename')).toBeVisible();
    await expect(page.locator('text=Delete')).toBeVisible();
    await expect(page.locator('text=Copy Path')).toBeVisible();
  });

  test('should create new files', async ({ page }) => {
    // Right-click in empty space
    await page.click('[data-testid="file-tree"]', { button: 'right' });
    
    // Click on "New File"
    await page.click('[data-testid="context-menu-new-file"]');
    
    // Enter file name
    await page.fill('[data-testid="new-file-input"]', 'newfile.js');
    await page.press('[data-testid="new-file-input"]', 'Enter');
    
    // Mock file creation
    await page.route('**/api/files/create', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, file: { name: 'newfile.js', type: 'file' } })
      });
    });
    
    // Check if new file appears in tree
    await expect(page.locator('text=newfile.js')).toBeVisible();
  });

  test('should create new directories', async ({ page }) => {
    // Right-click in empty space
    await page.click('[data-testid="file-tree"]', { button: 'right' });
    
    // Click on "New Folder"
    await page.click('[data-testid="context-menu-new-folder"]');
    
    // Enter folder name
    await page.fill('[data-testid="new-folder-input"]', 'newfolder');
    await page.press('[data-testid="new-folder-input"]', 'Enter');
    
    // Mock folder creation
    await page.route('**/api/files/create-directory', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, directory: { name: 'newfolder', type: 'directory' } })
      });
    });
    
    // Check if new folder appears in tree
    await expect(page.locator('text=newfolder')).toBeVisible();
  });

  test('should rename files', async ({ page }) => {
    // Right-click on a file
    await page.click('[data-testid="file-item-index.js"]', { button: 'right' });
    
    // Click on "Rename"
    await page.click('[data-testid="context-menu-rename"]');
    
    // Enter new name
    await page.fill('[data-testid="rename-input"]', 'main.js');
    await page.press('[data-testid="rename-input"]', 'Enter');
    
    // Mock rename operation
    await page.route('**/api/files/rename', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, newName: 'main.js' })
      });
    });
    
    // Check if file is renamed
    await expect(page.locator('text=main.js')).toBeVisible();
    await expect(page.locator('text=index.js')).not.toBeVisible();
  });

  test('should delete files', async ({ page }) => {
    // Right-click on a file
    await page.click('[data-testid="file-item-index.js"]', { button: 'right' });
    
    // Click on "Delete"
    await page.click('[data-testid="context-menu-delete"]');
    
    // Confirm deletion
    await expect(page.locator('[data-testid="delete-confirmation"]')).toBeVisible();
    await page.click('[data-testid="confirm-delete"]');
    
    // Mock delete operation
    await page.route('**/api/files/delete', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });
    
    // Check if file is removed
    await expect(page.locator('text=index.js')).not.toBeVisible();
  });

  test('should handle file search', async ({ page }) => {
    // Click on search button
    await page.click('[data-testid="file-search-button"]');
    
    // Enter search term
    await page.fill('[data-testid="file-search-input"]', 'index');
    
    // Mock search results
    await page.route('**/api/files/search', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          results: [
            { name: 'index.js', path: '/project/src/index.js', type: 'file' },
            { name: 'index.html', path: '/project/public/index.html', type: 'file' }
          ]
        })
      });
    });
    
    // Check if search results are displayed
    await expect(page.locator('[data-testid="search-result-index.js"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-result-index.html"]')).toBeVisible();
  });

  test('should handle file upload', async ({ page }) => {
    // Click on upload button
    await page.click('[data-testid="file-upload-button"]');
    
    // Upload file
    const testFile = {
      name: 'uploaded.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('This is uploaded content')
    };
    
    await page.locator('input[type="file"]').setInputFiles(testFile);
    
    // Mock upload
    await page.route('**/api/files/upload', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, file: { name: 'uploaded.txt', type: 'file' } })
      });
    });
    
    // Check if uploaded file appears
    await expect(page.locator('text=uploaded.txt')).toBeVisible();
  });

  test('should handle drag and drop', async ({ page }) => {
    // Mock drag and drop operation
    await page.route('**/api/files/move', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });

    // Simulate drag and drop
    const sourceFile = page.locator('[data-testid="file-item-index.js"]');
    const targetFolder = page.locator('[data-testid="directory-item-src"]');
    
    await sourceFile.dragTo(targetFolder);
    
    // Check if file is moved (this would require more complex mocking)
    await expect(page.locator('text=File moved successfully')).toBeVisible();
  });

  test('should handle file permissions', async ({ page }) => {
    // Right-click on a file
    await page.click('[data-testid="file-item-index.js"]', { button: 'right' });
    
    // Click on "Properties"
    await page.click('[data-testid="context-menu-properties"]');
    
    // Check if properties modal opens
    await expect(page.locator('[data-testid="file-properties-modal"]')).toBeVisible();
    await expect(page.locator('text=Permissions')).toBeVisible();
    await expect(page.locator('text=Size')).toBeVisible();
    await expect(page.locator('text=Modified')).toBeVisible();
  });

  test('should handle large file trees', async ({ page }) => {
    // Mock large file tree
    const largeFileTree = {
      files: Array.from({ length: 100 }, (_, i) => ({
        name: `file${i}.js`,
        type: 'file',
        path: `/project/file${i}.js`,
        size: 1024
      }))
    };

    await page.route('**/api/files/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(largeFileTree)
      });
    });

    await page.reload();
    
    // Check if virtualization is working (only visible files are rendered)
    const visibleFiles = await page.locator('[data-testid^="file-item-"]').count();
    expect(visibleFiles).toBeLessThan(100); // Should be virtualized
    
    // Scroll to load more files
    await page.locator('[data-testid="file-tree"]').scroll({ top: 1000 });
    
    // Check if more files are loaded
    await expect(page.locator('text=file50.js')).toBeVisible();
  });
}); 
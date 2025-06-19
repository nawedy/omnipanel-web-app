import { test, expect } from '@playwright/test';

test.describe('Documentation Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/workspace');
  });

  test('should validate Quick Reference Guide features', async ({ page }) => {
    // Test keyboard shortcuts from Quick Reference
    const shortcuts = [
      { key: 'Control+1', element: '[data-testid="chat-interface"]', description: 'Switch to Chat' },
      { key: 'Control+2', element: '[data-testid="terminal-interface"]', description: 'Switch to Terminal' },
      { key: 'Control+3', element: '[data-testid="code-editor-interface"]', description: 'Switch to Code Editor' },
      { key: 'Control+4', element: '[data-testid="notebook-interface"]', description: 'Switch to Notebook' },
      { key: 'Control+5', element: '[data-testid="research-interface"]', description: 'Switch to Research' },
      { key: 'Control+k', element: '[data-testid="global-search"]', description: 'Global Search' },
      { key: 'Control+Shift+p', element: '[data-testid="command-palette"]', description: 'Command Palette' },
      { key: 'Control+,', element: '[data-testid="settings-modal"]', description: 'Open Settings' }
    ];

    for (const shortcut of shortcuts) {
      await page.keyboard.press(shortcut.key);
      await expect(page.locator(shortcut.element)).toBeVisible({ timeout: 2000 });
      console.log(`✓ ${shortcut.description}: ${shortcut.key}`);
    }
  });

  test('should validate User Guide features exist', async ({ page }) => {
    // Test features mentioned in User Guide
    const features = [
      { selector: '[data-testid="workspace-sidebar"]', name: 'Workspace Sidebar' },
      { selector: '[data-testid="tool-grid"]', name: 'Professional Tool Grid' },
      { selector: '[data-testid="ai-model-selector"]', name: 'AI Model Selector' },
      { selector: '[data-testid="file-tree"]', name: 'File Tree' },
      { selector: '[data-testid="workspace-header"]', name: 'Workspace Header' },
      { selector: '[data-testid="theme-toggle"]', name: 'Theme Toggle' },
      { selector: '[data-testid="notifications-button"]', name: 'Notifications' },
      { selector: '[data-testid="user-profile-button"]', name: 'User Profile' }
    ];

    for (const feature of features) {
      await expect(page.locator(feature.selector)).toBeVisible({ timeout: 5000 });
      console.log(`✓ ${feature.name} is present`);
    }
  });

  test('should validate Onboarding Checklist items', async ({ page }) => {
    // Navigate to onboarding if it exists
    await page.goto('/onboarding').catch(() => {
      // If onboarding route doesn't exist, skip this test
      test.skip();
    });

    const checklistItems = [
      'workspace-setup',
      'ai-model-configuration', 
      'first-chat',
      'file-management',
      'terminal-usage',
      'settings-customization'
    ];

    for (const item of checklistItems) {
      const selector = `[data-testid="checklist-${item}"]`;
      if (await page.locator(selector).count() > 0) {
        await expect(page.locator(selector)).toBeVisible();
        console.log(`✓ Checklist item: ${item}`);
      } else {
        console.log(`⚠ Missing checklist item: ${item}`);
      }
    }
  });

  test('should validate AI Models mentioned in documentation', async ({ page }) => {
    await page.click('[data-testid="tool-chat"]');
    
    // Check if AI model selector exists
    if (await page.locator('[data-testid="ai-model-selector"]').count() > 0) {
      await page.click('[data-testid="ai-model-selector"]');
      
      const expectedModels = [
        'GPT-4',
        'GPT-3.5',
        'Claude',
        'Llama',
        'Local Model'
      ];

      for (const model of expectedModels) {
        const modelSelector = `[data-testid*="${model.toLowerCase().replace(/[^a-z0-9]/g, '-')}"]`;
        if (await page.locator(modelSelector).count() > 0) {
          console.log(`✓ AI Model available: ${model}`);
        } else {
          console.log(`⚠ AI Model not found: ${model}`);
        }
      }
    }
  });

  test('should validate workspace tools mentioned in guides', async ({ page }) => {
    const tools = [
      { name: 'Chat', testid: 'tool-chat', interface: 'chat-interface' },
      { name: 'Terminal', testid: 'tool-terminal', interface: 'terminal-interface' },
      { name: 'Code Editor', testid: 'tool-code-editor', interface: 'code-editor-interface' },
      { name: 'Notebook', testid: 'tool-notebook', interface: 'notebook-interface' },
      { name: 'Research', testid: 'tool-research', interface: 'research-interface' }
    ];

    for (const tool of tools) {
      // Check if tool button exists
      if (await page.locator(`[data-testid="${tool.testid}"]`).count() > 0) {
        await page.click(`[data-testid="${tool.testid}"]`);
        
        // Check if interface loads
        if (await page.locator(`[data-testid="${tool.interface}"]`).count() > 0) {
          await expect(page.locator(`[data-testid="${tool.interface}"]`)).toBeVisible();
          console.log(`✓ ${tool.name} tool working`);
        } else {
          console.log(`⚠ ${tool.name} interface not found`);
        }
      } else {
        console.log(`⚠ ${tool.name} tool button not found`);
      }
    }
  });

  test('should validate settings sections from documentation', async ({ page }) => {
    // Try to open settings
    await page.keyboard.press('Control+,').catch(() => {
      page.click('[data-testid="settings-button"]').catch(() => {
        console.log('⚠ Settings not accessible via keyboard or button');
      });
    });

    // Wait for settings modal or navigate to settings page
    const settingsModal = page.locator('[data-testid="settings-modal"]');
    const settingsPage = page.locator('[data-testid="settings-page"]');
    
    if (await settingsModal.count() > 0 || await settingsPage.count() > 0) {
      const settingsSections = [
        'general-settings',
        'ai-models-settings',
        'theme-settings',
        'keyboard-settings',
        'plugins-settings',
        'database-settings',
        'privacy-settings'
      ];

      for (const section of settingsSections) {
        const sectionSelector = `[data-testid="${section}"], [data-testid="settings-${section}"]`;
        if (await page.locator(sectionSelector).count() > 0) {
          console.log(`✓ Settings section: ${section}`);
        } else {
          console.log(`⚠ Settings section not found: ${section}`);
        }
      }
    } else {
      console.log('⚠ Settings interface not found');
    }
  });

  test('should validate file management features', async ({ page }) => {
    const fileFeatures = [
      { selector: '[data-testid="file-tree"]', name: 'File Tree' },
      { selector: '[data-testid="new-file-button"]', name: 'New File Button' },
      { selector: '[data-testid="new-folder-button"]', name: 'New Folder Button' },
      { selector: '[data-testid="file-search"]', name: 'File Search' },
      { selector: '[data-testid="file-upload"]', name: 'File Upload' }
    ];

    for (const feature of fileFeatures) {
      if (await page.locator(feature.selector).count() > 0) {
        console.log(`✓ ${feature.name} available`);
      } else {
        console.log(`⚠ ${feature.name} not found`);
      }
    }
  });

  test('should validate terminal features from documentation', async ({ page }) => {
    await page.click('[data-testid="tool-terminal"]');
    
    if (await page.locator('[data-testid="terminal-interface"]').count() > 0) {
      const terminalFeatures = [
        { selector: '[data-testid="terminal-input"]', name: 'Terminal Input' },
        { selector: '[data-testid="terminal-output"]', name: 'Terminal Output' },
        { selector: '[data-testid="terminal-clear"]', name: 'Clear Terminal' },
        { selector: '[data-testid="terminal-history"]', name: 'Command History' }
      ];

      for (const feature of terminalFeatures) {
        if (await page.locator(feature.selector).count() > 0) {
          console.log(`✓ Terminal feature: ${feature.name}`);
        } else {
          console.log(`⚠ Terminal feature not found: ${feature.name}`);
        }
      }
    } else {
      console.log('⚠ Terminal interface not accessible');
    }
  });

  test('should validate research tool features', async ({ page }) => {
    await page.click('[data-testid="tool-research"]');
    
    if (await page.locator('[data-testid="research-interface"]').count() > 0) {
      const researchFeatures = [
        { selector: '[data-testid="research-query"]', name: 'Research Query Input' },
        { selector: '[data-testid="search-button"]', name: 'Search Button' },
        { selector: '[data-testid="research-results"]', name: 'Research Results' },
        { selector: '[data-testid="save-research"]', name: 'Save Research' }
      ];

      for (const feature of researchFeatures) {
        if (await page.locator(feature.selector).count() > 0) {
          console.log(`✓ Research feature: ${feature.name}`);
        } else {
          console.log(`⚠ Research feature not found: ${feature.name}`);
        }
      }
    } else {
      console.log('⚠ Research interface not accessible');
    }
  });

  test('should validate plugin system features', async ({ page }) => {
    // Try to access plugins
    const pluginAccess = [
      '[data-testid="plugins-button"]',
      '[data-testid="sidebar-plugins"]',
      '[data-testid="plugin-manager"]'
    ];

    let pluginInterfaceFound = false;
    for (const selector of pluginAccess) {
      if (await page.locator(selector).count() > 0) {
        await page.click(selector);
        pluginInterfaceFound = true;
        break;
      }
    }

    if (pluginInterfaceFound) {
      const pluginFeatures = [
        { selector: '[data-testid="installed-plugins"]', name: 'Installed Plugins List' },
        { selector: '[data-testid="plugin-store"]', name: 'Plugin Store' },
        { selector: '[data-testid="install-plugin"]', name: 'Install Plugin Button' },
        { selector: '[data-testid="plugin-settings"]', name: 'Plugin Settings' }
      ];

      for (const feature of pluginFeatures) {
        if (await page.locator(feature.selector).count() > 0) {
          console.log(`✓ Plugin feature: ${feature.name}`);
        } else {
          console.log(`⚠ Plugin feature not found: ${feature.name}`);
        }
      }
    } else {
      console.log('⚠ Plugin interface not accessible');
    }
  });

  test('should validate database integration features', async ({ page }) => {
    const databaseFeatures = [
      { selector: '[data-testid="database-status"]', name: 'Database Status' },
      { selector: '[data-testid="database-connection"]', name: 'Database Connection' },
      { selector: '[data-testid="sql-editor"]', name: 'SQL Editor' },
      { selector: '[data-testid="database-tables"]', name: 'Database Tables' }
    ];

    for (const feature of databaseFeatures) {
      if (await page.locator(feature.selector).count() > 0) {
        console.log(`✓ Database feature: ${feature.name}`);
      } else {
        console.log(`⚠ Database feature not found: ${feature.name}`);
      }
    }
  });

  test('should validate theme and customization features', async ({ page }) => {
    const themeFeatures = [
      { selector: '[data-testid="theme-toggle"]', name: 'Theme Toggle' },
      { selector: '[data-testid="theme-selector"]', name: 'Theme Selector' },
      { selector: '[data-testid="custom-theme"]', name: 'Custom Theme Options' },
      { selector: '[data-testid="layout-options"]', name: 'Layout Options' }
    ];

    for (const feature of themeFeatures) {
      if (await page.locator(feature.selector).count() > 0) {
        console.log(`✓ Theme feature: ${feature.name}`);
      } else {
        console.log(`⚠ Theme feature not found: ${feature.name}`);
      }
    }
  });

  test('should generate documentation coverage report', async ({ page }) => {
    const results = {
      totalFeatures: 0,
      implementedFeatures: 0,
      missingFeatures: [],
      workingFeatures: []
    };

    // This test aggregates results from all other validation tests
    // In a real implementation, you would collect data from the previous tests
    
    console.log('\n=== DOCUMENTATION COVERAGE REPORT ===');
    console.log(`Total Features Documented: ${results.totalFeatures}`);
    console.log(`Features Implemented: ${results.implementedFeatures}`);
    console.log(`Coverage: ${results.totalFeatures > 0 ? Math.round((results.implementedFeatures / results.totalFeatures) * 100) : 0}%`);
    
    if (results.missingFeatures.length > 0) {
      console.log('\nMISSING FEATURES:');
      results.missingFeatures.forEach(feature => console.log(`- ${feature}`));
    }
    
    if (results.workingFeatures.length > 0) {
      console.log('\nWORKING FEATURES:');
      results.workingFeatures.forEach(feature => console.log(`+ ${feature}`));
    }
    
    console.log('=====================================\n');
  });
}); 
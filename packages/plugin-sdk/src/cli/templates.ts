// packages/plugin-sdk/src/cli/templates.ts
// Plugin templates for scaffolding new plugins

export class PluginTemplate {
  static getBasicTemplate(): string {
    return `
import { createPlugin } from '@omnipanel/plugin-sdk';

export default createPlugin(
  {
    id: 'my-plugin',
    name: 'My Plugin',
    version: '1.0.0',
    description: 'A sample plugin',
    author: 'Plugin Author',
    main: 'index.js',
    category: 'utilities'
  },
  async (api) => {
    // Plugin activation logic
    api.utils.log('Plugin activated!');
  },
  async () => {
    // Plugin deactivation logic
  }
);
`;
  }
} 
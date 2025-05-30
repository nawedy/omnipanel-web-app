const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;
// This can be replaced with `find-yarn-workspace-root`
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
config.resolver.disableHierarchicalLookup = true;

// 4. Add support for shared packages
config.resolver.alias = {
  '@omnipanel/types': path.resolve(workspaceRoot, 'packages/types/src'),
  '@omnipanel/config': path.resolve(workspaceRoot, 'packages/config/src'),
  '@omnipanel/core': path.resolve(workspaceRoot, 'packages/core/src'),
  '@omnipanel/ui': path.resolve(workspaceRoot, 'packages/ui/src'),
  '@omnipanel/database': path.resolve(workspaceRoot, 'packages/database/src'),
  '@omnipanel/llm-adapters': path.resolve(workspaceRoot, 'packages/llm-adapters/src'),
};

// 5. Add support for TypeScript files
config.resolver.sourceExts.push('ts', 'tsx');

// 6. Configure transformer for React Native SVG
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts.push('svg');

module.exports = config; 
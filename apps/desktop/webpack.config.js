const path = require('path');
const webpack = require('webpack');

const isDevelopment = process.env.NODE_ENV === 'development';

const baseConfig = {
  mode: isDevelopment ? 'development' : 'production',
  devtool: isDevelopment ? 'source-map' : false,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  externals: {
    electron: 'commonjs2 electron',
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  optimization: {
    minimize: !isDevelopment,
  },
};

// Main process configuration
const mainConfig = {
  ...baseConfig,
  target: 'electron-main',
  entry: {
    main: './src/main/main.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main/[name].js',
    libraryTarget: 'commonjs2',
  },
  externals: {
    ...baseConfig.externals,
    'electron-store': 'commonjs2 electron-store',
    'electron-updater': 'commonjs2 electron-updater',
    'electron-window-state': 'commonjs2 electron-window-state',
    'chokidar': 'commonjs2 chokidar',
    'node-machine-id': 'commonjs2 node-machine-id',
    'ps-tree': 'commonjs2 ps-tree',
    'tree-kill': 'commonjs2 tree-kill',
    'systeminformation': 'commonjs2 systeminformation',
    'axios': 'commonjs2 axios',
    'ws': 'commonjs2 ws',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    }),
  ],
};

// Preload process configuration
const preloadConfig = {
  ...baseConfig,
  target: 'electron-preload',
  entry: {
    preload: './src/preload/preload.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'preload/[name].js',
    libraryTarget: 'commonjs2',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    }),
  ],
};

module.exports = [mainConfig, preloadConfig]; 
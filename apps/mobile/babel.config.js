module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
            '@/components': './src/components',
            '@/screens': './src/screens',
            '@/navigation': './src/navigation',
            '@/hooks': './src/hooks',
            '@/services': './src/services',
            '@/store': './src/store',
            '@/utils': './src/utils',
            '@/types': './src/types',
            '@/constants': './src/constants',
            '@/assets': './assets',
          },
        },
      ],
      [
        'react-native-reanimated/plugin',
        {
          relativeSourceLocation: true,
        },
      ],
      'expo-router/babel',
    ],
  };
}; 
# OmniPanel Mobile App 📱

A full-featured React Native/Expo mobile app for the OmniPanel AI workspace.

## Features

- **Cross-platform**: iOS and Android support
- **Real-time sync**: Seamless data synchronization with NeonDB
- **Multi-model AI**: Support for multiple LLM providers
- **Offline-first**: Works without internet connection
- **Biometric auth**: Face ID/Touch ID support
- **Modern UI**: Beautiful, responsive design with dark/light themes
- **Voice input**: Speech-to-text for hands-free interaction
- **File management**: Upload, download, and manage project files
- **Push notifications**: Stay updated with real-time alerts

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand + React Context
- **Backend**: NeonDB (Auth, Database, Storage, Real-time)
- **Styling**: StyleSheet with dynamic theming
- **Icons**: Lucide React Native
- **Storage**: Expo SecureStore + AsyncStorage
- **Authentication**: Stack Auth with biometric support

## Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI: `npm install -g @expo/cli`
- iOS Simulator (macOS) or Android Studio
- Expo Go app on your device (for testing)

## Getting Started

### 1. Install Dependencies

```bash
cd omnipanel-core/apps/mobile
npm install
```

### 2. Environment Setup

Create a `.env` file in the mobile app root:

```env
EXPO_PUBLIC_NEON_DATABASE_URL=your_neon_database_url
EXPO_PUBLIC_STACK_PROJECT_ID=your_stack_project_id
```

### 3. Development

```bash
# Start the development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web (for testing)
npm run web
```

### 4. Building

```bash
# Build for development
npm run build:development

# Build for production
npm run build:production

# Build for both platforms
npm run build:all
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components
│   └── navigation/     # Navigation components
├── screens/            # Screen components
├── providers/          # React Context providers
├── hooks/              # Custom React hooks
├── services/           # API and external services
├── store/              # State management
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
└── constants/          # App constants

app/                    # Expo Router pages
├── (auth)/            # Authentication flow
├── (tabs)/            # Main tab navigation
├── onboarding/        # Onboarding screens
└── modal/             # Modal screens

assets/                 # Static assets
├── fonts/             # Custom fonts
├── images/            # Images and icons
└── sounds/            # Audio files
```

## Key Features Implementation

### Authentication
- Stack Auth with email/password
- Biometric authentication (Face ID/Touch ID)
- Secure token storage with Expo SecureStore
- Offline authentication fallback

### Real-time Sync
- NeonDB real-time subscriptions
- Optimistic updates for better UX
- Conflict resolution for offline changes
- Background sync when app becomes active

### Multi-model AI
- Integration with shared LLM adapters package
- Model switching and configuration
- Streaming responses for real-time chat
- Context management across conversations

### Offline Support
- Local data storage with SQLite
- Queue system for pending operations
- Automatic sync when connection restored
- Offline indicators and fallback UI

## Development Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint + Prettier for code formatting
- Functional components with hooks
- Proper error handling and loading states

### Performance
- Lazy loading for screens and components
- Image optimization and caching
- Efficient list rendering with FlatList
- Memory leak prevention

### Testing
```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Debugging
- Use Flipper for advanced debugging
- React Native Debugger for component inspection
- Expo DevTools for logs and performance

## Deployment

### App Store (iOS)
1. Configure app.json with proper bundle identifier
2. Set up Apple Developer account and certificates
3. Build with EAS: `eas build --platform ios`
4. Submit: `eas submit --platform ios`

### Google Play (Android)
1. Configure app.json with proper package name
2. Set up Google Play Console and signing keys
3. Build with EAS: `eas build --platform android`
4. Submit: `eas submit --platform android`

### Over-the-Air Updates
```bash
# Publish update
eas update --branch production

# Rollback if needed
eas update --branch production --message "Rollback to previous version"
```

## Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `expo r -c`
2. **iOS build failures**: Check Xcode version and certificates
3. **Android build issues**: Verify Android SDK and Java versions
4. **Dependency conflicts**: Clear node_modules and reinstall

### Performance Issues
- Use Flipper to profile performance
- Check for memory leaks in long-running screens
- Optimize images and reduce bundle size
- Use lazy loading for heavy components

## Contributing

1. Follow the existing code style and patterns
2. Add tests for new features
3. Update documentation for API changes
4. Test on both iOS and Android before submitting

## License

This project is part of the OmniPanel workspace and follows the same license terms. 
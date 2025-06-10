# 📱💻 Mobile & Desktop App Builds

## 🔧 Prerequisites

### Desktop App Requirements
```bash
# Install Node.js 18+
node --version  # Should be 18.0.0+

# Install build tools
npm install -g electron-builder

# Platform-specific tools:
# macOS: Xcode Command Line Tools
# Windows: Visual Studio Build Tools
# Linux: build-essential
```

### Mobile App Requirements
```bash
# Install Expo CLI
npm install -g @expo/cli eas-cli

# Create Expo account
expo register  # or expo login

# Install mobile development tools:
# Android: Android Studio + SDK
# iOS: Xcode (macOS only)
```

## 🖥️ Desktop App Builds

### Quick Build (All Platforms)

```bash
# Navigate to desktop app
cd omnipanel-core/apps/desktop

# Install dependencies
npm install

# Build for all platforms
npm run dist:all

# Output will be in: omnipanel-core/apps/desktop/dist/
# - Windows: .exe, .zip
# - macOS: .dmg, .zip  
# - Linux: .AppImage, .deb, .rpm
```

### Platform-Specific Builds

```bash
# Windows only (can run on any OS)
npm run dist:win

# macOS only (requires macOS)
npm run dist:mac

# Linux only  
npm run dist:linux

# Development build (current platform)
npm run pack
```

### Desktop Build Outputs

```
apps/desktop/dist/
├── OmniPanel-1.0.0.dmg              # macOS installer (DMG)
├── OmniPanel-1.0.0-mac.zip          # macOS portable
├── OmniPanel Setup 1.0.0.exe        # Windows installer
├── OmniPanel-1.0.0-win.zip          # Windows portable
├── OmniPanel-1.0.0.AppImage         # Linux universal
├── omnipanel_1.0.0_amd64.deb        # Debian/Ubuntu
├── omnipanel-1.0.0.x86_64.rpm       # Red Hat/CentOS/Fedora
└── latest.yml                       # Auto-updater metadata
```

### Code Signing (Optional but Recommended)

#### macOS Code Signing
```bash
# With Apple Developer account ($99/year)
export APPLE_ID="your-apple-id@email.com"
export APPLE_ID_PASSWORD="app-specific-password"
export APPLE_TEAM_ID="your-team-id"

# Build with signing
npm run dist:mac
```

#### Windows Code Signing
```bash
# With code signing certificate
export CSC_LINK="path/to/certificate.p12"
export CSC_KEY_PASSWORD="certificate-password"

# Build with signing
npm run dist:win
```

## 📱 Mobile App Builds

### Android APK Build

```bash
# Navigate to mobile app
cd omnipanel-core/apps/mobile

# Build production APK
eas build --platform android --profile production

# Build preview APK (for testing)
eas build --platform android --profile preview

# Download APK when complete
# Link will be provided in terminal and email
```

### iOS Build

```bash
# Build for iOS (requires macOS)
eas build --platform ios --profile production

# Build for TestFlight distribution
eas build --platform ios --profile preview
```

### Configure Build Profiles

Edit `omnipanel-core/apps/mobile/eas.json`:

```json
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Mobile Build Outputs

```
# Android
OmniPanel-v1.0.0.apk              # Direct install APK
OmniPanel-v1.0.0.aab              # Play Store bundle

# iOS  
OmniPanel-v1.0.0.ipa              # iOS app package
OmniPanel-v1.0.0-simulator.app    # iOS simulator build
```

## 🔄 Automated Build Pipeline

### GitHub Actions for Desktop

Create `.github/workflows/build-desktop.yml`:

```yaml
name: Build Desktop Apps

on:
  push:
    tags: ['v*']

jobs:
  build:
    strategy:
      matrix:
        os: [macos-latest, ubuntu-latest, windows-latest]
    
    runs-on: ${{ matrix.os }}
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build packages
        run: npm run build
      
      - name: Build desktop app
        run: |
          cd omnipanel-core/apps/desktop
          npm run dist
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: desktop-${{ matrix.os }}
          path: omnipanel-core/apps/desktop/dist/
```

### GitHub Actions for Mobile

Create `.github/workflows/build-mobile.yml`:

```yaml
name: Build Mobile Apps

on:
  push:
    tags: ['v*']

jobs:
  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - name: Install dependencies
        run: |
          cd omnipanel-core/apps/mobile
          npm install
      
      - name: Build Android APK
        run: |
          cd omnipanel-core/apps/mobile
          eas build --platform android --non-interactive
```

## 📦 Distribution Setup

### 1. Create GitHub Releases

```bash
# Create release with desktop builds
gh release create v1.0.0 \
  --title "OmniPanel v1.0.0 - Initial Release" \
  --notes "Complete AI workspace with cross-platform support" \
  apps/desktop/dist/* \
  apps/mobile/OmniPanel-v1.0.0.apk
```

### 2. Update Download Page

The web app download page will automatically link to:
- GitHub releases for desktop apps
- Direct APK downloads
- TestFlight links for iOS

### 3. Host Mobile APKs

```bash
# Copy APK to web app public folder
cp omnipanel-core/apps/mobile/OmniPanel-v1.0.0.apk omnipanel-core/apps/web/public/downloads/

# Update download page links
# The page will serve APKs directly from the web app
```

## 🔍 Testing Builds

### Desktop Testing

```bash
# Test Windows (on Windows)
./omnipanel-core/apps/desktop/dist/OmniPanel\ Setup\ 1.0.0.exe

# Test macOS (on macOS)
open ./omnipanel-core/apps/desktop/dist/OmniPanel-1.0.0.dmg

# Test Linux AppImage
chmod +x ./omnipanel-core/apps/desktop/dist/OmniPanel-1.0.0.AppImage
./omnipanel-core/apps/desktop/dist/OmniPanel-1.0.0.AppImage
```

### Mobile Testing

```bash
# Android testing
adb install OmniPanel-v1.0.0.apk

# iOS testing (requires device or simulator)
xcrun simctl install booted OmniPanel-v1.0.0.app
```

## 📊 Build Metrics

### Expected Build Sizes
- **Desktop**: 120-150 MB (includes Node.js runtime)
- **Android APK**: 40-60 MB
- **iOS IPA**: 50-70 MB

### Build Times
- **Desktop** (all platforms): 10-15 minutes
- **Android APK**: 5-10 minutes  
- **iOS IPA**: 10-15 minutes

## 🚨 Troubleshooting

### Common Desktop Issues

1. **Missing dependencies**:
   ```bash
   npm install --include=dev
   npm rebuild
   ```

2. **Platform-specific build failures**:
   ```bash
   # Clear cache
   npm run clean
   npm install
   ```

3. **Code signing errors**:
   - Verify certificates are valid
   - Check environment variables
   - Try building without signing first

### Common Mobile Issues

1. **Expo build failures**:
   ```bash
   # Clear Expo cache
   expo r -c
   
   # Update EAS CLI
   npm install -g @expo/cli@latest
   ```

2. **Android keystore issues**:
   - Generate new keystore if needed
   - Verify keystore password
   - Check signing configuration

3. **iOS provisioning**:
   - Verify Apple Developer account
   - Check bundle identifier
   - Update provisioning profiles

## 📈 Distribution Analytics

Track downloads and installations:

```javascript
// Add to apps for tracking
analytics.track('app_download', {
  platform: 'desktop',
  version: '1.0.0',
  source: 'github_release'
});

analytics.track('app_install', {
  platform: 'android',
  version: '1.0.0',
  install_method: 'direct_apk'
});
```

---

**After building apps, proceed to creating the marketing document!** 
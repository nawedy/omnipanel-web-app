# OmniPanel Deployment Guide

This document provides step-by-step instructions for building and deploying both the web and mobile applications in the OmniPanel monorepo.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Web App Deployment (Vercel)](#web-app-deployment-vercel)
- [Mobile App Deployment (iOS)](#mobile-app-deployment-ios)
- [Mobile App Deployment (Android)](#mobile-app-deployment-android)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Environment Setup
1. Node.js v18+ and npm v10+
2. Expo CLI: `npm install -g expo-cli`
3. Vercel CLI: `npm install -g vercel`
4. Xcode 14+ (for iOS builds)
5. Android Studio (for Android builds)
6. EAS CLI: `npm install -g eas-cli`

### Project Setup
1. Clone the repository: `git clone <repository-url>`
2. Install dependencies from the root directory:
   ```bash
   cd omnipanel-core
   npm install
   ```

## Web App Deployment (Vercel)

### Local Build and Testing

1. **Build the web app locally:**
   ```bash
   # From the monorepo root
   npm run build --workspace=apps/web
   ```

2. **Run the web app locally:**
   ```bash
   # From the monorepo root
   npm run dev --workspace=apps/web
   ```

3. **Verify the build:**
   - Check for any TypeScript errors or build warnings
   - Test all critical functionality in the local environment

### Deployment to Vercel

1. **Login to Vercel:**
   ```bash
   vercel login
   ```

2. **Deploy to Vercel:**
   ```bash
   cd apps/web
   vercel --prod
   ```

3. **Configure project settings (first-time only):**
   - Project name: `omnipanel-web` (or your preferred name)
   - Framework preset: `Next.js`
   - Root directory: `./` (since you're already in the apps/web directory)
   - Build command: Use default
   - Output directory: Use default
   - Development command: Use default

4. **Verify deployment:**
   - Check the Vercel dashboard for build logs
   - Test the deployed application at the provided URL
   - Verify all functionality works as expected

### Continuous Deployment

1. **Connect to GitHub repository:**
   - In the Vercel dashboard, connect your GitHub repository
   - Configure automatic deployments for the `main` branch

2. **Environment variables:**
   - Add any required environment variables in the Vercel project settings
   - Ensure sensitive values are properly secured

## Mobile App Deployment (iOS)

### Prerequisites for iOS

1. **Apple Developer Account:**
   - Active Apple Developer membership ($99/year)
   - Access to App Store Connect

2. **App Store preparation:**
   - App icon (1024x1024 PNG)
   - App screenshots for various device sizes
   - App description, keywords, and metadata
   - Privacy policy URL

### Local Development and Testing

1. **Prepare the app icon:**
   - Ensure `icon.png` exists in `apps/mobile/assets/`
   - The icon should be a square PNG image (1024x1024 recommended)

2. **Configure app.json:**
   - Update the `app.json` file with proper app identifiers, version, and build number
   - Example:
     ```json
     {
       "expo": {
         "name": "OmniPanel",
         "slug": "omnipanel",
         "version": "1.0.0",
         "ios": {
           "bundleIdentifier": "com.yourcompany.omnipanel",
           "buildNumber": "1"
         }
       }
     }
     ```

3. **Generate native iOS project:**
   ```bash
   cd apps/mobile
   npx expo prebuild --platform ios
   ```

4. **Run on iOS simulator:**
   ```bash
   npx expo run:ios
   ```

5. **Test thoroughly on simulator:**
   - Test all app features and functionality
   - Check for any UI issues or performance problems
   - Verify network requests and data handling

### Building for TestFlight

1. **Configure EAS Build:**
   ```bash
   cd apps/mobile
   npx eas build:configure
   ```

2. **Create eas.json file (if not created automatically):**
   ```json
   {
     "build": {
       "development": {
         "developmentClient": true,
         "distribution": "internal"
       },
       "preview": {
         "distribution": "internal"
       },
       "production": {}
     }
   }
   ```

3. **Login to Expo account:**
   ```bash
   npx eas login
   ```

4. **Build for TestFlight:**
   ```bash
   npx eas build --platform ios --profile preview
   ```

5. **Submit to TestFlight:**
   ```bash
   npx eas submit --platform ios
   ```

### Production App Store Submission

1. **Update version and build number:**
   - Increment version in `app.json` for new releases
   - Update build number for each submission

2. **Build production version:**
   ```bash
   npx eas build --platform ios --profile production
   ```

3. **Submit to App Store:**
   ```bash
   npx eas submit --platform ios
   ```

4. **Complete App Store Connect process:**
   - Login to App Store Connect
   - Complete app review information
   - Set pricing and availability
   - Submit for review

## Mobile App Deployment (Android)

### Prerequisites for Android

1. **Google Play Developer Account:**
   - Active Google Play Developer account ($25 one-time fee)
   - Access to Google Play Console

2. **Play Store preparation:**
   - App icon (512x512 PNG)
   - Feature graphic (1024x500 PNG)
   - App screenshots for various device sizes
   - App description and metadata
   - Privacy policy URL

### Local Development and Testing

1. **Configure app.json for Android:**
   ```json
   {
     "expo": {
       "android": {
         "package": "com.yourcompany.omnipanel",
         "versionCode": 1
       }
     }
   }
   ```

2. **Generate native Android project:**
   ```bash
   cd apps/mobile
   npx expo prebuild --platform android
   ```

3. **Run on Android emulator:**
   ```bash
   npx expo run:android
   ```

4. **Test thoroughly on emulator:**
   - Test all app features and functionality
   - Check for any UI issues or performance problems
   - Verify network requests and data handling

### Building for Internal Testing

1. **Build for internal distribution:**
   ```bash
   npx eas build --platform android --profile preview
   ```

2. **Share the build:**
   - EAS will provide a URL to download the APK
   - Share with internal testers

### Production Google Play Submission

1. **Update version and version code:**
   - Increment version in `app.json` for new releases
   - Update versionCode for each submission

2. **Build production version:**
   ```bash
   npx eas build --platform android --profile production
   ```

3. **Submit to Google Play:**
   ```bash
   npx eas submit --platform android
   ```

4. **Complete Google Play Console process:**
   - Login to Google Play Console
   - Complete app review information
   - Set pricing and availability
   - Submit for review

## Troubleshooting

### Common Web App Issues

1. **Build failures:**
   - Check TypeScript errors in the console
   - Verify all dependencies are installed correctly
   - Check for missing environment variables

2. **Runtime errors:**
   - Check browser console for JavaScript errors
   - Verify API endpoints are accessible
   - Check for CORS issues

### Common Mobile App Issues

1. **Expo prebuild failures:**
   - Ensure all required assets exist (icon.png, splash.png)
   - Check app.json configuration for errors
   - Verify all native dependencies are compatible

2. **iOS build failures:**
   - Check Xcode version compatibility
   - Verify Apple Developer account permissions
   - Check provisioning profiles and certificates

3. **Android build failures:**
   - Check Android SDK version compatibility
   - Verify Gradle configuration
   - Check for missing dependencies

4. **EAS build issues:**
   - Verify Expo account authentication
   - Check eas.json configuration
   - Review build logs for specific errors

---

## Maintenance and Updates

### Web App Updates

1. Make code changes and test locally
2. Push to the repository
3. Vercel will automatically deploy if CI/CD is configured
4. Alternatively, run `vercel --prod` from the web app directory

### Mobile App Updates

1. Update version numbers in app.json
2. Test changes locally
3. Build new versions using EAS
4. Submit updates to respective app stores

---

*This guide was last updated on June 10, 2025.*

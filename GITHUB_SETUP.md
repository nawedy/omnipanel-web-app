# 🐙 GitHub Repository Setup Guide

## Quick Setup (Execute these commands)

```bash
# 1. Create a new repository on GitHub.com
# - Go to https://github.com/new
# - Repository name: omnipanel-core
# - Description: "The ultimate AI-powered workspace - Chat, Code, Data Science, and Automation in one unified platform"
# - Make it Public
# - Don't initialize with README (we already have one)
# - Click "Create repository"

# 2. Add GitHub remote and push
git remote add origin https://github.com/nawedy/omnipanel-core.git
git branch -M main
git push -u origin main
```

## Repository Settings

### After creating the repository:

1. **Repository Description**: 
   ```
   The ultimate AI-powered workspace - Chat, Code, Data Science, and Automation in one unified platform. Supports 12+ LLM providers, real-time sync, cross-platform (Web/Desktop/Mobile), plugin SDK, advanced theming.
   ```

2. **Topics/Tags**: Add these topics for discoverability:
   ```
   ai-workspace, llm, chatgpt, ollama, typescript, nextjs, electron, react-native, 
   neondb, real-time, cross-platform, plugin-sdk, theming, data-science, 
   code-editor, terminal, jupyter, workspace, productivity, open-source
   ```

3. **Website**: Add your deployed website URL (e.g., `https://omnipanel.app`)

4. **License**: Choose MIT License for maximum adoption

5. **Releases**: Enable GitHub Releases for desktop app distribution

### Repository Features to Enable:

- ✅ **Issues**: For bug reports and feature requests
- ✅ **Projects**: For roadmap and sprint planning
- ✅ **Wiki**: For comprehensive documentation
- ✅ **Discussions**: For community Q&A
- ✅ **Actions**: For CI/CD automation
- ✅ **Security**: For vulnerability alerts

## Branch Protection Rules

Set up branch protection for `main`:

1. Go to Settings → Branches
2. Add rule for `main` branch:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators

## GitHub Actions Setup

Create `.github/workflows/` directory with these workflows:

### 1. CI/CD Pipeline (`.github/workflows/ci.yml`)
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - run: npm test
```

### 2. Desktop App Release (`.github/workflows/release.yml`)
```yaml
name: Release Desktop Apps

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-latest, windows-latest, ubuntu-latest]
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build:desktop
      - uses: actions/upload-artifact@v4
        with:
          name: desktop-${{ matrix.os }}
          path: apps/desktop/dist/
```

## Security Setup

1. **Secrets Management**: Add these repository secrets:
   - `NEON_DATABASE_URL`
   - `STACK_PROJECT_ID`
   - `VERCEL_TOKEN` (for deployment)
   - `APPLE_ID` (for macOS notarization)
   - `APPLE_PASSWORD` (app-specific password)

2. **Dependabot**: Enable automatic dependency updates

3. **Code Scanning**: Enable CodeQL analysis

## Community Files

Create these files in `.github/` directory:

### Issue Templates (`.github/ISSUE_TEMPLATE/`)

**Bug Report** (`bug_report.yml`):
```yaml
name: Bug Report
description: File a bug report
title: "[Bug]: "
labels: ["bug", "triage"]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to fill out this bug report!
  - type: input
    id: version
    attributes:
      label: Version
      description: What version of OmniPanel are you running?
      placeholder: ex. 1.0.0
    validations:
      required: true
  - type: dropdown
    id: platform
    attributes:
      label: Platform
      description: What platform are you using?
      options:
        - Web
        - Desktop (Windows)
        - Desktop (macOS)
        - Desktop (Linux)
        - Mobile (iOS)
        - Mobile (Android)
    validations:
      required: true
  - type: textarea
    id: what-happened
    attributes:
      label: What happened?
      description: Also tell us, what did you expect to happen?
      placeholder: Tell us what you see!
    validations:
      required: true
```
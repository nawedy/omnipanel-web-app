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
   supabase, real-time, cross-platform, plugin-sdk, theming, data-science, 
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
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
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

**Feature Request** (`feature_request.yml`):
```yaml
name: Feature Request
description: Suggest an idea for OmniPanel
title: "[Feature]: "
labels: ["enhancement", "triage"]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for suggesting a new feature!
  - type: textarea
    id: problem
    attributes:
      label: Is your feature request related to a problem?
      description: A clear description of what the problem is.
      placeholder: I'm always frustrated when...
  - type: textarea
    id: solution
    attributes:
      label: Describe the solution you'd like
      description: A clear description of what you want to happen.
  - type: textarea
    id: alternatives
    attributes:
      label: Describe alternatives you've considered
      description: Any alternative solutions or features you've considered.
```

### Pull Request Template (`.github/pull_request_template.md`)
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] I have tested these changes locally
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Screenshots (if applicable)

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
```

### Contributing Guide (`.github/CONTRIBUTING.md`)
```markdown
# Contributing to OmniPanel

Thank you for your interest in contributing to OmniPanel! This guide will help you get started.

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/omnipanel-core.git`
3. Install dependencies: `npm install`
4. Start development: `npm run dev`

## Code Style

- Use TypeScript with strict mode
- Follow ESLint and Prettier configurations
- Write meaningful commit messages
- Add tests for new features

## Submitting Changes

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Make your changes
3. Test thoroughly
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

## Reporting Issues

Use the issue templates to report bugs or request features.

## Questions?

Join our discussions or reach out to the maintainers.
```

## README Enhancements

Update the main README.md with:

1. **Badges**: Add status badges for build, version, license, etc.
2. **Demo**: Add screenshots and GIFs
3. **Quick Start**: Clear installation instructions
4. **Documentation**: Links to comprehensive docs
5. **Contributing**: Link to contributing guide
6. **Community**: Discord/Slack links
7. **Sponsors**: Recognition for supporters

## Release Strategy

1. **Semantic Versioning**: Use semver (1.0.0, 1.1.0, 2.0.0)
2. **Release Notes**: Detailed changelog for each release
3. **Pre-releases**: Beta versions for testing
4. **LTS Versions**: Long-term support for stable releases

## Marketing Integration

1. **Social Media**: Auto-post releases to Twitter/LinkedIn
2. **Product Hunt**: Prepare for Product Hunt launch
3. **Dev.to**: Cross-post major updates
4. **Hacker News**: Share significant milestones

---

**Next Steps**: After setting up the repository, proceed with Vercel deployment and app distribution setup. 
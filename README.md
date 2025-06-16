# 🚀 OmniPanel AI Workspace

The ultimate AI-powered workspace that brings together chat, code, data science, and automation in a unified, extensible platform. Works seamlessly across web, desktop, and mobile with support for local and cloud LLMs.

![OmniPanel Logo](assets/OmniPanel-logo.png)

## 🎯 Current Status: Version 1.3.0 - Production Ready

**Latest Release**: Sprint 8 - Complete Workspace Enhancement & AI Integration ✅  
**Build Status**: ✅ Passing | **TypeScript**: ✅ 100% Compliant | **Tests**: ✅ Comprehensive Coverage

### 🆕 Recent Major Updates (v1.3.0)
- **✅ Sprint 8**: Workspace sidebar overhaul, AI-powered research, professional avatars, enhanced drag system
- **✅ Sprint 7**: Workspace layout fixes, professional resizable panels, production stability
- **✅ Sprint 6**: Complete testing infrastructure, E2E tests, quality assurance
- **✅ Sprint 5**: File management overhaul, UI polish, context-aware AI assistance
- **✅ Sprint 4**: Enhanced file explorer, terminal integration, real-time monitoring
- **✅ Sprint 3**: Chat system redesign, context-aware AI, conversation management
- **✅ Sprint 2**: Settings system overhaul, advanced theming, keyboard shortcuts
- **✅ Sprint 1**: TypeScript error resolution, service integration, 100% type safety

## ✨ Features

### 🎯 **Core Workspace**
- **Professional Tool Grid**: 2x2 layout with 5 integrated tools (Chat, Terminal, Notebook, Code Editor, Research)
- **Enhanced Drag System**: Improved sidebar resizing (320px default, 200-500px range) with visual feedback
- **AI-Powered Research**: Real-time web search with Tavily API integration and intelligent summarization
- **Professional Branding**: Consistent AI avatars across all components with gradient fallbacks
- **Settings Migration**: Complete transition from modal to page-based settings system
- **Multi-tab Interface**: Context-aware workspace with seamless tool switching
- **Real-time Sync**: Cloud synchronization with offline-first architecture
- **Project Organization**: Folders, tags, favorites, multi-project navigation with recent files tracking
- **Modern UI**: Glassmorphism design with 8 custom color schemes and advanced theming

### 🤖 **AI Integration**
- **Multi-Model Support**: OpenAI, Ollama, llama.cpp, vLLM, Deepseek, Qwen, HuggingFace, Anthropic, Google Gemini, Mistral
- **Local & Cloud**: Seamless switching between local and cloud AI models with cost tracking
- **Context-Aware Chat**: Intelligent conversations with workspace context (files, terminal, selections)
- **Streaming Responses**: Real-time AI responses with performance monitoring and abort controls
- **AI-Powered Tools**: Code explanation, improvement, generation with context awareness

### 💻 **Development Tools**
- **Monaco Editor**: VSCode-style editor with syntax highlighting and AI assistance
- **Enhanced Terminal**: Full terminal with AI assistance, command suggestions, and context integration
- **Advanced Git Integration**: Visual status indicators, repository management, and file tracking
- **Professional File Management**: File tree with drag-drop, context menus, and real-time monitoring
- **Keyboard Shortcuts**: 67+ customizable shortcuts across 11 categories

### 📊 **Data Science**
- **Jupyter Notebooks**: Interactive cells with code execution and AI assistance
- **Visualization**: Built-in charting and data visualization with context awareness
- **AI-Powered Analysis**: Smart cell generation and intelligent data analysis

### 🔌 **Extensibility**
- **Plugin System**: Comprehensive SDK with marketplace integration
- **Advanced Theme Engine**: 8 color schemes, custom fonts, export/import functionality
- **Custom Components**: Extensible UI component system with TypeScript support
- **API Access**: Full REST API and CLI tools for automation

### ⚙️ **Settings & Configuration**
- **Comprehensive Settings**: 8 major sections (General, Theme, Keyboard, Database, Performance, Plugins, Errors, Privacy)
- **GDPR Compliance**: Complete privacy policy with data protection rights
- **Internationalization**: 12 language options with timezone management
- **Database Integration**: PostgreSQL, MySQL, SQLite, NeonDB with connection string support

## 🏗️ Architecture

### Monorepo Structure
```
omnipanel-core/
├── packages/              # Shared packages
│   ├── types/            # TypeScript definitions
│   ├── config/           # Global configuration
│   ├── database/         # Database models and utilities
│   ├── ui/               # Shared UI components
│   ├── llm-adapters/     # AI model connectors
│   ├── core/             # Business logic and sync
│   ├── plugin-sdk/       # Plugin development SDK
│   └── theme-engine/     # Advanced theming system
├── apps/                 # Applications
│   ├── web/              # Next.js web application
│   ├── desktop/          # Electron desktop app
│   ├── mobile/           # React Native mobile app
│   ├── docs/             # Documentation site
│   ├── website/          # Marketing website
│   └── marketplace/      # Plugin marketplace
└── assets/               # Shared assets and branding
```

### Technology Stack
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Desktop**: Electron with native APIs
- **Mobile**: React Native with Expo
- **Backend**: NeonDB (PostgreSQL, Auth, Storage, Functions)
- **State**: Zustand for client state management
- **Real-time**: NeonDB real-time subscriptions
- **Offline**: IndexedDB with automatic sync
- **UI**: Framer Motion, Monaco Editor, xterm.js

## 🚀 Quick Start

### Prerequisites
- Node.js 22+ 
- npm 8+
- Git

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/omnipanel-core.git
cd omnipanel-core

# Install dependencies
npm install

# Build all packages
npm run build

# Start development servers
npm run dev:web      # Web app (localhost:3003)
npm run dev:docs     # Documentation (localhost:3001)
npm run dev:website  # Marketing site (localhost:3004)
```

### Desktop App
```bash
# Build and run desktop app
npm run dev:desktop

# Build for distribution
npm run build:desktop
```

### Mobile App
```bash
# Start Expo development server
npm run dev:mobile

# Run on iOS simulator
npm run mobile:ios

# Run on Android emulator
npm run mobile:android
```
# OmniPanel Desktop App

Cross-platform desktop application built with Electron for the OmniPanel AI Workspace.

## Features

- **Native File System Access**: Full file system operations with native dialogs
- **Local LLM Management**: Start/stop/manage Ollama and other local model servers
- **System Monitoring**: Real-time CPU, memory, disk, and network monitoring
- **Auto-Updates**: Automatic application updates with electron-updater
- **Project Management**: Git integration and project metadata tracking
- **Security**: Sandboxed renderer with secure IPC communication

## Architecture

```
apps/desktop/
├── src/
│   ├── main/                 # Main Electron process
│   │   ├── main.ts          # Application entry point
│   │   └── native/          # Native API managers
│   │       ├── FileSystemManager.ts
│   │       ├── ModelServerManager.ts
│   │       ├── SystemMonitor.ts
│   │       └── AppUpdater.ts
│   └── preload/             # Preload script
│       └── preload.ts       # Secure IPC bridge
├── assets/                  # App icons and resources
├── dist/                    # Compiled output
├── build/                   # Built packages
└── package.json
```

## Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Electron compatible environment

### Setup

1. Install dependencies:
```bash
npm install
```

2. Build packages:
```bash
npm run build
```

3. Start development:
```bash
npm run dev
```

### Building

#### Development Build
```bash
npm run build:main    # Build main process
npm run build:renderer # Build renderer (web app)
```

#### Production Build
```bash
npm run build         # Build everything
npm run pack          # Create unpacked app
npm run dist          # Create distributable packages
```

#### Platform-Specific Builds
```bash
# macOS
npm run dist -- --mac

# Windows  
npm run dist -- --win

# Linux
npm run dist -- --linux
```

## Native API Managers

### FileSystemManager
- File and directory operations
- Project watching with chokidar
- Git status integration
- Project metadata extraction
- File search functionality

### ModelServerManager
- Ollama server lifecycle management
- Model downloading with progress
- Local model management
- Resource usage monitoring

### SystemMonitor
- Real-time system metrics
- Hardware information
- Process monitoring
- Alert thresholds
- Event-driven updates

### AppUpdater
- Automatic update checking
- Download progress tracking
- Update notifications
- Configurable update settings

## Security

The desktop app implements several security measures:

- **Context Isolation**: Renderer processes are isolated from Node.js
- **Preload Script**: Secure IPC communication bridge
- **Channel Whitelisting**: Only allowed IPC channels are permitted
- **No Remote Module**: Remote module is disabled
- **CSP Headers**: Content Security Policy enforcement
- **External URL Handling**: External links open in system browser

## Configuration

Application settings are stored using electron-store:

```typescript
// Window state
windowState: {
  width: number;
  height: number;
  x?: number;
  y?: number;
  isMaximized: boolean;
}

// Workspace settings
workspace: {
  currentProject?: string;
  recentProjects: string[];
  autoSave: boolean;
  syncEnabled: boolean;
}

// LLM configuration
llm: {
  providers: Record<string, any>;
  defaultProvider?: string;
  localModels: string[];
}

// System preferences
system: {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  startMinimized: boolean;
  closeToTray: boolean;
}
```

## IPC Communication

The preload script exposes a secure API to the renderer:

```typescript
window.desktopAPI = {
  fs: {
    selectFolder: () => Promise<string>,
    readFile: (path: string) => Promise<string>,
    writeFile: (path: string, content: string) => Promise<void>,
    // ... more file operations
  },
  system: {
    getInfo: () => Promise<SystemInfo>,
    getResourceUsage: () => Promise<ResourceUsage>,
  },
  llm: {
    startOllama: () => Promise<ServerResult>,
    getLocalModels: () => Promise<LocalModel[]>,
    // ... more LLM operations
  },
  // ... other APIs
}
```

## Building for Distribution

### Code Signing (macOS/Windows)

Set environment variables for code signing:

```bash
# macOS
export CSC_LINK=path/to/certificate.p12
export CSC_KEY_PASSWORD=certificate_password

# Windows
export CSC_LINK=path/to/certificate.p12
export CSC_KEY_PASSWORD=certificate_password
```

### Auto-Update Configuration

Configure publishing in package.json:

```json
{
  "build": {
    "publish": {
      "provider": "github",
      "owner": "omnipanel",
      "repo": "omnipanel-desktop"
    }
  }
}
```

### Notarization (macOS)

For macOS distribution:

```bash
export APPLE_ID=your_apple_id
export APPLE_ID_PASSWORD=app_specific_password
export APPLE_TEAM_ID=your_team_id
```

## Debugging

### Main Process
- Enable DevTools: Set `NODE_ENV=development`
- Debug: Use `--inspect` flag with Electron

### Renderer Process
- DevTools automatically open in development
- Access via View menu in production builds

### Logging
- Main process logs to console
- System events logged to electron-log
- Error reporting with stack traces

## Deployment

### Automatic Updates
- Updates distributed via GitHub Releases
- Differential updates for smaller downloads
- Rollback capability for failed updates

### System Requirements
- Windows 10/11 (x64, ARM64)
- macOS 10.15+ (Intel, Apple Silicon)
- Linux (x64, ARM64) - AppImage, deb, rpm

## Contributing

1. Follow TypeScript strict mode
2. Add tests for new features
3. Update documentation
4. Follow security best practices
5. Test on all target platforms

## Troubleshooting

### Common Issues

**Ollama not starting:**
- Check if Ollama is installed
- Verify PATH includes Ollama binary
- Check port 11434 availability

**File watching not working:**
- Check file permissions
- Verify chokidar configuration
- Check system file descriptor limits

**Updates failing:**
- Check network connectivity
- Verify code signing certificates
- Check GitHub release configuration

### Performance

- File watching excludes node_modules, .git
- System monitoring uses efficient intervals
- IPC communication is asynchronous
- Large file operations are chunked 
# OmniPanel Web App - User Guide

Welcome to OmniPanel! This comprehensive guide will help you master all features of your AI workspace.

## 📖 Table of Contents

1. [Getting Started](#-getting-started)
2. [AI Models & API Configuration](#-ai-models--api-configuration)
3. [Local Models Setup](#-local-models-setup)
4. [AI Rules Management](#-ai-rules-management)
5. [Workspace Features](#-workspace-features)
6. [Settings & Customization](#-settings--customization)
7. [Troubleshooting](#-troubleshooting)

---

## 🚀 Getting Started

### First Launch

1. **Access OmniPanel**: Open your browser and navigate to your OmniPanel web app
2. **Welcome Screen**: You'll see the welcome screen with quick actions:
   - Start a Chat
   - Create a File
   - Open Terminal
   - New Notebook

### Navigation Overview

- **Header**: Contains theme toggle, notifications, settings, and user menu
- **Sidebar**: Project navigator and tool shortcuts
- **Main Area**: Tabbed workspace for chat, code, terminal, and notebooks
- **File Tree**: Project files and folders (left panel)

---

## 🤖 AI Models & API Configuration

### Adding Cloud AI Providers

1. **Navigate to Settings**:
   - Click the ⚙️ Settings icon in the header
   - Select "AI Models" from the sidebar

2. **Add a New Provider**:
   - Click the "Add Provider" button
   - Choose your provider: OpenAI, Anthropic, Google, or Custom
   - Fill in the required information:
     - **Provider Name**: A friendly name for this configuration
     - **API Key**: Your API key from the provider
     - **Base URL**: (Optional) Custom endpoint URL
   - Click "Save Configuration"

### Managing API Keys

#### Adding an API Key:
1. Go to **Settings → AI Models**
2. Click **"Add Provider"**
3. Select your provider (OpenAI, Anthropic, Google, etc.)
4. Enter your API key in the designated field
5. Optionally set a custom name for easy identification
6. Click **"Test Connection"** to verify the key works
7. Save the configuration

#### Editing an API Key:
1. Find your provider in the list
2. Click the **"Edit"** button (pencil icon)
3. Update the API key or other settings
4. Click **"Test Connection"** to verify changes
5. Save the updated configuration

#### Removing an API Key:
1. Locate the provider you want to remove
2. Click the **"Delete"** button (trash icon)
3. Confirm the deletion when prompted

### Testing Connections

- Use the **"Test Connection"** button next to each provider
- Green checkmark = Connection successful
- Red X = Connection failed (check API key and internet connection)

### Supported Providers

| Provider | Models Available | Features |
|----------|------------------|----------|
| **OpenAI** | GPT-4, GPT-3.5-turbo, DALL-E | Chat, code generation, images |
| **Anthropic** | Claude-3, Claude-2 | Advanced reasoning, long contexts |
| **Google** | Gemini Pro, PaLM | Multimodal capabilities |
| **Custom** | Any OpenAI-compatible API | Self-hosted or other providers |

---

## 💾 Local Models Setup

### Prerequisites

Before setting up local models, ensure you have:
- **Ollama** installed on your system ([Download here](https://ollama.ai))
- Sufficient disk space (models range from 1GB to 70GB+)
- Adequate RAM (4GB minimum, 8GB+ recommended)

### Installing Ollama

#### macOS:
```bash
brew install ollama
```

#### Linux:
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

#### Windows:
Download from [ollama.ai](https://ollama.ai) and run the installer.

### Setting Up Local Models

1. **Navigate to AI Models Settings**:
   - Go to **Settings → AI Models**
   - Click the **"Local Models"** tab

2. **Check Ollama Status**:
   - The status indicator shows if Ollama is running
   - Green = Connected, Red = Not available

3. **Pull a Model**:
   - Click **"Add Local Model"**
   - Enter a model name (e.g., `llama2`, `codellama`, `mistral`)
   - Click **"Pull Model"** and wait for download

4. **Load a Model**:
   - Find your downloaded model in the list
   - Click **"Load"** to make it available for use
   - Monitor memory usage in the performance tab

### Popular Local Models

| Model | Size | Best For | Resource Requirements |
|-------|------|----------|----------------------|
| **Llama 2 7B** | ~4GB | General chat, coding | 8GB RAM |
| **Code Llama** | ~4GB | Code generation | 8GB RAM |
| **Mistral 7B** | ~4GB | Fast responses | 6GB RAM |
| **Llama 2 13B** | ~8GB | Better quality | 16GB RAM |
| **Llama 2 70B** | ~40GB | Highest quality | 64GB RAM |

### Model Management

#### Loading Models:
- Select models from the list
- Click **"Load"** to make them active
- Use **"Batch Load"** for multiple models

#### Unloading Models:
- Click **"Unload"** to free up memory
- Models remain downloaded but inactive

#### Deleting Models:
- Click **"Delete"** to remove from disk
- This frees up storage space permanently

### Performance Monitoring

The **Performance** tab shows:
- **Memory Usage**: RAM consumption per model
- **Load Times**: How long models take to start
- **Response Speed**: Tokens per second
- **System Resources**: Overall system usage

---

## 🧠 AI Rules Management

AI Rules let you customize how AI assistants behave in different contexts.

### Creating Rules

1. **Navigate to AI Rules**:
   - Go to **Settings → AI Rules**
   - Click the **"Rules"** tab

2. **Add a New Rule**:
   - Click **"Create Rule"**
   - Fill in the rule details:
     - **Name**: Descriptive name for the rule
     - **Category**: Behavior, Security, Performance, etc.
     - **Scope**: Global, Project, or Component-specific
     - **Priority**: Low, Medium, High, Critical
     - **Trigger**: When the rule should activate
     - **Actions**: What the rule should do

3. **Save and Test**:
   - Click **"Save Rule"**
   - Use **"Test Rule"** to verify it works

### Rule Categories

| Category | Purpose | Examples |
|----------|---------|----------|
| **Behavior** | Control AI responses | "Always explain code in simple terms" |
| **Security** | Safety constraints | "Never share API keys in responses" |
| **Performance** | Optimize responses | "Keep responses under 100 words" |
| **Content** | Filter or enhance content | "Always include error handling in code" |
| **Context** | Use workspace context | "Reference open files when relevant" |

### Rule Templates

Use pre-built templates for common scenarios:
- **Code Review**: Automatically review code for best practices
- **Security Scan**: Check for security vulnerabilities
- **Documentation**: Generate docs for functions
- **Error Handling**: Add error handling to code snippets

### Rule Sets

Group related rules together:
1. Click **"Rule Sets"** tab
2. Create a new set
3. Add multiple rules to the set
4. Activate the entire set at once

---

## 🛠️ Workspace Features

### Chat Interface

#### Starting a Conversation:
1. Click **"Start a Chat"** from welcome screen
2. Or use **Ctrl+Shift+C** keyboard shortcut
3. Type your message and press Enter

#### Chat Features:
- **Copy Messages**: Click the copy icon
- **Regenerate**: Click refresh to get a new response
- **Model Selection**: Change AI model mid-conversation
- **Context Awareness**: Chat can reference open files

#### Quick Actions:
- **Explain Code**: Select code and ask for explanation
- **Fix Errors**: Paste error messages for solutions
- **Generate Code**: Describe what you want to build

### Code Editor

#### Creating Files:
1. Click **"Create a File"** or **Ctrl+N**
2. Choose file type or enter custom extension
3. Start coding with full syntax highlighting

#### Editor Features:
- **IntelliSense**: Auto-completion and suggestions
- **AI Assistance**: 
  - **Ctrl+E**: Explain selected code
  - **Ctrl+I**: Improve/refactor code
- **Multi-language Support**: 20+ programming languages
- **Split View**: View markdown preview side-by-side

#### File Management:
- **Auto-save**: Changes saved automatically
- **Download**: Export files to your computer
- **Format**: Auto-format code with prettier

### Terminal

#### Opening Terminal:
1. Click **"Open Terminal"** or **Ctrl+`**
2. Get a fully interactive command line interface

#### Terminal Features:
- **Command History**: Use arrow keys to navigate
- **AI Assistance**: Type `ai: your question` for help
- **Export**: Copy output or download session logs
- **Working Directory**: Navigate your project structure

#### Useful Commands:
```bash
help           # Show available commands
ls             # List files and directories
pwd            # Show current directory
cd <path>      # Change directory
git status     # Check git status
ai: help me    # Ask AI for assistance
```

### Notebooks

#### Creating Notebooks:
1. Click **"New Notebook"** or **Ctrl+Shift+N**
2. Get a Jupyter-style interface for data science

#### Cell Types:
- **Code Cells**: Execute Python, R, or other languages
- **Markdown Cells**: Documentation and explanations
- **Raw Cells**: Plain text content

#### Notebook Features:
- **Run Cells**: Execute code with Shift+Enter
- **AI Assistance**: Get help with data analysis
- **Export**: Save as .ipynb format
- **Cell Management**: Add, delete, reorder cells

### File Tree

#### Navigation:
- **Expand/Collapse**: Click folder icons
- **File Selection**: Click files to open in editor
- **Context Menu**: Right-click for options

#### File Operations:
- **Create**: Right-click → New File/Folder
- **Rename**: Right-click → Rename
- **Delete**: Right-click → Delete
- **Search**: Use the search box to find files

---

## ⚙️ Settings & Customization

### General Settings

#### Language & Region:
- **Language**: Choose interface language
- **Timezone**: Set your local timezone
- **Date Format**: Customize date display

#### Interface:
- **Font Size**: Adjust text size (XS to XL)
- **Font Family**: Choose from Inter, System, or Mono

### Theme Customization

#### Color Schemes:
1. Go to **Settings → Theme**
2. Choose from pre-built themes:
   - **Dark** (default)
   - **Light**
   - **High Contrast**
   - **Custom**

#### Custom Themes:
- **Primary Color**: Main interface color
- **Accent Color**: Buttons and highlights
- **Border Radius**: Sharp or rounded corners
- **Density**: Compact, Comfortable, or Spacious

### Keyboard Shortcuts

#### Viewing Shortcuts:
- Go to **Settings → Keyboard Shortcuts**
- Browse by category: General, File, Edit, etc.

#### Customizing Shortcuts:
1. Find the action you want to modify
2. Click **"Edit"** next to the shortcut
3. Press your desired key combination
4. Click **"Save"**

#### Essential Shortcuts:
| Action | Default Shortcut |
|--------|-----------------|
| New Chat | Ctrl+Shift+C |
| New File | Ctrl+N |
| Open Terminal | Ctrl+` |
| New Notebook | Ctrl+Shift+N |
| Command Palette | Ctrl+Shift+P |
| Settings | Ctrl+, |

### Database Settings

Configure your database connection:
1. Go to **Settings → Database**
2. Choose provider: PostgreSQL, MySQL, SQLite, or NeonDB
3. Enter connection details
4. Test connection

### Performance Settings

#### Monitoring:
- **CPU Usage**: Track system resources
- **Memory Usage**: Monitor RAM consumption
- **Response Times**: Measure AI performance

#### Optimization:
- **Enable Animations**: Toggle for better performance
- **Max History Size**: Limit stored messages
- **Auto-save Interval**: Adjust save frequency

### Privacy Settings

#### Data Collection:
- **Telemetry**: Anonymous usage statistics
- **Crash Reporting**: Error reporting for debugging
- **Analytics**: Feature usage tracking

#### Data Management:
- **Export Data**: Download your information
- **Clear History**: Remove stored conversations
- **Delete Account**: Permanently remove data

---

## 🔧 Troubleshooting

### Common Issues

#### AI Models Not Working

**Problem**: API calls failing or models not responding

**Solutions**:
1. **Check API Key**: Verify it's correct and active
2. **Test Connection**: Use the test button in settings
3. **Check Quota**: Ensure you haven't exceeded usage limits
4. **Internet Connection**: Verify you're online
5. **Provider Status**: Check if the AI service is down

#### Local Models Issues

**Problem**: Ollama models not loading or responding slowly

**Solutions**:
1. **Check Ollama Status**: Ensure Ollama is running
   ```bash
   ollama list  # See available models
   ollama ps    # See running models
   ```
2. **Memory Issues**: Close other applications to free RAM
3. **Model Size**: Try smaller models if having memory issues
4. **Restart Ollama**: 
   ```bash
   ollama stop
   ollama start
   ```

#### Performance Issues

**Problem**: App running slowly or freezing

**Solutions**:
1. **Clear Browser Cache**: Refresh with Ctrl+Shift+R
2. **Close Unused Tabs**: Reduce memory usage
3. **Disable Animations**: Go to Settings → Performance
4. **Check System Resources**: Monitor CPU/RAM usage
5. **Restart Browser**: Close and reopen the application

#### Connection Issues

**Problem**: Cannot connect to services or sync

**Solutions**:
1. **Check Internet**: Verify network connection
2. **Firewall Settings**: Ensure ports aren't blocked
3. **VPN/Proxy**: Try disabling if having issues
4. **DNS Issues**: Try using 8.8.8.8 as DNS server

### Getting Help

#### Built-in Help:
- **Help Menu**: Click ? icon in header
- **Keyboard Shortcuts**: View all shortcuts
- **Documentation**: Access user guides

#### Support Resources:
- **GitHub Issues**: Report bugs and feature requests
- **Community Forum**: Get help from other users
- **Documentation**: Comprehensive guides and tutorials

#### Diagnostic Information:
To help with troubleshooting, gather this information:
- **Browser**: Name and version
- **Operating System**: Windows, macOS, or Linux
- **App Version**: Found in Settings → About
- **Error Messages**: Screenshot or copy exact text
- **Steps to Reproduce**: What you were doing when the issue occurred

### Logs and Debugging

#### Browser Console:
1. Press **F12** to open developer tools
2. Go to **Console** tab
3. Look for error messages (red text)
4. Share screenshots with support

#### Performance Monitoring:
- Go to **Settings → Performance**
- View real-time metrics
- Export performance reports if needed

---

## 🎯 Tips for Success

### Best Practices

#### AI Model Usage:
- **Start Small**: Use smaller models for simple tasks
- **Test Locally**: Try local models for privacy-sensitive work
- **Monitor Costs**: Keep track of API usage for paid services
- **Use Rules**: Set up AI rules for consistent behavior

#### Workspace Organization:
- **Project Structure**: Organize files in logical folders
- **Use Tabs**: Keep related work in different tabs
- **Save Often**: Enable auto-save for important work
- **Backup**: Export important conversations and files

#### Performance Optimization:
- **Close Unused Tabs**: Reduce memory usage
- **Unload Models**: Free up RAM when not using local models
- **Clear History**: Periodically clean up old conversations
- **Monitor Resources**: Keep an eye on system performance

### Advanced Features

#### Context Awareness:
OmniPanel can use information from your workspace to provide better assistance:
- **File Context**: AI knows about open files
- **Project Context**: Understands your project structure
- **Terminal Context**: Aware of recent commands
- **Notebook Context**: Knows about data and analysis

#### Batch Operations:
- **Multiple Models**: Load/unload several models at once
- **Bulk Actions**: Process multiple files simultaneously
- **Rule Sets**: Apply multiple AI rules together

#### Integration Tips:
- **Git Integration**: Use terminal for version control
- **Documentation**: Generate docs automatically with AI
- **Code Review**: Set up rules for automatic code analysis
- **Testing**: Use AI to generate test cases

---

## 📚 Additional Resources

### Learning Materials:
- **Video Tutorials**: Step-by-step walkthroughs
- **Example Projects**: Sample configurations and setups
- **Best Practices Guide**: Advanced usage patterns
- **API Documentation**: Integration and development guides

### Community:
- **Discord Server**: Real-time chat and support
- **GitHub Discussions**: Feature requests and feedback
- **Newsletter**: Updates and new features
- **Blog**: Tips, tricks, and tutorials

### Updates:
- **Release Notes**: What's new in each version
- **Migration Guides**: Upgrading from older versions
- **Feature Previews**: Upcoming functionality
- **Beta Program**: Test new features early

---

## 🚀 Ready to Get Started?

You're now equipped with everything you need to master OmniPanel! Start with:

1. **Set up your first AI provider** (OpenAI or Anthropic recommended)
2. **Create a simple project** with a few files
3. **Try the chat interface** with your AI assistant
4. **Explore the code editor** and its AI features
5. **Experiment with local models** if you have Ollama installed

Remember: OmniPanel is designed to grow with you. Start simple, then gradually explore advanced features as you become more comfortable.

**Happy coding with AI! 🤖✨**

---

*Last updated: January 2025*  
*Version: 1.0* 
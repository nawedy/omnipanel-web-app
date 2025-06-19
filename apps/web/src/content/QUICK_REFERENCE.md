# OmniPanel Quick Reference

## ⚡ Essential Keyboard Shortcuts

| Action | Shortcut | Description |
|--------|----------|-------------|
| **New Chat** | `Ctrl+Shift+C` | Start a new conversation |
| **New File** | `Ctrl+N` | Create a new file |
| **Open Terminal** | `Ctrl+\`` | Open terminal interface |
| **New Notebook** | `Ctrl+Shift+N` | Create new Jupyter notebook |
| **Command Palette** | `Ctrl+Shift+P` | Access all commands |
| **Settings** | `Ctrl+,` | Open settings |
| **Save File** | `Ctrl+S` | Save current file |
| **Find** | `Ctrl+F` | Search in current file |
| **Explain Code** | `Ctrl+E` | Explain selected code with AI |
| **Improve Code** | `Ctrl+I` | Improve/refactor selected code |

## 🔧 Quick Setup

### Add Your First AI Provider
1. Click ⚙️ Settings → AI Models
2. Click "Add Provider"
3. Choose OpenAI/Anthropic/Google
4. Enter your API key
5. Click "Test Connection"
6. Save configuration

### Install Local Models (Ollama)
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a model
ollama pull llama2

# Check status
ollama list
```

## 🤖 AI Model Quick Commands

### Popular Models to Try
- **GPT-4**: Best overall quality
- **Claude-3**: Great for analysis
- **Llama2**: Free local option
- **Code Llama**: Coding specialist
- **Mistral**: Fast responses

### Model Management
```bash
# In OmniPanel Terminal
ai: help me with this code    # Ask AI for help
ai: explain this error       # Get error explanations
ai: optimize this function   # Code improvements
```

## 📁 File Operations

### Quick Actions
- **Right-click** in file tree → New File/Folder
- **Drag & drop** to upload files
- **Double-click** file to open in editor
- **Ctrl+click** to open in new tab

### File Extensions & Languages
- `.py` → Python
- `.js/.ts` → JavaScript/TypeScript  
- `.md` → Markdown (with preview)
- `.json` → JSON with validation
- `.css/.scss` → Stylesheets
- `.html` → HTML with preview

## ⚡ Terminal Commands

### Built-in Commands
```bash
help              # Show all commands
ls                # List files
pwd               # Current directory
cd <path>         # Change directory
git status        # Git status
clear             # Clear screen
history           # Command history
ai: <question>    # Ask AI anything
```

### File Operations
```bash
mkdir folder      # Create directory
touch file.txt    # Create file
rm file.txt       # Delete file
cp source dest    # Copy file
mv old new        # Move/rename
```

## 📓 Notebook Quick Guide

### Cell Shortcuts
- **Shift+Enter**: Run cell and move to next
- **Ctrl+Enter**: Run cell and stay
- **A**: Insert cell above
- **B**: Insert cell below
- **DD**: Delete cell
- **M**: Change to Markdown
- **Y**: Change to Code

### Common Code Patterns
```python
# Data analysis starter
import pandas as pd
import matplotlib.pyplot as plt
df = pd.read_csv('data.csv')
df.head()

# AI assistance
# Select code and click AI button for help
```

## 💬 Chat Tips

### Effective Prompts
- **Be specific**: "Write a Python function that..."
- **Provide context**: "In this React component..."
- **Ask for explanations**: "Explain this code step by step"
- **Request improvements**: "How can I optimize this?"

### Context Features
- Chat can see your open files
- Reference code by file name
- Ask about terminal commands
- Get help with notebook cells

## 🎨 Customization

### Quick Theme Changes
1. Header → Theme toggle (🌙/☀️/🖥️)
2. Settings → Theme for full customization
3. Pick colors, fonts, spacing

### Essential Settings
- **Settings → General**: Language, timezone
- **Settings → Keyboard**: Custom shortcuts
- **Settings → Performance**: Speed optimizations
- **Settings → Privacy**: Data controls

## 🔍 Search & Navigation

### Global Search
- `Ctrl+Shift+F`: Search across all files
- Use file tree search box for quick filtering
- Command palette for feature discovery

### Project Navigation
- **File tree**: Click folders to expand
- **Breadcrumbs**: See current file path
- **Tabs**: Switch between open files
- **Recent files**: Quick access to latest work

## 🚨 Troubleshooting

### Common Fixes
| Problem | Solution |
|---------|----------|
| AI not responding | Check API key in Settings → AI Models |
| Local model won't load | Ensure Ollama is running: `ollama ps` |
| App running slow | Close unused tabs, check Performance settings |
| Can't connect | Check internet, disable VPN temporarily |
| Features missing | Refresh page with `Ctrl+Shift+R` |

### Quick Diagnostics
1. **F12** → Console tab → Look for red errors
2. Settings → Performance → Check resource usage
3. Settings → Database → Test connection
4. Try incognito/private browser window

## 🔄 Workflow Examples

### Code Review Workflow
1. Open files in editor
2. Select code sections
3. Use `Ctrl+E` to explain
4. Set up AI rules for consistency
5. Use chat for broader questions

### Data Analysis Workflow
1. Create new notebook
2. Upload CSV files
3. Use code cells for analysis
4. Ask AI for visualization ideas
5. Export results

### Writing Documentation
1. Create `.md` file
2. Use split view for preview
3. Ask AI to improve clarity
4. Auto-generate from code comments

## 📊 Performance Tips

### Optimize for Speed
- Close unused tabs regularly
- Unload local models when not needed
- Clear chat history occasionally
- Use smaller models for simple tasks
- Enable/disable animations based on hardware

### Memory Management
- Monitor local model RAM usage
- Use batch operations efficiently
- Keep file sizes reasonable
- Clear browser cache if needed

## 📱 Mobile/Tablet Usage

### Touch-Friendly Features
- Tap to select/edit
- Swipe gestures in file tree
- Virtual keyboard shortcuts
- Responsive design adapts to screen size

---

## 🆘 Need Help?

### Quick Links
- **Full Guide**: See `USERS_GUIDE.md`
- **Keyboard Shortcuts**: Settings → Keyboard
- **Settings**: Click ⚙️ in header
- **Status**: Check connection indicators

### Support Channels
- 🐛 **Bug Reports**: GitHub Issues
- 💬 **Questions**: Community Discord
- 📖 **Documentation**: Help menu
- 📧 **Contact**: support@omnipanel.ai

---

*Quick Reference v1.0 - January 2025* 
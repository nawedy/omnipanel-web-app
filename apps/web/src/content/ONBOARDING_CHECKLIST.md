# OmniPanel Onboarding Checklist

Welcome to OmniPanel! Follow this checklist to get set up and start being productive with AI in minutes.

## ✅ Pre-Launch Setup (5 minutes)

### 1. First Launch
- [ ] Open OmniPanel in your browser
- [ ] Explore the welcome screen
- [ ] Familiarize yourself with the layout:
  - [ ] Header (settings, theme, notifications)
  - [ ] Sidebar (file tree, tools)
  - [ ] Main workspace (tabs)
  - [ ] Status indicators

### 2. Basic Navigation Test
- [ ] Click "Start a Chat" - see the chat interface
- [ ] Click "Create a File" - see the code editor
- [ ] Click "Open Terminal" - see the terminal
- [ ] Click "New Notebook" - see the notebook interface
- [ ] Close tabs and return to welcome screen

## 🤖 AI Setup (10 minutes)

### Option A: Cloud AI (Recommended for beginners)
- [ ] Go to **Settings** (⚙️ icon) → **AI Models**
- [ ] Click **"Add Provider"**
- [ ] Choose your provider:
  - [ ] **OpenAI** (recommended) - Get API key from [platform.openai.com](https://platform.openai.com)
  - [ ] **Anthropic** - Get API key from [console.anthropic.com](https://console.anthropic.com)
  - [ ] **Google** - Get API key from [ai.google.dev](https://ai.google.dev)
- [ ] Enter your API key
- [ ] Set a friendly name (e.g., "My OpenAI")
- [ ] Click **"Test Connection"** (should show green checkmark)
- [ ] Save the configuration
- [ ] **Test**: Start a chat and ask "Hello, can you help me code?"

### Option B: Local AI (Advanced users)
- [ ] Install Ollama on your system:
  ```bash
  # macOS
  brew install ollama
  
  # Linux
  curl -fsSL https://ollama.ai/install.sh | sh
  
  # Windows: Download from ollama.ai
  ```
- [ ] Start Ollama and pull a model:
  ```bash
  ollama pull llama2
  # or try: codellama, mistral, phi
  ```
- [ ] In OmniPanel: **Settings** → **AI Models** → **Local Models** tab
- [ ] Verify Ollama status shows "Connected" (green)
- [ ] Your model should appear in the list
- [ ] Click **"Load"** next to the model
- [ ] **Test**: Start a chat and ask a question

## 🎨 Personalization (5 minutes)

### Theme & Appearance
- [ ] Click the theme toggle in header (🌙/☀️/🖥️)
- [ ] Try different themes: Dark, Light, System
- [ ] For advanced customization: **Settings** → **Theme**
  - [ ] Experiment with colors
  - [ ] Adjust font size if needed
  - [ ] Set your preferred density (compact/comfortable/spacious)

### Keyboard Shortcuts
- [ ] Go to **Settings** → **Keyboard Shortcuts**
- [ ] Review essential shortcuts:
  - [ ] `Ctrl+Shift+C` - New Chat
  - [ ] `Ctrl+N` - New File  
  - [ ] `Ctrl+`` - Terminal
  - [ ] `Ctrl+E` - Explain Code
- [ ] Customize any shortcuts you want to change

## 🧪 Test Core Features (15 minutes)

### 1. Chat with AI
- [ ] Start a new chat
- [ ] Ask: "Write a Python function to calculate fibonacci numbers"
- [ ] Try follow-up: "Now add error handling"
- [ ] Test copy message feature
- [ ] Try regenerating a response

### 2. Code Editor
- [ ] Create a new file: `test.py`
- [ ] Paste the fibonacci code from chat
- [ ] Select some code and press `Ctrl+E` (explain)
- [ ] Select code and press `Ctrl+I` (improve)
- [ ] Try auto-formatting
- [ ] Test file download

### 3. Terminal
- [ ] Open terminal
- [ ] Try basic commands: `ls`, `pwd`, `help`
- [ ] Test AI assistance: `ai: how do I check git status?`
- [ ] Try git command: `git status`
- [ ] Export terminal session

### 4. Notebook
- [ ] Create a new notebook
- [ ] Add a markdown cell with `# My First Notebook`
- [ ] Add a code cell with simple Python:
  ```python
  import math
  print(f"Pi is approximately {math.pi:.4f}")
  ```
- [ ] Run the cell (Shift+Enter)
- [ ] Add another cell and ask AI for help
- [ ] Export notebook (.ipynb format)

## 🔧 Advanced Setup (Optional - 20 minutes)

### AI Rules (For power users)
- [ ] Go to **Settings** → **AI Rules**
- [ ] Create a simple rule:
  - [ ] Name: "Code Documentation"
  - [ ] Category: Content
  - [ ] Trigger: When generating code
  - [ ] Action: Always include comments
- [ ] Test the rule by asking AI to write a function

### Project Organization
- [ ] Create a folder structure in file tree
- [ ] Upload or create sample files
- [ ] Practice navigating between files
- [ ] Use multiple tabs for different files

### Performance Optimization
- [ ] Go to **Settings** → **Performance**
- [ ] Check system resource usage
- [ ] Adjust settings if on slower hardware:
  - [ ] Disable animations
  - [ ] Reduce history size
  - [ ] Adjust auto-save interval

## 🚀 Ready to Go! (Next Steps)

### Your First Real Project
Choose one to try:
- [ ] **Web Development**: Create HTML/CSS/JS files, use AI for debugging
- [ ] **Python Script**: Build a tool, get AI help with logic
- [ ] **Data Analysis**: Upload CSV, use notebook for exploration
- [ ] **Documentation**: Write README files with AI assistance
- [ ] **Learning**: Ask AI to teach you a new programming concept

### Workflow Tips
- [ ] Keep chat open in one tab for questions
- [ ] Use AI rules for consistent code style
- [ ] Leverage context - AI knows about your open files
- [ ] Use terminal for git, package management
- [ ] Export important work regularly

## 📚 Learning Resources

### Must-Read Guides
- [ ] **Full User Guide**: `USERS_GUIDE.md` - Complete feature documentation
- [ ] **Quick Reference**: `QUICK_REFERENCE.md` - Shortcuts and commands
- [ ] **Keyboard Shortcuts**: Settings → Keyboard (in-app)

### Practice Exercises
Try these to build confidence:
1. [ ] **Code Explanation**: Paste complex code, ask AI to explain it
2. [ ] **Bug Fixing**: Paste error messages, get AI solutions  
3. [ ] **Code Review**: Ask AI to review your code for improvements
4. [ ] **Documentation**: Have AI write docs for your functions
5. [ ] **Optimization**: Ask AI to make your code faster/cleaner

### Community & Support
- [ ] Bookmark support resources:
  - [ ] GitHub Issues (for bugs)
  - [ ] Discord Community (for questions)
  - [ ] Documentation site
- [ ] Join the newsletter for updates

## ✨ Success Indicators

You'll know you're set up correctly when:
- [ ] AI responds to your questions in chat
- [ ] Code editor has syntax highlighting
- [ ] AI shortcuts work (`Ctrl+E`, `Ctrl+I`)
- [ ] Terminal executes commands
- [ ] Notebook cells run successfully
- [ ] Files save and can be downloaded
- [ ] Theme and settings persist between sessions

## 🆘 If You Get Stuck

### Quick Troubleshooting
1. **AI not responding**: Check API key in Settings → AI Models
2. **Local model issues**: Ensure Ollama is running (`ollama ps`)
3. **Performance issues**: Try refreshing with `Ctrl+Shift+R`
4. **UI problems**: Check browser console (F12) for errors
5. **Connection issues**: Verify internet connection

### Get Help
- **Immediate help**: Use the `?` help icon in header
- **Common issues**: Check `USERS_GUIDE.md` → Troubleshooting section
- **Report bugs**: GitHub Issues with detailed description
- **Ask questions**: Community Discord or forums

---

## 🎉 Congratulations!

You've successfully set up OmniPanel! You now have:
- ✅ AI-powered chat assistance
- ✅ Intelligent code editor  
- ✅ AI-enhanced terminal
- ✅ Interactive notebooks
- ✅ Personalized workspace

**Time to build something amazing with AI! 🚀**

---

*Onboarding Checklist v1.0 - January 2025*

**Estimated total setup time: 30-45 minutes**  
**Basic setup only: 15-20 minutes** 
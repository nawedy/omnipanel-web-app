'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal as TerminalIcon, 
  Play, 
  Square, 
  RotateCcw, 
  Settings, 
  Maximize2, 
  Minimize2,
  Bot,
  History,
  Copy,
  Download,
  Brain,
  Zap,
  FileText,
  Code,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  ChevronRight,
  Folder,
  GitBranch
} from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspace';
import { contextService, type TerminalContext } from '@/services/contextService';
import { aiService } from '@/services/aiService';
import { useMonitoring } from '@/components/providers/MonitoringProvider';

interface TerminalProps {
  sessionId?: string;
  projectId?: string;
  initialPath?: string;
  enableContextIntegration?: boolean;
  enableAIAssistance?: boolean;
}

interface TerminalOutput {
  type: 'input' | 'output' | 'error' | 'ai' | 'system' | 'success' | 'warning';
  content: string;
  timestamp: Date;
  command?: string;
  exitCode?: number;
  duration?: number;
  metadata?: {
    pid?: number;
    workingDirectory?: string;
    environment?: Record<string, string>;
  };
}

interface CommandSuggestion {
  command: string;
  description: string;
  category: 'file' | 'git' | 'npm' | 'system' | 'ai' | 'custom';
  confidence: number;
}

export function Terminal({ 
  sessionId, 
  projectId, 
  initialPath,
  enableContextIntegration = true,
  enableAIAssistance = true
}: TerminalProps) {
  const { currentProject } = useWorkspaceStore();
  const { captureMessage } = useMonitoring();
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPath, setCurrentPath] = useState(initialPath || '~/workspace');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [output, setOutput] = useState<TerminalOutput[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<CommandSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TerminalOutput['type'] | 'all'>('all');
  const [aiStreamId, setAiStreamId] = useState<string | null>(null);
  const [isAIThinking, setIsAIThinking] = useState(false);

  // Enhanced command database with context awareness
  const commandDatabase = useMemo(() => ({
    file: [
      { command: 'ls -la', description: 'List all files with details', confidence: 0.9 },
      { command: 'find . -name "*.tsx"', description: 'Find TypeScript React files', confidence: 0.8 },
      { command: 'grep -r "TODO" src/', description: 'Search for TODO comments', confidence: 0.7 },
      { command: 'cat package.json', description: 'View package.json contents', confidence: 0.8 },
      { command: 'tree -I node_modules', description: 'Show directory tree', confidence: 0.7 }
    ],
    git: [
      { command: 'git status', description: 'Check git status', confidence: 0.9 },
      { command: 'git add .', description: 'Stage all changes', confidence: 0.8 },
      { command: 'git commit -m "feat: "', description: 'Commit with message', confidence: 0.8 },
      { command: 'git push origin main', description: 'Push to main branch', confidence: 0.7 },
      { command: 'git log --oneline -10', description: 'Show recent commits', confidence: 0.7 }
    ],
    npm: [
      { command: 'npm install', description: 'Install dependencies', confidence: 0.9 },
      { command: 'npm run dev', description: 'Start development server', confidence: 0.8 },
      { command: 'npm run build', description: 'Build for production', confidence: 0.8 },
      { command: 'npm test', description: 'Run tests', confidence: 0.7 },
      { command: 'npm audit fix', description: 'Fix security vulnerabilities', confidence: 0.6 }
    ],
    system: [
      { command: 'ps aux | grep node', description: 'Find Node.js processes', confidence: 0.7 },
      { command: 'df -h', description: 'Check disk usage', confidence: 0.6 },
      { command: 'top', description: 'Show running processes', confidence: 0.6 },
      { command: 'netstat -tulpn', description: 'Show network connections', confidence: 0.5 }
    ],
    ai: [
      { command: 'ai: explain this error', description: 'Get AI help with errors', confidence: 0.9 },
      { command: 'ai: suggest next steps', description: 'Get AI suggestions', confidence: 0.8 },
      { command: 'ai: optimize this command', description: 'Optimize command usage', confidence: 0.7 },
      { command: 'ai: debug performance', description: 'Debug performance issues', confidence: 0.7 }
    ]
  }), []);

  // Initialize terminal with welcome message
  useEffect(() => {
    const welcomeMessages: TerminalOutput[] = [
      { 
        type: 'system', 
        content: '🚀 OmniPanel Terminal v2.0.0 - Enhanced with AI & Context Awareness', 
        timestamp: new Date() 
      },
      { 
        type: 'output', 
        content: `Working directory: ${currentPath}`, 
        timestamp: new Date() 
      },
      { 
        type: 'output', 
        content: 'Features: AI assistance (ai: <query>), Context integration, Smart suggestions', 
        timestamp: new Date() 
      }
    ];

    if (enableAIAssistance) {
      welcomeMessages.push({
        type: 'ai',
        content: '🤖 AI Assistant: Ready to help! Use "ai: <your question>" or Ctrl+A for assistance.',
        timestamp: new Date()
      });
    }

    if (enableContextIntegration) {
      welcomeMessages.push({
        type: 'system',
        content: '🧠 Context integration enabled - Terminal commands will be tracked for AI assistance.',
        timestamp: new Date()
      });
    }

    setOutput(welcomeMessages);
  }, [currentPath, enableAIAssistance, enableContextIntegration]);

  // Context integration
  useEffect(() => {
    if (!enableContextIntegration) return;

    const unsubscribe = contextService.subscribe((context) => {
      // Update suggestions based on active files
      const activeFileTypes = context.activeFiles.map(f => f.language).filter(Boolean);
      const hasTypeScript = activeFileTypes.includes('typescript');
      const hasReact = context.activeFiles.some(f => f.name.includes('.tsx') || f.name.includes('.jsx'));
      
      // Enhance command suggestions based on context
      const contextualSuggestions: CommandSuggestion[] = [];
      
      if (hasTypeScript) {
        contextualSuggestions.push({
          command: 'npx tsc --noEmit',
          description: 'Type check TypeScript files',
          category: 'npm',
          confidence: 0.8
        });
      }
      
      if (hasReact) {
        contextualSuggestions.push({
          command: 'npm run dev',
          description: 'Start React development server',
          category: 'npm',
          confidence: 0.9
        });
      }
      
      // Add contextual suggestions to the database
      setSuggestions(prev => [...contextualSuggestions, ...prev.slice(0, 5)]);
    });

    return unsubscribe;
  }, [enableContextIntegration]);

  // Enhanced command suggestions
  const getCommandSuggestions = useCallback((input: string): CommandSuggestion[] => {
    if (!input.trim()) return [];
    
    const trimmedInput = input.trim().toLowerCase();
    const allSuggestions: CommandSuggestion[] = [];
    
    // AI command suggestions
    if (trimmedInput.startsWith('ai:')) {
      const aiInput = trimmedInput.substring(3).trim();
      const aiSuggestions = commandDatabase.ai.map(cmd => ({
        ...cmd,
        category: 'ai' as const,
        confidence: aiInput ? cmd.confidence * 0.8 : cmd.confidence
      }));
      allSuggestions.push(...aiSuggestions);
    } else {
      // Regular command suggestions
      Object.entries(commandDatabase).forEach(([category, commands]) => {
        const matches = commands.filter(cmd =>
          cmd.command.toLowerCase().includes(trimmedInput) ||
          cmd.description.toLowerCase().includes(trimmedInput)
        ).map(cmd => ({ ...cmd, category: category as CommandSuggestion['category'] }));
        
        allSuggestions.push(...matches);
      });
      
      // History matches
      const historyMatches = commandHistory
        .filter((cmd, index, self) => 
          self.indexOf(cmd) === index && // Remove duplicates
          cmd.toLowerCase().includes(trimmedInput)
        )
        .slice(-5)
        .map(cmd => ({
          command: cmd,
          description: 'From history',
          category: 'custom' as const,
          confidence: 0.6
        }));
      
      allSuggestions.push(...historyMatches);
    }
    
    // Sort by confidence and relevance
    return allSuggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 8);
  }, [commandDatabase, commandHistory]);

  // Auto-complete functionality
  const handleAutoComplete = useCallback(() => {
    const suggestions = getCommandSuggestions(currentInput);
    
    if (suggestions.length === 1) {
      setCurrentInput(suggestions[0].command + (suggestions[0].command.endsWith(':') ? ' ' : ''));
      setShowSuggestions(false);
    } else if (suggestions.length > 1) {
      setSuggestions(suggestions);
      setShowSuggestions(true);
      setSelectedSuggestionIndex(0);
    }
  }, [currentInput, getCommandSuggestions]);

  // Apply suggestion
  const applySuggestion = useCallback((suggestion: CommandSuggestion) => {
    setCurrentInput(suggestion.command + (suggestion.command.endsWith(':') ? ' ' : ''));
    setShowSuggestions(false);
    setSuggestions([]);
    inputRef.current?.focus();
  }, []);

  // Enhanced command execution with context integration
  const executeCommand = useCallback(async (command: string) => {
    if (!command.trim()) return;

    const timestamp = new Date();
    const startTime = Date.now();
    
    // Add command to history
    setCommandHistory(prev => [...prev, command]);
    
    // Add input to output
    setOutput(prev => [...prev, { 
      type: 'input', 
      content: `${currentPath} $ ${command}`, 
      timestamp,
      command
    }]);

    setIsRunning(true);

    try {
      // Handle AI commands
      if (command.startsWith('ai:')) {
        const aiQuery = command.substring(3).trim();
        setIsAIThinking(true);
        
        try {
          // Get context for AI
          const context = enableContextIntegration ? contextService.getContext() : null;
          const contextPrompt = context ? 
            `Current working directory: ${currentPath}\nRecent commands: ${commandHistory.slice(-3).join(', ')}\nActive files: ${context.activeFiles.map(f => f.name).join(', ')}\n\nUser query: ${aiQuery}` :
            aiQuery;

          // Stream AI response
          const conversation = aiService.createConversation(`Terminal AI: ${aiQuery.substring(0, 30)}...`);
          const streamId = `terminal-${Date.now()}`;
          setAiStreamId(streamId);
          
          let fullResponse = '';
          
          for await (const chunk of aiService.streamMessage({
            message: contextPrompt,
            conversationId: conversation.id,
            includeContext: enableContextIntegration,
            stream: true
          })) {
            fullResponse = chunk.content;
            
            // Update the AI response in real-time
            setOutput(prev => {
              const lastIndex = prev.length - 1;
              const lastItem = prev[lastIndex];
              
              if (lastItem && lastItem.type === 'ai' && lastItem.content.startsWith('🤖 AI:')) {
                // Update existing AI response
                return [
                  ...prev.slice(0, lastIndex),
                  { ...lastItem, content: `🤖 AI: ${fullResponse}` }
                ];
              } else {
                // Add new AI response
                return [...prev, {
                  type: 'ai',
                  content: `🤖 AI: ${fullResponse}`,
                  timestamp: new Date()
                }];
              }
            });
            
            if (chunk.isComplete) break;
          }
          
          captureMessage('AI command executed', 'info', {
            query: aiQuery,
            responseLength: fullResponse.length
          });
          
        } catch (error) {
          setOutput(prev => [...prev, {
            type: 'error',
            content: `🤖 AI Error: Failed to process query - ${error}`,
            timestamp: new Date()
          }]);
          
          captureMessage('AI command failed', 'error', { error, query: aiQuery });
        } finally {
          setIsAIThinking(false);
          setAiStreamId(null);
        }
        
        return;
      }

      // Handle built-in commands
      const duration = Date.now() - startTime;
      let commandOutput: TerminalOutput;
      
      switch (command.toLowerCase().trim()) {
        case 'help':
          commandOutput = {
            type: 'output',
            content: `Available commands:
  help              - Show this help message
  ls, dir           - List directory contents
  pwd               - Show current directory
  cd <path>         - Change directory
  clear             - Clear terminal
  history           - Show command history
  ai: <query>       - Ask AI assistant (Ctrl+A)
  context           - Show current workspace context
  
File Operations:
  cat <file>        - Display file contents
  find <pattern>    - Search for files
  grep <pattern>    - Search in files
  
Development:
  npm <command>     - Run npm commands
  git <command>     - Run git commands
  node <file>       - Run Node.js file
  
🤖 AI Features:
  - Context-aware responses based on your workspace
  - Command suggestions and optimization
  - Error explanation and debugging help
  - Performance analysis and recommendations`,
            timestamp: new Date(),
            duration
          };
          break;

        case 'clear':
          setOutput([]);
          return;

        case 'history':
          commandOutput = {
            type: 'output',
            content: commandHistory.length > 0 ? 
              commandHistory.map((cmd, i) => `${i + 1}: ${cmd}`).join('\n') :
              'No command history available',
            timestamp: new Date(),
            duration
          };
          break;

        case 'context':
          if (enableContextIntegration) {
            const context = contextService.getContext();
            const summary = contextService.generateContextSummary();
            
            commandOutput = {
              type: 'output',
              content: `📊 Workspace Context:
Project: ${summary.projectInfo}
Active Files: ${summary.activeFiles}
Recent Commands: ${summary.recentCommands}
Current Task: ${summary.currentTask}

🧠 Context Details:
- ${context.activeFiles.length} active files
- ${context.terminalHistory.length} terminal commands
- ${context.recentActions.length} recent actions
${context.currentSelection ? `- Code selection: ${context.currentSelection.text.substring(0, 50)}...` : ''}`,
              timestamp: new Date(),
              duration
            };
          } else {
            commandOutput = {
              type: 'warning',
              content: 'Context integration is disabled',
              timestamp: new Date(),
              duration
            };
          }
          break;

        case 'pwd':
          commandOutput = {
            type: 'output',
            content: currentPath,
            timestamp: new Date(),
            duration
          };
          break;

        case 'ls':
        case 'dir':
          await new Promise(resolve => setTimeout(resolve, 300));
          commandOutput = {
            type: 'output',
            content: `📁 src/           📁 public/        📁 node_modules/
📄 package.json   📄 README.md      📄 tsconfig.json
📄 .env.local     📄 .gitignore     📄 next.config.js`,
            timestamp: new Date(),
            duration: Date.now() - startTime,
            exitCode: 0
          };
          break;

        case 'git status':
          await new Promise(resolve => setTimeout(resolve, 500));
          commandOutput = {
            type: 'output',
            content: `On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   src/components/FileTree.tsx
        modified:   src/components/terminal/Terminal.tsx

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        src/services/contextService.ts

no changes added to commit (use "git add ." or "git commit -a")`,
            timestamp: new Date(),
            duration: Date.now() - startTime,
            exitCode: 0
          };
          break;

        case 'npm run dev':
          await new Promise(resolve => setTimeout(resolve, 1000));
          commandOutput = {
            type: 'success',
            content: `> omnipanel-web@1.3.0 dev
> next dev --turbo

  ▲ Next.js 14.0.0 (turbo)
  - Local:        http://localhost:3000
  - Network:      http://192.168.1.100:3000

 ✓ Ready in 1.2s`,
            timestamp: new Date(),
            duration: Date.now() - startTime,
            exitCode: 0
          };
          break;

        default:
          // Handle unknown commands
          if (command.startsWith('cd ')) {
            const newPath = command.substring(3).trim();
            setCurrentPath(newPath || '~/workspace');
            commandOutput = {
              type: 'output',
              content: `Changed directory to: ${newPath || '~/workspace'}`,
              timestamp: new Date(),
              duration
            };
          } else if (command.startsWith('npm ')) {
            await new Promise(resolve => setTimeout(resolve, 800));
            commandOutput = {
              type: 'output',
              content: `Executing: ${command}\n✓ Command completed successfully`,
              timestamp: new Date(),
              duration: Date.now() - startTime,
              exitCode: 0
            };
          } else if (command.startsWith('git ')) {
            await new Promise(resolve => setTimeout(resolve, 600));
            commandOutput = {
              type: 'output',
              content: `Executing: ${command}\n✓ Git command completed`,
              timestamp: new Date(),
              duration: Date.now() - startTime,
              exitCode: 0
            };
          } else {
            commandOutput = {
              type: 'error',
              content: `Command not found: ${command}\nType 'help' for available commands or 'ai: how to ${command}' for AI assistance`,
              timestamp: new Date(),
              duration,
              exitCode: 127
            };
          }
      }

      setOutput(prev => [...prev, commandOutput]);

      // Add to context service if enabled
      if (enableContextIntegration) {
        const terminalContext: TerminalContext = {
          command,
          output: commandOutput.content,
          exitCode: commandOutput.exitCode || 0,
          timestamp,
          workingDirectory: currentPath
        };
        
        contextService.addTerminalCommand(terminalContext);
      }

      captureMessage('Terminal command executed', 'info', {
        command,
        exitCode: commandOutput.exitCode || 0,
        duration
      });

    } catch (error) {
      const errorOutput: TerminalOutput = {
        type: 'error',
        content: `Error executing command: ${error}`,
        timestamp: new Date(),
        duration: Date.now() - startTime,
        exitCode: 1
      };
      
      setOutput(prev => [...prev, errorOutput]);
      
      captureMessage('Terminal command failed', 'error', { command, error });
    } finally {
      setIsRunning(false);
    }
  }, [currentPath, commandHistory, enableContextIntegration, enableAIAssistance, captureMessage]);

  // Enhanced keyboard handling
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (currentInput.trim()) {
        executeCommand(currentInput.trim());
        setCurrentInput('');
        setHistoryIndex(-1);
        setShowSuggestions(false);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (showSuggestions && suggestions.length > 0) {
        applySuggestion(suggestions[selectedSuggestionIndex]);
      } else {
        handleAutoComplete();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (showSuggestions) {
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
      } else if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (showSuggestions) {
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
      } else if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentInput('');
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSuggestions([]);
    } else if (e.ctrlKey && e.key === 'a') {
      e.preventDefault();
      setCurrentInput('ai: ');
      inputRef.current?.focus();
    } else if (e.ctrlKey && e.key === 'c') {
      if (isRunning && aiStreamId) {
        aiService.stopStream(aiStreamId);
        setIsAIThinking(false);
        setAiStreamId(null);
        setOutput(prev => [...prev, {
          type: 'warning',
          content: '^C - Operation cancelled',
          timestamp: new Date()
        }]);
      }
    }
  }, [
    currentInput, 
    executeCommand, 
    showSuggestions, 
    suggestions, 
    selectedSuggestionIndex, 
    applySuggestion, 
    handleAutoComplete, 
    commandHistory, 
    historyIndex,
    isRunning,
    aiStreamId
  ]);

  // Input change handler with suggestions
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentInput(value);
    
    if (value.trim()) {
      const newSuggestions = getCommandSuggestions(value);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
      setSelectedSuggestionIndex(0);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  }, [getCommandSuggestions]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  // Filter output
  const filteredOutput = useMemo(() => {
    let filtered = output;
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.command && item.command.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.type === filterType);
    }
    
    return filtered;
  }, [output, searchTerm, filterType]);

  // Utility functions
  const clearTerminal = useCallback(() => {
    setOutput([]);
    captureMessage('Terminal cleared', 'info');
  }, [captureMessage]);

  const downloadOutput = useCallback(() => {
    const content = output.map(item => 
      `[${item.timestamp.toISOString()}] ${item.type.toUpperCase()}: ${item.content}`
    ).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `terminal-output-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    captureMessage('Terminal output downloaded', 'info');
  }, [output, captureMessage]);

  const copyOutput = useCallback(() => {
    const content = filteredOutput.map(item => item.content).join('\n');
    navigator.clipboard.writeText(content);
    captureMessage('Terminal output copied', 'info');
  }, [filteredOutput, captureMessage]);

  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  }, []);

  const getOutputIcon = useCallback((type: TerminalOutput['type']) => {
    switch (type) {
      case 'input': return <ChevronRight className="w-3 h-3 text-blue-400" />;
      case 'output': return <Info className="w-3 h-3 text-gray-400" />;
      case 'error': return <XCircle className="w-3 h-3 text-red-400" />;
      case 'success': return <CheckCircle className="w-3 h-3 text-green-400" />;
      case 'warning': return <AlertCircle className="w-3 h-3 text-yellow-400" />;
      case 'ai': return <Bot className="w-3 h-3 text-purple-400" />;
      case 'system': return <Settings className="w-3 h-3 text-cyan-400" />;
      default: return <Info className="w-3 h-3 text-gray-400" />;
    }
  }, []);

  const getSuggestionIcon = useCallback((category: CommandSuggestion['category']) => {
    switch (category) {
      case 'file': return <FileText className="w-3 h-3 text-blue-400" />;
      case 'git': return <GitBranch className="w-3 h-3 text-orange-400" />;
      case 'npm': return <Code className="w-3 h-3 text-red-400" />;
      case 'system': return <Settings className="w-3 h-3 text-gray-400" />;
      case 'ai': return <Bot className="w-3 h-3 text-purple-400" />;
      case 'custom': return <History className="w-3 h-3 text-green-400" />;
      default: return <Info className="w-3 h-3 text-gray-400" />;
    }
  }, []);

  return (
    <div className={`flex flex-col bg-black/95 text-green-400 font-mono text-sm transition-all duration-300 ${
      isExpanded ? 'h-screen' : 'h-96'
    }`}>
      {/* Enhanced Header */}
      <div className="flex-shrink-0 h-12 px-4 flex items-center justify-between bg-gray-900/50 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <TerminalIcon className="w-4 h-4 text-green-400" />
          <span className="font-medium text-white">Terminal</span>
          {enableContextIntegration && (
            <Brain className="w-3 h-3 text-blue-400" title="Context-aware" />
          )}
          {enableAIAssistance && (
            <Bot className="w-3 h-3 text-purple-400" title="AI assistance" />
          )}
          <span className="text-xs text-gray-400">{currentPath}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Search and Filter */}
          <div className="flex items-center gap-1">
            <div className="relative">
              <Search className="absolute left-2 top-1.5 w-3 h-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-24 pl-6 pr-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-400"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as typeof filterType)}
              className="text-xs bg-gray-800 border border-gray-600 rounded px-2 py-1 focus:outline-none focus:border-blue-400"
            >
              <option value="all">All</option>
              <option value="input">Input</option>
              <option value="output">Output</option>
              <option value="error">Errors</option>
              <option value="ai">AI</option>
            </select>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`p-1.5 hover:bg-gray-700 rounded transition-colors ${showHistory ? 'bg-gray-700' : ''}`}
              title="Command History"
            >
              <History className="w-3.5 h-3.5" />
            </button>
            
            <button
              onClick={copyOutput}
              className="p-1.5 hover:bg-gray-700 rounded transition-colors"
              title="Copy Output"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            
            <button
              onClick={downloadOutput}
              className="p-1.5 hover:bg-gray-700 rounded transition-colors"
              title="Download Output"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            
            <button
              onClick={clearTerminal}
              className="p-1.5 hover:bg-gray-700 rounded transition-colors"
              title="Clear Terminal"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 hover:bg-gray-700 rounded transition-colors"
              title={isExpanded ? "Minimize" : "Maximize"}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Command History Panel */}
      {showHistory && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="flex-shrink-0 max-h-32 overflow-y-auto bg-gray-900/30 border-b border-gray-700 p-2"
        >
          <div className="text-xs text-gray-400 mb-2">Command History:</div>
          <div className="space-y-1">
            {commandHistory.slice(-10).reverse().map((cmd, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-2 py-1 hover:bg-gray-700/50 rounded cursor-pointer"
                onClick={() => {
                  setCurrentInput(cmd);
                  setShowHistory(false);
                  inputRef.current?.focus();
                }}
              >
                <Clock className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-300 truncate">{cmd}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Terminal Output */}
      <div 
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-4 space-y-1"
      >
        <AnimatePresence>
          {filteredOutput.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex items-start gap-2 ${
                item.type === 'error' ? 'text-red-400' :
                item.type === 'success' ? 'text-green-400' :
                item.type === 'warning' ? 'text-yellow-400' :
                item.type === 'ai' ? 'text-purple-400' :
                item.type === 'system' ? 'text-cyan-400' :
                item.type === 'input' ? 'text-blue-400' :
                'text-gray-300'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getOutputIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <span>{formatTime(item.timestamp)}</span>
                  {item.duration && <span>({item.duration}ms)</span>}
                  {item.exitCode !== undefined && (
                    <span className={item.exitCode === 0 ? 'text-green-400' : 'text-red-400'}>
                      exit: {item.exitCode}
                    </span>
                  )}
                </div>
                <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed">
                  {item.content}
                </pre>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isAIThinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-purple-400"
          >
            <Bot className="w-3 h-3" />
            <div className="flex items-center gap-1">
              <span className="text-sm">AI is thinking</span>
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse" />
                <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-100" />
                <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-200" />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Command Input */}
      <div className="flex-shrink-0 relative">
        {/* Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-0 right-0 bg-gray-800 border border-gray-600 rounded-t-lg max-h-48 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors ${
                  index === selectedSuggestionIndex ? 'bg-blue-600/30' : 'hover:bg-gray-700'
                }`}
                onClick={() => applySuggestion(suggestion)}
              >
                {getSuggestionIcon(suggestion.category)}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white font-medium truncate">
                    {suggestion.command}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {suggestion.description}
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {Math.round(suggestion.confidence * 100)}%
                </div>
              </div>
            ))}
          </motion.div>
        )}
        
        {/* Input Line */}
        <div className="flex items-center gap-2 p-4 bg-gray-900/50 border-t border-gray-700">
          <span className="text-blue-400 font-medium">{currentPath} $</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            className="flex-1 bg-transparent text-green-400 outline-none font-mono"
            placeholder="Type a command or 'ai: <question>' for AI help..."
            disabled={isRunning}
            autoFocus
          />
          {isRunning && (
            <div className="flex items-center gap-2 text-yellow-400">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              <span className="text-xs">Running...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
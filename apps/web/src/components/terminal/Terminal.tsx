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
  GitBranch,
  HelpCircle
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useWorkspaceStore } from '@/stores/workspace';
import { useContextStore } from '@/stores/contextStore';
import { useWorkspaceContext } from '@/hooks/useWorkspaceContext';
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
  const { addTerminalCommand, updateSharedContext } = useContextStore();
  const { addTerminalCommand: addToWorkspaceContext, getRelevantContext } = useWorkspaceContext();
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

  // Enhanced command execution with context integration
  const executeCommand = useCallback(async (command: string) => {
    if (!command.trim()) return;

    const startTime = Date.now();
    setIsRunning(true);
    setCurrentInput('');
    
    // Add to command history
    setCommandHistory(prev => [...prev.slice(-49), command]);
    setHistoryIndex(-1);

    // Add input to output
    const inputOutput: TerminalOutput = {
      type: 'input',
      content: `${currentPath} $ ${command}`,
      timestamp: new Date(),
      command
    };
    setOutput(prev => [...prev, inputOutput]);

    try {
      let result: TerminalOutput;
      
      // Handle AI commands
      if (command.startsWith('ai:') || command.startsWith('AI:')) {
        result = await handleAICommand(command.substring(3).trim());
      }
      // Handle context commands
      else if (command.startsWith('context:')) {
        result = await handleContextCommand(command.substring(8).trim());
      }
      // Handle regular commands
      else {
        result = await executeSystemCommand(command);
      }

      const duration = Date.now() - startTime;
      result.duration = duration;
      
      setOutput(prev => [...prev, result]);

      // Add to context if enabled
      if (enableContextIntegration) {
        const terminalContext: TerminalContext = {
          command,
          output: result.content,
          exitCode: result.exitCode || 0,
          timestamp: new Date(),
          workingDirectory: currentPath
        };
        
        addToWorkspaceContext(command, result.content, result.exitCode);
        addTerminalCommand(command);
        
        // Update shared context for other components
        updateSharedContext('terminal', {
          lastCommand: command,
          lastOutput: result.content,
          workingDirectory: currentPath,
          timestamp: new Date()
        });
      }

      captureMessage(`Terminal command executed: ${command}`, 'info', {
        duration: duration.toString(),
        exitCode: (result.exitCode || 0).toString()
      });

    } catch (error) {
      const errorOutput: TerminalOutput = {
        type: 'error',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        command,
        exitCode: 1,
        duration: Date.now() - startTime
      };
      
      setOutput(prev => [...prev, errorOutput]);
      
      if (enableContextIntegration) {
        addToWorkspaceContext(command, errorOutput.content, 1);
      }
    } finally {
      setIsRunning(false);
    }
  }, [currentPath, enableContextIntegration, enableAIAssistance, addToWorkspaceContext, addTerminalCommand, updateSharedContext, captureMessage]);

  // Handle AI commands with context awareness
  const handleAICommand = useCallback(async (query: string): Promise<TerminalOutput> => {
    setIsAIThinking(true);
    
    try {
      // Get relevant context for the AI query
      const relevantContext = enableContextIntegration ? getRelevantContext(query, 1500) : '';
      
      const enhancedQuery = relevantContext ? 
        `Context: ${relevantContext}\n\nQuery: ${query}` : 
        query;

      // Generate AI response using the service
      const messages = [
        {
          role: 'system' as const,
          content: `You are a helpful terminal assistant. Provide concise, actionable responses. 
          Focus on terminal commands, file operations, and development tasks. 
          If suggesting commands, format them clearly with explanations.`,
          timestamp: new Date()
        },
        {
          role: 'user' as const,
          content: enhancedQuery,
          timestamp: new Date()
        }
      ];

      const response = await aiService.generateResponse(messages, relevantContext);

      return {
        type: 'ai',
        content: `🤖 AI Assistant: ${response}`,
        timestamp: new Date(),
        exitCode: 0
      };
    } catch (error) {
      return {
        type: 'error',
        content: `AI Error: ${error instanceof Error ? error.message : 'Failed to get AI response'}`,
        timestamp: new Date(),
        exitCode: 1
      };
    } finally {
      setIsAIThinking(false);
    }
  }, [enableContextIntegration, getRelevantContext]);

  // Handle context commands
  const handleContextCommand = useCallback(async (command: string): Promise<TerminalOutput> => {
    const parts = command.split(' ');
    const action = parts[0];

    switch (action) {
      case 'show':
        const context = contextService.getContext();
        return {
          type: 'output',
          content: `Active Files: ${context.activeFiles.length}\nTerminal History: ${context.terminalHistory.length}\nProject: ${context.project?.name || 'None'}`,
          timestamp: new Date(),
          exitCode: 0
        };
      
      case 'clear':
        contextService.clearContext();
        return {
          type: 'success',
          content: 'Context cleared successfully',
          timestamp: new Date(),
          exitCode: 0
        };
      
      case 'summary':
        const summary = contextService.generateContextSummary();
        return {
          type: 'output',
          content: `Project: ${summary.projectInfo}\nFiles: ${summary.activeFiles}\nRecent: ${summary.recentCommands}`,
          timestamp: new Date(),
          exitCode: 0
        };
      
      default:
        return {
          type: 'error',
          content: `Unknown context command: ${action}. Available: show, clear, summary`,
          timestamp: new Date(),
          exitCode: 1
        };
    }
  }, []);

  // Handle system commands
  const executeSystemCommand = useCallback(async (command: string): Promise<TerminalOutput> => {
    const startTime = Date.now();
    
    switch (command.toLowerCase().trim()) {
      case 'help':
        return {
          type: 'output',
          content: `Available commands:
help              - Show this help message
ls, dir           - List directory contents
pwd               - Show current directory
cd <path>         - Change directory
clear             - Clear terminal
history           - Show command history
ai: <query>       - Ask AI assistant (Ctrl+A)
context: <action> - Context commands (show, clear, summary)

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
          duration: Date.now() - startTime,
          exitCode: 0
        };

      case 'clear':
        setOutput([]);
        return {
          type: 'system',
          content: 'Terminal cleared',
          timestamp: new Date(),
          exitCode: 0
        };

      case 'history':
        return {
          type: 'output',
          content: commandHistory.length > 0 ? 
            commandHistory.map((cmd, i) => `${i + 1}: ${cmd}`).join('\n') :
            'No command history available',
          timestamp: new Date(),
          duration: Date.now() - startTime,
          exitCode: 0
        };

      case 'pwd':
        return {
          type: 'output',
          content: currentPath,
          timestamp: new Date(),
          duration: Date.now() - startTime,
          exitCode: 0
        };

      case 'ls':
      case 'dir':
        await new Promise(resolve => setTimeout(resolve, 300));
        return {
          type: 'output',
          content: `📁 src/           📁 public/        📁 node_modules/
📄 package.json   📄 README.md      📄 tsconfig.json
📄 .env.local     📄 .gitignore     📄 next.config.js`,
          timestamp: new Date(),
          duration: Date.now() - startTime,
          exitCode: 0
        };

      default:
        // Handle unknown commands
        if (command.startsWith('cd ')) {
          const newPath = command.substring(3).trim();
          setCurrentPath(newPath || '~/workspace');
          return {
            type: 'output',
            content: `Changed directory to: ${newPath || '~/workspace'}`,
            timestamp: new Date(),
            duration: Date.now() - startTime,
            exitCode: 0
          };
        } else if (command.startsWith('npm ')) {
          await new Promise(resolve => setTimeout(resolve, 800));
          return {
            type: 'output',
            content: `Executing: ${command}\n✓ Command completed successfully`,
            timestamp: new Date(),
            duration: Date.now() - startTime,
            exitCode: 0
          };
        } else if (command.startsWith('git ')) {
          await new Promise(resolve => setTimeout(resolve, 600));
          return {
            type: 'output',
            content: `Executing: ${command}\n✓ Git command completed`,
            timestamp: new Date(),
            duration: Date.now() - startTime,
            exitCode: 0
          };
        } else {
          return {
            type: 'error',
            content: `Command not found: ${command}\nType 'help' for available commands or 'ai: how to ${command}' for AI assistance`,
            timestamp: new Date(),
            duration: Date.now() - startTime,
            exitCode: 127
          };
        }
    }
  }, [commandHistory, currentPath]);

  // Enhanced command suggestions with context awareness
  const generateSuggestions = useCallback((input: string) => {
    if (!input.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const allSuggestions: CommandSuggestion[] = [];
    
    // Add commands from database
    Object.entries(commandDatabase).forEach(([category, commands]) => {
      commands.forEach(cmd => {
        if (cmd.command.toLowerCase().includes(input.toLowerCase()) ||
            cmd.description.toLowerCase().includes(input.toLowerCase())) {
          allSuggestions.push({
            ...cmd,
            category: category as CommandSuggestion['category']
          });
        }
      });
    });

    // Add AI suggestions
    if (enableAIAssistance && input.length > 2) {
      allSuggestions.push({
        command: `ai: ${input}`,
        description: `Ask AI about: ${input}`,
        category: 'ai',
        confidence: 0.8
      });
    }

    // Add context-aware suggestions
    if (enableContextIntegration) {
      const context = contextService.getContext();
      
      // Suggest commands based on active files
      if (context.activeFiles.some(f => f.name.endsWith('.json'))) {
        allSuggestions.push({
          command: 'cat package.json',
          description: 'View package.json (detected in workspace)',
          category: 'file',
          confidence: 0.9
        });
      }
      
      if (context.activeFiles.some(f => f.language === 'typescript')) {
        allSuggestions.push({
          command: 'npx tsc --noEmit',
          description: 'Type check TypeScript files (detected in workspace)',
          category: 'npm',
          confidence: 0.9
        });
      }
    }

    // Sort by confidence and relevance
    allSuggestions.sort((a, b) => {
      const aRelevance = a.command.toLowerCase().startsWith(input.toLowerCase()) ? 1 : 0;
      const bRelevance = b.command.toLowerCase().startsWith(input.toLowerCase()) ? 1 : 0;
      
      if (aRelevance !== bRelevance) return bRelevance - aRelevance;
      return b.confidence - a.confidence;
    });

    const finalSuggestions = allSuggestions.slice(0, 8);
    setSuggestions(finalSuggestions);
    setShowSuggestions(finalSuggestions.length > 0);
    setSelectedSuggestionIndex(0);
  }, [commandDatabase, enableAIAssistance, enableContextIntegration]);

  // Auto-complete functionality
  const handleAutoComplete = useCallback(() => {
    generateSuggestions(currentInput);
    
    if (suggestions.length === 1) {
      setCurrentInput(suggestions[0].command + (suggestions[0].command.endsWith(':') ? ' ' : ''));
      setShowSuggestions(false);
    } else if (suggestions.length > 1) {
      setShowSuggestions(true);
      setSelectedSuggestionIndex(0);
    }
  }, [currentInput, suggestions, generateSuggestions]);

  // Apply suggestion
  const applySuggestion = useCallback((suggestion: CommandSuggestion) => {
    setCurrentInput(suggestion.command + (suggestion.command.endsWith(':') ? ' ' : ''));
    setShowSuggestions(false);
    setSuggestions([]);
    inputRef.current?.focus();
  }, []);

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
      case 'ai': return (
        <Avatar className="w-3 h-3">
          <AvatarImage src="/ai-avatar.png" alt="AI" />
          <AvatarFallback className="text-xs">AI</AvatarFallback>
        </Avatar>
      );
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
      case 'ai': return (
        <Avatar className="w-3 h-3">
          <AvatarImage src="/ai-avatar.png" alt="AI" />
          <AvatarFallback className="text-xs">AI</AvatarFallback>
        </Avatar>
      );
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
            <Brain className="w-3 h-3 text-blue-400" />
          )}
          {enableAIAssistance && (
            <Avatar className="w-3 h-3">
              <AvatarImage src="/ai-avatar.png" alt="AI" />
              <AvatarFallback className="text-xs">AI</AvatarFallback>
            </Avatar>
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
            <Avatar className="w-3 h-3">
              <AvatarImage src="/ai-avatar.png" alt="AI" />
              <AvatarFallback className="text-xs">AI</AvatarFallback>
            </Avatar>
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
            onChange={(e) => {
              setCurrentInput(e.target.value);
              generateSuggestions(e.target.value);
            }}
            onKeyDown={(e) => {
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
            }}
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
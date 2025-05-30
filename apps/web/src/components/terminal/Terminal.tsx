'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
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
  Download
} from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspace';

interface TerminalProps {
  sessionId?: string;
  projectId?: string;
  initialPath?: string;
}

export function Terminal({ sessionId, projectId, initialPath }: TerminalProps) {
  const { currentProject } = useWorkspaceStore();
  const terminalRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPath, setCurrentPath] = useState(initialPath || '~/');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [output, setOutput] = useState<Array<{ type: 'input' | 'output' | 'error' | 'ai'; content: string; timestamp: Date }>>([]);
  const [currentInput, setCurrentInput] = useState('');

  // Mock terminal initialization
  useEffect(() => {
    if (terminalRef.current) {
      // Initialize welcome message
      const welcomeMessages = [
        { type: 'output' as const, content: '🚀 OmniPanel Terminal v1.0.0', timestamp: new Date() },
        { type: 'output' as const, content: `Working directory: ${currentPath}`, timestamp: new Date() },
        { type: 'output' as const, content: 'Type "help" for available commands or ask AI for assistance!', timestamp: new Date() },
        { type: 'ai' as const, content: '💡 AI Assistant: I can help you with commands, explain outputs, and suggest optimizations. Just prefix your message with "ai:" or use Ctrl+A', timestamp: new Date() }
      ];
      setOutput(welcomeMessages);
    }
  }, []);

  const executeCommand = async (command: string) => {
    if (!command.trim()) return;

    const timestamp = new Date();
    
    // Add command to history
    setCommandHistory(prev => [...prev, command]);
    
    // Add input to output
    setOutput(prev => [...prev, { 
      type: 'input', 
      content: `${currentPath} $ ${command}`, 
      timestamp 
    }]);

    setIsRunning(true);

    try {
      // Handle AI commands
      if (command.startsWith('ai:')) {
        const aiQuery = command.substring(3).trim();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const aiResponses = [
          `🤖 AI: The command "${aiQuery}" appears to be asking about code assistance. Let me help you with that!`,
          `🤖 AI: I can see you're working on a project. Would you like me to suggest some useful commands?`,
          `🤖 AI: That's a great question! Here's what I think about your query...`,
          `🤖 AI: Let me analyze your request and provide some guidance.`
        ];
        
        const response = aiResponses[Math.floor(Math.random() * aiResponses.length)];
        setOutput(prev => [...prev, { 
          type: 'ai', 
          content: response, 
          timestamp: new Date() 
        }]);
        return;
      }

      // Handle built-in commands
      switch (command.toLowerCase().trim()) {
        case 'help':
          setOutput(prev => [...prev, { 
            type: 'output', 
            content: `Available commands:
  help          - Show this help message
  ls, dir       - List directory contents
  pwd           - Show current directory
  cd <path>     - Change directory
  clear         - Clear terminal
  history       - Show command history
  ai: <query>   - Ask AI assistant (or press Ctrl+A)
  run <file>    - Run code file
  git status    - Show git status
  npm <cmd>     - Run npm commands
  node <file>   - Run Node.js file
  python <file> - Run Python file
  
🤖 AI Features:
  - Ask questions with "ai: <your question>"
  - Get command suggestions
  - Explain error messages
  - Code execution help`, 
            timestamp: new Date() 
          }]);
          break;

        case 'ls':
        case 'dir':
          await new Promise(resolve => setTimeout(resolve, 500));
          setOutput(prev => [...prev, { 
            type: 'output', 
            content: `📁 src/          📁 dist/         📁 node_modules/
📄 package.json  📄 README.md     📄 tsconfig.json
📄 .gitignore    📄 .env.example  📄 tailwind.config.ts`, 
            timestamp: new Date() 
          }]);
          break;

        case 'pwd':
          setOutput(prev => [...prev, { 
            type: 'output', 
            content: currentPath, 
            timestamp: new Date() 
          }]);
          break;

        case 'clear':
          setOutput([]);
          break;

        case 'history':
          setOutput(prev => [...prev, { 
            type: 'output', 
            content: commandHistory.map((cmd, i) => `${i + 1}  ${cmd}`).join('\n'), 
            timestamp: new Date() 
          }]);
          break;

        case 'git status':
          await new Promise(resolve => setTimeout(resolve, 800));
          setOutput(prev => [...prev, { 
            type: 'output', 
            content: `On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   src/components/Terminal.tsx

no changes added to commit (use "git add" or "git commit -a")`, 
            timestamp: new Date() 
          }]);
          break;

        default:
          if (command.startsWith('cd ')) {
            const newPath = command.substring(3).trim();
            setCurrentPath(newPath === '..' ? '~/' : newPath);
            setOutput(prev => [...prev, { 
              type: 'output', 
              content: `Changed directory to ${newPath}`, 
              timestamp: new Date() 
            }]);
          } else if (command.startsWith('npm ')) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            setOutput(prev => [...prev, { 
              type: 'output', 
              content: `Running ${command}...\n✅ Command completed successfully`, 
              timestamp: new Date() 
            }]);
          } else if (command.startsWith('run ') || command.startsWith('node ') || command.startsWith('python ')) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setOutput(prev => [...prev, { 
              type: 'output', 
              content: `Executing ${command}...\nHello, World!\n✅ Process completed with exit code 0`, 
              timestamp: new Date() 
            }]);
          } else {
            setOutput(prev => [...prev, { 
              type: 'error', 
              content: `Command not found: ${command}\nType "help" for available commands or "ai: <query>" for assistance`, 
              timestamp: new Date() 
            }]);
          }
      }
    } catch (error) {
      setOutput(prev => [...prev, { 
        type: 'error', 
        content: `Error executing command: ${error}`, 
        timestamp: new Date() 
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(currentInput);
      setCurrentInput('');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // TODO: Implement auto-completion
    } else if (e.ctrlKey && e.key === 'a') {
      e.preventDefault();
      setCurrentInput('ai: ');
    } else if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      setIsRunning(false);
      setOutput(prev => [...prev, { 
        type: 'output', 
        content: '^C', 
        timestamp: new Date() 
      }]);
    }
  };

  const clearTerminal = () => {
    setOutput([]);
  };

  const downloadOutput = () => {
    const content = output.map(line => 
      `[${line.timestamp.toLocaleTimeString()}] ${line.type.toUpperCase()}: ${line.content}`
    ).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'terminal-output.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyOutput = () => {
    const content = output.map(line => line.content).join('\n');
    navigator.clipboard.writeText(content);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <motion.div 
      className={`h-full flex flex-col bg-gray-900 text-green-400 font-mono ${
        isExpanded ? 'fixed inset-0 z-50' : ''
      }`}
      initial={false}
      animate={{ 
        height: isExpanded ? '100vh' : '100%',
        width: isExpanded ? '100vw' : '100%'
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Terminal Header */}
      <div className="flex-shrink-0 h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <TerminalIcon className="w-5 h-5 text-green-400" />
            <span className="font-medium text-green-300">Terminal</span>
          </div>
          <div className="flex items-center gap-2 px-2 py-1 bg-gray-700 rounded text-sm">
            <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
            <span className="text-gray-300">{currentPath}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentInput('ai: ')}
            className="p-2 hover:bg-gray-700 rounded-md transition-colors text-blue-400"
            title="Ask AI Assistant"
          >
            <Bot className="w-4 h-4" />
          </button>
          <button
            onClick={() => setOutput(prev => [...prev, { 
              type: 'output', 
              content: commandHistory.slice(-10).map((cmd, i) => `${i + 1}  ${cmd}`).join('\n'), 
              timestamp: new Date() 
            }])}
            className="p-2 hover:bg-gray-700 rounded-md transition-colors"
            title="Show History"
          >
            <History className="w-4 h-4" />
          </button>
          <button
            onClick={copyOutput}
            className="p-2 hover:bg-gray-700 rounded-md transition-colors"
            title="Copy Output"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={downloadOutput}
            className="p-2 hover:bg-gray-700 rounded-md transition-colors"
            title="Download Output"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={clearTerminal}
            className="p-2 hover:bg-gray-700 rounded-md transition-colors"
            title="Clear Terminal"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-700 rounded-md transition-colors"
            title={isExpanded ? "Minimize" : "Maximize"}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            className="p-2 hover:bg-gray-700 rounded-md transition-colors"
            title="Terminal Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Terminal Output */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1" ref={terminalRef}>
        {output.map((line, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`text-sm leading-relaxed ${
              line.type === 'input' ? 'text-white' :
              line.type === 'error' ? 'text-red-400' :
              line.type === 'ai' ? 'text-blue-400' :
              'text-green-400'
            }`}
          >
            <span className="text-gray-500 text-xs mr-2">
              {formatTime(line.timestamp)}
            </span>
            <span className="whitespace-pre-wrap">{line.content}</span>
          </motion.div>
        ))}
        
        {/* Current Input Line */}
        <div className="flex items-center text-sm">
          <span className="text-gray-500 text-xs mr-2">
            {formatTime(new Date())}
          </span>
          <span className="text-green-400 mr-2">{currentPath} $</span>
          <input
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1 bg-transparent outline-none text-white caret-green-400"
            placeholder={isRunning ? "Process running..." : "Type a command..."}
            disabled={isRunning}
            autoFocus
          />
          {isRunning && (
            <div className="ml-2 flex items-center gap-1">
              <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce" />
              <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce delay-100" />
              <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce delay-200" />
            </div>
          )}
        </div>
      </div>

      {/* Terminal Footer */}
      <div className="flex-shrink-0 h-8 bg-gray-800 border-t border-gray-700 flex items-center justify-between px-4 text-xs text-gray-400">
        <div className="flex items-center gap-4">
          <span>Commands: {commandHistory.length}</span>
          <span>Lines: {output.length}</span>
          <span>AI Mode: Ctrl+A</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Enter: Execute</span>
          <span>Ctrl+C: Cancel</span>
          <span>Tab: Complete</span>
        </div>
      </div>
    </motion.div>
  );
} 
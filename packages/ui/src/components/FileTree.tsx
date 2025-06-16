//# packages/ui/src/components/FileTree.tsx

'use client';

import React, { useState, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Folder as FolderIcon, FolderOpen, File as FileIcon } from 'lucide-react';
import { clsx } from 'clsx';

export interface TreeElement {
  id: string;
  name: string;
  isSelectable?: boolean;
  children?: TreeElement[];
  icon?: React.ReactNode;
  type?: 'file' | 'folder';
}

interface TreeContextValue {
  selectedId: string | null;
  expandedItems: Set<string>;
  onSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
}

const TreeContext = createContext<TreeContextValue | null>(null);

export interface TreeProps {
  elements: TreeElement[];
  initialSelectedId?: string;
  initialExpandedItems?: string[];
  onSelectionChange?: (id: string) => void;
  className?: string;
  children?: React.ReactNode;
}

const Tree: React.FC<TreeProps> = ({
  elements,
  initialSelectedId,
  initialExpandedItems = [],
  onSelectionChange,
  className,
  children
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId || null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(initialExpandedItems)
  );

  const handleSelect = (id: string) => {
    setSelectedId(id);
    onSelectionChange?.(id);
  };

  const handleToggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const contextValue: TreeContextValue = {
    selectedId,
    expandedItems,
    onSelect: handleSelect,
    onToggleExpand: handleToggleExpand
  };

  return (
    <TreeContext.Provider value={contextValue}>
      <div className={clsx(
        'select-none overflow-hidden rounded-md bg-gray-50 dark:bg-gray-900 p-2',
        className
      )}>
        {children || React.createElement(TreeContent, { elements: elements })}
      </div>
    </TreeContext.Provider>
  );
};

const TreeContent: React.FC<{ elements: TreeElement[] }> = ({ elements }) => {
  return (
    <div className="space-y-1">
      {elements.map((element) => (
        React.createElement(TreeItem, { key: element.id, element: element })
      ))}
    </div>
  );
};

const TreeItem: React.FC<{ element: TreeElement; depth?: number }> = ({ 
  element, 
  depth = 0 
}) => {
  const context = useContext(TreeContext);
  if (!context) throw new Error('TreeItem must be used within Tree');
  
  const { selectedId, expandedItems, onSelect, onToggleExpand } = context;
  const isSelected = selectedId === element.id;
  const isExpanded = expandedItems.has(element.id);
  const hasChildren = element.children && element.children.length > 0;
  const isFolder = element.type === 'folder' || hasChildren;

  const handleClick = () => {
    if (element.isSelectable !== false) {
      onSelect(element.id);
    }
    if (hasChildren) {
      onToggleExpand(element.id);
    }
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand(element.id);
  };

  return (
    <div>
      <motion.div
        className={clsx(
          'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer',
          'hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150',
          isSelected && 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
          element.isSelectable === false && 'cursor-default'
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleClick}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {/* Expand/Collapse Button */}
        {hasChildren && (
          <motion.button
            className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            onClick={handleToggleClick}
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {React.createElement(ChevronRight, { className: "w-3 h-3" })}
          </motion.button>
        )}
        
        {/* Icon */}
        <div className="flex-shrink-0 w-4 h-4 text-gray-600 dark:text-gray-400">
          {element.icon || (
            isFolder ? (
              isExpanded ? React.createElement(FolderOpen, { className: "w-4 h-4" }) : React.createElement(FolderIcon, { className: "w-4 h-4" })
            ) : (
              React.createElement(FileIcon, { className: "w-4 h-4" })
            )
          )}
        </div>
        
        {/* Name */}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
          {element.name}
        </span>
      </motion.div>
      
      {/* Children */}
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ml-4 border-l border-gray-200 dark:border-gray-700 pl-2">
              {element.children!.map((child) => (
                React.createElement(TreeItem, { key: child.id, element: child, depth: depth + 1 })
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Pre-built components for common use cases
export const Folder: React.FC<{
  element: string;
  value: string;
  children: React.ReactNode;
}> = ({ element, value, children }) => {
  const context = useContext(TreeContext);
  if (!context) throw new Error('Folder must be used within Tree');
  
  const { expandedItems, onToggleExpand } = context;
  const isExpanded = expandedItems.has(value);

  return (
    <div>
      <motion.div
        className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
        onClick={() => onToggleExpand(value)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {React.createElement(ChevronRight, { className: "w-4 h-4 text-gray-500" })}
        </motion.div>
        <div className="w-4 h-4 text-yellow-600">
          {isExpanded ? React.createElement(FolderOpen, { className: "w-4 h-4" }) : React.createElement(FolderIcon, { className: "w-4 h-4" })}
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {element}
        </span>
      </motion.div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="ml-6 border-l border-gray-200 dark:border-gray-700 pl-2 overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const File: React.FC<{
  value: string;
  children: React.ReactNode;
}> = ({ value, children }) => {
  const context = useContext(TreeContext);
  if (!context) throw new Error('File must be used within Tree');
  
  const { selectedId, onSelect } = context;
  const isSelected = selectedId === value;

  return (
    <motion.div
      className={clsx(
        'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors duration-150',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        isSelected && 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
      )}
      onClick={() => onSelect(value)}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="w-4 h-4 text-gray-600 dark:text-gray-400">
        {React.createElement(FileIcon, { className: "w-4 h-4" })}
      </div>
      <div className="text-sm text-gray-700 dark:text-gray-300">
        {children}
      </div>
    </motion.div>
  );
};

export { Tree };
// apps/web/src/providers/AIContextProvider.tsx
// AI context provider for managing AI-related state
"use client";

import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface AIContextType {
  isProcessing: boolean;
  currentModel: string;
  setProcessing: (processing: boolean) => void;
  setModel: (model: string) => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

interface AIContextProviderProps {
  children: ReactNode;
}

export function AIContextProvider({ children }: AIContextProviderProps): React.JSX.Element {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentModel, setCurrentModel] = useState('gpt-4');

  const setProcessing = (processing: boolean) => {
    setIsProcessing(processing);
  };

  const setModel = (model: string) => {
    setCurrentModel(model);
  };

  return (
    <AIContext.Provider value={{
      isProcessing,
      currentModel,
      setProcessing,
      setModel
    }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAIContext() {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAIContext must be used within an AIContextProvider');
  }
  return context;
} 
import React, { createContext, useContext, ReactNode } from 'react';

export interface LLMContextType {
  currentModel: string | null;
  availableModels: string[];
  isLoading: boolean;
  setModel: (modelId: string) => Promise<void>;
  sendMessage: (message: string) => Promise<string>;
}

const LLMContext = createContext<LLMContextType | undefined>(undefined);

interface LLMProviderProps {
  children: ReactNode;
}

export function LLMProvider({ children }: LLMProviderProps): JSX.Element {
  // TODO: Implement LLM adapter integration
  const contextValue: LLMContextType = {
    currentModel: null,
    availableModels: [],
    isLoading: false,
    setModel: async (modelId: string) => {
      // TODO: Implement model switching
    },
    sendMessage: async (message: string) => {
      // TODO: Implement message sending
      return 'This is a placeholder response';
    },
  };

  return (
    <LLMContext.Provider value={contextValue}>
      {children}
    </LLMContext.Provider>
  );
}

export function useLLM(): LLMContextType {
  const context = useContext(LLMContext);
  if (context === undefined) {
    throw new Error('useLLM must be used within an LLMProvider');
  }
  return context;
} 
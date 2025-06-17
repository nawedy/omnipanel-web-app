// apps/web/src/stores/aiRulesStore.ts
// AI rules state management for behavior rules, templates, and execution

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  AIRule, 
  RuleTemplate, 
  RuleSet, 
  RuleExecutionContext, 
  RuleExecutionResult, 
  RuleValidationResult,
  RuleScope,
  RuleCategory,
  RulePriority,
  BUILT_IN_RULE_TEMPLATES
} from '@/types/aiRules';

// AI Rules State
interface AIRulesState {
  // Rules
  rules: AIRule[];
  templates: RuleTemplate[];
  ruleSets: RuleSet[];
  
  // Execution
  executionHistory: RuleExecutionResult[];
  isExecuting: boolean;
  
  // Settings
  enableRulesEngine: boolean;
  maxExecutionHistory: number;
  debugMode: boolean;
  
  // Actions - Rule Management
  addRule: (rule: Omit<AIRule, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'usageCount' | 'lastUsed' | 'successRate'>) => string;
  updateRule: (ruleId: string, updates: Partial<AIRule>) => void;
  deleteRule: (ruleId: string) => void;
  duplicateRule: (ruleId: string) => string;
  toggleRuleStatus: (ruleId: string) => void;
  
  // Actions - Template Management
  addTemplate: (template: Omit<RuleTemplate, 'id'>) => string;
  updateTemplate: (templateId: string, updates: Partial<RuleTemplate>) => void;
  deleteTemplate: (templateId: string) => void;
  createRuleFromTemplate: (templateId: string, customizations?: Partial<AIRule>) => string;
  
  // Actions - Rule Set Management
  createRuleSet: (ruleSet: Omit<RuleSet, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateRuleSet: (ruleSetId: string, updates: Partial<RuleSet>) => void;
  deleteRuleSet: (ruleSetId: string) => void;
  addRuleToSet: (ruleSetId: string, ruleId: string) => void;
  removeRuleFromSet: (ruleSetId: string, ruleId: string) => void;
  
  // Actions - Rule Execution
  executeRules: (context: RuleExecutionContext) => Promise<RuleExecutionResult[]>;
  validateRule: (rule: AIRule) => RuleValidationResult;
  testRule: (rule: AIRule, context: RuleExecutionContext) => Promise<RuleExecutionResult>;
  
  // Actions - Utility
  getRulesByScope: (scope: RuleScope) => AIRule[];
  getRulesByCategory: (category: RuleCategory) => AIRule[];
  getActiveRules: () => AIRule[];
  searchRules: (query: string) => AIRule[];
  exportRules: () => string;
  importRules: (rulesData: string) => void;
  resetToDefaults: () => void;
  
  // Actions - Settings
  updateSettings: (settings: Partial<Pick<AIRulesState, 'enableRulesEngine' | 'maxExecutionHistory' | 'debugMode'>>) => void;
}

// Generate unique ID
const generateId = (): string => {
  return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Default rule sets
const defaultRuleSets: RuleSet[] = [
  {
    id: 'essential-rules',
    name: 'Essential Rules',
    description: 'Core rules that should always be active',
    scope: 'global',
    rules: [],
    isActive: true,
    priority: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'code-rules',
    name: 'Code Development Rules',
    description: 'Rules specific to code development and programming',
    scope: 'project',
    rules: [],
    isActive: true,
    priority: 2,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const useAIRulesStore = create<AIRulesState>()(
  persist(
    (set, get) => ({
      // Initial state
      rules: [],
      templates: BUILT_IN_RULE_TEMPLATES,
      ruleSets: defaultRuleSets,
      executionHistory: [],
      isExecuting: false,
      
      // Settings
      enableRulesEngine: true,
      maxExecutionHistory: 1000,
      debugMode: false,
      
      // Rule Management
      addRule: (ruleData) => {
        const id = generateId();
        const rule: AIRule = {
          ...ruleData,
          id,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user', // Would be actual user ID in real app
          version: 1,
          usageCount: 0,
          successRate: 100
        };
        
        set((state) => ({
          rules: [...state.rules, rule]
        }));
        
        return id;
      },
      
      updateRule: (ruleId, updates) => set((state) => ({
        rules: state.rules.map(rule => 
          rule.id === ruleId 
            ? { 
                ...rule, 
                ...updates, 
                updatedAt: new Date(),
                version: rule.version + 1
              }
            : rule
        )
      })),
      
      deleteRule: (ruleId) => set((state) => ({
        rules: state.rules.filter(rule => rule.id !== ruleId),
        ruleSets: state.ruleSets.map(ruleSet => ({
          ...ruleSet,
          rules: ruleSet.rules.filter(id => id !== ruleId)
        }))
      })),
      
      duplicateRule: (ruleId) => {
        const state = get();
        const originalRule = state.rules.find(rule => rule.id === ruleId);
        if (!originalRule) return '';
        
        const id = generateId();
        const duplicatedRule: AIRule = {
          ...originalRule,
          id,
          name: `${originalRule.name} (Copy)`,
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1,
          usageCount: 0
        };
        
        set((state) => ({
          rules: [...state.rules, duplicatedRule]
        }));
        
        return id;
      },
      
      toggleRuleStatus: (ruleId) => set((state) => ({
        rules: state.rules.map(rule => 
          rule.id === ruleId 
            ? { 
                ...rule, 
                status: rule.status === 'active' ? 'inactive' : 'active',
                updatedAt: new Date()
              }
            : rule
        )
      })),
      
      // Template Management
      addTemplate: (templateData) => {
        const id = generateId();
        const template: RuleTemplate = {
          ...templateData,
          id
        };
        
        set((state) => ({
          templates: [...state.templates, template]
        }));
        
        return id;
      },
      
      updateTemplate: (templateId, updates) => set((state) => ({
        templates: state.templates.map(template => 
          template.id === templateId ? { ...template, ...updates } : template
        )
      })),
      
      deleteTemplate: (templateId) => set((state) => ({
        templates: state.templates.filter(template => 
          template.id !== templateId && !template.isBuiltIn
        )
      })),
      
      createRuleFromTemplate: (templateId, customizations = {}) => {
        const state = get();
        const template = state.templates.find(t => t.id === templateId);
        if (!template) return '';
        
        const id = generateId();
        const rule: AIRule = {
          ...template.template,
          ...customizations,
          id,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user',
          version: 1,
          usageCount: 0,
          successRate: 100
        };
        
        set((state) => ({
          rules: [...state.rules, rule]
        }));
        
        return id;
      },
      
      // Rule Set Management
      createRuleSet: (ruleSetData) => {
        const id = generateId();
        const ruleSet: RuleSet = {
          ...ruleSetData,
          id,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        set((state) => ({
          ruleSets: [...state.ruleSets, ruleSet]
        }));
        
        return id;
      },
      
      updateRuleSet: (ruleSetId, updates) => set((state) => ({
        ruleSets: state.ruleSets.map(ruleSet => 
          ruleSet.id === ruleSetId 
            ? { ...ruleSet, ...updates, updatedAt: new Date() }
            : ruleSet
        )
      })),
      
      deleteRuleSet: (ruleSetId) => set((state) => ({
        ruleSets: state.ruleSets.filter(ruleSet => ruleSet.id !== ruleSetId)
      })),
      
      addRuleToSet: (ruleSetId, ruleId) => set((state) => ({
        ruleSets: state.ruleSets.map(ruleSet => 
          ruleSet.id === ruleSetId 
            ? { 
                ...ruleSet, 
                rules: [...ruleSet.rules, ruleId],
                updatedAt: new Date()
              }
            : ruleSet
        )
      })),
      
      removeRuleFromSet: (ruleSetId, ruleId) => set((state) => ({
        ruleSets: state.ruleSets.map(ruleSet => 
          ruleSet.id === ruleSetId 
            ? { 
                ...ruleSet, 
                rules: ruleSet.rules.filter(id => id !== ruleId),
                updatedAt: new Date()
              }
            : ruleSet
        )
      })),
      
      // Rule Execution
      executeRules: async (context) => {
        const state = get();
        if (!state.enableRulesEngine) return [];
        
        set({ isExecuting: true });
        
        try {
          const activeRules = state.rules.filter(rule => rule.status === 'active');
          const applicableRules = activeRules.filter(rule => {
            // Filter rules by scope
            if (rule.scope === 'project' && !context.projectId) return false;
            if (rule.scope === 'workspace' && !context.workspaceId) return false;
            if (rule.scope === 'component' && !context.componentType) return false;
            
            // Check trigger conditions
            if (rule.trigger.type === 'keyword' && rule.trigger.value) {
              return context.inputText.toLowerCase().includes(rule.trigger.value.toLowerCase());
            }
            
            if (rule.trigger.type === 'context' && rule.trigger.conditions) {
              return rule.trigger.conditions.every(condition => {
                const fieldValue = context.metadata[condition.field];
                switch (condition.operator) {
                  case 'equals':
                    return fieldValue === condition.value;
                  case 'contains':
                    return String(fieldValue).includes(String(condition.value));
                  case 'startsWith':
                    return String(fieldValue).startsWith(String(condition.value));
                  case 'endsWith':
                    return String(fieldValue).endsWith(String(condition.value));
                  default:
                    return false;
                }
              });
            }
            
            return rule.trigger.type === 'always';
          });
          
          // Sort by priority
          applicableRules.sort((a, b) => {
            const priorityWeights = { low: 1, medium: 2, high: 3, critical: 4 };
            return priorityWeights[b.priority] - priorityWeights[a.priority];
          });
          
          const results: RuleExecutionResult[] = [];
          
          for (const rule of applicableRules) {
            const startTime = Date.now();
            
            try {
              const result: RuleExecutionResult = {
                ruleId: rule.id,
                executed: true,
                success: true,
                modifications: [],
                errors: [],
                executionTime: Date.now() - startTime,
                metadata: {
                  ruleName: rule.name,
                  ruleCategory: rule.category,
                  rulePriority: rule.priority
                }
              };
              
              // Process rule actions
              for (const action of rule.actions) {
                switch (action.type) {
                  case 'modify':
                    result.modifications.push(`Modified ${action.target}: ${action.value}`);
                    break;
                  case 'enhance':
                    result.modifications.push(`Enhanced ${action.target}: ${action.value}`);
                    break;
                  case 'restrict':
                    result.modifications.push(`Restricted ${action.target}: ${action.value}`);
                    break;
                  case 'log':
                    if (state.debugMode) {
                      console.log(`Rule ${rule.name}: ${action.value}`);
                    }
                    break;
                }
              }
              
              results.push(result);
              
              // Update rule usage statistics
              set((state) => ({
                rules: state.rules.map(r => 
                  r.id === rule.id 
                    ? { 
                        ...r, 
                        usageCount: r.usageCount + 1,
                        lastUsed: new Date()
                      }
                    : r
                )
              }));
              
            } catch (error) {
              results.push({
                ruleId: rule.id,
                executed: true,
                success: false,
                modifications: [],
                errors: [error instanceof Error ? error.message : 'Unknown error'],
                executionTime: Date.now() - startTime,
                metadata: {
                  ruleName: rule.name,
                  error: error instanceof Error ? error.message : 'Unknown error'
                }
              });
            }
          }
          
          // Add to execution history
          set((state) => ({
            executionHistory: [
              ...results,
              ...state.executionHistory
            ].slice(0, state.maxExecutionHistory)
          }));
          
          return results;
        } finally {
          set({ isExecuting: false });
        }
      },
      
      validateRule: (rule) => {
        const errors: string[] = [];
        const warnings: string[] = [];
        const suggestions: string[] = [];
        
        // Basic validation
        if (!rule.name.trim()) {
          errors.push('Rule name is required');
        }
        
        if (!rule.description.trim()) {
          warnings.push('Rule description is recommended');
        }
        
        if (rule.actions.length === 0) {
          errors.push('At least one action is required');
        }
        
        // Trigger validation
        if (rule.trigger.type === 'keyword' && !rule.trigger.value) {
          errors.push('Keyword trigger requires a value');
        }
        
        if (rule.trigger.type === 'context' && (!rule.trigger.conditions || rule.trigger.conditions.length === 0)) {
          errors.push('Context trigger requires conditions');
        }
        
        // Action validation
        for (const action of rule.actions) {
          if (!action.value.trim()) {
            errors.push(`Action of type "${action.type}" requires a value`);
          }
        }
        
        // Suggestions
        if (rule.priority === 'low' && rule.scope === 'global') {
          suggestions.push('Consider using higher priority for global rules');
        }
        
        if (rule.actions.length > 5) {
          suggestions.push('Consider splitting complex rules into multiple simpler rules');
        }
        
        return {
          isValid: errors.length === 0,
          errors,
          warnings,
          suggestions
        };
      },
      
      testRule: async (rule, context) => {
        const startTime = Date.now();
        
        try {
          // Simulate rule execution
          const result: RuleExecutionResult = {
            ruleId: rule.id,
            executed: true,
            success: true,
            modifications: rule.actions.map(action => `${action.type}: ${action.value}`),
            errors: [],
            executionTime: Date.now() - startTime,
            metadata: {
              test: true,
              ruleName: rule.name
            }
          };
          
          return result;
        } catch (error) {
          return {
            ruleId: rule.id,
            executed: true,
            success: false,
            modifications: [],
            errors: [error instanceof Error ? error.message : 'Test failed'],
            executionTime: Date.now() - startTime,
            metadata: {
              test: true,
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          };
        }
      },
      
      // Utility functions
      getRulesByScope: (scope) => {
        return get().rules.filter(rule => rule.scope === scope);
      },
      
      getRulesByCategory: (category) => {
        return get().rules.filter(rule => rule.category === category);
      },
      
      getActiveRules: () => {
        return get().rules.filter(rule => rule.status === 'active');
      },
      
      searchRules: (query) => {
        const state = get();
        const searchTerm = query.toLowerCase();
        
        return state.rules.filter(rule => 
          rule.name.toLowerCase().includes(searchTerm) ||
          rule.description.toLowerCase().includes(searchTerm) ||
          rule.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      },
      
      exportRules: () => {
        const state = get();
        const exportData = {
          rules: state.rules,
          templates: state.templates.filter(t => !t.isBuiltIn),
          ruleSets: state.ruleSets,
          settings: {
            enableRulesEngine: state.enableRulesEngine,
            maxExecutionHistory: state.maxExecutionHistory,
            debugMode: state.debugMode
          },
          exportedAt: new Date().toISOString(),
          version: '1.0'
        };
        
        return JSON.stringify(exportData, null, 2);
      },
      
      importRules: (rulesData) => {
        try {
          const data = JSON.parse(rulesData);
          
          set((state) => ({
            rules: [...state.rules, ...(data.rules || [])],
            templates: [...state.templates, ...(data.templates || [])],
            ruleSets: [...state.ruleSets, ...(data.ruleSets || [])],
            ...(data.settings || {})
          }));
        } catch (error) {
          console.error('Failed to import rules:', error);
        }
      },
      
      resetToDefaults: () => set({
        rules: [],
        templates: BUILT_IN_RULE_TEMPLATES,
        ruleSets: defaultRuleSets,
        executionHistory: [],
        enableRulesEngine: true,
        maxExecutionHistory: 1000,
        debugMode: false
      }),
      
      // Settings
      updateSettings: (settings) => set((state) => ({ ...state, ...settings }))
    }),
    {
      name: 'ai-rules-store',
      partialize: (state) => ({
        rules: state.rules,
        templates: state.templates.filter(t => !t.isBuiltIn), // Don't persist built-in templates
        ruleSets: state.ruleSets,
        enableRulesEngine: state.enableRulesEngine,
        maxExecutionHistory: state.maxExecutionHistory,
        debugMode: state.debugMode
      })
    }
  )
); 
// apps/web/src/types/aiRules.ts
// Type definitions for AI rules engine and behavior management

// Rule Scope
export type RuleScope = 'global' | 'project' | 'workspace' | 'component';

// Rule Category
export type RuleCategory = 
  | 'behavior' 
  | 'formatting' 
  | 'security' 
  | 'performance' 
  | 'content' 
  | 'interaction' 
  | 'context';

// Rule Priority
export type RulePriority = 'low' | 'medium' | 'high' | 'critical';

// Rule Status
export type RuleStatus = 'active' | 'inactive' | 'draft' | 'archived';

// Rule Trigger
export interface RuleTrigger {
  type: 'always' | 'context' | 'keyword' | 'pattern' | 'condition';
  value?: string;
  conditions?: RuleCondition[];
}

// Rule Condition
export interface RuleCondition {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'regex' | 'gt' | 'lt' | 'gte' | 'lte';
  value: string | number | boolean;
  caseSensitive?: boolean;
}

// Rule Action
export interface RuleAction {
  type: 'modify' | 'restrict' | 'enhance' | 'redirect' | 'log' | 'notify';
  target: string;
  value: string;
  parameters?: Record<string, any>;
}

// AI Rule Definition
export interface AIRule {
  id: string;
  name: string;
  description: string;
  category: RuleCategory;
  scope: RuleScope;
  priority: RulePriority;
  status: RuleStatus;
  
  // Rule Logic
  trigger: RuleTrigger;
  actions: RuleAction[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
  
  // Configuration
  isEditable: boolean;
  isSystemRule: boolean;
  tags: string[];
  
  // Usage Statistics
  usageCount: number;
  lastUsed?: Date;
  successRate: number;
}

// Rule Template
export interface RuleTemplate {
  id: string;
  name: string;
  description: string;
  category: RuleCategory;
  template: Omit<AIRule, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'version' | 'usageCount' | 'lastUsed' | 'successRate'>;
  isBuiltIn: boolean;
  tags: string[];
}

// Rule Validation Result
export interface RuleValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// Rule Execution Context
export interface RuleExecutionContext {
  userId: string;
  projectId?: string;
  workspaceId?: string;
  componentType?: string;
  inputText: string;
  metadata: Record<string, any>;
  timestamp: Date;
}

// Rule Execution Result
export interface RuleExecutionResult {
  ruleId: string;
  executed: boolean;
  success: boolean;
  output?: string;
  modifications: string[];
  errors: string[];
  executionTime: number;
  metadata: Record<string, any>;
}

// Rule Set
export interface RuleSet {
  id: string;
  name: string;
  description: string;
  scope: RuleScope;
  rules: string[]; // Rule IDs
  isActive: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

// Built-in Rule Templates
export const BUILT_IN_RULE_TEMPLATES: RuleTemplate[] = [
  {
    id: 'code-formatting',
    name: 'Code Formatting',
    description: 'Ensure consistent code formatting and style',
    category: 'formatting',
    isBuiltIn: true,
    tags: ['code', 'formatting', 'style'],
    template: {
      name: 'Code Formatting Rule',
      description: 'Automatically format code according to project standards',
      category: 'formatting',
      scope: 'project',
      priority: 'medium',
      status: 'active',
      trigger: {
        type: 'context',
        conditions: [
          {
            field: 'componentType',
            operator: 'equals',
            value: 'code-editor'
          }
        ]
      },
      actions: [
        {
          type: 'modify',
          target: 'output',
          value: 'Apply consistent indentation, spacing, and naming conventions'
        }
      ],
      isEditable: true,
      isSystemRule: false,
      tags: ['formatting', 'code']
    }
  },
  {
    id: 'security-check',
    name: 'Security Guidelines',
    description: 'Enforce security best practices in AI responses',
    category: 'security',
    isBuiltIn: true,
    tags: ['security', 'safety', 'privacy'],
    template: {
      name: 'Security Check Rule',
      description: 'Prevent AI from suggesting insecure code or practices',
      category: 'security',
      scope: 'global',
      priority: 'critical',
      status: 'active',
      trigger: {
        type: 'always'
      },
      actions: [
        {
          type: 'restrict',
          target: 'output',
          value: 'Do not suggest code with known security vulnerabilities'
        },
        {
          type: 'enhance',
          target: 'output',
          value: 'Include security considerations and best practices'
        }
      ],
      isEditable: false,
      isSystemRule: true,
      tags: ['security', 'safety']
    }
  },
  {
    id: 'context-awareness',
    name: 'Context Awareness',
    description: 'Use workspace context to provide relevant responses',
    category: 'context',
    isBuiltIn: true,
    tags: ['context', 'workspace', 'relevance'],
    template: {
      name: 'Context Awareness Rule',
      description: 'Consider current project files and workspace state',
      category: 'context',
      scope: 'workspace',
      priority: 'high',
      status: 'active',
      trigger: {
        type: 'always'
      },
      actions: [
        {
          type: 'enhance',
          target: 'input',
          value: 'Include relevant project context and file information'
        }
      ],
      isEditable: true,
      isSystemRule: false,
      tags: ['context', 'workspace']
    }
  },
  {
    id: 'response-length',
    name: 'Response Length Control',
    description: 'Control the length and verbosity of AI responses',
    category: 'behavior',
    isBuiltIn: true,
    tags: ['length', 'verbosity', 'concise'],
    template: {
      name: 'Response Length Rule',
      description: 'Keep responses concise and focused',
      category: 'behavior',
      scope: 'global',
      priority: 'medium',
      status: 'active',
      trigger: {
        type: 'always'
      },
      actions: [
        {
          type: 'modify',
          target: 'output',
          value: 'Provide concise, focused responses without unnecessary verbosity',
          parameters: {
            maxLength: 2000,
            preferBulletPoints: true
          }
        }
      ],
      isEditable: true,
      isSystemRule: false,
      tags: ['length', 'concise']
    }
  },
  {
    id: 'code-explanation',
    name: 'Code Explanation',
    description: 'Always explain code suggestions and reasoning',
    category: 'content',
    isBuiltIn: true,
    tags: ['code', 'explanation', 'education'],
    template: {
      name: 'Code Explanation Rule',
      description: 'Include explanations for all code suggestions',
      category: 'content',
      scope: 'project',
      priority: 'high',
      status: 'active',
      trigger: {
        type: 'keyword',
        value: 'code'
      },
      actions: [
        {
          type: 'enhance',
          target: 'output',
          value: 'Include clear explanations for code suggestions and reasoning'
        }
      ],
      isEditable: true,
      isSystemRule: false,
      tags: ['code', 'explanation']
    }
  }
];

// Rule Categories with Descriptions
export const RULE_CATEGORIES: Record<RuleCategory, { name: string; description: string; icon: string }> = {
  behavior: {
    name: 'Behavior',
    description: 'Control AI personality and response style',
    icon: 'brain'
  },
  formatting: {
    name: 'Formatting',
    description: 'Code and text formatting rules',
    icon: 'code'
  },
  security: {
    name: 'Security',
    description: 'Security and safety guidelines',
    icon: 'shield'
  },
  performance: {
    name: 'Performance',
    description: 'Performance optimization rules',
    icon: 'zap'
  },
  content: {
    name: 'Content',
    description: 'Content quality and structure rules',
    icon: 'file-text'
  },
  interaction: {
    name: 'Interaction',
    description: 'User interaction and UX rules',
    icon: 'users'
  },
  context: {
    name: 'Context',
    description: 'Context awareness and relevance rules',
    icon: 'layers'
  }
};

// Rule Scopes with Descriptions
export const RULE_SCOPES: Record<RuleScope, { name: string; description: string }> = {
  global: {
    name: 'Global',
    description: 'Applies to all AI interactions across the application'
  },
  project: {
    name: 'Project',
    description: 'Applies only to the current project'
  },
  workspace: {
    name: 'Workspace',
    description: 'Applies to the current workspace session'
  },
  component: {
    name: 'Component',
    description: 'Applies to specific UI components'
  }
};

// Rule Priorities with Descriptions
export const RULE_PRIORITIES: Record<RulePriority, { name: string; description: string; weight: number }> = {
  low: {
    name: 'Low',
    description: 'Optional suggestions and enhancements',
    weight: 1
  },
  medium: {
    name: 'Medium',
    description: 'Important guidelines and preferences',
    weight: 2
  },
  high: {
    name: 'High',
    description: 'Critical rules that should be followed',
    weight: 3
  },
  critical: {
    name: 'Critical',
    description: 'System rules that cannot be overridden',
    weight: 4
  }
}; 
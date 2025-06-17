// apps/web/src/app/settings/ai-rules/page.tsx
// AI rules management page for configuring behavior rules, templates, and rule sets

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Settings, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Copy, 
  Download, 
  Upload,
  Search,
  Filter,
  Brain,
  Code,
  Shield,
  Zap,
  FileText,
  Users,
  Layers,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAIRulesStore } from '@/stores/aiRulesStore';
import { 
  AIRule, 
  RuleTemplate, 
  RuleSet, 
  RuleCategory, 
  RuleScope, 
  RulePriority,
  RULE_CATEGORIES,
  RULE_SCOPES,
  RULE_PRIORITIES
} from '@/types/aiRules';
import { RuleExecutionContext } from '@/types/aiRules';

export default function AIRulesPage(): React.JSX.Element {
  const {
    rules,
    templates,
    ruleSets,
    enableRulesEngine,
    debugMode,
    addRule,
    updateRule,
    deleteRule,
    duplicateRule,
    toggleRuleStatus,
    addTemplate,
    createRuleFromTemplate,
    createRuleSet,
    updateRuleSet,
    deleteRuleSet,
    validateRule,
    testRule,
    getRulesByCategory,
    getRulesByScope,
    getActiveRules,
    searchRules,
    exportRules,
    importRules,
    resetToDefaults,
    updateSettings
  } = useAIRulesStore();

  const [activeTab, setActiveTab] = useState<'rules' | 'templates' | 'sets'>('rules');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<RuleCategory | 'all'>('all');
  const [selectedScope, setSelectedScope] = useState<RuleScope | 'all'>('all');
  const [showAddRule, setShowAddRule] = useState(false);
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [showAddRuleSet, setShowAddRuleSet] = useState(false);
  const [editingRule, setEditingRule] = useState<AIRule | null>(null);
  const [testingRule, setTestingRule] = useState<string | null>(null);

  // Filter rules based on search and filters
  const filteredRules = React.useMemo(() => {
    let filtered = searchQuery ? searchRules(searchQuery) : rules;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(rule => rule.category === selectedCategory);
    }
    
    if (selectedScope !== 'all') {
      filtered = filtered.filter(rule => rule.scope === selectedScope);
    }
    
    return filtered;
  }, [rules, searchQuery, selectedCategory, selectedScope, searchRules]);

  const handleTestRule = async (rule: AIRule): Promise<void> => {
    setTestingRule(rule.id);
    try {
      const context: RuleExecutionContext = {
        inputText: 'Test input for rule validation',
        projectId: 'test-project',
        workspaceId: 'test-workspace',
        componentType: 'test-component',
        userId: 'test-user',
        metadata: {
          testMode: true,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date()
      };
      await testRule(rule, context);
    } finally {
      setTestingRule(null);
    }
  };

  const handleExportRules = (): void => {
    const exportData = exportRules();
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-rules-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportRules = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        importRules(content);
      } catch (error) {
        console.error('Failed to import rules:', error);
      }
    };
    reader.readAsText(file);
  };

  const getCategoryIcon = (category: RuleCategory): React.ReactNode => {
    const iconMap = {
      behavior: <Brain className="w-4 h-4" />,
      formatting: <Code className="w-4 h-4" />,
      security: <Shield className="w-4 h-4" />,
      performance: <Zap className="w-4 h-4" />,
      content: <FileText className="w-4 h-4" />,
      interaction: <Users className="w-4 h-4" />,
      context: <Layers className="w-4 h-4" />
    };
    return iconMap[category];
  };

  const getPriorityColor = (priority: RulePriority): string => {
    const colorMap = {
      low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colorMap[priority];
  };

  const renderRulesTab = (): React.JSX.Element => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            AI Behavior Rules
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configure rules that control AI behavior and responses
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportRules}
            className="inline-flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <label className="inline-flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImportRules}
              className="hidden"
            />
          </label>
          <button
            onClick={() => setShowAddRule(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Rule
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as RuleCategory | 'all')}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="all">All Categories</option>
          {Object.entries(RULE_CATEGORIES).map(([key, category]) => (
            <option key={key} value={key}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          value={selectedScope}
          onChange={(e) => setSelectedScope(e.target.value as RuleScope | 'all')}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="all">All Scopes</option>
          {Object.entries(RULE_SCOPES).map(([key, scope]) => (
            <option key={key} value={key}>
              {scope.name}
            </option>
          ))}
        </select>
      </div>

      {/* Rules Grid */}
      <div className="grid gap-4">
        {filteredRules.map((rule) => {
          const validation = validateRule(rule);
          
          return (
            <div
              key={rule.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    rule.status === 'active' 
                      ? 'bg-green-100 dark:bg-green-900' 
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    {getCategoryIcon(rule.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {rule.name}
                      </h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(rule.priority)}`}>
                        {RULE_PRIORITIES[rule.priority].name}
                      </span>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full">
                        {RULE_SCOPES[rule.scope].name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {rule.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>Used {rule.usageCount} times</span>
                      <span>{rule.successRate}% success rate</span>
                      <span>v{rule.version}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    rule.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {rule.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Validation Status */}
              {!validation.isValid && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-200">
                      Validation Issues
                    </span>
                  </div>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                    {validation.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleTestRule(rule)}
                    disabled={testingRule === rule.id}
                    className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {testingRule === rule.id ? (
                      <Clock className="w-4 h-4 mr-1" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-1" />
                    )}
                    Test
                  </button>
                  <button
                    onClick={() => toggleRuleStatus(rule.id)}
                    className={`inline-flex items-center px-3 py-1.5 rounded-md transition-colors ${
                      rule.status === 'active'
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {rule.status === 'active' ? (
                      <>
                        <Pause className="w-4 h-4 mr-1" />
                        Disable
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-1" />
                        Enable
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setEditingRule(rule)}
                    className="inline-flex items-center px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => duplicateRule(rule.id)}
                    className="inline-flex items-center px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Duplicate
                  </button>
                </div>
                <button
                  onClick={() => deleteRule(rule.id)}
                  className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRules.length === 0 && (
        <div className="text-center py-12">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No rules found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchQuery || selectedCategory !== 'all' || selectedScope !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Create your first AI behavior rule to get started'
            }
          </p>
          <button
            onClick={() => setShowAddRule(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Rule
          </button>
        </div>
      )}
    </div>
  );

  const renderTemplatesTab = (): React.JSX.Element => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Rule Templates
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Pre-built templates for common AI behavior patterns
          </p>
        </div>
        <button
          onClick={() => setShowAddTemplate(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Template
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  {getCategoryIcon(template.category)}
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {template.name}
                    </h4>
                    {template.isBuiltIn && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                        Built-in
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {template.description}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => createRuleFromTemplate(template.id)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Rule
              </button>
              {!template.isBuiltIn && (
                <div className="flex items-center space-x-2">
                  <button className="inline-flex items-center px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRuleSetsTab = (): React.JSX.Element => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Rule Sets
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Organize rules into logical groups for different contexts
          </p>
        </div>
        <button
          onClick={() => setShowAddRuleSet(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Rule Set
        </button>
      </div>

      {/* Rule Sets Grid */}
      <div className="grid gap-4">
        {ruleSets.map((ruleSet) => (
          <div
            key={ruleSet.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  ruleSet.isActive 
                    ? 'bg-green-100 dark:bg-green-900' 
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  <Layers className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {ruleSet.name}
                    </h4>
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full">
                      {RULE_SCOPES[ruleSet.scope].name}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {ruleSet.description}
                  </p>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {ruleSet.rules.length} rules • Priority {ruleSet.priority}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  ruleSet.isActive ? 'bg-green-500' : 'bg-gray-400'
                }`} />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {ruleSet.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateRuleSet(ruleSet.id, { isActive: !ruleSet.isActive })}
                  className={`inline-flex items-center px-3 py-1.5 rounded-md transition-colors ${
                    ruleSet.isActive
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {ruleSet.isActive ? (
                    <>
                      <Pause className="w-4 h-4 mr-1" />
                      Disable
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-1" />
                      Enable
                    </>
                  )}
                </button>
                <button className="inline-flex items-center px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </button>
              </div>
              <button
                onClick={() => deleteRuleSet(ruleSet.id)}
                className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          AI Rules Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure AI behavior rules, templates, and rule sets to control how AI responds
        </p>
      </div>

      {/* Global Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Global Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Rules Engine
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enable AI rules processing
              </p>
            </div>
            <button
              onClick={() => updateSettings({ enableRulesEngine: !enableRulesEngine })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                enableRulesEngine ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enableRulesEngine ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Debug Mode
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Show detailed rule execution info
              </p>
            </div>
            <button
              onClick={() => updateSettings({ debugMode: !debugMode })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                debugMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  debugMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Quick Actions
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Reset to default rules
              </p>
            </div>
            <button
              onClick={resetToDefaults}
              className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Rules</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{rules.length}</p>
            </div>
            <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Rules</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{getActiveRules().length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Templates</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{templates.length}</p>
            </div>
            <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rule Sets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{ruleSets.length}</p>
            </div>
            <Layers className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'rules', label: 'Rules', icon: Brain },
            { id: 'templates', label: 'Templates', icon: FileText },
            { id: 'sets', label: 'Rule Sets', icon: Layers }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'rules' && renderRulesTab()}
      {activeTab === 'templates' && renderTemplatesTab()}
      {activeTab === 'sets' && renderRuleSetsTab()}
    </div>
  );
}
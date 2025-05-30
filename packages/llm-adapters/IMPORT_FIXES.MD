// packages/llm-adapters/IMPORT_FIXES.md

# 🔧 Import Issues - Migration Guide

## ❌ **Issues Found & Fixes**

### 1. **BaseAdapter vs BaseLLMAdapter Inconsistency**

**Problem:**
```typescript
// Some files use:
import { BaseAdapter } from '../base/adapter';  // ❌ Error: no export named 'BaseAdapter'

// Other files use:
import { BaseLLMAdapter } from '@/base/adapter';  // ✅ Works but inconsistent path
```

**✅ Solution:**
Updated `base/adapter.ts` to export both names for compatibility:
```typescript
export abstract class BaseAdapter { /* ... */ }
export class BaseLLMAdapter extends BaseAdapter {} // Alias for compatibility
```

### 2. **Import Path Inconsistencies**

**Problem:**
```typescript
// Mix of paths in different files:
import { BaseLLMAdapter } from '@/base/adapter';           // ❌ Absolute path
import { BaseAdapter } from '../base/adapter';             // ✅ Relative path
import { createStreamingParser } from '@/streaming/parser'; // ❌ Wrong path
```

**✅ Solution - Standardize to Relative Paths:**
```typescript
// ✅ All providers should use:
import { BaseAdapter } from '../base/adapter';
import { createRetryWrapper } from '../utils/retry';
import { RateLimiter } from '../utils/rateLimiter';
import { CostTracker } from '../utils/costTracker';
import { createStreamingParser } from '../utils/parser';
```

### 3. **Unused Imports**

**Problem:**
```typescript
// ❌ Unused imports causing TypeScript errors:
import MessageRole from '...';        // Never used
import { createStreamingParser };     // Declared but never used
```

**✅ Solution - Remove Unused Imports:**
```typescript
// ❌ Remove these unused imports:
// import MessageRole from '...';
// import { createStreamingParser } from '...';

// ✅ Only import what you actually use
```

## 🔄 **Migration Steps for Each Provider**

### **Step 1: Fix Base Adapter Import**
```typescript
// ❌ Change from:
import { BaseLLMAdapter } from '@/base/adapter';

// ✅ Change to:
import { BaseAdapter } from '../base/adapter';
```

### **Step 2: Fix Utility Imports**
```typescript
// ❌ Change from:
import { createStreamingParser } from '@/streaming/parser';

// ✅ Change to:
import { createStreamingParser } from '../utils/parser';
```

### **Step 3: Remove Unused Imports**
```typescript
// ❌ Remove these lines completely:
// import MessageRole from '...';
// import { createStreamingParser } from '...' (if not used);
```

### **Step 4: Update Class Declaration**
```typescript
// ✅ Keep consistent:
export class ProviderNameAdapter extends BaseAdapter {
  // Implementation...
}
```

## 📁 **Files That Need Updates**

### **Files Using Wrong BaseAdapter Import:**
- `providers/llamacpp.ts`
- `providers/deepseek.ts`
- `providers/mistral.ts`
- `providers/qwen.ts`
- `providers/huggingface.ts`

### **Files Using @/ Absolute Paths:**
- `providers/openai.ts`
- `providers/anthropic.ts`
- `providers/google.ts`

### **Files with Unused Imports:**
- `providers/ollama.ts` (MessageRole)
- `providers/openai.ts` (createStreamingParser if unused)

## 🛠️ **Quick Fix Template**

For each provider file, update the imports section:

```typescript
// packages/llm-adapters/src/providers/[PROVIDER].ts

import {
  AIProvider,
  ChatMessage,
  ChatResponse,
  StreamingChatResponse,
  ModelInfo,
  AIProviderConfig,
  TokenUsage,
  ProviderError,
  ProviderErrorType
} from '@omnipanel/types';
import { BaseAdapter } from '../base/adapter';
import { createRetryWrapper } from '../utils/retry';
import { RateLimiter } from '../utils/rateLimiter';
import { CostTracker } from '../utils/costTracker';
// Only import parser if actually used:
// import { createStreamingParser } from '../utils/parser';

export interface [Provider]Config extends AIProviderConfig {
  // Config interface
}

export class [Provider]Adapter extends BaseAdapter {
  // Implementation
}
```

## ✅ **Verification Checklist**

After making changes, ensure:

- [ ] No TypeScript errors for missing exports
- [ ] No unused import warnings
- [ ] All relative paths (`../`) instead of absolute (`@/`)
- [ ] BaseAdapter (not BaseLLMAdapter) is used consistently
- [ ] Provider classes extend BaseAdapter correctly

## 🎯 **Expected Results**

After applying these fixes:
- ✅ All TypeScript errors resolved
- ✅ Consistent import paths across all providers
- ✅ No unused import warnings
- ✅ Both BaseAdapter and BaseLLMAdapter work (compatibility)
- ✅ Clean, maintainable codebase

## 📋 **Files Modified Summary**

1. **`base/adapter.ts`** - ✅ Created with both BaseAdapter and BaseLLMAdapter exports
2. **`utils/parser.ts`** - ✅ Added createStreamingParser export
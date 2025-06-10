// packages/config/src/ai.ts
import { z } from 'zod';

// AI provider configuration schema
export const AIConfigSchema = z.object({
  // Default settings
  default: z.object({
    provider: z.string().default('openai'),
    model: z.string().default('gpt-4'),
    temperature: z.number().min(0).max(2).default(0.7),
    max_tokens: z.number().positive().default(2048),
    timeout_ms: z.number().positive().default(60000),
  }).default({}),
  
  // OpenAI configuration
  openai: z.object({
    api_key: z.string().optional(),
    organization: z.string().optional(),
    project: z.string().optional(),
    base_url: z.string().url().optional(),
    enabled: z.boolean().default(false),
    models: z.array(z.string()).default([
      'gpt-4o',
      'gpt-4',
      'gpt-4-turbo',
    ]),
    rate_limit: z.object({
      requests_per_minute: z.number().positive().default(60),
      tokens_per_minute: z.number().positive().default(60000),
    }).default({}),
  }).default({}),
  
  // Anthropic configuration
  anthropic: z.object({
    api_key: z.string().optional(),
    base_url: z.string().url().optional(),
    enabled: z.boolean().default(false),
    models: z.array(z.string()).default([
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
    ]),
    rate_limit: z.object({
      requests_per_minute: z.number().positive().default(60),
      tokens_per_minute: z.number().positive().default(40000),
    }).default({}),
  }).default({}),
  
  // Google AI configuration
  google: z.object({
    api_key: z.string().optional(),
    base_url: z.string().url().optional(),
    enabled: z.boolean().default(false),
    models: z.array(z.string()).default([
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.0-pro',
    ]),
    rate_limit: z.object({
      requests_per_minute: z.number().positive().default(60),
      tokens_per_minute: z.number().positive().default(32000),
    }).default({}),
  }).default({}),
  
  // Local model configuration
  local: z.object({
    ollama: z.object({
      base_url: z.string().url().default('http://localhost:11434'),
      enabled: z.boolean().default(false),
      timeout_ms: z.number().positive().default(120000),
      models: z.array(z.string()).default([]),
    }).default({}),
    vllm: z.object({
      base_url: z.string().url().default('http://localhost:8000'),
      enabled: z.boolean().default(false),
      timeout_ms: z.number().positive().default(120000),
      models: z.array(z.string()).default([]),
    }).default({}),
    llamacpp: z.object({
      base_url: z.string().url().default('http://localhost:8080'),
      enabled: z.boolean().default(false),
      timeout_ms: z.number().positive().default(120000),
      model: z.string().optional(),
    }).default({}),
  }).default({}),
  
  // Global settings
  settings: z.object({
    enable_streaming: z.boolean().default(true),
    enable_function_calling: z.boolean().default(true),
    enable_cost_tracking: z.boolean().default(true),
    max_concurrent_requests: z.number().positive().default(10),
    retry_attempts: z.number().nonnegative().default(3),
    retry_delay_ms: z.number().positive().default(1000),
    enable_caching: z.boolean().default(true),
    cache_ttl_seconds: z.number().positive().default(300),
  }).default({}),
});

export type AIConfig = z.infer<typeof AIConfigSchema>;

// Create AI configuration from environment variables
export const createAIConfig = (): AIConfig => {
  const config = {
    default: {
      provider: process.env.AI_DEFAULT_PROVIDER || 'openai',
      model: process.env.AI_DEFAULT_MODEL || 'gpt-4',
      temperature: parseFloat(process.env.AI_DEFAULT_TEMPERATURE || '0.7'),
      max_tokens: parseInt(process.env.AI_DEFAULT_MAX_TOKENS || '2048'),
      timeout_ms: parseInt(process.env.AI_DEFAULT_TIMEOUT_MS || '60000'),
    },
    
    openai: {
      api_key: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID,
      project: process.env.OPENAI_PROJECT_ID,
      base_url: process.env.OPENAI_BASE_URL,
      enabled: !!process.env.OPENAI_API_KEY,
      models: process.env.OPENAI_MODELS?.split(',') || ['gpt-4o', 'gpt-4', 'gpt-4-turbo'],
      rate_limit: {
        requests_per_minute: parseInt(process.env.OPENAI_RATE_LIMIT_RPM || '60'),
        tokens_per_minute: parseInt(process.env.OPENAI_RATE_LIMIT_TPM || '60000'),
      },
    },
    
    anthropic: {
      api_key: process.env.ANTHROPIC_API_KEY,
      base_url: process.env.ANTHROPIC_BASE_URL,
      enabled: !!process.env.ANTHROPIC_API_KEY,
      models: process.env.ANTHROPIC_MODELS?.split(',') || [
        'claude-3-opus-20240229',
        'claude-3-sonnet-20240229',
        'claude-3-haiku-20240307',
      ],
      rate_limit: {
        requests_per_minute: parseInt(process.env.ANTHROPIC_RATE_LIMIT_RPM || '60'),
        tokens_per_minute: parseInt(process.env.ANTHROPIC_RATE_LIMIT_TPM || '40000'),
      },
    },
    
    google: {
      api_key: process.env.GOOGLE_AI_API_KEY,
      base_url: process.env.GOOGLE_AI_BASE_URL,
      enabled: !!process.env.GOOGLE_AI_API_KEY,
      models: process.env.GOOGLE_AI_MODELS?.split(',') || [
        'gemini-1.5-pro',
        'gemini-1.5-flash',
        'gemini-1.0-pro',
      ],
      rate_limit: {
        requests_per_minute: parseInt(process.env.GOOGLE_AI_RATE_LIMIT_RPM || '60'),
        tokens_per_minute: parseInt(process.env.GOOGLE_AI_RATE_LIMIT_TPM || '32000'),
      },
    },
    
    local: {
      ollama: {
        base_url: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        enabled: process.env.OLLAMA_ENABLED === 'true',
        timeout_ms: parseInt(process.env.OLLAMA_TIMEOUT_MS || '120000'),
        models: process.env.OLLAMA_MODELS?.split(',') || [],
      },
      vllm: {
        base_url: process.env.VLLM_BASE_URL || 'http://localhost:8000',
        enabled: process.env.VLLM_ENABLED === 'true',
        timeout_ms: parseInt(process.env.VLLM_TIMEOUT_MS || '120000'),
        models: process.env.VLLM_MODELS?.split(',') || [],
      },
      llamacpp: {
        base_url: process.env.LLAMACPP_BASE_URL || 'http://localhost:8080',
        enabled: process.env.LLAMACPP_ENABLED === 'true',
        timeout_ms: parseInt(process.env.LLAMACPP_TIMEOUT_MS || '120000'),
        model: process.env.LLAMACPP_MODEL,
      },
    },
    
    settings: {
      enable_streaming: process.env.AI_ENABLE_STREAMING !== 'false',
      enable_function_calling: process.env.AI_ENABLE_FUNCTION_CALLING !== 'false',
      enable_cost_tracking: process.env.AI_ENABLE_COST_TRACKING !== 'false',
      max_concurrent_requests: parseInt(process.env.AI_MAX_CONCURRENT_REQUESTS || '10'),
      retry_attempts: parseInt(process.env.AI_RETRY_ATTEMPTS || '3'),
      retry_delay_ms: parseInt(process.env.AI_RETRY_DELAY_MS || '1000'),
      enable_caching: process.env.AI_ENABLE_CACHING !== 'false',
      cache_ttl_seconds: parseInt(process.env.AI_CACHE_TTL_SECONDS || '300'),
    },
  };

  return AIConfigSchema.parse(config);
};

// Validate AI configuration
export const validateAIConfig = (config: unknown): AIConfig => {
  try {
    return AIConfigSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('AI configuration validation failed:');
      error.errors.forEach(err => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
    }
    throw new Error('Invalid AI configuration');
  }
};

// Get enabled AI providers
export const getEnabledAIProviders = (config: AIConfig): string[] => {
  const enabled: string[] = [];
  
  if (config.openai.enabled) enabled.push('openai');
  if (config.anthropic.enabled) enabled.push('anthropic');
  if (config.google.enabled) enabled.push('google');
  if (config.local.ollama.enabled) enabled.push('ollama');
  if (config.local.vllm.enabled) enabled.push('vllm');
  if (config.local.llamacpp.enabled) enabled.push('llamacpp');
  
  return enabled;
};

// Get available models for a provider
export const getProviderModels = (config: AIConfig, provider: string): string[] => {
  switch (provider) {
    case 'openai':
      return config.openai.models;
    case 'anthropic':
      return config.anthropic.models;
    case 'google':
      return config.google.models;
    case 'ollama':
      return config.local.ollama.models;
    case 'vllm':
      return config.local.vllm.models;
    case 'llamacpp':
      return config.local.llamacpp.model ? [config.local.llamacpp.model] : [];
    default:
      return [];
  }
};
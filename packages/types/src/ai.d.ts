export interface AIProvider {
    id: string;
    name: string;
    type: AIProviderType;
    models: AIModel[];
    config: AIProviderConfig;
    status: AIProviderStatus;
}
export type AIProviderType = 'openai' | 'anthropic' | 'google' | 'ollama' | 'vllm' | 'llamacpp' | 'custom';
export type AIProviderStatus = 'active' | 'inactive' | 'error' | 'limited';
export interface AIModel {
    id: string;
    name: string;
    provider: string;
    context_length: number;
    supports_streaming: boolean;
    supports_functions: boolean;
    cost_per_token?: AICostStructure;
    capabilities: AIModelCapability[];
}
export interface AICostStructure {
    input: number;
    output: number;
    currency: string;
}
export type AIModelCapability = 'text' | 'code' | 'vision' | 'tools' | 'multimodal';
export interface AIProviderConfig {
    api_key?: string;
    base_url?: string;
    organization?: string;
    project?: string;
    rate_limit?: AIRateLimit;
    timeout?: number;
    custom_headers?: Record<string, string>;
}
export interface AIRateLimit {
    requests_per_minute: number;
    tokens_per_minute: number;
    concurrent_requests: number;
}
export interface AICompletionRequest {
    model: string;
    messages: AIRequestMessage[];
    stream?: boolean;
    temperature?: number;
    max_tokens?: number;
    tools?: AIRequestTool[];
    tool_choice?: string;
}
export interface AIRequestMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    name?: string;
    tool_calls?: AIRequestToolCall[];
}
export interface AIRequestTool {
    type: 'function';
    function: AIRequestFunctionDefinition;
}
export interface AIRequestFunctionDefinition {
    name: string;
    description: string;
    parameters: Record<string, any>;
}
export interface AIRequestToolCall {
    id: string;
    type: 'function';
    function: {
        name: string;
        arguments: string;
    };
}
export interface AICompletionResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: AIChoice[];
    usage: AIUsageStats;
}
export interface AIChoice {
    index: number;
    message: AIResponseMessage;
    finish_reason: AIFinishReason;
}
export interface AIResponseMessage {
    role: 'assistant';
    content: string;
    tool_calls?: AIResponseToolCall[];
}
export interface AIResponseToolCall {
    id: string;
    type: 'function';
    function: {
        name: string;
        arguments: string;
    };
}
export type AIFinishReason = 'stop' | 'length' | 'tool_calls' | 'content_filter';
export interface AIUsageStats {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
}
export interface AIUsageMetrics {
    total_requests: number;
    total_tokens: number;
    total_cost: number;
    average_latency: number;
    error_rate: number;
    provider_distribution: AIProviderUsage[];
    model_distribution: AIModelUsage[];
}
export interface AIProviderUsage {
    provider: string;
    requests: number;
    tokens: number;
    cost: number;
    success_rate: number;
}
export interface AIModelUsage {
    model: string;
    provider: string;
    requests: number;
    tokens: number;
    cost: number;
    average_latency: number;
}
//# sourceMappingURL=ai.d.ts.map
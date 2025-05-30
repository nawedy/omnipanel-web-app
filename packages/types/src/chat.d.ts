export interface ChatMessage {
    id: string;
    role: ChatMessageRole;
    content: string;
    timestamp: string;
    tokens?: ChatTokenUsage;
    citations?: ChatCitation[];
    attachments?: ChatAttachment[];
}
export type ChatMessageRole = 'user' | 'assistant' | 'system';
export interface ChatTokenUsage {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    cost?: number;
}
export interface ChatCitation {
    source: string;
    url?: string;
    excerpt: string;
    confidence: number;
}
export interface ChatAttachment {
    id: string;
    type: ChatAttachmentType;
    url: string;
    name: string;
    size?: number;
}
export type ChatAttachmentType = 'image' | 'file' | 'code' | 'link';
export interface ChatStreamingEvent {
    type: ChatStreamingEventType;
    data: ChatStreamingData;
}
export type ChatStreamingEventType = 'start' | 'chunk' | 'complete' | 'error';
export interface ChatStreamingData {
    content?: string;
    finished?: boolean;
    tokens?: ChatTokenUsage;
    error?: string;
}
export interface ChatFunctionCall {
    name: string;
    arguments: Record<string, any>;
    result?: any;
}
export interface ChatToolCall {
    id: string;
    type: 'function';
    function: ChatFunctionCall;
}
export interface ChatSessionConfig {
    model_provider: string;
    model_name: string;
    temperature?: number;
    max_tokens?: number;
    system_prompt?: string;
    tools?: ChatTool[];
}
export interface ChatTool {
    type: 'function';
    function: ChatFunctionDefinition;
}
export interface ChatFunctionDefinition {
    name: string;
    description: string;
    parameters: Record<string, any>;
}
export interface ChatSearchResult {
    message_id: string;
    content: string;
    highlights: ChatSearchHighlight[];
    relevance_score: number;
}
export interface ChatSearchHighlight {
    text: string;
    start: number;
    end: number;
}
export type ChatFinishReason = 'stop' | 'length' | 'function_call' | 'content_filter';
//# sourceMappingURL=chat.d.ts.map
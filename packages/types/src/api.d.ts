export interface APIResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    timestamp?: string;
}
export interface APIPaginatedResponse<T> extends APIResponse<T[]> {
    pagination: APIPagination;
}
export interface APIPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export interface APISearchParams {
    query?: string;
    filters?: Record<string, any>;
    sort?: APISortOption[];
    page?: number;
    limit?: number;
}
export interface APISortOption {
    field: string;
    direction: 'asc' | 'desc';
}
export interface APIError {
    code: string;
    message: string;
    details?: Record<string, any>;
    field?: string;
}
export interface APICreateProjectRequest {
    name: string;
    description?: string;
    type: string;
    settings?: Record<string, any>;
}
export interface APIUpdateProjectRequest {
    name?: string;
    description?: string;
    settings?: Record<string, any>;
}
export interface APISendMessageRequest {
    content: string;
    role: 'user';
    attachments?: APIMessageAttachment[];
}
export interface APIMessageAttachment {
    type: string;
    url: string;
    name: string;
    size?: number;
}
export type APIResourceType = 'project' | 'file' | 'chat' | 'message' | 'user';
//# sourceMappingURL=api.d.ts.map
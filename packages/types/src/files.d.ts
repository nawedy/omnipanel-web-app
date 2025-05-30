export interface FileOperation {
    type: FileOperationType;
    file_id: string;
    old_path?: string;
    new_path?: string;
    content?: string;
    timestamp: string;
    user_id: string;
}
export type FileOperationType = 'create' | 'update' | 'delete' | 'move' | 'copy';
export interface FileDiff {
    old_content: string;
    new_content: string;
    changes: FileDiffChange[];
    stats: FileDiffStats;
}
export interface FileDiffChange {
    type: 'add' | 'remove' | 'modify';
    line_number: number;
    content: string;
}
export interface FileDiffStats {
    additions: number;
    deletions: number;
    modifications: number;
}
export interface FileSearchResult {
    file_id: string;
    path: string;
    matches: FileSearchMatch[];
    relevance_score: number;
}
export interface FileSearchMatch {
    line_number: number;
    content: string;
    highlights: FileSearchHighlight[];
}
export interface FileSearchHighlight {
    start: number;
    end: number;
    text: string;
}
export interface FileAnalytics {
    most_edited: FileUsage[];
    language_distribution: FileLanguageStats[];
    size_distribution: FileSizeDistribution;
    recent_activity: FileActivity[];
}
export interface FileUsage {
    file_id: string;
    path: string;
    edit_count: number;
    last_edited: string;
}
export interface FileLanguageStats {
    language: string;
    file_count: number;
    total_size: number;
    percentage: number;
}
export interface FileSizeDistribution {
    small: number;
    medium: number;
    large: number;
    huge: number;
}
export interface FileActivity {
    file_id: string;
    operation: FileOperationType;
    timestamp: string;
    user_id: string;
}
export interface FileUploadRequest {
    name: string;
    content: string;
    path: string;
    project_id: string;
}
export interface FileUpdateRequest {
    content?: string;
    path?: string;
    name?: string;
}
export interface FileWatchEvent {
    type: FileWatchEventType;
    file_id: string;
    path: string;
    timestamp: string;
}
export type FileWatchEventType = 'created' | 'modified' | 'deleted' | 'moved';
//# sourceMappingURL=files.d.ts.map
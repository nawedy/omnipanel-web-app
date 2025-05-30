export interface ProjectStats {
    file_count: number;
    total_size: number;
    last_activity: string;
    member_count: number;
    chat_sessions: number;
    total_messages: number;
}
export interface ProjectAnalytics {
    usage: ProjectUsageMetrics;
    trends: ProjectTrendData[];
    performance: ProjectPerformanceMetrics;
    period: ProjectAnalyticsPeriod;
}
export type ProjectAnalyticsPeriod = 'day' | 'week' | 'month' | 'year';
export interface ProjectUsageMetrics {
    active_users: number;
    total_sessions: number;
    file_changes: number;
    ai_requests: number;
}
export interface ProjectTrendData {
    date: string;
    value: number;
    metric: string;
}
export interface ProjectPerformanceMetrics {
    response_time: ProjectTimeSeriesPoint[];
    error_rate: number;
    uptime: number;
    confidence: ProjectConfidenceInterval;
}
export interface ProjectTimeSeriesPoint {
    timestamp: string;
    value: number;
}
export interface ProjectConfidenceInterval {
    lower: number;
    upper: number;
    confidence_level: number;
}
export interface ProjectTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    files: ProjectFileTemplate[];
    variables: ProjectTemplateVariable[];
}
export interface ProjectFileTemplate {
    path: string;
    content: string;
    template_variables: string[];
}
export interface ProjectTemplateVariable {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'select';
    description: string;
    default?: any;
    options?: any[];
    required: boolean;
}
export interface ProjectInvitation {
    id: string;
    project_id: string;
    email: string;
    role: string;
    invited_by: string;
    expires_at: string;
    status: ProjectInvitationStatus;
}
export type ProjectInvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';
export interface ProjectActivity {
    id: string;
    project_id: string;
    user_id: string;
    action: ProjectActivityType;
    details: Record<string, any>;
    timestamp: string;
}
export type ProjectActivityType = 'created' | 'updated' | 'deleted' | 'member_added' | 'member_removed' | 'file_changed';
//# sourceMappingURL=projects.d.ts.map
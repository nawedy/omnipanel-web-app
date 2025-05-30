import { z } from 'zod';
export declare const DatabaseConfigSchema: z.ZodObject<{
    supabase: z.ZodObject<{
        url: z.ZodString;
        anon_key: z.ZodString;
        service_role_key: z.ZodOptional<z.ZodString>;
        project_id: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        url: string;
        anon_key: string;
        service_role_key?: string | undefined;
        project_id?: string | undefined;
    }, {
        url: string;
        anon_key: string;
        service_role_key?: string | undefined;
        project_id?: string | undefined;
    }>;
    connection: z.ZodDefault<z.ZodObject<{
        pool_size: z.ZodDefault<z.ZodNumber>;
        timeout_ms: z.ZodDefault<z.ZodNumber>;
        idle_timeout_ms: z.ZodDefault<z.ZodNumber>;
        max_retries: z.ZodDefault<z.ZodNumber>;
        retry_delay_ms: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        pool_size: number;
        timeout_ms: number;
        idle_timeout_ms: number;
        max_retries: number;
        retry_delay_ms: number;
    }, {
        pool_size?: number | undefined;
        timeout_ms?: number | undefined;
        idle_timeout_ms?: number | undefined;
        max_retries?: number | undefined;
        retry_delay_ms?: number | undefined;
    }>>;
    performance: z.ZodDefault<z.ZodObject<{
        enable_realtime: z.ZodDefault<z.ZodBoolean>;
        enable_row_level_security: z.ZodDefault<z.ZodBoolean>;
        enable_query_logging: z.ZodDefault<z.ZodBoolean>;
        slow_query_threshold_ms: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        enable_realtime: boolean;
        enable_row_level_security: boolean;
        enable_query_logging: boolean;
        slow_query_threshold_ms: number;
    }, {
        enable_realtime?: boolean | undefined;
        enable_row_level_security?: boolean | undefined;
        enable_query_logging?: boolean | undefined;
        slow_query_threshold_ms?: number | undefined;
    }>>;
    backup: z.ZodDefault<z.ZodObject<{
        enable_auto_backup: z.ZodDefault<z.ZodBoolean>;
        backup_interval_hours: z.ZodDefault<z.ZodNumber>;
        retention_days: z.ZodDefault<z.ZodNumber>;
        backup_location: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        enable_auto_backup: boolean;
        backup_interval_hours: number;
        retention_days: number;
        backup_location?: string | undefined;
    }, {
        enable_auto_backup?: boolean | undefined;
        backup_interval_hours?: number | undefined;
        retention_days?: number | undefined;
        backup_location?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    supabase: {
        url: string;
        anon_key: string;
        service_role_key?: string | undefined;
        project_id?: string | undefined;
    };
    connection: {
        pool_size: number;
        timeout_ms: number;
        idle_timeout_ms: number;
        max_retries: number;
        retry_delay_ms: number;
    };
    performance: {
        enable_realtime: boolean;
        enable_row_level_security: boolean;
        enable_query_logging: boolean;
        slow_query_threshold_ms: number;
    };
    backup: {
        enable_auto_backup: boolean;
        backup_interval_hours: number;
        retention_days: number;
        backup_location?: string | undefined;
    };
}, {
    supabase: {
        url: string;
        anon_key: string;
        service_role_key?: string | undefined;
        project_id?: string | undefined;
    };
    connection?: {
        pool_size?: number | undefined;
        timeout_ms?: number | undefined;
        idle_timeout_ms?: number | undefined;
        max_retries?: number | undefined;
        retry_delay_ms?: number | undefined;
    } | undefined;
    performance?: {
        enable_realtime?: boolean | undefined;
        enable_row_level_security?: boolean | undefined;
        enable_query_logging?: boolean | undefined;
        slow_query_threshold_ms?: number | undefined;
    } | undefined;
    backup?: {
        enable_auto_backup?: boolean | undefined;
        backup_interval_hours?: number | undefined;
        retention_days?: number | undefined;
        backup_location?: string | undefined;
    } | undefined;
}>;
export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;
export declare const createDatabaseConfig: () => DatabaseConfig;
export declare const validateDatabaseConfig: (config: unknown) => DatabaseConfig;
export declare const getDatabaseUrl: (config: DatabaseConfig) => string;
export declare const isProductionDatabase: (config: DatabaseConfig) => boolean;
//# sourceMappingURL=database.d.ts.map
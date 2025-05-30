import { z } from 'zod';
export type Environment = 'development' | 'staging' | 'production' | 'test';
export type { DatabaseConfig } from './database';
export declare const getCurrentEnvironment: () => Environment;
export declare const EnvironmentSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "staging", "production", "test"]>>;
    DEBUG: z.ZodOptional<z.ZodString>;
    PORT: z.ZodOptional<z.ZodString>;
    HOST: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "development" | "staging" | "production" | "test";
    DEBUG?: string | undefined;
    PORT?: string | undefined;
    HOST?: string | undefined;
}, {
    NODE_ENV?: "development" | "staging" | "production" | "test" | undefined;
    DEBUG?: string | undefined;
    PORT?: string | undefined;
    HOST?: string | undefined;
}>;
export declare const loadEnvironmentVariables: () => Record<string, string | undefined>;
export declare const validateRequiredEnvVars: (required: string[]) => void;
export declare const getEnvVar: (key: string, fallback?: string) => string | undefined;
export declare const isDevelopment: () => boolean;
export declare const isProduction: () => boolean;
export declare const isStaging: () => boolean;
export declare const isTest: () => boolean;
export declare const loadEnvironmentConfig: <T>(configs: Record<Environment, T>, currentEnv?: Environment) => T;
export declare const loadConfigFromFile: <T>(filename: string, parser: (content: string) => T) => Promise<T>;
export declare const parseEnvBoolean: (value: string | undefined, defaultValue?: boolean) => boolean;
export declare const parseEnvNumber: (value: string | undefined, defaultValue?: number) => number;
export declare const parseEnvArray: (value: string | undefined, separator?: string, defaultValue?: string[]) => string[];
export declare const mergeConfigs: <T extends Record<string, any>>(base: T, override: Partial<T>) => T;
export declare const deepMergeConfigs: <T extends Record<string, any>>(base: T, override: Partial<T>) => T;
//# sourceMappingURL=index.d.ts.map
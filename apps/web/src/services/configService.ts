// apps/web/src/services/configService.ts
// Configuration service for managing user settings and database configuration

interface DatabaseConfig {
  projectId: string;
  apiKey: string;
  connectionString: string;
}

interface AppConfig {
  database: DatabaseConfig;
  theme: string;
  language: string;
  timezone: string;
  font: string;
}

class ConfigService {
  private storageKey = 'omnipanel-config';

  /**
   * Get configuration from localStorage
   */
  getConfig(): Partial<AppConfig> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to parse stored configuration:', error);
      return {};
    }
  }

  /**
   * Save configuration to localStorage
   */
  saveConfig(config: Partial<AppConfig>): boolean {
    try {
      const currentConfig = this.getConfig();
      const mergedConfig = { ...currentConfig, ...config };
      localStorage.setItem(this.storageKey, JSON.stringify(mergedConfig));
      return true;
    } catch (error) {
      console.error('Failed to save configuration:', error);
      return false;
    }
  }

  /**
   * Get database configuration
   */
  getDatabaseConfig(): Partial<DatabaseConfig> {
    const config = this.getConfig();
    return config.database || {};
  }

  /**
   * Save database configuration
   */
  saveDatabaseConfig(dbConfig: Partial<DatabaseConfig>): boolean {
    try {
      const currentConfig = this.getConfig();
      const updatedConfig = {
        ...currentConfig,
        database: { ...currentConfig.database, ...dbConfig }
      };
      return this.saveConfig(updatedConfig);
    } catch (error) {
      console.error('Failed to save database configuration:', error);
      return false;
    }
  }

  /**
   * Clear all configuration
   */
  clearConfig(): boolean {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.error('Failed to clear configuration:', error);
      return false;
    }
  }

  /**
   * Validate database configuration
   */
  validateDatabaseConfig(config: Partial<DatabaseConfig>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.projectId && !config.connectionString) {
      errors.push('Either Project ID or Connection String is required');
    }

    if (config.projectId && config.projectId.length < 10) {
      errors.push('Project ID must be at least 10 characters');
    }

    if (config.apiKey && config.apiKey.length < 20) {
      errors.push('API Key must be at least 20 characters');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get environment variables for runtime configuration
   * This would integrate with actual environment variable setting in production
   */
  getEnvironmentVariables(): Record<string, string> {
    const dbConfig = this.getDatabaseConfig();
    const envVars: Record<string, string> = {};

    if (dbConfig.projectId) {
      envVars.NEON_PROJECT_ID = dbConfig.projectId;
    }

    if (dbConfig.apiKey) {
      envVars.NEON_API_KEY = dbConfig.apiKey;
    }

    if (dbConfig.connectionString) {
      envVars.DATABASE_URL = dbConfig.connectionString;
    }

    return envVars;
  }
}

export const configService = new ConfigService();
export default configService; 
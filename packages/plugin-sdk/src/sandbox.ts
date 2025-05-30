import { PluginPermission } from './types';

export class PluginSandbox {
  private permissionChecks = new Map<PluginPermission, PermissionChecker>();

  constructor() {
    this.initializePermissionChecks();
  }

  /**
   * Execute code in a sandboxed environment with specific permissions
   */
  async execute<T>(
    fn: () => Promise<T> | T,
    permissions: PluginPermission[]
  ): Promise<T> {
    // Validate permissions before execution
    this.validatePermissions(permissions);

    // Create sandboxed execution context
    const context = this.createSandboxContext(permissions);

    try {
      // Execute the function in the sandbox
      return await this.executeInContext(fn, context);
    } catch (error) {
      throw new PluginSecurityError(`Sandbox execution failed: ${error}`);
    }
  }

  /**
   * Check if a specific permission is granted
   */
  checkPermission(permission: PluginPermission, permissions: PluginPermission[]): boolean {
    return permissions.includes(permission);
  }

  /**
   * Validate all required permissions
   */
  validatePermissions(permissions: PluginPermission[]): void {
    for (const permission of permissions) {
      const checker = this.permissionChecks.get(permission);
      if (!checker) {
        throw new PluginSecurityError(`Unknown permission: ${permission}`);
      }

      if (!checker.validate()) {
        throw new PluginSecurityError(`Permission denied: ${permission}`);
      }
    }
  }

  private initializePermissionChecks(): void {
    this.permissionChecks.set('file-system', new FileSystemPermissionChecker());
    this.permissionChecks.set('network', new NetworkPermissionChecker());
    this.permissionChecks.set('workspace', new WorkspacePermissionChecker());
    this.permissionChecks.set('chat', new ChatPermissionChecker());
    this.permissionChecks.set('terminal', new TerminalPermissionChecker());
    this.permissionChecks.set('notebook', new NotebookPermissionChecker());
    this.permissionChecks.set('settings', new SettingsPermissionChecker());
    this.permissionChecks.set('clipboard', new ClipboardPermissionChecker());
    this.permissionChecks.set('notifications', new NotificationsPermissionChecker());
    this.permissionChecks.set('storage', new StoragePermissionChecker());
  }

  private createSandboxContext(permissions: PluginPermission[]): SandboxContext {
    return new SandboxContext(permissions, this);
  }

  private async executeInContext<T>(
    fn: () => Promise<T> | T,
    context: SandboxContext
  ): Promise<T> {
    // In a real implementation, this would use a proper sandbox like VM2 or Worker
    // For now, we'll execute with context validation
    const originalGlobals = this.captureGlobals();
    
    try {
      // Apply sandbox restrictions
      this.applySandboxRestrictions(context);
      
      // Execute the function
      const result = await fn();
      
      return result;
    } finally {
      // Restore original globals
      this.restoreGlobals(originalGlobals);
    }
  }

  private captureGlobals(): Record<string, any> {
    // Capture critical globals that might be modified
    return {
      fetch: globalThis.fetch,
      localStorage: globalThis.localStorage,
      sessionStorage: globalThis.sessionStorage,
      // Add other globals as needed
    };
  }

  private applySandboxRestrictions(context: SandboxContext): void {
    // Apply restrictions based on permissions
    if (!context.hasPermission('network')) {
      // Disable network access
      (globalThis as any).fetch = () => {
        throw new PluginSecurityError('Network access denied');
      };
    }

    if (!context.hasPermission('storage')) {
      // Disable storage access
      (globalThis as any).localStorage = new RestrictedStorage();
      (globalThis as any).sessionStorage = new RestrictedStorage();
    }

    // Add more restrictions as needed
  }

  private restoreGlobals(globals: Record<string, any>): void {
    // Restore original globals
    Object.assign(globalThis, globals);
  }
}

class SandboxContext {
  constructor(
    private permissions: PluginPermission[],
    private sandbox: PluginSandbox
  ) {}

  hasPermission(permission: PluginPermission): boolean {
    return this.sandbox.checkPermission(permission, this.permissions);
  }

  requirePermission(permission: PluginPermission): void {
    if (!this.hasPermission(permission)) {
      throw new PluginSecurityError(`Required permission not granted: ${permission}`);
    }
  }
}

abstract class PermissionChecker {
  abstract validate(): boolean;
}

class FileSystemPermissionChecker extends PermissionChecker {
  validate(): boolean {
    // Check if file system access is allowed
    return true; // Simplified for demo
  }
}

class NetworkPermissionChecker extends PermissionChecker {
  validate(): boolean {
    // Check if network access is allowed
    return true; // Simplified for demo
  }
}

class WorkspacePermissionChecker extends PermissionChecker {
  validate(): boolean {
    // Check if workspace access is allowed
    return true; // Simplified for demo
  }
}

class ChatPermissionChecker extends PermissionChecker {
  validate(): boolean {
    // Check if chat access is allowed
    return true; // Simplified for demo
  }
}

class TerminalPermissionChecker extends PermissionChecker {
  validate(): boolean {
    // Check if terminal access is allowed
    return true; // Simplified for demo
  }
}

class NotebookPermissionChecker extends PermissionChecker {
  validate(): boolean {
    // Check if notebook access is allowed
    return true; // Simplified for demo
  }
}

class SettingsPermissionChecker extends PermissionChecker {
  validate(): boolean {
    // Check if settings access is allowed
    return true; // Simplified for demo
  }
}

class ClipboardPermissionChecker extends PermissionChecker {
  validate(): boolean {
    // Check if clipboard access is allowed
    return navigator.clipboard !== undefined;
  }
}

class NotificationsPermissionChecker extends PermissionChecker {
  validate(): boolean {
    // Check if notifications are allowed
    return Notification.permission === 'granted';
  }
}

class StoragePermissionChecker extends PermissionChecker {
  validate(): boolean {
    // Check if storage access is allowed
    return true; // Simplified for demo
  }
}

class RestrictedStorage implements Storage {
  get length(): number {
    throw new PluginSecurityError('Storage access denied');
  }

  clear(): void {
    throw new PluginSecurityError('Storage access denied');
  }

  getItem(key: string): string | null {
    throw new PluginSecurityError('Storage access denied');
  }

  key(index: number): string | null {
    throw new PluginSecurityError('Storage access denied');
  }

  removeItem(key: string): void {
    throw new PluginSecurityError('Storage access denied');
  }

  setItem(key: string, value: string): void {
    throw new PluginSecurityError('Storage access denied');
  }
}

export class PluginSecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PluginSecurityError';
  }
}

/**
 * Security policy for plugins
 */
export class PluginSecurityPolicy {
  private static instance: PluginSecurityPolicy;
  private policies = new Map<string, PolicyRule[]>();

  static getInstance(): PluginSecurityPolicy {
    if (!PluginSecurityPolicy.instance) {
      PluginSecurityPolicy.instance = new PluginSecurityPolicy();
    }
    return PluginSecurityPolicy.instance;
  }

  addPolicy(pluginId: string, rules: PolicyRule[]): void {
    this.policies.set(pluginId, rules);
  }

  checkPolicy(pluginId: string, action: string): boolean {
    const rules = this.policies.get(pluginId) || [];
    return rules.some(rule => rule.matches(action) && rule.allowed);
  }

  removePolicy(pluginId: string): void {
    this.policies.delete(pluginId);
  }
}

export interface PolicyRule {
  pattern: string;
  allowed: boolean;
  matches(action: string): boolean;
}

export class GlobPolicyRule implements PolicyRule {
  constructor(
    public pattern: string,
    public allowed: boolean
  ) {}

  matches(action: string): boolean {
    // Simple glob matching - in production, use a proper glob library
    const regex = new RegExp(
      this.pattern
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.')
    );
    return regex.test(action);
  }
}

/**
 * Resource monitor for plugins
 */
export class PluginResourceMonitor {
  private static instance: PluginResourceMonitor;
  private pluginUsage = new Map<string, ResourceUsage>();

  static getInstance(): PluginResourceMonitor {
    if (!PluginResourceMonitor.instance) {
      PluginResourceMonitor.instance = new PluginResourceMonitor();
    }
    return PluginResourceMonitor.instance;
  }

  startMonitoring(pluginId: string): void {
    this.pluginUsage.set(pluginId, {
      memoryUsage: 0,
      cpuUsage: 0,
      networkRequests: 0,
      startTime: Date.now(),
    });
  }

  stopMonitoring(pluginId: string): ResourceUsage | undefined {
    const usage = this.pluginUsage.get(pluginId);
    if (usage) {
      usage.endTime = Date.now();
      this.pluginUsage.delete(pluginId);
    }
    return usage;
  }

  updateUsage(pluginId: string, updates: Partial<ResourceUsage>): void {
    const usage = this.pluginUsage.get(pluginId);
    if (usage) {
      Object.assign(usage, updates);
    }
  }

  getUsage(pluginId: string): ResourceUsage | undefined {
    return this.pluginUsage.get(pluginId);
  }

  getAllUsage(): Map<string, ResourceUsage> {
    return new Map(this.pluginUsage);
  }
}

interface ResourceUsage {
  memoryUsage: number;
  cpuUsage: number;
  networkRequests: number;
  startTime: number;
  endTime?: number;
} 
"use client";

// Storage interfaces
interface StorageItem<T = any> {
  key: string;
  value: T;
  timestamp: number;
  expiresAt?: number;
  metadata?: Record<string, any>;
}

interface StorageOptions {
  encrypt?: boolean;
  expiresIn?: number; // milliseconds
  compress?: boolean;
  metadata?: Record<string, any>;
}

interface StorageQuota {
  total: number;
  used: number;
  available: number;
  percentage: number;
}

interface StorageStats {
  localStorage: StorageQuota;
  sessionStorage: StorageQuota;
  indexedDB?: StorageQuota;
  totalItems: number;
  expiredItems: number;
  lastCleanup: Date;
}

// Storage driver interface
interface StorageDriver {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options?: StorageOptions): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
  size(): Promise<number>;
  quota(): Promise<StorageQuota>;
}

// LocalStorage driver implementation
class LocalStorageDriver implements StorageDriver {
  private prefix: string;
  private encryptionKey?: string;
  
  constructor(prefix = 'omnipanel_', encryptionKey?: string) {
    this.prefix = prefix;
    this.encryptionKey = encryptionKey;
  }
  
  private getFullKey(key: string): string {
    return `${this.prefix}${key}`;
  }
  
  private encrypt(data: string): string {
    if (!this.encryptionKey) return data;
    
    // Simple XOR encryption (in production, use proper encryption)
    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
      encrypted += String.fromCharCode(
        data.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
      );
    }
    return btoa(encrypted);
  }
  
  private decrypt(data: string): string {
    if (!this.encryptionKey) return data;
    
    try {
      const decoded = atob(data);
      let decrypted = '';
      for (let i = 0; i < decoded.length; i++) {
        decrypted += String.fromCharCode(
          decoded.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
        );
      }
      return decrypted;
    } catch {
      return data; // Return as-is if decryption fails
    }
  }
  
  private compress(data: string): string {
    // Simple compression using repeated character replacement
    return data.replace(/(.)\1+/g, (match, char) => `${char}${match.length}`);
  }
  
  private decompress(data: string): string {
    return data.replace(/(.)\d+/g, (match, char) => {
      const count = parseInt(match.slice(1));
      return char.repeat(count);
    });
  }
  
  async get<T>(key: string): Promise<T | null> {
    try {
      const fullKey = this.getFullKey(key);
      const rawData = localStorage.getItem(fullKey);
      
      if (!rawData) return null;
      
      let processedData = rawData;
      
      // Decrypt if needed
      if (this.encryptionKey) {
        processedData = this.decrypt(processedData);
      }
      
      const item: StorageItem<T> = JSON.parse(processedData);
      
      // Check expiration
      if (item.expiresAt && Date.now() > item.expiresAt) {
        await this.remove(key);
        return null;
      }
      
      return item.value;
    } catch (error) {
      console.error(`Failed to get item from localStorage: ${key}`, error);
      return null;
    }
  }
  
  async set<T>(key: string, value: T, options: StorageOptions = {}): Promise<void> {
    try {
      const item: StorageItem<T> = {
        key,
        value,
        timestamp: Date.now(),
        expiresAt: options.expiresIn ? Date.now() + options.expiresIn : undefined,
        metadata: options.metadata,
      };
      
      let serializedData = JSON.stringify(item);
      
      // Compress if requested
      if (options.compress) {
        serializedData = this.compress(serializedData);
      }
      
      // Encrypt if needed
      if (this.encryptionKey || options.encrypt) {
        serializedData = this.encrypt(serializedData);
      }
      
      const fullKey = this.getFullKey(key);
      localStorage.setItem(fullKey, serializedData);
      
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        // Auto-cleanup expired items and retry
        await this.cleanup();
        try {
          const fullKey = this.getFullKey(key);
          localStorage.setItem(fullKey, JSON.stringify({
            key,
            value,
            timestamp: Date.now(),
            expiresAt: options.expiresIn ? Date.now() + options.expiresIn : undefined,
            metadata: options.metadata,
          }));
        } catch (retryError) {
          throw new Error(`Storage quota exceeded and cleanup failed: ${retryError}`);
        }
      } else {
        throw new Error(`Failed to set item in localStorage: ${error}`);
      }
    }
  }
  
  async remove(key: string): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      localStorage.removeItem(fullKey);
    } catch (error) {
      console.error(`Failed to remove item from localStorage: ${key}`, error);
    }
  }
  
  async clear(): Promise<void> {
    try {
      const keys = await this.keys();
      for (const key of keys) {
        await this.remove(key);
      }
    } catch (error) {
      console.error('Failed to clear localStorage', error);
    }
  }
  
  async keys(): Promise<string[]> {
    try {
      const allKeys = Object.keys(localStorage);
      return allKeys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.slice(this.prefix.length));
    } catch (error) {
      console.error('Failed to get localStorage keys', error);
      return [];
    }
  }
  
  async size(): Promise<number> {
    try {
      const keys = await this.keys();
      return keys.length;
    } catch (error) {
      console.error('Failed to get localStorage size', error);
      return 0;
    }
  }
  
  async quota(): Promise<StorageQuota> {
    try {
      // Estimate localStorage usage
      const used = JSON.stringify(localStorage).length;
      const total = 10 * 1024 * 1024; // ~10MB typical limit
      const available = total - used;
      const percentage = (used / total) * 100;
      
      return { total, used, available, percentage };
    } catch (error) {
      console.error('Failed to get localStorage quota', error);
      return { total: 0, used: 0, available: 0, percentage: 0 };
    }
  }
  
  async cleanup(): Promise<number> {
    try {
      const keys = await this.keys();
      let cleanedCount = 0;
      
      for (const key of keys) {
        const item = await this.get(key);
        if (item === null) {
          // Item was expired and auto-removed
          cleanedCount++;
        }
      }
      
      return cleanedCount;
    } catch (error) {
      console.error('Failed to cleanup localStorage', error);
      return 0;
    }
  }
}

// SessionStorage driver implementation
class SessionStorageDriver implements StorageDriver {
  private prefix: string;
  
  constructor(prefix = 'omnipanel_session_') {
    this.prefix = prefix;
  }
  
  private getFullKey(key: string): string {
    return `${this.prefix}${key}`;
  }
  
  async get<T>(key: string): Promise<T | null> {
    try {
      const fullKey = this.getFullKey(key);
      const rawData = sessionStorage.getItem(fullKey);
      
      if (!rawData) return null;
      
      const item: StorageItem<T> = JSON.parse(rawData);
      
      // Check expiration
      if (item.expiresAt && Date.now() > item.expiresAt) {
        await this.remove(key);
        return null;
      }
      
      return item.value;
    } catch (error) {
      console.error(`Failed to get item from sessionStorage: ${key}`, error);
      return null;
    }
  }
  
  async set<T>(key: string, value: T, options: StorageOptions = {}): Promise<void> {
    try {
      const item: StorageItem<T> = {
        key,
        value,
        timestamp: Date.now(),
        expiresAt: options.expiresIn ? Date.now() + options.expiresIn : undefined,
        metadata: options.metadata,
      };
      
      const fullKey = this.getFullKey(key);
      sessionStorage.setItem(fullKey, JSON.stringify(item));
      
    } catch (error) {
      throw new Error(`Failed to set item in sessionStorage: ${error}`);
    }
  }
  
  async remove(key: string): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      sessionStorage.removeItem(fullKey);
    } catch (error) {
      console.error(`Failed to remove item from sessionStorage: ${key}`, error);
    }
  }
  
  async clear(): Promise<void> {
    try {
      const keys = await this.keys();
      for (const key of keys) {
        await this.remove(key);
      }
    } catch (error) {
      console.error('Failed to clear sessionStorage', error);
    }
  }
  
  async keys(): Promise<string[]> {
    try {
      const allKeys = Object.keys(sessionStorage);
      return allKeys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.slice(this.prefix.length));
    } catch (error) {
      console.error('Failed to get sessionStorage keys', error);
      return [];
    }
  }
  
  async size(): Promise<number> {
    try {
      const keys = await this.keys();
      return keys.length;
    } catch (error) {
      console.error('Failed to get sessionStorage size', error);
      return 0;
    }
  }
  
  async quota(): Promise<StorageQuota> {
    try {
      const used = JSON.stringify(sessionStorage).length;
      const total = 5 * 1024 * 1024; // ~5MB typical limit
      const available = total - used;
      const percentage = (used / total) * 100;
      
      return { total, used, available, percentage };
    } catch (error) {
      console.error('Failed to get sessionStorage quota', error);
      return { total: 0, used: 0, available: 0, percentage: 0 };
    }
  }
}

// IndexedDB driver implementation
class IndexedDBDriver implements StorageDriver {
  private dbName: string;
  private version: number;
  private storeName: string;
  private db: IDBDatabase | null = null;
  
  constructor(dbName = 'OmniPanelDB', version = 1, storeName = 'storage') {
    this.dbName = dbName;
    this.version = version;
    this.storeName = storeName;
  }
  
  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp');
          store.createIndex('expiresAt', 'expiresAt');
        }
      };
    });
  }
  
  private async performTransaction<T>(
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T>
  ): Promise<T> {
    const db = await this.getDB();
    const transaction = db.transaction([this.storeName], mode);
    const store = transaction.objectStore(this.storeName);
    const request = operation(store);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async get<T>(key: string): Promise<T | null> {
    try {
      const item = await this.performTransaction('readonly', store =>
        store.get(key)
      );
      
      if (!item) return null;
      
      // Check expiration
      if (item.expiresAt && Date.now() > item.expiresAt) {
        await this.remove(key);
        return null;
      }
      
      return item.value;
    } catch (error) {
      console.error(`Failed to get item from IndexedDB: ${key}`, error);
      return null;
    }
  }
  
  async set<T>(key: string, value: T, options: StorageOptions = {}): Promise<void> {
    try {
      const item: StorageItem<T> = {
        key,
        value,
        timestamp: Date.now(),
        expiresAt: options.expiresIn ? Date.now() + options.expiresIn : undefined,
        metadata: options.metadata,
      };
      
      await this.performTransaction('readwrite', store =>
        store.put(item)
      );
    } catch (error) {
      throw new Error(`Failed to set item in IndexedDB: ${error}`);
    }
  }
  
  async remove(key: string): Promise<void> {
    try {
      await this.performTransaction('readwrite', store =>
        store.delete(key)
      );
    } catch (error) {
      console.error(`Failed to remove item from IndexedDB: ${key}`, error);
    }
  }
  
  async clear(): Promise<void> {
    try {
      await this.performTransaction('readwrite', store =>
        store.clear()
      );
    } catch (error) {
      console.error('Failed to clear IndexedDB', error);
    }
  }
  
  async keys(): Promise<string[]> {
    try {
      return await this.performTransaction('readonly', store =>
        store.getAllKeys()
      ) as string[];
    } catch (error) {
      console.error('Failed to get IndexedDB keys', error);
      return [];
    }
  }
  
  async size(): Promise<number> {
    try {
      return await this.performTransaction('readonly', store =>
        store.count()
      );
    } catch (error) {
      console.error('Failed to get IndexedDB size', error);
      return 0;
    }
  }
  
  async quota(): Promise<StorageQuota> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const total = estimate.quota || 0;
        const used = estimate.usage || 0;
        const available = total - used;
        const percentage = total > 0 ? (used / total) * 100 : 0;
        
        return { total, used, available, percentage };
      }
      
      return { total: 0, used: 0, available: 0, percentage: 0 };
    } catch (error) {
      console.error('Failed to get IndexedDB quota', error);
      return { total: 0, used: 0, available: 0, percentage: 0 };
    }
  }
  
  async cleanup(): Promise<number> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('expiresAt');
      
      const now = Date.now();
      const expiredItems = await new Promise<IDBRequest<any[]>>((resolve, reject) => {
        const request = index.getAll(IDBKeyRange.upperBound(now));
        request.onsuccess = () => resolve(request);
        request.onerror = () => reject(request.error);
      });
      
      let cleanedCount = 0;
      for (const item of expiredItems.result) {
        await new Promise<void>((resolve, reject) => {
          const deleteRequest = store.delete(item.key);
          deleteRequest.onsuccess = () => {
            cleanedCount++;
            resolve();
          };
          deleteRequest.onerror = () => reject(deleteRequest.error);
        });
      }
      
      return cleanedCount;
    } catch (error) {
      console.error('Failed to cleanup IndexedDB', error);
      return 0;
    }
  }
}

// Main storage service
class StorageService {
  private drivers: Map<string, StorageDriver> = new Map();
  private defaultDriver: string = 'localStorage';
  
  constructor() {
    this.drivers.set('localStorage', new LocalStorageDriver());
    this.drivers.set('sessionStorage', new SessionStorageDriver());
    
    // Only initialize IndexedDB if available
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      this.drivers.set('indexedDB', new IndexedDBDriver());
    }
  }
  
  // Driver management
  setDefaultDriver(driverName: string): void {
    if (!this.drivers.has(driverName)) {
      throw new Error(`Driver ${driverName} not found`);
    }
    this.defaultDriver = driverName;
  }
  
  addDriver(name: string, driver: StorageDriver): void {
    this.drivers.set(name, driver);
  }
  
  getDriver(name?: string): StorageDriver {
    const driverName = name || this.defaultDriver;
    const driver = this.drivers.get(driverName);
    
    if (!driver) {
      throw new Error(`Driver ${driverName} not found`);
    }
    
    return driver;
  }
  
  // Storage operations
  async get<T>(key: string, driverName?: string): Promise<T | null> {
    const driver = this.getDriver(driverName);
    return driver.get<T>(key);
  }
  
  async set<T>(
    key: string,
    value: T,
    options?: StorageOptions,
    driverName?: string
  ): Promise<void> {
    const driver = this.getDriver(driverName);
    return driver.set(key, value, options);
  }
  
  async remove(key: string, driverName?: string): Promise<void> {
    const driver = this.getDriver(driverName);
    return driver.remove(key);
  }
  
  async clear(driverName?: string): Promise<void> {
    const driver = this.getDriver(driverName);
    return driver.clear();
  }
  
  async keys(driverName?: string): Promise<string[]> {
    const driver = this.getDriver(driverName);
    return driver.keys();
  }
  
  async size(driverName?: string): Promise<number> {
    const driver = this.getDriver(driverName);
    return driver.size();
  }
  
  // Utility methods
  async exists(key: string, driverName?: string): Promise<boolean> {
    const value = await this.get(key, driverName);
    return value !== null;
  }
  
  async setMultiple<T>(
    items: Array<{ key: string; value: T; options?: StorageOptions }>,
    driverName?: string
  ): Promise<void> {
    const driver = this.getDriver(driverName);
    const promises = items.map(item =>
      driver.set(item.key, item.value, item.options)
    );
    await Promise.all(promises);
  }
  
  async getMultiple<T>(keys: string[], driverName?: string): Promise<Array<T | null>> {
    const driver = this.getDriver(driverName);
    const promises = keys.map(key => driver.get<T>(key));
    return Promise.all(promises);
  }
  
  async removeMultiple(keys: string[], driverName?: string): Promise<void> {
    const driver = this.getDriver(driverName);
    const promises = keys.map(key => driver.remove(key));
    await Promise.all(promises);
  }
  
  // Statistics and monitoring
  async getStats(): Promise<StorageStats> {
    const localStorage = await this.drivers.get('localStorage')!.quota();
    const sessionStorage = await this.drivers.get('sessionStorage')!.quota();
    
    let indexedDB: StorageQuota | undefined;
    if (this.drivers.has('indexedDB')) {
      indexedDB = await this.drivers.get('indexedDB')!.quota();
    }
    
    const totalItems = await Promise.all(
      Array.from(this.drivers.keys()).map(name => this.size(name))
    ).then(sizes => sizes.reduce((sum, size) => sum + size, 0));
    
    return {
      localStorage,
      sessionStorage,
      indexedDB,
      totalItems,
      expiredItems: 0, // Would need to track this
      lastCleanup: new Date(),
    };
  }
  
  async cleanup(driverName?: string): Promise<number> {
    if (driverName) {
      const driver = this.getDriver(driverName);
      if ('cleanup' in driver && typeof driver.cleanup === 'function') {
        return (driver as any).cleanup();
      }
      return 0;
    }
    
    // Cleanup all drivers
    let totalCleaned = 0;
    for (const [name, driver] of this.drivers) {
      if ('cleanup' in driver && typeof driver.cleanup === 'function') {
        try {
          const cleaned = await (driver as any).cleanup();
          totalCleaned += cleaned;
        } catch (error) {
          console.error(`Failed to cleanup driver ${name}:`, error);
        }
      }
    }
    
    return totalCleaned;
  }
  
  // Backup and restore
  async backup(): Promise<string> {
    const backup: Record<string, any> = {};
    
    for (const [driverName, driver] of this.drivers) {
      try {
        const keys = await driver.keys();
        const items: Record<string, any> = {};
        
        for (const key of keys) {
          const value = await driver.get(key);
          if (value !== null) {
            items[key] = value;
          }
        }
        
        backup[driverName] = items;
      } catch (error) {
        console.error(`Failed to backup driver ${driverName}:`, error);
      }
    }
    
    return JSON.stringify({
      backup,
      timestamp: Date.now(),
      version: '1.0.0',
    });
  }
  
  async restore(backupData: string): Promise<void> {
    try {
      const { backup } = JSON.parse(backupData);
      
      for (const [driverName, items] of Object.entries(backup)) {
        if (this.drivers.has(driverName)) {
          const driver = this.getDriver(driverName);
          
          for (const [key, value] of Object.entries(items as Record<string, any>)) {
            await driver.set(key, value);
          }
        }
      }
    } catch (error) {
      throw new Error(`Failed to restore backup: ${error}`);
    }
  }
  
  // Migration helpers
  async migrate(
    fromDriverName: string,
    toDriverName: string,
    keys?: string[]
  ): Promise<number> {
    const fromDriver = this.getDriver(fromDriverName);
    const toDriver = this.getDriver(toDriverName);
    
    const keysToMigrate = keys || await fromDriver.keys();
    let migratedCount = 0;
    
    for (const key of keysToMigrate) {
      try {
        const value = await fromDriver.get(key);
        if (value !== null) {
          await toDriver.set(key, value);
          migratedCount++;
        }
      } catch (error) {
        console.error(`Failed to migrate key ${key}:`, error);
      }
    }
    
    return migratedCount;
  }
}

// Export singleton instance
export const storageService = new StorageService();

// Export types and classes
export type {
  StorageItem,
  StorageOptions,
  StorageQuota,
  StorageStats,
  StorageDriver,
};

export {
  StorageService,
  LocalStorageDriver,
  SessionStorageDriver,
  IndexedDBDriver,
}; 
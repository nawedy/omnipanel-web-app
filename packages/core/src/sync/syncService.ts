import { getSupabaseClient, SupabaseDatabase } from '@omnipanel/database';
import type { DatabaseConfig } from '@omnipanel/config';
import type { 
  DatabaseProject, 
  DatabaseMessage, 
  DatabaseFile,
  DatabaseChatSession 
} from '@omnipanel/types';

export interface SyncEvent {
  type: 'insert' | 'update' | 'delete';
  table: string;
  record: any;
  timestamp: Date;
}

export interface SyncState {
  isOnline: boolean;
  lastSync: Date | null;
  pendingOperations: SyncEvent[];
  subscriptions: Map<string, any>;
}

export interface SyncServiceConfig {
  databaseConfig: DatabaseConfig;
  enableOfflineMode: boolean;
  syncIntervalMs: number;
  maxRetries: number;
}

export class SyncService {
  private supabaseClient: SupabaseDatabase | null = null;
  private state: SyncState;
  private config: SyncServiceConfig;
  private dbName = 'omnipanel-offline-db';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor(config: SyncServiceConfig) {
    this.config = config;
    this.state = {
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      lastSync: null,
      pendingOperations: [],
      subscriptions: new Map(),
    };

    // Only add event listeners in browser environment
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));
    }
  }

  /**
   * Initialize the sync service
   */
  async initialize(): Promise<void> {
    try {
      // Initialize Supabase client
      this.supabaseClient = getSupabaseClient(this.config.databaseConfig);

      // Initialize IndexedDB for offline storage
      if (this.config.enableOfflineMode) {
        await this.initializeIndexedDB();
      }

      // Start sync interval
      this.startSyncInterval();

      // Setup real-time subscriptions if online
      if (this.state.isOnline) {
        await this.setupRealtimeSubscriptions();
      }

      console.log('🔄 Sync service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize sync service:', error);
      throw error;
    }
  }

  /**
   * Initialize IndexedDB for offline storage
   */
  private async initializeIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores for different data types
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
          projectStore.createIndex('owner_id', 'owner_id');
          projectStore.createIndex('updated_at', 'updated_at');
        }

        if (!db.objectStoreNames.contains('chat_sessions')) {
          const chatStore = db.createObjectStore('chat_sessions', { keyPath: 'id' });
          chatStore.createIndex('project_id', 'project_id');
          chatStore.createIndex('created_at', 'created_at');
        }

        if (!db.objectStoreNames.contains('messages')) {
          const messageStore = db.createObjectStore('messages', { keyPath: 'id' });
          messageStore.createIndex('session_id', 'session_id');
          messageStore.createIndex('created_at', 'created_at');
        }

        if (!db.objectStoreNames.contains('files')) {
          const fileStore = db.createObjectStore('files', { keyPath: 'id' });
          fileStore.createIndex('project_id', 'project_id');
          fileStore.createIndex('path', 'path');
          fileStore.createIndex('updated_at', 'updated_at');
        }

        if (!db.objectStoreNames.contains('sync_queue')) {
          db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  /**
   * Setup real-time subscriptions for live updates
   */
  private async setupRealtimeSubscriptions(): Promise<void> {
    if (!this.supabaseClient) return;

    const subscriptions = [
      {
        table: 'projects',
        callback: this.handleProjectUpdate.bind(this),
      },
      {
        table: 'chat_sessions',
        callback: this.handleChatSessionUpdate.bind(this),
      },
      {
        table: 'messages',
        callback: this.handleMessageUpdate.bind(this),
      },
      {
        table: 'files',
        callback: this.handleFileUpdate.bind(this),
      },
    ];

    for (const sub of subscriptions) {
      const subscription = this.supabaseClient
        .channel(`public:${sub.table}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: sub.table },
          sub.callback
        )
        .subscribe();

      this.state.subscriptions.set(sub.table, subscription);
    }

    console.log('🔗 Real-time subscriptions setup complete');
  }

  /**
   * Handle project updates from real-time subscription
   */
  private handleProjectUpdate(payload: any): void {
    console.log('📁 Project update received:', payload);
    
    // Store in IndexedDB if offline mode enabled
    if (this.config.enableOfflineMode && this.db) {
      this.storeOffline('projects', payload.new || payload.old);
    }

    // Emit event for UI updates
    this.emitSyncEvent('project_updated', payload);
  }

  /**
   * Handle chat session updates from real-time subscription
   */
  private handleChatSessionUpdate(payload: any): void {
    console.log('💬 Chat session update received:', payload);
    
    if (this.config.enableOfflineMode && this.db) {
      this.storeOffline('chat_sessions', payload.new || payload.old);
    }

    this.emitSyncEvent('chat_session_updated', payload);
  }

  /**
   * Handle message updates from real-time subscription
   */
  private handleMessageUpdate(payload: any): void {
    console.log('💭 Message update received:', payload);
    
    if (this.config.enableOfflineMode && this.db) {
      this.storeOffline('messages', payload.new || payload.old);
    }

    this.emitSyncEvent('message_updated', payload);
  }

  /**
   * Handle file updates from real-time subscription
   */
  private handleFileUpdate(payload: any): void {
    console.log('📄 File update received:', payload);
    
    if (this.config.enableOfflineMode && this.db) {
      this.storeOffline('files', payload.new || payload.old);
    }

    this.emitSyncEvent('file_updated', payload);
  }

  /**
   * Store data in IndexedDB for offline access
   */
  private async storeOffline(storeName: string, data: any): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    try {
      await store.put(data);
    } catch (error) {
      console.error(`❌ Failed to store ${storeName} offline:`, error);
    }
  }

  /**
   * Get data from IndexedDB when offline
   */
  async getOfflineData<T>(storeName: string, key?: string): Promise<T[]> {
    if (!this.db) return [];

    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      let request: IDBRequest;
      
      if (key) {
        request = store.get(key);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => {
        const result = key ? [request.result].filter(Boolean) : request.result;
        resolve(result);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Queue operation for later sync when back online
   */
  async queueOperation(operation: Omit<SyncEvent, 'timestamp'>): Promise<void> {
    const syncEvent: SyncEvent = {
      ...operation,
      timestamp: new Date(),
    };

    this.state.pendingOperations.push(syncEvent);

    // Store in IndexedDB for persistence
    if (this.db) {
      const transaction = this.db.transaction(['sync_queue'], 'readwrite');
      const store = transaction.objectStore('sync_queue');
      await store.add(syncEvent);
    }

    console.log('📥 Operation queued for sync:', syncEvent);
  }

  /**
   * Process pending operations when back online
   */
  private async processPendingOperations(): Promise<void> {
    if (!this.supabaseClient || this.state.pendingOperations.length === 0) {
      return;
    }

    console.log(`🔄 Processing ${this.state.pendingOperations.length} pending operations`);

    const operations = [...this.state.pendingOperations];
    this.state.pendingOperations = [];

    for (const operation of operations) {
      try {
        await this.executeOperation(operation);
        console.log('✅ Operation synced:', operation);
      } catch (error) {
        console.error('❌ Failed to sync operation:', operation, error);
        // Re-queue failed operation
        this.state.pendingOperations.push(operation);
      }
    }

    // Clear successful operations from IndexedDB
    if (this.db) {
      const transaction = this.db.transaction(['sync_queue'], 'readwrite');
      const store = transaction.objectStore('sync_queue');
      await store.clear();
    }
  }

  /**
   * Execute a sync operation against Supabase
   */
  private async executeOperation(operation: SyncEvent): Promise<void> {
    if (!this.supabaseClient) return;

    const { type, table, record } = operation;

    switch (type) {
      case 'insert':
        await this.supabaseClient.from(table).insert(record);
        break;
      case 'update':
        await this.supabaseClient.from(table).update(record).eq('id', record.id);
        break;
      case 'delete':
        await this.supabaseClient.from(table).delete().eq('id', record.id);
        break;
    }
  }

  /**
   * Handle online event
   */
  private async handleOnline(): Promise<void> {
    console.log('🌐 Back online - syncing data');
    this.state.isOnline = true;

    if (this.supabaseClient) {
      await this.setupRealtimeSubscriptions();
      await this.processPendingOperations();
      this.state.lastSync = new Date();
    }

    this.emitSyncEvent('online', { isOnline: true });
  }

  /**
   * Handle offline event
   */
  private handleOffline(): void {
    console.log('📴 Gone offline - switching to offline mode');
    this.state.isOnline = false;

    // Close real-time subscriptions
    this.state.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this.state.subscriptions.clear();

    this.emitSyncEvent('offline', { isOnline: false });
  }

  /**
   * Start periodic sync interval
   */
  private startSyncInterval(): void {
    this.syncInterval = setInterval(async () => {
      if (this.state.isOnline && this.state.pendingOperations.length > 0) {
        await this.processPendingOperations();
      }
    }, this.config.syncIntervalMs);
  }

  /**
   * Emit sync events for UI updates
   */
  private emitSyncEvent(type: string, data: any): void {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('sync_event', {
        detail: { type, data },
      });
      window.dispatchEvent(event);
    }
  }

  /**
   * Get current sync state
   */
  getSyncState(): SyncState {
    return { ...this.state };
  }

  /**
   * Force sync now
   */
  async forcSync(): Promise<void> {
    if (this.state.isOnline) {
      await this.processPendingOperations();
      this.state.lastSync = new Date();
      console.log('🔄 Force sync completed');
    }
  }

  /**
   * Cleanup resources
   */
  async destroy(): Promise<void> {
    // Clear interval
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Close subscriptions
    this.state.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });

    // Close IndexedDB
    if (this.db) {
      this.db.close();
    }

    // Remove event listeners
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline.bind(this));
      window.removeEventListener('offline', this.handleOffline.bind(this));
    }

    console.log('🔄 Sync service destroyed');
  }
} 
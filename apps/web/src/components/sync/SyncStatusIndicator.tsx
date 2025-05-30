'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi,
  WifiOff,
  RotateCcw,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

export interface SyncStatus {
  isOnline: boolean;
  isConnected: boolean;
  isSyncing: boolean;
  lastSync: Date | null;
  pendingOperations: number;
  error?: string;
}

interface SyncStatusIndicatorProps {
  status: SyncStatus;
  onRetrySync?: () => void;
}

export function SyncStatusIndicator({ status, onRetrySync }: SyncStatusIndicatorProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Only render on client to avoid hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Don't render during SSR
  }

  const getSyncIcon = () => {
    if (!status.isOnline) {
      return <WifiOff className="w-4 h-4 text-red-400" />;
    }
    
    if (!status.isConnected) {
      return <AlertCircle className="w-4 h-4 text-orange-400" />;
    }
    
    if (status.isSyncing) {
      return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
    }
    
    if (status.error) {
      return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
    
    return <CheckCircle className="w-4 h-4 text-green-400" />;
  };

  const getSyncStatusText = () => {
    if (!status.isOnline) return 'Offline';
    if (!status.isConnected) return 'Disconnected';
    if (status.isSyncing) return 'Syncing...';
    if (status.error) return 'Error';
    return 'Synced';
  };

  const getStatusColor = () => {
    if (!status.isOnline || status.error) return 'text-red-400';
    if (!status.isConnected) return 'text-orange-400';
    if (status.isSyncing) return 'text-blue-400';
    return 'text-green-400';
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors hover:bg-accent/50 ${
          showDropdown ? 'bg-accent/50' : ''
        }`}
        title={`Sync Status: ${getSyncStatusText()}`}
      >
        {getSyncIcon()}
        <span className={`text-sm hidden sm:block ${getStatusColor()}`}>
          {getSyncStatusText()}
        </span>
        {status.pendingOperations > 0 && (
          <span className="bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
            {status.pendingOperations}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showDropdown && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setShowDropdown(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50"
            >
              <div className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm">Sync Status</h3>
                  {onRetrySync && (
                    <button
                      onClick={() => {
                        onRetrySync();
                        setShowDropdown(false);
                      }}
                      className="p-1.5 hover:bg-accent rounded transition-colors"
                      title="Retry Sync"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Status Details */}
                <div className="space-y-3">
                  {/* Connection Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Connection</span>
                    <div className="flex items-center gap-2">
                      {status.isOnline ? (
                        <Wifi className="w-4 h-4 text-green-400" />
                      ) : (
                        <WifiOff className="w-4 h-4 text-red-400" />
                      )}
                      <span className={`text-sm ${getStatusColor()}`}>
                        {status.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>

                  {/* Last Sync */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last Sync</span>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{formatLastSync(status.lastSync)}</span>
                    </div>
                  </div>

                  {/* Pending Operations */}
                  {status.pendingOperations > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Pending</span>
                      <span className="text-sm text-orange-400">
                        {status.pendingOperations} operation{status.pendingOperations !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}

                  {/* Error Message */}
                  {status.error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-400">Sync Error</p>
                          <p className="text-sm text-red-300 mt-1">{status.error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Success State */}
                  {!status.error && status.isOnline && status.isConnected && !status.isSyncing && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-md p-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <p className="text-sm text-green-400">All data synced</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-border">
                  <div className="text-xs text-muted-foreground">
                    {status.isSyncing ? (
                      'Synchronizing data...'
                    ) : (
                      'Data is automatically synced in real-time'
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
} 
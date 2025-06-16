'use client';

import React, { useState, useEffect } from 'react';
import { useDatabase } from '@/hooks/useDatabase';
import { 
  Database, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  Loader2, 
  Power,
  Shield,
  Clock
} from 'lucide-react';

interface DatabaseStatusProps {
  showControls?: boolean;
  className?: string;
}

export function DatabaseStatus({ 
  showControls = false,
  className = ''
}: DatabaseStatusProps) {
  const { 
    isConnected, 
    isLoading, 
    isExecuting,
    error, 
    testConnection, 
    checkHealth,
    resetConnection
  } = useDatabase();
  
  const [health, setHealth] = useState<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    latency?: number;
    connections?: number;
    uptime?: number;
  } | null>(null);
  
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Check health on initial load if connected
  useEffect(() => {
    if (isConnected && !isLoading && !health) {
      handleCheckHealth();
    }
  }, [isConnected, isLoading]);

  const handleCheckHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const healthResult = await checkHealth();
      if (healthResult) {
        setHealth(healthResult);
      }
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const handleResetConnection = async () => {
    setIsResetting(true);
    try {
      await resetConnection();
      // After reset, check health again
      await handleCheckHealth();
    } finally {
      setIsResetting(false);
    }
  };

  const getStatusColor = () => {
    if (error || !isConnected) return 'text-red-500 dark:text-red-400';
    if (isLoading || isExecuting) return 'text-amber-500 dark:text-amber-400';
    if (health?.status === 'degraded') return 'text-amber-500 dark:text-amber-400';
    if (health?.status === 'unhealthy') return 'text-red-500 dark:text-red-400';
    return 'text-emerald-500 dark:text-emerald-400';
  };

  const getStatusIcon = () => {
    if (isLoading || isExecuting || isCheckingHealth || isResetting) {
      return <Loader2 className="w-5 h-5 animate-spin" />;
    }
    
    if (error || !isConnected) {
      return <AlertCircle className="w-5 h-5" />;
    }
    
    if (health?.status === 'degraded') {
      return <Shield className="w-5 h-5" />;
    }
    
    if (health?.status === 'unhealthy') {
      return <AlertCircle className="w-5 h-5" />;
    }
    
    return <Check className="w-5 h-5" />;
  };

  const getStatusText = () => {
    if (isLoading) return 'Connecting...';
    if (isExecuting) return 'Working...';
    if (isCheckingHealth) return 'Checking health...';
    if (isResetting) return 'Resetting connection...';
    
    if (error) return `Error: ${error.message}`;
    if (!isConnected) return 'Disconnected';
    
    if (health?.status === 'degraded') return 'Degraded';
    if (health?.status === 'unhealthy') return 'Unhealthy';
    
    return 'Connected';
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Database className="w-5 h-5" />
          Database Status
        </h3>
        
        {showControls && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCheckHealth}
              disabled={isLoading || isCheckingHealth || isResetting}
              className="p-2 rounded-md hover:bg-muted transition-colors disabled:opacity-50"
              title="Check health"
            >
              <RefreshCw className={`w-4 h-4 ${isCheckingHealth ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={handleResetConnection}
              disabled={isLoading || isCheckingHealth || isResetting}
              className="p-2 rounded-md hover:bg-muted transition-colors disabled:opacity-50"
              title="Reset connection"
            >
              <Power className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-background rounded-md">
          <div className={`${getStatusColor()}`}>
            {getStatusIcon()}
          </div>
          <div>
            <div className="font-medium">Status</div>
            <div className="text-sm text-muted-foreground">{getStatusText()}</div>
          </div>
        </div>
        
        {health && isConnected && (
          <>
            <div className="grid grid-cols-3 gap-3">
              {health.latency !== undefined && (
                <div className="p-3 bg-background rounded-md">
                  <div className="flex items-center gap-2 mb-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-medium">Latency</span>
                  </div>
                  <div className="text-lg font-semibold">
                    {health.latency} ms
                  </div>
                </div>
              )}
              
              {health.connections !== undefined && (
                <div className="p-3 bg-background rounded-md">
                  <div className="flex items-center gap-2 mb-1 text-muted-foreground">
                    <Database className="w-4 h-4" />
                    <span className="text-xs font-medium">Connections</span>
                  </div>
                  <div className="text-lg font-semibold">
                    {health.connections}
                  </div>
                </div>
              )}
              
              {health.uptime !== undefined && (
                <div className="p-3 bg-background rounded-md">
                  <div className="flex items-center gap-2 mb-1 text-muted-foreground">
                    <Shield className="w-4 h-4" />
                    <span className="text-xs font-medium">Uptime</span>
                  </div>
                  <div className="text-lg font-semibold">
                    {Math.floor(health.uptime / 86400)}d {Math.floor((health.uptime % 86400) / 3600)}h
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

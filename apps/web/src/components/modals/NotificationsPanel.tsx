import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bell, 
  Check, 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Trash2,
  Mail,
  Settings,
  Filter,
  Clock,
  Bot,
  Code,
  FileText,
  Users
} from 'lucide-react';
import { formatTimestamp } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'ai' | 'code' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
}

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'ai',
      title: 'AI Model Updated',
      message: 'GPT-4 is now available for your workspace. Improved performance and accuracy.',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      read: false,
      action: {
        label: 'Try Now',
        handler: () => console.log('Opening AI chat'),
      },
    },
    {
      id: '2',
      type: 'code',
      title: 'Code Execution Complete',
      message: 'Your Python script finished running successfully. Output saved to terminal.',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      read: false,
      action: {
        label: 'View Output',
        handler: () => console.log('Opening terminal'),
      },
    },
    {
      id: '3',
      type: 'success',
      title: 'Project Saved',
      message: 'All changes have been automatically saved to cloud storage.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      read: true,
    },
    {
      id: '4',
      type: 'warning',
      title: 'Storage Warning',
      message: 'You are using 85% of your storage quota. Consider upgrading your plan.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
      action: {
        label: 'Upgrade',
        handler: () => console.log('Opening upgrade page'),
      },
    },
    {
      id: '5',
      type: 'system',
      title: 'Workspace Synced',
      message: 'Your workspace has been synchronized across all devices.',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      read: true,
    },
    {
      id: '6',
      type: 'info',
      title: 'New Feature Available',
      message: 'Terminal auto-completion is now enabled. Press Tab for suggestions.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'unread' | 'ai' | 'code' | 'system'>('all');

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info': return Info;
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return XCircle;
      case 'ai': return Bot;
      case 'code': return Code;
      case 'system': return Settings;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'info': return 'text-blue-500';
      case 'success': return 'text-green-500';
      case 'warning': return 'text-orange-500';
      case 'error': return 'text-red-500';
      case 'ai': return 'text-purple-500';
      case 'code': return 'text-emerald-500';
      case 'system': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAsUnread = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: false } : n
    ));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    if (confirm('Are you sure you want to clear all notifications?')) {
      setNotifications([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-4 top-16 w-96 bg-background border border-border rounded-lg shadow-xl z-50 max-h-[80vh] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-accent rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-2 bg-accent/30 border-b border-border overflow-x-auto">
        {[
          { key: 'all', label: 'All', icon: Bell },
          { key: 'unread', label: 'Unread', icon: Mail },
          { key: 'ai', label: 'AI', icon: Bot },
          { key: 'code', label: 'Code', icon: Code },
          { key: 'system', label: 'System', icon: Settings },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors ${
              filter === key
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent'
            }`}
          >
            <Icon className="w-3 h-3" />
            {label}
            {key === 'unread' && unreadCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-primary-foreground text-primary text-xs rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Actions */}
      {notifications.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2 bg-accent/20 border-b border-border">
          <div className="flex items-center gap-2">
            <button
              onClick={markAllAsRead}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              disabled={unreadCount === 0}
            >
              Mark all read
            </button>
            <span className="text-xs text-muted-foreground">•</span>
            <button
              onClick={clearAll}
              className="text-xs text-red-600 hover:text-red-500 transition-colors"
            >
              Clear all
            </button>
          </div>
          <span className="text-xs text-muted-foreground">
            {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Notifications List */}
      <div className="overflow-y-auto max-h-96">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bell className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              {filter === 'all' ? 'No notifications' : `No ${filter} notifications`}
            </h3>
            <p className="text-xs text-muted-foreground">
              {filter === 'all' 
                ? "You're all caught up! New notifications will appear here."
                : `You don't have any ${filter} notifications right now.`
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredNotifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-accent/50 transition-colors ${
                    !notification.read ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full bg-accent ${getNotificationColor(notification.type)}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-accent rounded transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatTimestamp(notification.timestamp)}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {notification.action && (
                            <button
                              onClick={notification.action.handler}
                              className="px-2 py-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded transition-colors"
                            >
                              {notification.action.label}
                            </button>
                          )}
                          
                          <button
                            onClick={() => notification.read ? markAsUnread(notification.id) : markAsRead(notification.id)}
                            className="p-1 hover:bg-accent rounded transition-colors"
                            title={notification.read ? 'Mark as unread' : 'Mark as read'}
                          >
                            {notification.read ? (
                              <Mail className="w-3 h-3" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border bg-accent/20">
        <button className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors">
          Notification Settings
        </button>
      </div>
    </div>
  );
} 
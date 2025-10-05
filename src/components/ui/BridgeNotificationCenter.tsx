import React, { useState, useEffect, useRef } from 'react';
import { Bell, Settings, Check, X, AlertCircle, Info, CheckCircle, Zap, Users, Globe } from 'lucide-react';
import BridgeNotificationService from '../services/BridgeNotificationService';
import type { BridgeNotification, NotificationPreferences } from '../services/BridgeNotificationService';

interface BridgeNotificationCenterProps {
  bridgeId?: string;
  onNotificationClick?: (notification: BridgeNotification) => void;
}

const BridgeNotificationCenter: React.FC<BridgeNotificationCenterProps> = ({ 
  bridgeId, 
  onNotificationClick 
}) => {
  const [notificationService] = useState(() => new BridgeNotificationService());
  const [notifications, setNotifications] = useState<BridgeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    space_mined: true,
    user_activity: true,
    system_alerts: true,
    optimization_updates: true
  });
  const [isConnected, setIsConnected] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Initialize notification service
  useEffect(() => {
    const initializeService = async () => {
      try {
        await notificationService.initialize();
        setIsConnected(true);
        
        // Load preferences
        const prefs = notificationService.getPreferences();
        setPreferences(prefs);
        
        // Register notification handler
        notificationService.onNotification((notification) => {
          setNotifications(prev => [notification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/icons/icon-192x192.png',
              tag: notification.id
            });
          }
        });
        
        // Load existing notifications
        const existingNotifications = notificationService.getAllNotifications();
        setNotifications(existingNotifications);
        setUnreadCount(notificationService.getUnreadNotifications().length);
        
      } catch (error) {
        console.error('Failed to initialize notification service:', error);
      }
    };
    
    initializeService();
    
    return () => {
      notificationService.disconnect();
    };
  }, [notificationService]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: BridgeNotification) => {
    // Mark as read
    notificationService.markAsRead(notification.id);
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    // Call callback
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  const markAllAsRead = async () => {
    await notificationService.markAllAsRead();
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    const updatedPrefs = { ...preferences, ...newPreferences };
    setPreferences(updatedPrefs);
    await notificationService.updatePreferences(newPreferences);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'space_mined':
        return <Globe className="text-green-400" size={16} />;
      case 'user_joined':
      case 'user_left':
        return <Users className="text-blue-400" size={16} />;
      case 'optimization_complete':
        return <Zap className="text-yellow-400" size={16} />;
      case 'system_alert':
        return <AlertCircle className="text-red-400" size={16} />;
      default:
        return <Info className="text-slate-400" size={16} />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'space_mined':
        return 'border-l-green-500';
      case 'user_joined':
      case 'user_left':
        return 'border-l-blue-500';
      case 'optimization_complete':
        return 'border-l-yellow-500';
      case 'system_alert':
        return 'border-l-red-500';
      default:
        return 'border-l-slate-500';
    }
  };

  const filteredNotifications = bridgeId 
    ? notifications.filter(n => n.bridge_id === bridgeId)
    : notifications;

  return (
    <div className="relative" ref={notificationRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
      >
        <Bell size={20} className="text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-lg z-50">
          {/* Header */}
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Notifications</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1 hover:bg-slate-700 rounded"
                >
                  <Settings size={16} className="text-slate-400" />
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="p-1 hover:bg-slate-700 rounded"
                    title="Mark all as read"
                  >
                    <Check size={16} className="text-green-400" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-slate-700 rounded"
                >
                  <X size={16} className="text-slate-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="p-4 border-b border-slate-700 bg-slate-700/50">
              <h4 className="text-sm font-semibold text-white mb-3">Notification Preferences</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={preferences.space_mined}
                    onChange={(e) => updatePreferences({ space_mined: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-slate-300">Space Mining</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={preferences.user_activity}
                    onChange={(e) => updatePreferences({ user_activity: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-slate-300">User Activity</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={preferences.optimization_updates}
                    onChange={(e) => updatePreferences({ optimization_updates: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-slate-300">Optimization Updates</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={preferences.system_alerts}
                    onChange={(e) => updatePreferences({ system_alerts: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-slate-300">System Alerts</span>
                </label>
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
                <p className="text-sm">You'll see updates here when they arrive</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-l-4 ${getNotificationColor(notification.type)} hover:bg-slate-700/50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-slate-700/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold text-white truncate">
                          {notification.title}
                        </h4>
                        <span className="text-xs text-slate-500">
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          {notification.bridge_id === 'system' ? 'System' : `Bridge: ${notification.bridge_id}`}
                        </span>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="p-3 border-t border-slate-700 bg-slate-700/30">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={clearNotifications}
                  className="text-xs text-slate-400 hover:text-slate-300"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}

          {/* Connection Status */}
          <div className="p-2 border-t border-slate-700">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Connection:</span>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BridgeNotificationCenter;
/**
 * Universal Notification System
 * Works in both web and Electron environments
 * Provides toast-style notifications with animations
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// Notification types
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextValue {
  notifications: Notification[];
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

// Notification Provider
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto remove after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    // Also show native/electron notification for important messages
    if (typeof window !== 'undefined' && window.electron) {
      window.electron.notification.show(notification.title, notification.message || '', {
        urgency: notification.type === 'error' ? 'critical' : 'normal',
      });
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const success = useCallback((title: string, message?: string) => {
    showNotification({ type: 'success', title, message });
  }, [showNotification]);

  const error = useCallback((title: string, message?: string) => {
    showNotification({ type: 'error', title, message, duration: 7000 });
  }, [showNotification]);

  const info = useCallback((title: string, message?: string) => {
    showNotification({ type: 'info', title, message });
  }, [showNotification]);

  const warning = useCallback((title: string, message?: string) => {
    showNotification({ type: 'warning', title, message, duration: 6000 });
  }, [showNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        showNotification,
        removeNotification,
        success,
        error,
        info,
        warning,
      }}
    >
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

// Notification Container (renders all notifications)
function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

// Individual Notification Item
function NotificationItem({ notification, onClose }: { notification: Notification; onClose: () => void }) {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const interval = 50;
      const steps = notification.duration / interval;
      const decrement = 100 / steps;

      const timer = setInterval(() => {
        setProgress(prev => Math.max(0, prev - decrement));
      }, interval);

      return () => clearInterval(timer);
    }
  }, [notification.duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
  };

  const colors = {
    success: 'from-green-500/20 to-green-600/20 border-green-500/30',
    error: 'from-red-500/20 to-red-600/20 border-red-500/30',
    info: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    warning: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
  };

  const progressColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  };

  return (
    <div
      className={`
        pointer-events-auto
        min-w-[320px] max-w-md
        bg-gradient-to-br ${colors[notification.type]}
        backdrop-blur-xl
        border rounded-lg
        shadow-2xl
        overflow-hidden
        transition-all duration-300
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
      style={{
        animation: isExiting ? undefined : 'slideIn 0.3s ease-out',
      }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {icons[notification.type]}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white mb-1">
              {notification.title}
            </h4>

            {notification.message && (
              <p className="text-xs text-gray-300 leading-relaxed">
                {notification.message}
              </p>
            )}

            {notification.action && (
              <button
                onClick={() => {
                  notification.action?.onClick();
                  handleClose();
                }}
                className="mt-2 text-xs font-medium text-white underline hover:no-underline"
              >
                {notification.action.label}
              </button>
            )}
          </div>

          <button
            onClick={handleClose}
            className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {notification.duration && notification.duration > 0 && (
        <div className="h-1 bg-black/20">
          <div
            className={`h-full ${progressColors[notification.type]} transition-all duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

// Keyframes for animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;
document.head.appendChild(style);

export default NotificationProvider;

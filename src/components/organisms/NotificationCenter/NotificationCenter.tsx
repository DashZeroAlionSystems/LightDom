import React, { useState } from 'react';
import { X, Bell, Check, Trash2, MoreVertical, Circle } from 'lucide-react';
import { Button } from '../../atoms/Button';
import { Badge } from '../../atoms/Badge';
import { Avatar } from '../../atoms/Avatar';
import { Divider } from '../../atoms/Divider';
import { EmptyState } from '../../molecules/EmptyState';
import { Tabs } from '../../molecules/Tabs';

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type?: 'info' | 'success' | 'warning' | 'error';
  avatar?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDelete?: (id: string) => void;
  onDeleteAll?: () => void;
  onNotificationClick?: (notification: Notification) => void;
  onClose?: () => void;
  showTabs?: boolean;
  maxHeight?: string;
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onDeleteAll,
  onNotificationClick,
  onClose,
  showTabs = true,
  maxHeight = '600px',
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications =
    activeTab === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications;

  const typeColors = {
    info: 'text-blue-500',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500',
  };

  const tabs = [
    { id: 'all', label: 'All', badge: notifications.length },
    { id: 'unread', label: 'Unread', badge: unreadCount },
  ];

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Bell size={20} className="text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="destructive" size="sm">
              {unreadCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && onMarkAllAsRead && (
            <Button variant="ghost" size="sm" onClick={onMarkAllAsRead}>
              <Check size={16} className="mr-1" />
              Mark all read
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={18} />
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      {showTabs && (
        <div className="px-4 pt-2">
          <Tabs
            tabs={tabs.map((tab) => ({
              id: tab.id,
              label: tab.label,
              badge: tab.badge,
            }))}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            variant="underline"
          />
        </div>
      )}

      {/* Notifications List */}
      <div className="overflow-y-auto" style={{ maxHeight }}>
        {filteredNotifications.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<Bell size={48} />}
              title={activeTab === 'unread' ? 'No unread notifications' : 'No notifications'}
              description={
                activeTab === 'unread'
                  ? "You're all caught up!"
                  : 'Notifications will appear here when you receive them'
              }
              size="sm"
            />
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`
                  group p-4 hover:bg-gray-50 transition-colors cursor-pointer
                  ${!notification.read ? 'bg-blue-50/50' : ''}
                `}
                onClick={() => {
                  onNotificationClick?.(notification);
                  if (!notification.read) {
                    onMarkAsRead?.(notification.id);
                  }
                }}
              >
                <div className="flex gap-3">
                  {/* Avatar or Type Indicator */}
                  {notification.avatar ? (
                    <Avatar
                      src={notification.avatar}
                      alt={notification.title}
                      size="sm"
                    />
                  ) : (
                    <div
                      className={
                        notification.type === 'error'
                          ? 'flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-red-100'
                          : notification.type === 'success'
                          ? 'flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-green-100'
                          : notification.type === 'warning'
                          ? 'flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-yellow-100'
                          : 'flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-blue-100'
                      }
                    >
                      <Circle
                        size={8}
                        className={typeColors[notification.type || 'info']}
                        fill="currentColor"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <Circle size={6} className="text-blue-500 flex-shrink-0" fill="currentColor" />
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete?.(notification.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500">{notification.timestamp}</p>
                      {notification.action && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            notification.action?.onClick();
                          }}
                          className="text-xs"
                        >
                          {notification.action.label}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredNotifications.length > 0 && onDeleteAll && (
        <>
          <Divider />
          <div className="p-3 flex items-center justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDeleteAll}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 size={14} className="mr-1" />
              Clear all notifications
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

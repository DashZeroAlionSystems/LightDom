import { useState, useEffect } from 'react';

interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'error';
  time: string;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    
    // Set up real-time notifications (WebSocket or polling)
    const interval = setInterval(fetchNotifications, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Mock notifications for now
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'Optimization Completed',
          description: 'Your optimization for example.com has been completed successfully. Score improved by 24%.',
          type: 'success',
          time: '2 minutes ago',
          read: false,
          actionUrl: '/dashboard/optimization',
          actionText: 'View Details'
        },
        {
          id: '2',
          title: 'New Tokens Earned',
          description: 'You have earned 150 LDOM tokens from your recent optimizations.',
          type: 'info',
          time: '15 minutes ago',
          read: false,
          actionUrl: '/dashboard/wallet',
          actionText: 'View Wallet'
        },
        {
          id: '3',
          title: 'Website Added',
          description: 'test-site.org has been successfully added to your optimization queue.',
          type: 'info',
          time: '1 hour ago',
          read: true,
          actionUrl: '/dashboard/websites',
          actionText: 'Manage Websites'
        },
        {
          id: '4',
          title: 'Optimization Failed',
          description: 'Optimization for demo.net failed due to network timeout. Please try again.',
          type: 'error',
          time: '2 hours ago',
          read: true,
          actionUrl: '/dashboard/optimization',
          actionText: 'Retry'
        },
        {
          id: '5',
          title: 'Weekly Report Ready',
          description: 'Your weekly optimization report is ready for download.',
          type: 'info',
          time: '1 day ago',
          read: true,
          actionUrl: '/dashboard/analytics',
          actionText: 'Download Report'
        }
      ];

      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications(prev => {
          const notification = prev.find(n => n.id === notificationId);
          const newNotifications = prev.filter(n => n.id !== notificationId);
          if (notification && !notification.read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
          return newNotifications;
        });
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const createNotification = async (notification: Omit<Notification, 'id' | 'time' | 'read'>) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...notification,
          time: 'Just now',
          read: false
        }),
      });

      if (response.ok) {
        const newNotification = await response.json();
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        return newNotification;
      }
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  };

  const getUnreadNotifications = () => {
    return notifications.filter(notification => !notification.read);
  };

  const getNotificationsByType = (type: Notification['type']) => {
    return notifications.filter(notification => notification.type === type);
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    getUnreadNotifications,
    getNotificationsByType,
    refreshNotifications: fetchNotifications,
  };
};
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
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } else {
        // Mock notifications for development
        const mockNotifications: Notification[] = [
          {
            id: '1',
            title: 'Website Optimization Complete',
            description: 'example.com has been successfully optimized with a 24% performance improvement.',
            type: 'success',
            time: '2 minutes ago',
            read: false,
            actionUrl: '/dashboard/optimization',
            actionText: 'View Details'
          },
          {
            id: '2',
            title: 'SEO Analysis Available',
            description: 'New SEO insights are available for competitor.com.',
            type: 'info',
            time: '15 minutes ago',
            read: false,
            actionUrl: '/dashboard/seo',
            actionText: 'View Analysis'
          },
          {
            id: '3',
            title: 'Token Reward Earned',
            description: 'You earned 50 tokens for completing the optimization of test.com.',
            type: 'success',
            time: '1 hour ago',
            read: true,
            actionUrl: '/dashboard/wallet',
            actionText: 'View Wallet'
          },
          {
            id: '4',
            title: 'Optimization Failed',
            description: 'The optimization for demo.com failed due to server timeout.',
            type: 'error',
            time: '2 hours ago',
            read: true,
            actionUrl: '/dashboard/optimization',
            actionText: 'Retry'
          },
          {
            id: '5',
            title: 'System Maintenance',
            description: 'Scheduled maintenance will occur tonight from 2 AM to 4 AM EST.',
            type: 'warning',
            time: '3 hours ago',
            read: true
          }
        ];
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Set mock data on error
      setNotifications([
        {
          id: '1',
          title: 'Welcome to LightDom',
          description: 'Your dashboard is ready! Start by adding your first website.',
          type: 'info',
          time: 'Just now',
          read: false,
          actionUrl: '/dashboard/websites',
          actionText: 'Add Website'
        }
      ]);
      setUnreadCount(1);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === id
              ? { ...notification, read: true }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        // Update locally even if API fails
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === id
              ? { ...notification, read: true }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Update locally even if API fails
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
      } else {
        // Update locally even if API fails
        setNotifications(prev =>
          prev.map(notification => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // Update locally even if API fails
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const notification = notifications.find(n => n.id === id);
        setNotifications(prev => prev.filter(notification => notification.id !== id));
        if (notification && !notification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      } else {
        throw new Error('Failed to delete notification');
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
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
        body: JSON.stringify(notification),
      });

      if (response.ok) {
        const newNotification = await response.json();
        setNotifications(prev => [newNotification, ...prev]);
        if (!newNotification.read) {
          setUnreadCount(prev => prev + 1);
        }
        return newNotification;
      } else {
        throw new Error('Failed to create notification');
      }
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    refreshNotifications: fetchNotifications,
  };
};
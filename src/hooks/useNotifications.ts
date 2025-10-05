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
<<<<<<< HEAD
=======
    
    // Set up real-time notifications (WebSocket or polling)
    const interval = setInterval(fetchNotifications, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
>>>>>>> origin/main
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
<<<<<<< HEAD
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
=======
      
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
>>>>>>> origin/main
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
=======
  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
>>>>>>> origin/main
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification =>
<<<<<<< HEAD
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
=======
            notification.id === notificationId
>>>>>>> origin/main
              ? { ...notification, read: true }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
<<<<<<< HEAD
      // Update locally even if API fails
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
=======
>>>>>>> origin/main
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/notifications/read-all', {
<<<<<<< HEAD
        method: 'POST',
=======
        method: 'PUT',
>>>>>>> origin/main
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
<<<<<<< HEAD
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
=======
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/notifications/${notificationId}`, {
>>>>>>> origin/main
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/main
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
<<<<<<< HEAD
        body: JSON.stringify(notification),
=======
        body: JSON.stringify({
          ...notification,
          time: 'Just now',
          read: false
        }),
>>>>>>> origin/main
      });

      if (response.ok) {
        const newNotification = await response.json();
        setNotifications(prev => [newNotification, ...prev]);
<<<<<<< HEAD
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

=======
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

>>>>>>> origin/main
  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
<<<<<<< HEAD
=======
    getUnreadNotifications,
    getNotificationsByType,
>>>>>>> origin/main
    refreshNotifications: fetchNotifications,
  };
};
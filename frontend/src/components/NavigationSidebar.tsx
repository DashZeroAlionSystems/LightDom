import { AdminSidebar } from '@/components/admin/sidebar/AdminSidebar';
import { adminSidebarDefaults } from '@/config/adminSidebarConfig';
import { useAuth } from '@/hooks/useAuth';
import { AuthService } from '@/services/auth';
import React from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

/**
 * NavigationSidebar acts as the default admin navigation shell.
 * It now delegates rendering to the config-driven AdminSidebar organism
 * for consistent Material-inspired styling across the app.
 */
export const NavigationSidebar: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <AdminSidebar
      featureToggles={adminSidebarDefaults.featureToggles}
      user={{
        name: user?.name || user?.email,
        email: user?.email,
        role: 'Administrator',
      }}
      notificationCount={0}
      onSettingsClick={() => navigate('/settings')}
      onNotificationsClick={() => toast.success('Notifications feature coming soon!')}
      onLogoutClick={handleLogout}
      onCreatePage={() => {
        toast.success('Launching page creation wizard');
        navigate('/workflow-wizard');
      }}
      onCreateDashboard={() => {
        toast.success('Opening dashboard assembly surface');
        navigate('/unified-dashboard');
      }}
    />
  );
};

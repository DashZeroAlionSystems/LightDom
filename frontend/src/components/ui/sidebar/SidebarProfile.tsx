import React from 'react';
import { Bell, Settings, LogOut } from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { useSidebar } from './SidebarContainer';

interface SidebarProfileProps {
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
    role?: string;
  };
  onSettingsClick?: () => void;
  onNotificationsClick?: () => void;
  onLogoutClick?: () => void;
  notificationCount?: number;
  className?: string;
}

export const SidebarProfile: React.FC<SidebarProfileProps> = ({
  user,
  onSettingsClick,
  onNotificationsClick,
  onLogoutClick,
  notificationCount = 0,
  className,
}) => {
  const { collapsed } = useSidebar();

  if (collapsed) {
    return (
      <div className={cn('p-3 border-t border-border', className)}>
        <div className="flex flex-col items-center gap-2">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name || 'User'}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {getInitials(user?.name || user?.email)}
              </span>
            </div>
          )}
          
          {onNotificationsClick && (
            <button
              onClick={onNotificationsClick}
              className="relative p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('p-3 border-t border-border', className)}>
      <div className="bg-accent/50 rounded-lg p-3 space-y-3">
        {/* User Info */}
        <div className="flex items-center gap-3">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name || 'User'}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-semibold">
                {getInitials(user?.name || user?.email)}
              </span>
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.name || user?.email || 'User'}
            </p>
            {user?.role && (
              <p className="text-xs text-muted-foreground truncate">
                {user.role}
              </p>
            )}
          </div>
          
          {onNotificationsClick && (
            <button
              onClick={onNotificationsClick}
              className="relative p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {onSettingsClick && (
            <button
              onClick={onSettingsClick}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors text-xs"
              aria-label="Settings"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
          )}
          
          {onLogoutClick && (
            <button
              onClick={onLogoutClick}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors text-xs"
              aria-label="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Menu, Search, Bell, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { Avatar } from '../../atoms/Avatar';
import { Badge } from '../../atoms/Badge';
import { DropdownMenu } from '../../molecules/DropdownMenu';

export interface HeaderProps {
  logo?: React.ReactNode;
  appName?: string;
  onMenuClick?: () => void;
  onSearch?: (query: string) => void;
  notifications?: number;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onLogoutClick?: () => void;
  showSearch?: boolean;
  variant?: 'light' | 'dark';
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  logo,
  appName = 'LightDom',
  onMenuClick,
  onSearch,
  notifications = 0,
  user,
  onNotificationClick,
  onProfileClick,
  onSettingsClick,
  onLogoutClick,
  showSearch = true,
  variant = 'light',
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const bgClass = variant === 'dark' 
    ? 'bg-gray-900 border-gray-800 text-white' 
    : 'bg-white border-gray-200 text-gray-900';

  return (
    <header className={`sticky top-0 z-50 w-full border-b ${bgClass} ${className}`}>
      <div className="flex h-16 items-center gap-4 px-4 md:px-6">
        {/* Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="md:hidden"
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </Button>

        {/* Logo & App Name */}
        <div className="flex items-center gap-3">
          {logo || (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <span className="text-lg font-bold text-white">L</span>
            </div>
          )}
          <span className="hidden text-lg font-semibold md:block">{appName}</span>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <Search 
                size={18} 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
              />
              <Input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </form>
        )}

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onNotificationClick}
            className="relative"
            aria-label={`${notifications} notifications`}
          >
            <Bell size={20} />
            {notifications > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1"
              >
                {notifications > 99 ? '99+' : notifications}
              </Badge>
            )}
          </Button>

          {/* User Menu */}
          {user && (
            <DropdownMenu
              trigger={
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Avatar
                    src={user.avatar}
                    alt={user.name}
                    initials={user.name.split(' ').map(n => n[0]).join('')}
                    size="sm"
                  />
                  <span className="hidden md:block text-sm font-medium">{user.name}</span>
                  <ChevronDown size={16} />
                </Button>
              }
              items={[
                {
                  icon: <User size={16} />,
                  label: 'Profile',
                  onClick: onProfileClick,
                },
                {
                  icon: <Settings size={16} />,
                  label: 'Settings',
                  onClick: onSettingsClick,
                },
                { separator: true },
                {
                  icon: <LogOut size={16} />,
                  label: 'Logout',
                  onClick: onLogoutClick,
                  destructive: true,
                },
              ]}
            />
          )}
        </div>
      </div>
    </header>
  );
};

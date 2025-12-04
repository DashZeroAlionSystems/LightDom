import React from 'react';
import { Header } from '../organisms/Header/Header';
import { Sidebar } from '../organisms/Sidebar/Sidebar';

interface DashboardTemplateProps {
  children: React.ReactNode;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
  showSearch?: boolean;
  notificationCount?: number;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export const DashboardTemplate: React.FC<DashboardTemplateProps> = ({
  children,
  sidebarCollapsed = false,
  onSidebarToggle,
  showSearch = true,
  notificationCount = 0,
  user = { name: 'John Doe', email: 'john@example.com' },
}) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        showSearch={showSearch}
        notificationCount={notificationCount}
        user={user}
      />
      <div className="flex">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={onSidebarToggle}
        />
        <main className={`flex-1 p-6 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

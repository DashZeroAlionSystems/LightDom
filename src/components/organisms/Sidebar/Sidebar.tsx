import React, { useState } from 'react';
import { 
  Home, Layout, FileText, Settings, Users, BarChart3, Package, 
  Shield, Database, Zap, ChevronRight, ChevronLeft 
} from 'lucide-react';
import { Button } from '../../atoms/Button';
import { Divider } from '../../atoms/Divider';
import { Badge } from '../../atoms/Badge';

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
}

export interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

export interface SidebarProps {
  sections: SidebarSection[];
  activeItemId?: string;
  onItemClick?: (itemId: string) => void;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  variant?: 'light' | 'dark';
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sections,
  activeItemId,
  onItemClick,
  collapsible = true,
  defaultCollapsed = false,
  variant = 'light',
  className = '',
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const bgClass = variant === 'dark'
    ? 'bg-gray-900 border-gray-800 text-gray-100'
    : 'bg-white border-gray-200 text-gray-900';

  const itemBgClass = variant === 'dark'
    ? 'hover:bg-gray-800'
    : 'hover:bg-gray-100';

  const activeBgClass = variant === 'dark'
    ? 'bg-gray-800 text-blue-400'
    : 'bg-blue-50 text-blue-600';

  return (
    <aside
      className={`relative flex flex-col border-r transition-all duration-300 ${bgClass} ${
        collapsed ? 'w-16' : 'w-64'
      } ${className}`}
    >
      {/* Collapse Toggle */}
      {collapsible && (
        <div className="flex h-16 items-center justify-end px-4 border-b border-gray-200 dark:border-gray-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </Button>
        </div>
      )}

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto py-4">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            {section.title && !collapsed && (
              <div className="px-4 mb-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {section.title}
                </p>
              </div>
            )}

            <div className="space-y-1 px-2">
              {section.items.map((item) => {
                const isActive = item.active || activeItemId === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (!item.disabled) {
                        item.onClick?.();
                        onItemClick?.(item.id);
                      }
                    }}
                    disabled={item.disabled}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg
                      transition-colors duration-200
                      ${isActive ? activeBgClass : itemBgClass}
                      ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      ${collapsed ? 'justify-center' : ''}
                    `}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left text-sm font-medium">
                          {item.label}
                        </span>
                        {item.badge && (
                          <Badge size="sm" variant={isActive ? 'default' : 'secondary'}>
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>

            {sectionIndex < sections.length - 1 && !collapsed && (
              <div className="px-4 my-4">
                <Divider />
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

// Example usage with default sections
export const defaultSidebarSections: SidebarSection[] = [
  {
    title: 'Main',
    items: [
      { id: 'home', label: 'Home', icon: <Home size={20} />, active: true },
      { id: 'dashboard', label: 'Dashboard', icon: <Layout size={20} /> },
      { id: 'documents', label: 'Documents', icon: <FileText size={20} />, badge: 3 },
    ],
  },
  {
    title: 'Management',
    items: [
      { id: 'users', label: 'Users', icon: <Users size={20} /> },
      { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
      { id: 'packages', label: 'Packages', icon: <Package size={20} /> },
    ],
  },
  {
    title: 'System',
    items: [
      { id: 'security', label: 'Security', icon: <Shield size={20} /> },
      { id: 'database', label: 'Database', icon: <Database size={20} /> },
      { id: 'integrations', label: 'Integrations', icon: <Zap size={20} />, badge: 'NEW' },
      { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
    ],
  },
];

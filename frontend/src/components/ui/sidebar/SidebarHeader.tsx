import React from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from './SidebarContainer';

interface SidebarHeaderProps {
  logo?: React.ReactNode;
  brandName?: string;
  brandSubtitle?: string;
  className?: string;
  showToggle?: boolean;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  logo,
  brandName = 'LightDom',
  brandSubtitle = 'Platform',
  className,
  showToggle = true,
}) => {
  const { collapsed, toggleCollapsed } = useSidebar();

  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 border-b border-border min-h-[64px]',
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {logo || (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xl">L</span>
          </div>
        )}
        
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="text-base font-bold text-foreground truncate">
              {brandName}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {brandSubtitle}
            </span>
          </div>
        )}
      </div>
      
      {showToggle && (
        <button
          onClick={toggleCollapsed}
          className={cn(
            'p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors flex-shrink-0',
            collapsed && 'ml-0'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <Menu className="w-5 h-5" />
          ) : (
            <X className="w-5 h-5" />
          )}
        </button>
      )}
    </div>
  );
};

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useSidebar } from './SidebarContainer';

interface SidebarNavItemProps {
  to: string;
  icon?: React.ReactNode;
  label: string;
  description?: string;
  badge?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  to,
  icon,
  label,
  description,
  badge,
  onClick,
  className,
}) => {
  const location = useLocation();
  const { collapsed } = useSidebar();
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);

  const content = (
    <>
      {icon && (
        <span
          className={cn(
            'flex items-center justify-center w-5 h-5 flex-shrink-0',
            isActive ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {icon}
        </span>
      )}
      
      {!collapsed && (
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'text-sm truncate',
                isActive ? 'text-primary font-medium' : 'text-foreground'
              )}
            >
              {label}
            </span>
            {badge && <span className="flex-shrink-0">{badge}</span>}
          </div>
          {description && (
            <span className="text-xs text-muted-foreground truncate">
              {description}
            </span>
          )}
        </div>
      )}
    </>
  );

  const itemClasses = cn(
    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
    isActive
      ? 'bg-primary/10 text-primary'
      : 'text-foreground hover:bg-accent hover:text-foreground',
    collapsed && 'justify-center',
    className
  );

  if (onClick) {
    return (
      <button onClick={onClick} className={itemClasses}>
        {content}
      </button>
    );
  }

  return (
    <Link to={to} className={itemClasses}>
      {content}
    </Link>
  );
};

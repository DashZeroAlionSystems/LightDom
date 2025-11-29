import React from 'react';
import { cn } from '@/lib/utils';

interface SidebarDividerProps {
  className?: string;
  label?: string;
}

export const SidebarDivider: React.FC<SidebarDividerProps> = ({ className, label }) => {
  if (label) {
    return (
      <div className={cn('px-3 py-2', className)}>
        <div className="flex items-center gap-2">
          <div className="flex-1 border-t border-border" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </span>
          <div className="flex-1 border-t border-border" />
        </div>
      </div>
    );
  }

  return <div className={cn('my-2 border-t border-border', className)} />;
};

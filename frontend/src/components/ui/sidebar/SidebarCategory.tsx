import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from './SidebarContainer';

interface SidebarCategoryProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export const SidebarCategory: React.FC<SidebarCategoryProps> = ({
  title,
  icon,
  children,
  defaultOpen = true,
  className,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const { collapsed } = useSidebar();

  if (collapsed) {
    // In collapsed mode, show a simple divider
    return (
      <div className="my-2 border-t border-border" />
    );
  }

  return (
    <div className={cn('space-y-1', className)}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider"
      >
        <div className="flex items-center gap-2">
          {icon && <span className="flex items-center justify-center w-4 h-4">{icon}</span>}
          <span>{title}</span>
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>
      
      {open && (
        <div className="space-y-1 pl-1">
          {children}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { cn } from '@/lib/utils';

interface SidebarIconProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'accent' | 'muted';
}

export const SidebarIcon: React.FC<SidebarIconProps> = ({
  children,
  className,
  variant = 'default',
}) => {
  const variantClasses = {
    default: 'text-muted-foreground',
    accent: 'text-primary',
    muted: 'text-muted-foreground/60',
  };

  return (
    <span
      className={cn(
        'flex items-center justify-center w-5 h-5 flex-shrink-0',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

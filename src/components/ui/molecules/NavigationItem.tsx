/**
 * NavigationItem - Molecule composed from atoms
 * Navigation item with icon, label, and optional badge
 */

import React from 'react';
import { NavigationIcon } from '../atoms/Icon';
import { Text } from '../atoms/Typography';
import { Badge } from '../atoms/Badge';
import { cn } from '@/lib/utils';

export interface NavigationItemProps {
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  badge?: {
    text: string;
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  };
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export const NavigationItem = React.forwardRef<HTMLButtonElement, NavigationItemProps>(
  ({ label, icon, active = false, badge, onClick, className, disabled = false }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'group w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200',
          active
            ? 'bg-blue-50 text-blue-600 font-medium'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        {icon && <NavigationIcon icon={icon} active={active} />}
        <Text
          size="sm"
          weight={active ? 'medium' : 'normal'}
          color={active ? 'primary' : 'default'}
          as="span"
          className="flex-1 text-left"
        >
          {label}
        </Text>
        {badge && (
          <Badge
            variant={badge.variant || 'default'}
            size="xs"
          >
            {badge.text}
          </Badge>
        )}
      </button>
    );
  }
);

NavigationItem.displayName = 'NavigationItem';

/**
 * NavigationGroup - Group of navigation items with a header
 */
export interface NavigationGroupProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const NavigationGroup = React.forwardRef<HTMLDivElement, NavigationGroupProps>(
  ({ title, children, className }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-1', className)}>
        {title && (
          <Text
            size="xs"
            weight="semibold"
            color="muted"
            className="px-4 py-2 uppercase tracking-wider"
          >
            {title}
          </Text>
        )}
        <div className="space-y-0.5">{children}</div>
      </div>
    );
  }
);

NavigationGroup.displayName = 'NavigationGroup';

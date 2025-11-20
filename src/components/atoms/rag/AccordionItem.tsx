import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState, type ReactNode, type HTMLAttributes } from 'react';

export interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  /** Accordion title/header */
  title: string | ReactNode;
  /** Content to show when expanded */
  children: ReactNode;
  /** Initially expanded state */
  defaultExpanded?: boolean;
  /** Controlled expanded state */
  expanded?: boolean;
  /** Callback when expanded state changes */
  onExpandedChange?: (expanded: boolean) => void;
  /** Icon to show in header */
  icon?: ReactNode;
  /** Badge or additional info in header */
  badge?: ReactNode;
  /** Visual variant */
  variant?: 'default' | 'bordered' | 'flat';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Disable interaction */
  disabled?: boolean;
}

export const AccordionItem = ({
  title,
  children,
  defaultExpanded = false,
  expanded: controlledExpanded,
  onExpandedChange,
  icon,
  badge,
  variant = 'default',
  size = 'md',
  disabled = false,
  className,
  ...props
}: AccordionItemProps) => {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  
  // Use controlled state if provided, otherwise use internal state
  const expanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  
  const toggleExpanded = () => {
    if (disabled) return;
    const newExpanded = !expanded;
    setInternalExpanded(newExpanded);
    onExpandedChange?.(newExpanded);
  };

  const sizeClasses = {
    sm: {
      header: 'px-3 py-2 text-sm',
      content: 'px-3 py-2 text-sm',
      icon: 'h-4 w-4',
    },
    md: {
      header: 'px-4 py-3 text-base',
      content: 'px-4 py-3 text-base',
      icon: 'h-5 w-5',
    },
    lg: {
      header: 'px-5 py-4 text-lg',
      content: 'px-5 py-4 text-base',
      icon: 'h-6 w-6',
    },
  };

  const variantClasses = {
    default: 'bg-surface rounded-lg shadow-sm border border-outline',
    bordered: 'border border-outline rounded-lg',
    flat: 'border-b border-outline last:border-b-0',
  };

  const ChevronIcon = expanded ? ChevronUp : ChevronDown;

  return (
    <div
      className={cn(
        'transition-all duration-200',
        variantClasses[variant],
        disabled && 'opacity-60 cursor-not-allowed',
        className
      )}
      {...props}
    >
      <button
        onClick={toggleExpanded}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between gap-3',
          'transition-colors duration-200',
          'hover:bg-surface-container-highest',
          variant !== 'flat' && 'rounded-t-lg',
          expanded && variant !== 'flat' && 'rounded-b-none',
          sizeClasses[size].header,
          disabled && 'cursor-not-allowed'
        )}
        aria-expanded={expanded}
        aria-disabled={disabled}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {icon && (
            <div className="flex-shrink-0 text-on-surface-variant">
              {icon}
            </div>
          )}
          <div className="flex-1 text-left font-medium text-on-surface truncate">
            {title}
          </div>
          {badge && (
            <div className="flex-shrink-0">
              {badge}
            </div>
          )}
        </div>
        <ChevronIcon
          className={cn(
            'flex-shrink-0 text-on-surface-variant transition-transform duration-200',
            sizeClasses[size].icon
          )}
        />
      </button>

      {expanded && (
        <div
          className={cn(
            'text-on-surface-variant',
            'border-t border-outline',
            'animate-in slide-in-from-top-2 duration-200',
            sizeClasses[size].content
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
};

AccordionItem.displayName = 'AccordionItem';

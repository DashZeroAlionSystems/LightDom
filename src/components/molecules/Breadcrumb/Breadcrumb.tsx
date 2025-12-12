import { cn } from '@/lib/utils';
import { ChevronRight, Home, LucideIcon } from 'lucide-react';
import React, { forwardRef } from 'react';
import { Typography } from '../atoms/Typography';

export interface BreadcrumbItem {
  /** Label text */
  label: string;
  /** Link URL */
  href?: string;
  /** Custom icon */
  icon?: LucideIcon;
  /** Is this the current page */
  current?: boolean;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  /** Array of breadcrumb items */
  items: BreadcrumbItem[];
  /** Custom separator */
  separator?: React.ReactNode;
  /** Show home icon for first item */
  showHomeIcon?: boolean;
  /** Custom onClick handler for items */
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
  /** Max items to show before collapsing */
  maxItems?: number;
}

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  (
    {
      items,
      separator,
      showHomeIcon = true,
      onItemClick,
      maxItems,
      className,
      ...props
    },
    ref
  ) => {
    const SeparatorComponent = separator || (
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    );

    // Handle collapsing for many items
    let displayItems = items;
    let collapsed = false;

    if (maxItems && items.length > maxItems) {
      const first = items.slice(0, 1);
      const last = items.slice(-Math.max(maxItems - 2, 1));
      displayItems = [...first, { label: '...', current: false }, ...last];
      collapsed = true;
    }

    return (
      <nav ref={ref} aria-label="Breadcrumb" className={className} {...props}>
        <ol className="flex items-center gap-2 flex-wrap">
          {displayItems.map((item, index) => {
            const isFirst = index === 0;
            const isLast = index === displayItems.length - 1;
            const isEllipsis = item.label === '...' && collapsed;
            const ItemIcon = item.icon;

            const handleClick = (e: React.MouseEvent) => {
              if (onItemClick && !isEllipsis) {
                e.preventDefault();
                onItemClick(item, index);
              }
            };

            const content = (
              <>
                {isFirst && showHomeIcon && !ItemIcon && (
                  <Home className="w-4 h-4 mr-1" />
                )}
                {ItemIcon && <ItemIcon className="w-4 h-4 mr-1" />}
                {item.label}
              </>
            );

            return (
              <li key={index} className="flex items-center gap-2">
                {item.href && !item.current && !isEllipsis ? (
                  <a
                    href={item.href}
                    onClick={handleClick}
                    className={cn(
                      'flex items-center text-sm hover:text-primary transition-colors',
                      'text-muted-foreground hover:underline'
                    )}
                  >
                    {content}
                  </a>
                ) : (
                  <Typography
                    variant="body2"
                    color={item.current ? 'default' : 'muted'}
                    className={cn(
                      'flex items-center',
                      item.current && 'font-medium',
                      isEllipsis && 'select-none'
                    )}
                    aria-current={item.current ? 'page' : undefined}
                  >
                    {content}
                  </Typography>
                )}
                {!isLast && <span className="shrink-0">{SeparatorComponent}</span>}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }
);

Breadcrumb.displayName = 'Breadcrumb';

import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import React, { useState, useRef, useEffect } from 'react';

const tooltipVariants = cva(
  'absolute z-50 px-2.5 py-1.5 text-sm font-medium rounded-md shadow-lg pointer-events-none transition-all duration-200 max-w-xs',
  {
    variants: {
      variant: {
        dark: 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900',
        light: 'bg-white text-gray-900 border border-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-700',
        primary: 'bg-primary text-primary-foreground',
        success: 'bg-green-600 text-white',
        warning: 'bg-yellow-500 text-white',
        error: 'bg-red-600 text-white',
      },
    },
    defaultVariants: {
      variant: 'dark',
    },
  }
);

const arrowVariants = cva('absolute h-2 w-2 rotate-45', {
  variants: {
    variant: {
      dark: 'bg-gray-900 dark:bg-gray-100',
      light: 'bg-white border-l border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700',
      primary: 'bg-primary',
      success: 'bg-green-600',
      warning: 'bg-yellow-500',
      error: 'bg-red-600',
    },
  },
  defaultVariants: {
    variant: 'dark',
  },
});

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps extends VariantProps<typeof tooltipVariants> {
  /** Tooltip content */
  content: React.ReactNode;
  /** Element that triggers the tooltip */
  children: React.ReactElement;
  /** Tooltip placement */
  placement?: TooltipPlacement;
  /** Delay before showing (ms) */
  delay?: number;
  /** Disable the tooltip */
  disabled?: boolean;
  /** Show arrow */
  arrow?: boolean;
  /** Custom offset from trigger */
  offset?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  variant,
  placement = 'top',
  delay = 200,
  disabled = false,
  arrow = true,
  offset = 8,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const arrowOffset = arrow ? 4 : 0;

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - offset - arrowOffset;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + offset + arrowOffset;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - offset - arrowOffset;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + offset + arrowOffset;
        break;
    }

    // Ensure tooltip stays in viewport (SSR-safe check)
    if (typeof window !== 'undefined') {
      const padding = 8;
      left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));
      top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding));
    }

    setPosition({ top, left });
  };

  const showTooltip = () => {
    if (disabled) return;
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
    }
  }, [isVisible]);

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  const getArrowPosition = () => {
    switch (placement) {
      case 'top':
        return '-bottom-1 left-1/2 -translate-x-1/2';
      case 'bottom':
        return '-top-1 left-1/2 -translate-x-1/2';
      case 'left':
        return '-right-1 top-1/2 -translate-y-1/2';
      case 'right':
        return '-left-1 top-1/2 -translate-y-1/2';
    }
  };

  const childWithRef = React.cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: (e: React.MouseEvent) => {
      showTooltip();
      children.props.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      hideTooltip();
      children.props.onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent) => {
      showTooltip();
      children.props.onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent) => {
      hideTooltip();
      children.props.onBlur?.(e);
    },
  });

  return (
    <>
      {childWithRef}
      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={cn(
            tooltipVariants({ variant }),
            'fixed opacity-0',
            isVisible && 'opacity-100'
          )}
          style={{ top: position.top, left: position.left }}
        >
          {content}
          {arrow && (
            <span
              className={cn(arrowVariants({ variant }), getArrowPosition())}
            />
          )}
        </div>
      )}
    </>
  );
};

Tooltip.displayName = 'Tooltip';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const tooltipVariants = cva(
  'absolute z-tooltip px-2 py-1 text-xs font-medium text-white bg-neutral-900 rounded-md shadow-lg transition-opacity duration-200 pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-neutral-900 text-white',
        primary: 'bg-primary text-white',
        secondary: 'bg-secondary text-white',
        accent: 'bg-accent text-white',
        success: 'bg-success text-white',
        warning: 'bg-warning text-white',
        error: 'bg-error text-white',
        light: 'bg-white text-neutral-900 border border-neutral-200',
      },
      size: {
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-3 py-1.5',
        lg: 'text-base px-4 py-2',
      },
      placement: {
        top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
        'top-left': 'bottom-full left-0 mb-2',
        'top-right': 'bottom-full right-0 mb-2',
        'bottom-left': 'top-full left-0 mt-2',
        'bottom-right': 'top-full right-0 mt-2',
        'left-top': 'right-full top-0 mr-2',
        'left-bottom': 'right-full bottom-0 mr-2',
        'right-top': 'left-full top-0 ml-2',
        'right-bottom': 'left-full bottom-0 ml-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm',
      placement: 'top',
    },
  }
);

export interface TooltipProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tooltipVariants> {
  content: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
  delay?: number;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'left-top' | 'left-bottom' | 'right-top' | 'right-bottom';
  trigger?: 'hover' | 'click' | 'focus';
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  disabled = false,
  delay = 200,
  placement = 'top',
  variant,
  size,
  trigger = 'hover',
  className,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    if (disabled) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      updatePosition();
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = triggerRect.top + scrollY - tooltipRect.height - 8;
        left = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + scrollY + 8;
        left = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left + scrollX - tooltipRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + scrollX + 8;
        break;
      case 'top-left':
        top = triggerRect.top + scrollY - tooltipRect.height - 8;
        left = triggerRect.left + scrollX;
        break;
      case 'top-right':
        top = triggerRect.top + scrollY - tooltipRect.height - 8;
        left = triggerRect.right + scrollX - tooltipRect.width;
        break;
      case 'bottom-left':
        top = triggerRect.bottom + scrollY + 8;
        left = triggerRect.left + scrollX;
        break;
      case 'bottom-right':
        top = triggerRect.bottom + scrollY + 8;
        left = triggerRect.right + scrollX - tooltipRect.width;
        break;
      case 'left-top':
        top = triggerRect.top + scrollY;
        left = triggerRect.left + scrollX - tooltipRect.width - 8;
        break;
      case 'left-bottom':
        top = triggerRect.bottom + scrollY - tooltipRect.height;
        left = triggerRect.left + scrollX - tooltipRect.width - 8;
        break;
      case 'right-top':
        top = triggerRect.top + scrollY;
        left = triggerRect.right + scrollX + 8;
        break;
      case 'right-bottom':
        top = triggerRect.bottom + scrollY - tooltipRect.height;
        left = triggerRect.right + scrollX + 8;
        break;
    }

    setPosition({ top, left });
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      const handleResize = () => updatePosition();
      const handleScroll = () => updatePosition();
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, true);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [isVisible, placement]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (trigger === 'hover') showTooltip();
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') hideTooltip();
  };

  const handleClick = () => {
    if (trigger === 'click') {
      setIsVisible(!isVisible);
      if (!isVisible) updatePosition();
    }
  };

  const handleFocus = () => {
    if (trigger === 'focus') showTooltip();
  };

  const handleBlur = () => {
    if (trigger === 'focus') hideTooltip();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && isVisible) {
      setIsVisible(false);
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="inline-block"
      >
        {children}
      </div>
      
      {isVisible && createPortal(
        <div
          ref={tooltipRef}
          className={cn(tooltipVariants({ variant, size, placement }), className)}
          style={{
            top: position.top,
            left: position.left,
          }}
          role="tooltip"
          {...props}
        >
          {content}
          {/* Arrow */}
          <div
            className={cn(
              'absolute w-0 h-0 border-4 border-transparent',
              {
                'bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full border-t-neutral-900': placement === 'top',
                'top-0 left-1/2 transform -translate-x-1/2 -translate-y-full border-b-neutral-900': placement === 'bottom',
                'right-0 top-1/2 transform -translate-y-1/2 translate-x-full border-l-neutral-900': placement === 'left',
                'left-0 top-1/2 transform -translate-y-1/2 -translate-x-full border-r-neutral-900': placement === 'right',
              }
            )}
          />
        </div>,
        document.body
      )}
    </>
  );
};

export { Tooltip, tooltipVariants };
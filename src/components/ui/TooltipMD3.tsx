/**
 * Improved Tooltip Component
 * Material Design 3 compliant tooltip with better positioning
 */

import React, { useState, useRef, useEffect } from 'react';

export interface TooltipProps {
  /** Tooltip content */
  content: React.ReactNode;
  /** Tooltip placement */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** Trigger element */
  children: React.ReactElement;
  /** Delay before showing (ms) */
  enterDelay?: number;
  /** Delay before hiding (ms) */
  leaveDelay?: number;
  /** Disable the tooltip */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  placement = 'top',
  children,
  enterDelay = 200,
  leaveDelay = 0,
  disabled = false,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const enterTimeoutRef = useRef<NodeJS.Timeout>();
  const leaveTimeoutRef = useRef<NodeJS.Timeout>();

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    let x = 0;
    let y = 0;

    switch (placement) {
      case 'top':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.top - tooltipRect.height - 8;
        break;
      case 'bottom':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.bottom + 8;
        break;
      case 'left':
        x = triggerRect.left - tooltipRect.width - 8;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
      case 'right':
        x = triggerRect.right + 8;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
    }

    // Keep tooltip on screen
    const padding = 8;
    x = Math.max(padding, Math.min(x, window.innerWidth - tooltipRect.width - padding));
    y = Math.max(padding, Math.min(y, window.innerHeight - tooltipRect.height - padding));

    setPosition({ x, y });
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isVisible]);

  const handleMouseEnter = () => {
    if (disabled) return;
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }
    enterTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, enterDelay);
  };

  const handleMouseLeave = () => {
    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current);
    }
    leaveTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, leaveDelay);
  };

  const arrowPosition = {
    top: 'bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full border-t-inverse-surface border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'top-0 left-1/2 transform -translate-x-1/2 -translate-y-full border-b-inverse-surface border-l-transparent border-r-transparent border-t-transparent',
    left: 'right-0 top-1/2 transform translate-x-full -translate-y-1/2 border-l-inverse-surface border-t-transparent border-b-transparent border-r-transparent',
    right: 'left-0 top-1/2 transform -translate-x-full -translate-y-1/2 border-r-inverse-surface border-t-transparent border-b-transparent border-l-transparent',
  };

  const child = React.Children.only(children);
  const trigger = React.cloneElement(child, {
    ref: triggerRef,
    onMouseEnter: (e: React.MouseEvent) => {
      handleMouseEnter();
      child.props.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      handleMouseLeave();
      child.props.onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent) => {
      handleMouseEnter();
      child.props.onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent) => {
      handleMouseLeave();
      child.props.onBlur?.(e);
    },
  });

  return (
    <>
      {trigger}
      {isVisible && !disabled && (
        <div
          ref={tooltipRef}
          className={`
            fixed
            z-50
            px-3
            py-2
            bg-inverse-surface
            text-inverse-on-surface
            text-label-sm
            font-medium
            rounded-lg
            shadow-lg
            pointer-events-none
            animate-in
            fade-in-0
            zoom-in-95
            ${className}
          `}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
          role="tooltip"
        >
          {content}
          {/* Arrow */}
          <div
            className={`
              absolute
              w-0
              h-0
              border-4
              ${arrowPosition[placement]}
            `}
          />
        </div>
      )}
    </>
  );
};

/**
 * Simple Tooltip Component
 * Simplified tooltip for basic use cases
 */
export interface SimpleTooltipProps {
  text: string;
  children: React.ReactElement;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export const SimpleTooltip: React.FC<SimpleTooltipProps> = ({
  text,
  children,
  placement = 'top',
}) => {
  return (
    <Tooltip content={text} placement={placement}>
      {children}
    </Tooltip>
  );
};

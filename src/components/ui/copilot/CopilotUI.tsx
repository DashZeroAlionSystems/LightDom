/**
 * Copilot-Styled UI Components
 * Inspired by VS Code GitHub Copilot's clean, modern interface
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * CopilotPanel - Main container with subtle styling
 */
export interface CopilotPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  elevated?: boolean;
}

export const CopilotPanel = React.forwardRef<HTMLDivElement, CopilotPanelProps>(
  ({ className, title, subtitle, headerAction, footer, elevated, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border border-gray-200/60 bg-white',
          elevated && 'shadow-sm',
          className
        )}
        {...props}
      >
        {(title || subtitle || headerAction) && (
          <div className="flex items-start justify-between border-b border-gray-200/60 px-4 py-3">
            <div>
              {title && (
                <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
              )}
              {subtitle && (
                <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>
              )}
            </div>
            {headerAction && <div className="ml-4">{headerAction}</div>}
          </div>
        )}
        <div className="p-4">{children}</div>
        {footer && (
          <div className="border-t border-gray-200/60 bg-gray-50/50 px-4 py-3">
            {footer}
          </div>
        )}
      </div>
    );
  }
);

CopilotPanel.displayName = 'CopilotPanel';

/**
 * CopilotDivider - Subtle horizontal divider
 */
export interface CopilotDividerProps extends React.HTMLAttributes<HTMLHRElement> {
  label?: string;
  variant?: 'light' | 'default';
}

export const CopilotDivider = React.forwardRef<HTMLHRElement, CopilotDividerProps>(
  ({ className, label, variant = 'default', ...props }, ref) => {
    if (label) {
      return (
        <div className={cn('relative my-4', className)} ref={ref as any}>
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className={cn(
              'w-full border-t',
              variant === 'light' ? 'border-gray-100' : 'border-gray-200/60'
            )} />
          </div>
          <div className="relative flex justify-center">
            <span className={cn(
              'bg-white px-2 text-xs',
              variant === 'light' ? 'text-gray-400' : 'text-gray-500'
            )}>
              {label}
            </span>
          </div>
        </div>
      );
    }

    return (
      <hr
        ref={ref}
        className={cn(
          'my-4 border-t',
          variant === 'light' ? 'border-gray-100' : 'border-gray-200/60',
          className
        )}
        {...props}
      />
    );
  }
);

CopilotDivider.displayName = 'CopilotDivider';

/**
 * CopilotList - Clean list with hover states
 */
export interface CopilotListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  active?: boolean;
  clickable?: boolean;
}

export const CopilotListItem = React.forwardRef<HTMLDivElement, CopilotListItemProps>(
  ({ className, icon, title, description, action, active, clickable, onClick, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'group flex items-start gap-3 rounded-md px-3 py-2 transition-colors duration-150',
          clickable && 'cursor-pointer hover:bg-gray-50/80',
          active && 'bg-blue-50/50 hover:bg-blue-50/70',
          className
        )}
        onClick={onClick}
        {...props}
      >
        {icon && (
          <div className={cn(
            'mt-0.5 flex-shrink-0 text-gray-400',
            active && 'text-blue-600'
          )}>
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className={cn(
            'text-sm font-medium text-gray-900',
            active && 'text-blue-700'
          )}>
            {title}
          </div>
          {description && (
            <div className="mt-0.5 text-xs text-gray-500 line-clamp-2">
              {description}
            </div>
          )}
        </div>
        {action && (
          <div className="ml-2 flex-shrink-0">{action}</div>
        )}
      </div>
    );
  }
);

CopilotListItem.displayName = 'CopilotListItem';

export interface CopilotListProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: CopilotListItemProps[];
}

export const CopilotList = React.forwardRef<HTMLDivElement, CopilotListProps>(
  ({ className, items, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-0.5', className)} {...props}>
        {items ? items.map((item, idx) => (
          <CopilotListItem key={idx} {...item} />
        )) : children}
      </div>
    );
  }
);

CopilotList.displayName = 'CopilotList';

/**
 * CopilotInput - Clean input field
 */
export interface CopilotInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const CopilotInput = React.forwardRef<HTMLInputElement, CopilotInputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-xs font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'block w-full rounded-md border border-gray-200/60 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400',
              'transition-colors duration-150',
              'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
              'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
              error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-gray-500">{hint}</p>
        )}
      </div>
    );
  }
);

CopilotInput.displayName = 'CopilotInput';

/**
 * CopilotTextarea - Multi-line input
 */
export interface CopilotTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const CopilotTextarea = React.forwardRef<HTMLTextAreaElement, CopilotTextareaProps>(
  ({ className, label, error, hint, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-xs font-medium text-gray-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'block w-full rounded-md border border-gray-200/60 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400',
            'transition-colors duration-150',
            'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
            'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
            error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-gray-500">{hint}</p>
        )}
      </div>
    );
  }
);

CopilotTextarea.displayName = 'CopilotTextarea';

/**
 * CopilotAccordion - Collapsible sections
 */
export interface CopilotAccordionItemProps {
  id: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  content: React.ReactNode;
  defaultOpen?: boolean;
}

export interface CopilotAccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  items: CopilotAccordionItemProps[];
  allowMultiple?: boolean;
}

export const CopilotAccordion = React.forwardRef<HTMLDivElement, CopilotAccordionProps>(
  ({ className, items, allowMultiple = false, ...props }, ref) => {
    const [openItems, setOpenItems] = useState<Set<string>>(
      new Set(items.filter(item => item.defaultOpen).map(item => item.id))
    );

    const toggleItem = (id: string) => {
      setOpenItems(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          if (!allowMultiple) {
            newSet.clear();
          }
          newSet.add(id);
        }
        return newSet;
      });
    };

    return (
      <div ref={ref} className={cn('space-y-1', className)} {...props}>
        {items.map((item) => {
          const isOpen = openItems.has(item.id);
          return (
            <div key={item.id} className="rounded-lg border border-gray-200/60 bg-white">
              <button
                onClick={() => toggleItem(item.id)}
                className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors duration-150 hover:bg-gray-50/50"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {item.icon && (
                    <div className="flex-shrink-0 text-gray-400">
                      {item.icon}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {item.title}
                      </span>
                      {item.badge}
                    </div>
                    {item.subtitle && (
                      <p className="mt-0.5 text-xs text-gray-500">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>
                <svg
                  className={cn(
                    'ml-2 h-4 w-4 flex-shrink-0 text-gray-400 transition-transform duration-200',
                    isOpen && 'rotate-180'
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isOpen && (
                <div className="border-t border-gray-200/60 px-4 py-3">
                  {item.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }
);

CopilotAccordion.displayName = 'CopilotAccordion';

/**
 * CopilotButton - Clean, minimal button
 */
export interface CopilotButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const CopilotButton = React.forwardRef<HTMLButtonElement, CopilotButtonProps>(
  ({ className, variant = 'secondary', size = 'md', icon, iconPosition = 'left', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          {
            'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800': variant === 'primary',
            'bg-white border border-gray-200/60 text-gray-700 hover:bg-gray-50 active:bg-gray-100': variant === 'secondary',
            'bg-transparent text-gray-700 hover:bg-gray-50 active:bg-gray-100': variant === 'ghost',
            'px-3 py-1.5 text-sm': size === 'md',
            'px-2 py-1 text-xs': size === 'sm',
          },
          className
        )}
        {...props}
      >
        {icon && iconPosition === 'left' && icon}
        {children}
        {icon && iconPosition === 'right' && icon}
      </button>
    );
  }
);

CopilotButton.displayName = 'CopilotButton';

/**
 * CopilotCodeBlock - Code display with Copilot styling
 */
export interface CopilotCodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
  language?: string;
  code: string;
  showLineNumbers?: boolean;
}

export const CopilotCodeBlock = React.forwardRef<HTMLPreElement, CopilotCodeBlockProps>(
  ({ className, language, code, showLineNumbers, ...props }, ref) => {
    const lines = code.split('\n');
    
    return (
      <div className="rounded-lg border border-gray-200/60 bg-gray-50/50 overflow-hidden">
        {language && (
          <div className="border-b border-gray-200/60 px-3 py-1.5 text-xs text-gray-500">
            {language}
          </div>
        )}
        <pre
          ref={ref}
          className={cn('overflow-x-auto p-3 text-sm', className)}
          {...props}
        >
          <code className="font-mono text-gray-900">
            {showLineNumbers ? (
              lines.map((line, idx) => (
                <div key={idx} className="flex gap-4">
                  <span className="select-none text-gray-400 w-8 text-right flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span>{line}</span>
                </div>
              ))
            ) : (
              code
            )}
          </code>
        </pre>
      </div>
    );
  }
);

CopilotCodeBlock.displayName = 'CopilotCodeBlock';

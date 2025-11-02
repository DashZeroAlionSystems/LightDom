/**
 * Checkbox Component - Material Design 3
 * Accessible checkbox with Material Design 3 styling
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';

const checkboxVariants = cva(
  [
    'peer relative h-5 w-5 shrink-0 rounded-sm border border-outline',
    'bg-surface text-on-surface',
    'transition-all duration-medium-2 ease-standard',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
    'hover:border-primary',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-outline',
    'data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-on-primary',
    'data-[state=indeterminate]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:text-on-primary'
  ]
);

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof checkboxVariants> {
  /**
   * Whether the checkbox is in an indeterminate state
   */
  indeterminate?: boolean;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, indeterminate, ...props }, ref) => {
    const checkboxRef = React.useRef<HTMLInputElement>(null);
    const mergedRef = (ref as React.Ref<HTMLInputElement>) || checkboxRef;

    React.useEffect(() => {
      if (mergedRef && typeof mergedRef === 'object' && mergedRef.current) {
        mergedRef.current.indeterminate = !!indeterminate;
      }
    }, [indeterminate, mergedRef]);

    return (
      <div className="relative">
        <input
          type="checkbox"
          ref={mergedRef}
          className={cn('sr-only peer')}
          {...props}
        />
        <div
          className={cn(
            checkboxVariants({ className }),
            'flex items-center justify-center'
          )}
          data-state={
            indeterminate
              ? 'indeterminate'
              : props.checked
              ? 'checked'
              : 'unchecked'
          }
        >
          {indeterminate ? (
            <div className="w-3 h-0.5 bg-current rounded-full" />
          ) : props.checked ? (
            <Check className="w-3 h-3" />
          ) : null}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox, checkboxVariants };
export type { CheckboxProps };

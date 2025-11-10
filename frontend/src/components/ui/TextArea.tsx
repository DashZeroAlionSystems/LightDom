import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const textareaVariants = cva(
  [
    'w-full rounded-xl border border-outline bg-surface text-on-surface transition-colors duration-medium-2 ease-standard',
    'placeholder:text-on-surface-variant/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-70'
  ],
  {
    variants: {
      size: {
        sm: 'px-3 py-2 text-body-sm',
        md: 'px-4 py-3 text-body-md',
        lg: 'px-5 py-4 text-body-lg'
      },
      state: {
        default: '',
        error: 'border-error focus-visible:ring-error',
        success: 'border-success focus-visible:ring-success'
      }
    },
    defaultVariants: {
      size: 'md',
      state: 'default'
    }
  }
);

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  label?: string;
  helperText?: string;
  error?: string;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, size, state, label, helperText, error, id, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id ?? generatedId;
    const effectiveState = error ? 'error' : state ?? 'default';

    return (
      <div className='space-y-1'>
        {label ? (
          <label
            htmlFor={textareaId}
            className='md3-label-medium text-on-surface'
          >
            {label}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(textareaVariants({ size, state: effectiveState }), className)}
          {...props}
        />
        {(helperText || error) && (
          <p className={cn('md3-body-small px-1 text-on-surface-variant', error && 'text-error')}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export { TextArea, textareaVariants };
export type { TextAreaProps };

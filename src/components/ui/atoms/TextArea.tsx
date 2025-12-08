/**
 * TextArea Atom - Reusable textarea with floating label support
 * Matches the Input.tsx styling and exposes a small, consistent API.
 */

import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

const textareaVariants = cva(
  [
    'w-full rounded-md transition-all duration-150 ease-in-out',
    'text-base text-gray-800 placeholder:text-gray-400',
    'focus:outline-none focus:ring-2 focus:ring-blue-500',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ],
  {
    variants: {
      variant: {
        outlined: 'border border-gray-300 bg-white',
        filled: 'bg-gray-50 border-0',
      },
      size: {
        sm: 'text-sm p-2',
        md: 'text-base p-3',
        lg: 'text-lg p-4',
      },
    },
    defaultVariants: {
      variant: 'outlined',
      size: 'md',
    },
  }
);

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  label?: string;
  helper?: string;
  error?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, variant, size, label, helper, error, ...props }, ref) => {
    const hasLabel = Boolean(label);

    return (
      <div className={cn('space-y-1 w-full')}>
        {hasLabel && <label className='block text-sm font-medium text-gray-700'>{label}</label>}
        <textarea
          ref={ref}
          className={cn(textareaVariants({ variant, size }), className)}
          {...props}
        />
        {error ? (
          <p className='text-xs text-red-600'>{error}</p>
        ) : (
          helper && <p className='text-xs text-gray-500'>{helper}</p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;

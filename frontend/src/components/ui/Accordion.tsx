import React, { useState, createContext, useContext } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

const accordionVariants = cva('', {
  variants: {
    variant: {
      default: '',
      bordered: 'border border-outline rounded-xl',
      ghost: '',
    },
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

const accordionItemVariants = cva(
  'border-b border-outline-variant last:border-b-0 transition-all duration-medium-2 ease-emphasized',
  {
    variants: {
      variant: {
        default: '',
        bordered: 'border-outline',
        ghost: 'border-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const accordionTriggerVariants = cva(
  [
    'flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline',
    'text-on-surface hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
    'cursor-pointer select-none',
  ],
  {
    variants: {
      size: {
        sm: 'text-sm py-3',
        md: 'text-base py-4',
        lg: 'text-lg py-5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const accordionContentVariants = cva(
  'overflow-hidden text-on-surface transition-all duration-medium-2 ease-emphasized',
  {
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

interface AccordionContextValue {
  type: 'single' | 'multiple';
  collapsible: boolean;
  value: string | string[];
  onValueChange: (value: string | string[]) => void;
  variant: VariantProps<typeof accordionVariants>['variant'];
  size: VariantProps<typeof accordionVariants>['size'];
}

const AccordionContext = createContext<AccordionContextValue | null>(null);
const AccordionItemContext = createContext<string | null>(null);

export interface AccordionProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof accordionVariants> {
  type?: 'single' | 'multiple';
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  collapsible?: boolean;
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  (
    {
      type = 'single',
      value,
      defaultValue,
      onValueChange,
      variant,
      size,
      className,
      children,
      collapsible = false,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState<string | string[]>(
      defaultValue || (type === 'multiple' ? [] : '')
    );

    const currentValue = value !== undefined ? value : internalValue;

    const handleValueChange = (newValue: string | string[]) => {
      setInternalValue(newValue);
      onValueChange?.(newValue);
    };

    return (
      <AccordionContext.Provider
        value={{
          type,
          collapsible,
          value: currentValue,
          onValueChange: handleValueChange,
          variant,
          size,
        }}
      >
        <div
          ref={ref}
          className={cn(accordionVariants({ variant, size }), className)}
          {...props}
        >
          {children}
        </div>
      </AccordionContext.Provider>
    );
  }
);

Accordion.displayName = 'Accordion';

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ value, className, children, ...props }, ref) => {
    const context = useContext(AccordionContext);
    if (!context) {
      throw new Error('AccordionItem must be used within an Accordion');
    }

    return (
      <AccordionItemContext.Provider value={value}>
        <div
          ref={ref}
          className={cn(accordionItemVariants({ variant: context.variant }), className)}
          data-accordion-item
          data-value={value}
          {...props}
        >
          {children}
        </div>
      </AccordionItemContext.Provider>
    );
  }
);

AccordionItem.displayName = 'AccordionItem';

export interface AccordionTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, children, asChild, ...props }, ref) => {
    const context = useContext(AccordionContext);
    const itemValue = useContext(AccordionItemContext);
    if (!context) {
      throw new Error('AccordionTrigger must be used within an AccordionItem');
    }
    if (!itemValue) {
      throw new Error('AccordionTrigger must have an associated item value');
    }

    const handleClick = () => {
      const { type, value, onValueChange } = context;

      if (type === 'single') {
        const isCurrentlyOpen = value === itemValue;
        if (isCurrentlyOpen) {
          if (context.collapsible) {
            onValueChange('');
          }
        } else {
          onValueChange(itemValue);
        }
      } else {
        const currentValues = Array.isArray(value) ? value : [];
        const newValues = currentValues.includes(itemValue)
          ? currentValues.filter(v => v !== itemValue)
          : [...currentValues, itemValue];
        onValueChange(newValues);
      }
    };

    const isOpen =
      context.type === 'single'
        ? context.value === itemValue
        : Array.isArray(context.value) && context.value.includes(itemValue);

    if (asChild) {
      return React.cloneElement(children as React.ReactElement, {
        onClick: handleClick,
        'aria-expanded': isOpen,
        'aria-controls': `accordion-content-${itemValue}`,
        ...props,
      });
    }

    return (
      <button
        ref={ref}
        className={cn(accordionTriggerVariants({ size: context.size }), className)}
        onClick={handleClick}
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${itemValue}`}
        data-state={isOpen ? 'open' : 'closed'}
        {...props}
      >
        {children}
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>
    );
  }
);

AccordionTrigger.displayName = 'AccordionTrigger';

export interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, children, ...props }, ref) => {
    const context = useContext(AccordionContext);
    const itemValue = useContext(AccordionItemContext);
    if (!context) {
      throw new Error('AccordionContent must be used within an AccordionItem');
    }
    if (!itemValue) {
      throw new Error('AccordionContent must have an associated item value');
    }

    const isOpen =
      context.type === 'single'
        ? context.value === itemValue
        : Array.isArray(context.value) && context.value.includes(itemValue);

    return (
      <div
        ref={ref}
        className={cn(
          accordionContentVariants({ size: context.size }),
          'data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up'
        )}
        style={{
          display: isOpen ? 'block' : 'none',
        }}
        id={`accordion-content-${itemValue}`}
        data-state={isOpen ? 'open' : 'closed'}
        {...props}
      >
        <div className='pb-4 pt-0'>{children}</div>
      </div>
    );
  }
);

AccordionContent.displayName = 'AccordionContent';

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };

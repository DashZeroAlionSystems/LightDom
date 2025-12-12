import React, { useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';
import { Typography } from '../../atoms/Typography';

const accordionItemStyles = cva('border-b border-border transition-colors', {
  variants: {
    variant: {
      default: 'bg-background',
      bordered: 'border rounded-lg mb-2 bg-background',
      filled: 'bg-muted rounded-lg mb-2',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const accordionHeaderStyles = cva(
  'flex items-center justify-between w-full p-4 text-left cursor-pointer hover:bg-accent/50 transition-colors',
  {
    variants: {
      variant: {
        default: '',
        bordered: 'rounded-t-lg',
        filled: 'rounded-lg',
      },
      open: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        variant: 'bordered',
        open: false,
        class: 'rounded-lg',
      },
      {
        variant: 'filled',
        open: false,
        class: 'rounded-lg',
      },
    ],
  }
);

const accordionContentStyles = cva('overflow-hidden transition-all', {
  variants: {
    open: {
      true: 'max-h-[1000px] opacity-100',
      false: 'max-h-0 opacity-0',
    },
  },
  defaultVariants: {
    open: false,
  },
});

export interface AccordionItem {
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionProps extends VariantProps<typeof accordionItemStyles> {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpenIndexes?: number[];
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  defaultOpenIndexes = [],
  variant,
  className,
}) => {
  const [openIndexes, setOpenIndexes] = useState<number[]>(defaultOpenIndexes);

  const toggleItem = (index: number, disabled?: boolean) => {
    if (disabled) return;

    if (allowMultiple) {
      setOpenIndexes((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    } else {
      setOpenIndexes((prev) => (prev.includes(index) ? [] : [index]));
    }
  };

  return (
    <div className={className}>
      {items.map((item, index) => {
        const isOpen = openIndexes.includes(index);

        return (
          <div
            key={index}
            className={accordionItemStyles({ variant })}
            style={{ opacity: item.disabled ? 0.5 : 1 }}
          >
            <button
              className={accordionHeaderStyles({ variant, open: isOpen })}
              onClick={() => toggleItem(index, item.disabled)}
              disabled={item.disabled}
            >
              <div className="flex items-center gap-3">
                {item.icon && <span>{item.icon}</span>}
                <Typography variant="body1" className="font-medium">
                  {item.title}
                </Typography>
              </div>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <div className={accordionContentStyles({ open: isOpen })}>
              <div className="p-4 pt-0">{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

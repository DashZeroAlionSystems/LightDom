import React, { useState, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';
import { Button } from '../../atoms/Button';

const dropdownStyles = cva(
  'absolute z-50 min-w-[8rem] rounded-md border bg-popover p-1 shadow-md',
  {
    variants: {
      placement: {
        bottom: 'top-full mt-2',
        top: 'bottom-full mb-2',
        left: 'right-full mr-2 top-0',
        right: 'left-full ml-2 top-0',
      },
      align: {
        start: 'left-0',
        center: 'left-1/2 -translate-x-1/2',
        end: 'right-0',
      },
    },
    defaultVariants: {
      placement: 'bottom',
      align: 'start',
    },
  }
);

const dropdownItemStyles = cva(
  'relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none transition-colors',
  {
    variants: {
      variant: {
        default: 'hover:bg-accent hover:text-accent-foreground',
        destructive: 'text-destructive hover:bg-destructive/10',
      },
      disabled: {
        true: 'pointer-events-none opacity-50',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      disabled: false,
    },
  }
);

export interface DropdownMenuItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  destructive?: boolean;
  onClick?: () => void;
}

export interface DropdownMenuProps extends VariantProps<typeof dropdownStyles> {
  trigger?: React.ReactNode;
  triggerLabel?: string;
  items: DropdownMenuItem[];
  onSelect?: (value: string) => void;
  className?: string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  triggerLabel = 'Menu',
  items,
  onSelect,
  placement,
  align,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleItemClick = (item: DropdownMenuItem) => {
    if (!item.disabled) {
      item.onClick?.();
      onSelect?.(item.value);
      setIsOpen(false);
    }
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className || ''}`}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger || (
          <Button variant="outline" size="md" className="flex items-center gap-2">
            {triggerLabel}
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        )}
      </div>

      {isOpen && (
        <div className={dropdownStyles({ placement, align })}>
          {items.map((item, index) => (
            <div
              key={`${item.value}-${index}`}
              className={dropdownItemStyles({
                variant: item.destructive ? 'destructive' : 'default',
                disabled: item.disabled,
              })}
              onClick={() => handleItemClick(item)}
            >
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

const drawerVariants = cva(
  [
    'fixed z-drawer flex flex-col',
    'bg-surface-container-high text-on-surface',
    'border border-outline-variant',
    'shadow-level-3',
    'transition-transform duration-medium-2 ease-emphasized'
  ],
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b',
        bottom: 'inset-x-0 bottom-0 border-t',
        left: 'inset-y-0 left-0 border-r w-80',
        right: 'inset-y-0 right-0 border-l w-80'
      },
      size: {
        sm: 'w-64',
        md: 'w-80',
        lg: 'w-96',
        xl: 'w-[28rem]',
        full: 'w-full'
      }
    },
    compoundVariants: [
      {
        side: 'top',
        class: 'max-h-[80vh]'
      },
      {
        side: 'bottom',
        class: 'max-h-[80vh]'
      },
      {
        side: ['left', 'right'],
        size: 'sm',
        class: 'w-64'
      },
      {
        side: ['left', 'right'],
        size: 'md',
        class: 'w-80'
      },
      {
        side: ['left', 'right'],
        size: 'lg',
        class: 'w-96'
      },
      {
        side: ['left', 'right'],
        size: 'xl',
        class: 'w-[28rem]'
      }
    ],
    defaultVariants: {
      side: 'right',
      size: 'md'
    }
  }
);

const drawerOverlayVariants = cva(
  'fixed inset-0 z-drawer-overlay bg-black/50 backdrop-blur-sm transition-opacity duration-medium-2 ease-emphasized',
  {
    variants: {
      blur: {
        none: '',
        sm: 'backdrop-blur-sm',
        md: 'backdrop-blur-md',
        lg: 'backdrop-blur-lg'
      }
    },
    defaultVariants: {
      blur: 'sm'
    }
  }
);

export interface DrawerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof drawerVariants>,
    VariantProps<typeof drawerOverlayVariants> {
  isOpen: boolean;
  onClose: () => void;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  preventScroll?: boolean;
}

const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(
  ({
    isOpen,
    onClose,
    closeOnOverlayClick = true,
    closeOnEscape = true,
    showCloseButton = true,
    preventScroll = true,
    side = 'right',
    size,
    blur,
    className,
    children,
    ...props
  }, ref) => {
    const drawerRef = useRef<HTMLDivElement>(null);

    // Handle escape key
    useEffect(() => {
      if (!isOpen || !closeOnEscape) return;

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, closeOnEscape, onClose]);

    // Prevent body scroll
    useEffect(() => {
      if (isOpen && preventScroll) {
        document.body.style.overflow = 'hidden';
        return () => {
          document.body.style.overflow = 'unset';
        };
      }
    }, [isOpen, preventScroll]);

    // Focus management
    useEffect(() => {
      if (isOpen) {
        const focusableElements = drawerRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements?.[0] as HTMLElement;
        firstElement?.focus();
      }
    }, [isOpen]);

    const handleOverlayClick = (event: React.MouseEvent) => {
      if (closeOnOverlayClick && event.target === event.currentTarget) {
        onClose();
      }
    };

    const getTransformClasses = () => {
      if (!isOpen) {
        switch (side) {
          case 'top': return '-translate-y-full';
          case 'bottom': return 'translate-y-full';
          case 'left': return '-translate-x-full';
          case 'right': return 'translate-x-full';
        }
      }
      return '';
    };

    if (!isOpen) return null;

    return (
      <>
        {/* Overlay */}
        <div
          className={cn(drawerOverlayVariants({ blur }))}
          onClick={handleOverlayClick}
        />

        {/* Drawer */}
        <div
          ref={(el) => {
            if (typeof ref === 'function') ref(el);
            else if (ref) ref.current = el;
            drawerRef.current = el;
          }}
          className={cn(
            drawerVariants({ side, size }),
            getTransformClasses(),
            className
          )}
          role="dialog"
          aria-modal="true"
          {...props}
        >
          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface transition-colors z-10"
              aria-label="Close drawer"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          {children}
        </div>
      </>
    );
  }
);

Drawer.displayName = 'Drawer';

// Drawer sub-components for better composition
interface DrawerHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

const DrawerHeader: React.FC<DrawerHeaderProps> = ({
  title,
  description,
  className,
  children,
  ...props
}) => (
  <div className={cn('flex flex-col gap-2 p-6 pb-4', className)} {...props}>
    {title && (
      <h2 className="md3-headline-small text-on-surface">{title}</h2>
    )}
    {description && (
      <p className="md3-body-medium text-on-surface-variant">{description}</p>
    )}
    {children}
  </div>
);

const DrawerContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('flex-1 overflow-auto px-6', className)} {...props}>
    {children}
  </div>
);

interface DrawerFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end' | 'between';
}

const DrawerFooter: React.FC<DrawerFooterProps> = ({
  align = 'end',
  className,
  children,
  ...props
}) => {
  const alignClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between'
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-6 py-4 border-t border-outline-variant',
        alignClasses[align],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export { Drawer, DrawerHeader, DrawerContent, DrawerFooter };

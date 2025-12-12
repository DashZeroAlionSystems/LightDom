import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

const typographyVariants = cva('transition-colors', {
  variants: {
    variant: {
      h1: 'text-4xl md:text-5xl font-bold tracking-tight',
      h2: 'text-3xl md:text-4xl font-bold tracking-tight',
      h3: 'text-2xl md:text-3xl font-semibold',
      h4: 'text-xl md:text-2xl font-semibold',
      h5: 'text-lg md:text-xl font-medium',
      h6: 'text-base md:text-lg font-medium',
      body1: 'text-base leading-relaxed',
      body2: 'text-sm leading-relaxed',
      subtitle1: 'text-lg font-medium',
      subtitle2: 'text-base font-medium',
      caption: 'text-xs text-foreground/60',
      overline: 'text-xs uppercase tracking-wider font-medium',
      code: 'font-mono text-sm bg-muted px-1.5 py-0.5 rounded',
      lead: 'text-xl text-foreground/80 leading-relaxed',
    },
    color: {
      default: 'text-foreground',
      primary: 'text-primary',
      secondary: 'text-foreground/60',
      muted: 'text-muted-foreground',
      success: 'text-green-600 dark:text-green-400',
      warning: 'text-yellow-600 dark:text-yellow-400',
      error: 'text-red-600 dark:text-red-400',
      info: 'text-blue-600 dark:text-blue-400',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
  },
  defaultVariants: {
    variant: 'body1',
    color: 'default',
    align: 'left',
  },
});

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  /** Element type to render */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label';
  /** Truncate text with ellipsis */
  truncate?: boolean;
  /** Maximum number of lines before truncation */
  maxLines?: number;
  /** Disable text selection */
  noSelect?: boolean;
}

const variantToElement: Record<string, keyof JSX.IntrinsicElements> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  body1: 'p',
  body2: 'p',
  subtitle1: 'p',
  subtitle2: 'p',
  caption: 'span',
  overline: 'span',
  code: 'code',
  lead: 'p',
};

export const Typography: React.FC<TypographyProps> = ({
  as,
  variant = 'body1',
  color,
  align,
  weight,
  truncate,
  maxLines,
  noSelect,
  className,
  children,
  ...props
}) => {
  const Component = as || variantToElement[variant || 'body1'] || 'p';

  return (
    <Component
      className={cn(
        typographyVariants({ variant, color, align, weight }),
        truncate && 'truncate',
        maxLines && `line-clamp-${maxLines}`,
        noSelect && 'select-none',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

Typography.displayName = 'Typography';

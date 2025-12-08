import { cn } from '@/lib/utils';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { ButtonHTMLAttributes } from 'react';

export interface CopyControlProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Content to copy to clipboard */
  content: string;
  /** Display variant */
  variant?: 'icon' | 'text' | 'both';
  /** Size of the control */
  size?: 'sm' | 'md' | 'lg';
  /** Duration to show success state in ms */
  successDuration?: number;
  /** Callback after successful copy */
  onCopySuccess?: () => void;
}

export const CopyControl = ({
  content,
  variant = 'icon',
  size = 'md',
  successDuration = 2000,
  onCopySuccess,
  className,
  ...props
}: CopyControlProps) => {
  const [copied, setCopied] = useState(false);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const buttonSizeClasses = {
    sm: 'p-1 text-xs',
    md: 'p-1.5 text-sm',
    lg: 'p-2 text-base',
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      onCopySuccess?.();
      setTimeout(() => setCopied(false), successDuration);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const Icon = copied ? Check : Copy;
  const showText = variant === 'text' || variant === 'both';
  const showIcon = variant === 'icon' || variant === 'both';

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg transition-all duration-200',
        'hover:bg-surface-container-highest',
        copied
          ? 'text-success'
          : 'text-on-surface-variant hover:text-on-surface',
        buttonSizeClasses[size],
        className
      )}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
      aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
      {...props}
    >
      {showIcon && <Icon className={cn(sizeClasses[size])} />}
      {showText && (
        <span className="font-medium">{copied ? 'Copied!' : 'Copy'}</span>
      )}
    </button>
  );
};

CopyControl.displayName = 'CopyControl';

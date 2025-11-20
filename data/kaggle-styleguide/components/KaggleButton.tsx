import React from 'react';
import { cn } from '@/lib/utils';

interface KaggleButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  disabled?: boolean;
}

export const KaggleButton: React.FC<KaggleButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'medium',
  onClick,
  disabled = false,
}) => {
  return (
    <button
      className={cn(
        'rounded font-medium transition-all duration-200',
        {
          'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
          'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
          'border border-blue-600 text-blue-600 hover:bg-blue-50': variant === 'outlined',
          'text-blue-600 hover:bg-blue-50': variant === 'text',
          'px-3 py-1.5 text-sm': size === 'small',
          'px-4 py-2 text-base': size === 'medium',
          'px-6 py-3 text-lg': size === 'large',
          'opacity-50 cursor-not-allowed': disabled,
        },
        className
      )}
      onClick={onClick}
      disabled={disabled}
      style={{
        borderRadius: '50%',
        fontWeight: '400',
        transition: '0.3s',
      }}
    >
      {children}
    </button>
  );
};
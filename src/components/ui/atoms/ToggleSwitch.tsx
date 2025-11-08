import React from 'react';
import { cn } from '@/lib/utils';

export interface ToggleSwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  label?: React.ReactNode;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  size = 'md',
  label,
  disabled,
  ...props
}) => {
  const sizeMap: Record<string, { track: string; thumb: string; translate: string }> = {
    sm: { track: 'w-9 h-5', thumb: 'w-4 h-4', translate: 'translate-x-4' },
    md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 'translate-x-5' },
    lg: { track: 'w-14 h-8', thumb: 'w-7 h-7', translate: 'translate-x-7' },
  };

  const sizes = sizeMap[size] || sizeMap.md;

  return (
    <label className={cn('inline-flex items-center gap-3', disabled && 'opacity-60') }>
      {label && <span className="text-sm text-gray-700">{label}</span>}

      <span className="relative inline-flex items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
          {...props}
        />

        <span
          className={cn(
            `${sizes.track} rounded-full transition-colors duration-200 bg-gray-300 peer-checked:bg-blue-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400`,
          )}
        />

        <span
          aria-hidden
          className={cn(
            `absolute left-1 top-1 bg-white rounded-full shadow transform transition-transform duration-200`,
            sizes.thumb,
            `peer-checked:${sizes.translate}`
          )}
        />
      </span>
    </label>
  );
};

export default ToggleSwitch;

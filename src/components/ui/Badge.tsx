import React from 'react';

export const Badge: React.FC<React.HTMLAttributes<HTMLSpanElement> & { variant?: 'secondary' | 'default' }> = ({
  className = '',
  variant = 'default',
  ...props
}) => {
  const base = 'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium';
  const variantClass = variant === 'secondary' ? 'bg-gray-200 text-gray-800' : 'bg-blue-600 text-white';
  return <span className={`${base} ${variantClass} ${className}`} {...props} />;
};

export default Badge;
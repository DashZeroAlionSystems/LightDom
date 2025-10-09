import React from 'react';

export const Alert: React.FC<React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'destructive' }> = ({
  className = '',
  variant = 'default',
  children,
  ...props
}) => {
  const base = 'rounded border p-3';
  const variantClass = variant === 'destructive' ? 'border-red-300 bg-red-50 text-red-800' : 'border-blue-300 bg-blue-50 text-blue-800';
  return <div className={`${base} ${variantClass} ${className}`} {...props}>{children}</div>;
};

export const AlertDescription: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
  <div className={`text-sm ${className}`} {...props} />
);

export default Alert;



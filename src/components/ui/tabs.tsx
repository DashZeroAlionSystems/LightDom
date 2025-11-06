import React from 'react';

export const Tabs: React.FC<React.HTMLAttributes<HTMLDivElement> & { value: string; onValueChange: (v: string) => void }> = ({
  className = '',
  children,
}) => (
  <div className={className}>{children}</div>
);

export const TabsList: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div className={`flex gap-2 ${className}`} {...props}>{children}</div>
);

export const TabsTrigger: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }> = ({ className = '', children, ...props }) => (
  <button className={`px-3 py-2 rounded border ${className}`} {...props}>{children}</button>
);

export const TabsContent: React.FC<React.HTMLAttributes<HTMLDivElement> & { value: string }> = ({ className = '', children, ...props }) => (
  <div className={className} {...props}>{children}</div>
);

export default Tabs;



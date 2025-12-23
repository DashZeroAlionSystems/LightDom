import React from 'react';

export const Dialog: React.FC<React.HTMLAttributes<HTMLDivElement> & { open: boolean; onOpenChange: (v: boolean) => void }> = ({
  open,
  onOpenChange,
  children,
  className = '',
}) => (
  <div className={`${className}`}>{open ? children : null}</div>
);

export const DialogTrigger: React.FC<{ asChild?: boolean } & React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

export const DialogContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
  <div className={`border rounded p-4 bg-white ${className}`} {...props} />
);

export const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
  <div className={`mb-2 ${className}`} {...props} />
);

export const DialogTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className = '', ...props }) => (
  <h3 className={`text-lg font-semibold ${className}`} {...props} />
);

export default Dialog;



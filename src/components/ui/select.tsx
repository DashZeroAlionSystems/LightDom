import React from 'react';

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className = '', children, ...props }) => (
  <select className={`border rounded px-3 py-2 w-full border-gray-300 focus:outline-none focus:ring focus:border-blue-300 ${className}`} {...props}>
    {children}
  </select>
);

export const SelectTrigger: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div className={`border rounded px-3 py-2 ${className}`} {...props}>{children}</div>
);

export const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => (
  <span className="text-gray-500">{placeholder}</span>
);

export const SelectContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div className={`mt-1 rounded border bg-white shadow ${className}`} {...props}>{children}</div>
);

export const SelectItem: React.FC<React.HTMLAttributes<HTMLDivElement> & { value: string }> = ({ className = '', children, ...props }) => (
  <div className={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${className}`} {...props}>{children}</div>
);

export default Select;



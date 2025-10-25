import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
};

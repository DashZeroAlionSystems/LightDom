import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';

interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarContainer');
  }
  return context;
};

interface SidebarContainerProps {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
  className?: string;
  collapsedWidth?: string;
  expandedWidth?: string;
}

export const SidebarContainer: React.FC<SidebarContainerProps> = ({
  children,
  defaultCollapsed = false,
  className,
  collapsedWidth = 'w-20',
  expandedWidth = 'w-64',
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const toggleCollapsed = () => setCollapsed(!collapsed);

  const contextValue: SidebarContextValue = {
    collapsed,
    setCollapsed,
    toggleCollapsed,
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      <aside
        className={cn(
          'flex flex-col bg-card border-r border-border transition-all duration-300 ease-in-out',
          collapsed ? collapsedWidth : expandedWidth,
          className
        )}
      >
        {children}
      </aside>
    </SidebarContext.Provider>
  );
};

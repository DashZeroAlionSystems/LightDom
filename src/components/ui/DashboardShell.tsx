/**
 * DashboardShell Component - Material Design 3
 * Unified layout for admin and client dashboards with responsive sidebar
 */

import React, { useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Button } from './Button';
import { Avatar } from './Avatar';
import { Badge } from './Badge';

const shellVariants = cva(
  [
    'min-h-screen bg-surface-container-lowest text-on-surface',
    'transition-all duration-medium-2 ease-standard'
  ],
  {
    variants: {
      mode: {
        admin: 'bg-surface-container-lowest',
        client: 'bg-surface',
        dashboard: 'bg-surface-container-lowest'
      }
    },
    defaultVariants: {
      mode: 'dashboard'
    }
  }
);

const sidebarVariants = cva(
  [
    'fixed left-0 top-0 z-40 h-screen bg-surface-container border-r border-outline-variant',
    'transition-transform duration-medium-2 ease-emphasized',
    'flex flex-col'
  ],
  {
    variants: {
      collapsed: {
        true: 'w-16 -translate-x-0',
        false: 'w-64 translate-x-0'
      },
      mobile: {
        true: '-translate-x-full lg:translate-x-0',
        false: 'translate-x-0'
      }
    },
    defaultVariants: {
      collapsed: false,
      mobile: false
    }
  }
);

export interface DashboardShellProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof shellVariants> {
  /**
   * Navigation items for the sidebar
   */
  navigation?: NavigationItem[];
  /**
   * User information for the profile section
   */
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role?: string;
  };
  /**
   * Whether the sidebar should be collapsible
   */
  collapsible?: boolean;
  /**
   * Search functionality
   */
  onSearch?: (query: string) => void;
  /**
   * Header actions
   */
  headerActions?: React.ReactNode;
  /**
   * Footer content
   */
  footer?: React.ReactNode;
}

export interface NavigationItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  badge?: {
    content: string | number;
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  };
  children?: NavigationItem[];
  divider?: boolean;
  section?: string;
}

const DashboardShell = React.forwardRef<HTMLDivElement, DashboardShellProps>(
  ({ 
    className,
    mode,
    navigation = [],
    user,
    collapsible = true,
    onSearch,
    headerActions,
    footer,
    children,
    ...props 
  }, ref) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const toggleSidebar = () => {
      setSidebarCollapsed(!sidebarCollapsed);
    };

    const toggleMobileMenu = () => {
      setMobileMenuOpen(!mobileMenuOpen);
    };

    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if (onSearch) {
        onSearch(searchQuery);
      }
    };

    const renderNavigationItem = (item: NavigationItem) => {
      const isActive = item.active;
      
      return (
        <div key={item.id}>
          {item.section && !sidebarCollapsed && (
            <div className="px-3 py-2">
              <h3 className="text-label-sm font-medium text-on-surface-variant uppercase tracking-wider">
                {item.section}
              </h3>
            </div>
          )}
          
          {item.divider && <hr className="my-2 border-outline-variant" />}
          
          <button
            onClick={item.onClick || (() => {})}
            className={cn(
              'flex items-center w-full px-3 py-2 text-left rounded-lg mx-2 mb-1',
              'transition-all duration-medium-2 ease-standard',
              'hover:bg-primary/8 focus:bg-primary/12 focus:outline-none',
              isActive && 'bg-primary/12 text-primary',
              !isActive && 'text-on-surface',
              sidebarCollapsed && 'justify-center px-2'
            )}
          >
            {item.icon && (
              <span className={cn(
                'flex-shrink-0 w-5 h-5',
                !sidebarCollapsed && 'mr-3'
              )}>
                {item.icon}
              </span>
            )}
            
            {!sidebarCollapsed && (
              <>
                <span className="flex-1 text-body-md font-medium">
                  {item.label}
                </span>
                
                {item.badge && (
                  <Badge 
                    variant={item.badge.variant || 'primary'} 
                    size="sm"
                  >
                    {item.badge.content}
                  </Badge>
                )}
              </>
            )}
          </button>
          
          {item.children && !sidebarCollapsed && (
            <div className="ml-8 space-y-1">
              {item.children.map(child => renderNavigationItem(child))}
            </div>
          )}
        </div>
      );
    };

    return (
      <div
        ref={ref}
        className={cn(shellVariants({ mode, className }))}
        {...props}
      >
        {/* Mobile menu backdrop */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-surface-dim/50 z-30 lg:hidden"
            onClick={toggleMobileMenu}
          />
        )}

        {/* Sidebar */}
        <aside className={cn(
          sidebarVariants({ 
            collapsed: sidebarCollapsed, 
            mobile: !mobileMenuOpen 
          })
        )}>
          {/* Sidebar header */}
          <div className="p-4 border-b border-outline-variant">
            {!sidebarCollapsed ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-on-primary font-bold text-sm">LD</span>
                </div>
                <div>
                  <h1 className="text-title-md font-semibold">LightDom</h1>
                  <p className="text-body-sm text-on-surface-variant">
                    {mode === 'admin' ? 'Admin Portal' : 'Dashboard'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-on-primary font-bold text-sm">LD</span>
                </div>
              </div>
            )}
          </div>

          {/* Search */}
          {onSearch && !sidebarCollapsed && (
            <div className="p-4 border-b border-outline-variant">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-surface-container-highest rounded-lg border border-outline focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              </form>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-2 overflow-y-auto">
            {navigation.map(item => renderNavigationItem(item))}
          </nav>

          {/* User profile */}
          {user && (
            <div className="p-4 border-t border-outline-variant">
              {!sidebarCollapsed ? (
                <div className="flex items-center gap-3">
                  <Avatar
                    src={user.avatar}
                    name={user.name}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-body-md font-medium truncate">
                      {user.name}
                    </p>
                    <p className="text-body-sm text-on-surface-variant truncate">
                      {user.email}
                    </p>
                  </div>
                  <Button size="sm" variant="text">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </Button>
                </div>
              ) : (
                <div className="flex justify-center">
                  <Avatar
                    src={user.avatar}
                    name={user.name}
                    size="md"
                  />
                </div>
              )}
            </div>
          )}

          {/* Sidebar toggle */}
          {collapsible && (
            <div className="p-2 border-t border-outline-variant">
              <Button
                variant="text"
                size="sm"
                onClick={toggleSidebar}
                fullWidth={!sidebarCollapsed}
                className={cn(sidebarCollapsed && 'mx-auto')}
              >
                <svg
                  className={cn(
                    'w-4 h-4 transition-transform duration-medium-2',
                    sidebarCollapsed && 'rotate-180'
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                {!sidebarCollapsed && <span className="ml-2">Collapse</span>}
              </Button>
            </div>
          )}
        </aside>

        {/* Main content */}
        <div className={cn(
          'transition-all duration-medium-2 ease-standard',
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        )}>
          {/* Mobile header */}
          <header className="lg:hidden bg-surface-container border-b border-outline-variant p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="text"
                size="sm"
                onClick={toggleMobileMenu}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
              
              <h1 className="text-title-lg font-semibold">
                {mode === 'admin' ? 'Admin Portal' : 'Dashboard'}
              </h1>
              
              {headerActions || (
                user && (
                  <Avatar
                    src={user.avatar}
                    name={user.name}
                    size="sm"
                  />
                )
              )}
            </div>
          </header>

          {/* Page content */}
          <main className="p-6">
            {children}
          </main>

          {/* Footer */}
          {footer && (
            <footer className="bg-surface-container border-t border-outline-variant p-4">
              {footer}
            </footer>
          )}
        </div>
      </div>
    );
  }
);

DashboardShell.displayName = 'DashboardShell';

export { DashboardShell, shellVariants };
export type { DashboardShellProps, NavigationItem };
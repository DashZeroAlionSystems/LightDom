/**
 * Dashboard Shell - Unified Layout for Admin and Client Views
 * Material Design 3 with responsive sidebar
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Moon,
  Sun,
  Wallet,
  Pickaxe,
  FolderKanban,
  HelpCircle,
  Cpu,
  Zap,
  DollarSign,
  TrendingUp,
  Globe,
  ShoppingCart,
  Wrench,
  Database,
  Shield,
  FileText,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  roles?: string[];
}

const adminNavItems: NavItem[] = [
  { title: 'Overview', href: '/admin', icon: LayoutDashboard },
  { title: 'Users', href: '/admin/users', icon: Users, badge: '12' },
  { title: 'Blockchain', href: '/admin/blockchain', icon: Cpu },
  { title: 'Automation', href: '/admin/automation', icon: Zap },
  { title: 'System', href: '/admin/system', icon: Settings },
  { title: 'Database', href: '/admin/database', icon: Database },
  { title: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { title: 'Billing', href: '/admin/billing', icon: DollarSign },
  { title: 'Security', href: '/admin/security', icon: Shield },
];

const clientNavItems: NavItem[] = [
  { title: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
  { title: 'Mining', href: '/dashboard/mining', icon: Pickaxe },
  { title: 'SEO Tools', href: '/dashboard/seo', icon: TrendingUp },
  { title: 'Metaverse', href: '/dashboard/metaverse', icon: Globe },
  { title: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
  { title: 'Marketplace', href: '/dashboard/marketplace', icon: ShoppingCart },
  { title: 'Tools', href: '/dashboard/tools', icon: Wrench },
  { title: 'Help', href: '/dashboard/help', icon: HelpCircle },
];

interface DashboardShellProps {
  children: React.ReactNode;
  mode?: 'admin' | 'client';
}

export default function DashboardShell({ children, mode = 'client' }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const { user, logout } = useEnhancedAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = mode === 'admin' ? adminNavItems : clientNavItems;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 bg-surface-container-low border-r border-outline transition-all duration-medium-3 ease-emphasized',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-outline">
          {sidebarOpen ? (
            <h1 className="text-title-lg font-heading font-semibold bg-gradient-primary bg-clip-text text-transparent">
              LightDom
            </h1>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-primary" />
          )}
          <Button
            variant="text"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-short-4',
                  'hover:bg-primary/8',
                  isActive && 'bg-primary/12 text-primary',
                  !isActive && 'text-on-surface'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-label-lg">{item.title}</span>
                    {item.badge && (
                      <Badge variant="primary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="border-t border-outline p-4">
          <div className="flex items-center gap-3">
            <Avatar
              name={user?.name || 'User'}
              size="md"
              src={user?.avatar}
            />
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-label-md font-medium text-on-surface truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-label-sm text-on-surface-variant truncate">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          'transition-all duration-medium-3 ease-emphasized',
          sidebarOpen ? 'pl-64' : 'pl-20'
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-40 bg-surface-container-low border-b border-outline backdrop-blur-lg bg-opacity-95">
          <div className="flex h-16 items-center justify-between px-6">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
                <input
                  type="search"
                  placeholder="Search..."
                  className="w-full h-10 pl-10 pr-4 rounded-full border border-outline bg-transparent text-body-md placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-border-focus transition-all"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="text"
                size="sm"
                onClick={() => setDarkMode(!darkMode)}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              
              <Button variant="text" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-error rounded-full" />
              </Button>
              
              <Button
                variant="outlined"
                size="sm"
                onClick={handleLogout}
                leftIcon={<LogOut className="h-4 w-4" />}
              >
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

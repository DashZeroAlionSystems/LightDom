/**
 * Design Tools Navigation
 * Navigation component for accessing design and development tools
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Palette,
  Database,
  Zap,
  Home,
  Settings,
  BarChart3,
  Users,
  Shield,
  Monitor,
  Code,
  Layers,
  Sparkles
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  description: string;
  category: 'core' | 'design' | 'admin' | 'development';
}

const DesignToolsNavigation: React.FC = () => {
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <Home className="h-5 w-5" />,
      description: 'Main dashboard overview',
      category: 'core'
    },
    {
      name: 'Training Data Pipeline',
      path: '/dashboard/training-data',
      icon: <Database className="h-5 w-5" />,
      description: 'ML training data visualization and management',
      category: 'development'
    },
    {
      name: 'Design System Guide',
      path: '/dashboard/design-system',
      icon: <Palette className="h-5 w-5" />,
      description: 'Material Design 3.0 system and components',
      category: 'design'
    },
    {
      name: 'Motion Showcase',
      path: '/dashboard/motion-showcase',
      icon: <Zap className="h-5 w-5" />,
      description: 'Animation demos and motion principles',
      category: 'design'
    },
    {
      name: 'Analytics',
      path: '/dashboard/analytics',
      icon: <BarChart3 className="h-5 w-5" />,
      description: 'System analytics and metrics',
      category: 'core'
    },
    {
      name: 'User Management',
      path: '/admin/users',
      icon: <Users className="h-5 w-5" />,
      description: 'User administration and management',
      category: 'admin'
    },
    {
      name: 'System Monitoring',
      path: '/admin/monitoring',
      icon: <Monitor className="h-5 w-5" />,
      description: 'System health and performance monitoring',
      category: 'admin'
    },
    {
      name: 'Security Settings',
      path: '/admin/security',
      icon: <Shield className="h-5 w-5" />,
      description: 'Security configuration and audit logs',
      category: 'admin'
    },
    {
      name: 'Settings',
      path: '/dashboard/settings',
      icon: <Settings className="h-5 w-5" />,
      description: 'Application settings and preferences',
      category: 'core'
    }
  ];

  const getCategoryColor = (category: NavItem['category']) => {
    switch (category) {
      case 'core':
        return 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100';
      case 'design':
        return 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100';
      case 'admin':
        return 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100';
      case 'development':
        return 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100';
    }
  };

  const getCategoryIcon = (category: NavItem['category']) => {
    switch (category) {
      case 'core':
        return <Home className="h-4 w-4" />;
      case 'design':
        return <Palette className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'development':
        return <Code className="h-4 w-4" />;
      default:
        return <Layers className="h-4 w-4" />;
    }
  };

  const categories = ['core', 'design', 'development', 'admin'] as const;

  return (
    <div className="min-h-screen bg-background-primary">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-full">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              LightDom Design Tools
            </h1>
          </div>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Comprehensive design system, development tools, and administrative interfaces
            for the LightDom Space-Bridge Platform
          </p>
        </div>

        {/* Navigation Grid */}
        <div className="space-y-8">
          {categories.map((category) => {
            const categoryItems = navItems.filter(item => item.category === category);

            return (
              <div key={category} className="space-y-4">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-muted rounded-lg">
                    {getCategoryIcon(category)}
                  </div>
                  <h2 className="text-2xl font-semibold capitalize">
                    {category} Tools
                  </h2>
                  <div className="flex-1 h-px bg-border ml-4" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryItems.map((item) => {
                    const isActive = location.pathname === item.path;

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`group block p-6 border-2 rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'border-accent-blue bg-accent-blue/5 shadow-lg scale-105'
                            : getCategoryColor(item.category)
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-accent-blue text-text-primary'
                              : 'bg-background-primary group-hover:bg-accent-blue/10'
                          }`}>
                            {item.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-semibold text-lg mb-2 ${
                              isActive ? 'text-accent-blue' : ''
                            }`}>
                              {item.name}
                            </h3>
                            <p className="text-sm text-text-secondary leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        {isActive && (
                          <div className="mt-4 flex items-center gap-2 text-accent-blue">
                            <div className="w-2 h-2 bg-accent-blue rounded-full animate-pulse" />
                            <span className="text-sm font-medium">Currently Active</span>
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-16 p-8 bg-card rounded-xl border">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Code className="h-5 w-5" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => window.open('/api/docs', '_blank')}
              className="p-4 border rounded-lg hover:bg-muted transition-colors text-left"
            >
              <div className="font-medium mb-1">API Documentation</div>
              <div className="text-sm text-text-secondary">View API endpoints and schemas</div>
            </button>
            <button
              onClick={async () => {
                try {
                  const res = await fetch('/api/admin/system-health');
                  if (!res.ok) return alert('Failed to fetch system health');
                  const json = await res.json();
                  alert('System Health: ' + (json?.data?.status || 'unknown'));
                } catch (err) {
                  alert('System Health check failed: ' + err.message);
                }
              }}
              className="p-4 border rounded-lg hover:bg-muted transition-colors text-left"
            >
              <div className="font-medium mb-1">System Health</div>
              <div className="text-sm text-text-secondary">Check API server status</div>
            </button>
            <button
              onClick={async () => {
                try {
                  const res = await fetch('/api/admin/quick-stats');
                  if (!res.ok) return alert('Failed to fetch quick stats');
                  const json = await res.json();
                  alert('Quick Stats:\n' + JSON.stringify(json.data, null, 2));
                } catch (err) {
                  alert('Quick stats failed: ' + err.message);
                }
              }}
              className="p-4 border rounded-lg hover:bg-muted transition-colors text-left"
            >
              <div className="font-medium mb-1">Admin Quick Stats</div>
              <div className="text-sm text-text-secondary">Fetch summary admin metrics</div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-text-secondary">
          <p className="text-sm">
            LightDom Space-Bridge Platform • Material Design 3.0 • React + TypeScript
          </p>
          <p className="text-xs mt-2">
            Built with ❤️ for blockchain-based DOM optimization
          </p>
        </div>
      </div>
    </div>
  );
};

export default DesignToolsNavigation;
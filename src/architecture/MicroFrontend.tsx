import React, { useEffect, useState, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// Micro-frontend registry
interface MicroFrontendConfig {
  name: string;
  url: string;
  version: string;
  dependencies: string[];
  routes: string[];
  permissions?: string[];
  tier?: 'starter' | 'professional' | 'enterprise';
}

const MICRO_FRONTENDS: MicroFrontendConfig[] = [
  {
    name: 'dashboard-core',
    url: '/mf/dashboard-core.js',
    version: '1.0.0',
    dependencies: ['react', 'react-dom'],
    routes: ['/', '/dashboard'],
    permissions: [],
    tier: 'starter'
  },
  {
    name: 'ai-ml-dashboard',
    url: '/mf/ai-ml-dashboard.js',
    version: '1.0.0',
    dependencies: ['react', 'react-dom', 'tensorflow'],
    routes: ['/ai-ml', '/neural-network'],
    permissions: ['ml.access'],
    tier: 'professional'
  },
  {
    name: 'enterprise-admin',
    url: '/mf/enterprise-admin.js',
    version: '1.0.0',
    dependencies: ['react', 'react-dom', 'react-query'],
    routes: ['/admin', '/enterprise'],
    permissions: ['admin.access'],
    tier: 'enterprise'
  },
  {
    name: 'research-portal',
    url: '/mf/research-portal.js',
    version: '1.0.0',
    dependencies: ['react', 'react-dom', 'd3'],
    routes: ['/research', '/analytics'],
    permissions: ['research.access'],
    tier: 'professional'
  }
];

// Micro-frontend loader
class MicroFrontendLoader {
  private loadedModules: Map<string, any> = new Map();
  private loadingPromises: Map<string, Promise<any>> = new Map();

  async loadModule(config: MicroFrontendConfig): Promise<any> {
    if (this.loadedModules.has(config.name)) {
      return this.loadedModules.get(config.name);
    }

    if (this.loadingPromises.has(config.name)) {
      return this.loadingPromises.get(config.name);
    }

    const loadPromise = new Promise<any>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = config.url;
      script.onload = () => {
        // Assume the module exposes itself globally with its name
        const module = (window as any)[config.name];
        if (module) {
          this.loadedModules.set(config.name, module);
          resolve(module);
        } else {
          reject(new Error(`Module ${config.name} not found`));
        }
      };
      script.onerror = () => reject(new Error(`Failed to load ${config.name}`));
      document.head.appendChild(script);
    });

    this.loadingPromises.set(config.name, loadPromise);
    return loadPromise;
  }

  async unloadModule(name: string): Promise<void> {
    if (this.loadedModules.has(name)) {
      this.loadedModules.delete(name);
      // Remove script tag
      const script = document.querySelector(`script[src*="${name}"]`);
      if (script) {
        script.remove();
      }
    }
  }
}

const loader = new MicroFrontendLoader();

// Micro-frontend boundary component
interface MicroFrontendProps {
  config: MicroFrontendConfig;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

const MicroFrontend: React.FC<MicroFrontendProps> = ({
  config,
  fallback,
  onLoad,
  onError
}) => {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loader.loadModule(config)
      .then((module) => {
        setComponent(() => module.default || module);
        onLoad?.();
      })
      .catch((err) => {
        setError(err);
        onError?.(err);
      });

    return () => {
      // Cleanup on unmount
      loader.unloadModule(config.name).catch(console.error);
    };
  }, [config.name, onLoad, onError]);

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-error mb-2">Failed to load {config.name}</div>
          <div className="text-sm text-on-surface-variant">{error.message}</div>
        </div>
      </div>
    );
  }

  if (!Component) {
    return fallback || (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-error mb-2">Error in {config.name}</div>
            <div className="text-sm text-on-surface-variant">Component failed to render</div>
          </div>
        </div>
      }
    >
      <Suspense fallback={fallback}>
        <Component />
      </Suspense>
    </ErrorBoundary>
  );
};

// Micro-frontend router
interface MicroFrontendRouterProps {
  routes: Array<{
    path: string;
    component: MicroFrontendConfig;
  }>;
  currentPath: string;
  userPermissions?: string[];
  userTier?: 'starter' | 'professional' | 'enterprise';
}

const MicroFrontendRouter: React.FC<MicroFrontendRouterProps> = ({
  routes,
  currentPath,
  userPermissions = [],
  userTier = 'starter'
}) => {
  const matchingRoute = routes.find(route => {
    // Simple path matching - in production, use a proper router
    return route.path === currentPath ||
           currentPath.startsWith(route.path + '/') ||
           (route.path === '/' && currentPath === '/');
  });

  if (!matchingRoute) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-2xl text-on-surface mb-2">404</div>
          <div className="text-on-surface-variant">Page not found</div>
        </div>
      </div>
    );
  }

  const { component } = matchingRoute;

  // Check permissions
  if (component.permissions && component.permissions.length > 0) {
    const hasPermission = component.permissions.some(perm =>
      userPermissions.includes(perm)
    );
    if (!hasPermission) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-error mb-2">Access Denied</div>
            <div className="text-sm text-on-surface-variant">
              You don't have permission to access this feature
            </div>
          </div>
        </div>
      );
    }
  }

  // Check tier
  if (component.tier) {
    const tierLevels = { starter: 1, professional: 2, enterprise: 3 };
    const requiredTier = tierLevels[component.tier];
    const userTierLevel = tierLevels[userTier];

    if (userTierLevel < requiredTier) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-warning mb-2">Upgrade Required</div>
            <div className="text-sm text-on-surface-variant">
              This feature requires {component.tier} tier or higher
            </div>
          </div>
        </div>
      );
    }
  }

  return <MicroFrontend config={component} />;
};

// Main application shell with micro-frontend orchestration
interface MicroFrontendShellProps {
  userPermissions?: string[];
  userTier?: 'starter' | 'professional' | 'enterprise';
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export const MicroFrontendShell: React.FC<MicroFrontendShellProps> = ({
  userPermissions = [],
  userTier = 'starter',
  currentPath = '/',
  onNavigate
}) => {
  const routes = MICRO_FRONTENDS.map(mf => ({
    path: mf.routes[0], // Primary route
    component: mf
  }));

  return (
    <div className="min-h-screen bg-surface">
      {/* Navigation Header */}
      <header className="border-b border-outline bg-surface-container-high px-6 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-xl font-semibold text-on-surface">LightDom</div>
            <div className="flex items-center gap-4">
              {MICRO_FRONTENDS.map(mf => {
                const hasAccess = mf.tier ?
                  ['starter', 'professional', 'enterprise'].indexOf(userTier) >=
                  ['starter', 'professional', 'enterprise'].indexOf(mf.tier) : true;

                return (
                  <button
                    key={mf.name}
                    onClick={() => onNavigate?.(mf.routes[0])}
                    disabled={!hasAccess}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                      hasAccess
                        ? 'text-on-surface hover:bg-surface-container'
                        : 'text-outline-variant cursor-not-allowed'
                    }`}
                  >
                    {mf.name.replace('-', ' ')}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-on-surface-variant capitalize">{userTier} Tier</span>
            <div className="h-2 w-2 rounded-full bg-success"></div>
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <MicroFrontendRouter
          routes={routes}
          currentPath={currentPath}
          userPermissions={userPermissions}
          userTier={userTier}
        />
      </main>

      {/* Status Bar */}
      <footer className="border-t border-outline bg-surface-container px-6 py-3">
        <div className="flex items-center justify-between text-sm text-on-surface-variant">
          <div className="flex items-center gap-4">
            <span>System Status: Operational</span>
            <span>•</span>
            <span>Micro-frontends: {MICRO_FRONTENDS.length} loaded</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Version: 1.0.0</span>
            <span>•</span>
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Export utilities
export { MICRO_FRONTENDS, MicroFrontendLoader };
export type { MicroFrontendConfig, MicroFrontendProps, MicroFrontendRouterProps, MicroFrontendShellProps };

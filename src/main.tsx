/**
 * Main Application Entry Point
 * LightDom Space Optimization System with Light DOM Slot Support
 */

import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import ModernFrontPage from './components/ModernFrontPage';
import LandingPage from './components/ui/LandingPage';
import SpaceMiningDashboard from './components/ui/SpaceMiningDashboard';
import BillingDashboard from './components/ui/BillingDashboard';
import BridgeAnalyticsDashboard from './components/ui/BridgeAnalyticsDashboard';
import LoginPage from './components/ui/auth/LoginPage';
import RegisterPage from './components/ui/auth/RegisterPage';
import DashboardOverview from './components/ui/dashboard/DashboardOverview';
import AdminDashboard from './components/ui/admin/AdminDashboard';
import MetaverseDashboard from './components/ui/MetaverseDashboard';
import WalletDashboard from './components/ui/wallet/WalletDashboard';
import { SEOOptimizationDashboard } from './components/SEOOptimizationDashboard';
import { EnhancedAuthProvider, useEnhancedAuth } from './contexts/EnhancedAuthContext';
import BackButton from './components/ui/BackButton';
import EnhancedNavigation from './components/ui/EnhancedNavigation';
import SEOCrawlerWorkflow from './components/ui/admin/SEOCrawlerWorkflow';
import './discord-theme.css';
import './index.css';
import './styles/modern-frontpage.css';

// Import styles
import './styles/animations.css';
import './styles/design-tokens.css';
import './styles/component-system.css';
import './styles/admin-dashboard.css';

const Guarded: React.FC<{ children: React.ReactNode, requireAdmin?: boolean }> = ({ children, requireAdmin }) => {
  const { isAuthenticated, isAdmin, loading, user } = useEnhancedAuth();
  
  console.log('Guarded component - isAuthenticated:', isAuthenticated, 'isAdmin:', isAdmin, 'loading:', loading, 'user:', user);
  
  if (loading) {
    console.log('Guarded: Still loading...');
    return <div>Loading...</div>;
  }
  if (!isAuthenticated) {
    console.log('Guarded: Not authenticated, redirecting to login');
    window.history.replaceState({}, '', '/login');
    return null;
  }
  if (requireAdmin && !isAdmin) {
    console.log('Guarded: Admin required but user is not admin, redirecting to dashboard');
    window.history.replaceState({}, '', '/dashboard');
    return null;
  }
  console.log('Guarded: Access granted');
  return <>{children}</>;
};

const AdminRedirectWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin } = useEnhancedAuth();
  
  React.useEffect(() => {
    if (isAdmin) {
      console.log('Admin user detected, redirecting to admin dashboard');
      window.history.replaceState({}, '', '/admin');
    }
  }, [isAdmin]);
  
  if (isAdmin) {
    return <div>Redirecting to admin dashboard...</div>;
  }
  
  return <>{children}</>;
};

// Simple routing based on URL path
const App = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    window.history.pushState({}, '', path);
  };

  const renderContent = () => {
    console.log('renderContent called with currentPath:', currentPath);
    
    if (currentPath === '/login') {
      return <LoginPage />;
    } else if (currentPath === '/register') {
      return <RegisterPage />;
    } else if (currentPath === '/pricing') {
      return <LandingPage />;
    } else if (currentPath === '/dashboard') {
      return (
        <Guarded>
          <AdminRedirectWrapper>
            <DashboardOverview />
          </AdminRedirectWrapper>
        </Guarded>
      );
    } else if (currentPath === '/admin/seo-workflows') {
      console.log('Rendering SEO Crawler Workflow, currentPath:', currentPath);
      const goBack = () => {
        setCurrentPath('/admin');
      };
      return (
        <div>
          <BackButton onBack={goBack} className="mb-4" />
          <SEOCrawlerWorkflow />
        </div>
      );
    } else if (currentPath === '/admin') {
      console.log('Rendering admin dashboard, currentPath:', currentPath);
      const goBack = () => {
        setCurrentPath('/');
      };
      return (
        <div>
          <BackButton onBack={goBack} className="mb-4" />
          <AdminDashboard onBack={goBack} />
        </div>
      );
    }
    const goBack = () => {
      setCurrentPath('/');
    };

    if (currentPath === '/') {
      // Show modern landing page at root
      return <ModernFrontPage onNavigate={setCurrentPath} />;
    } else if (currentPath === '/dashboard') {
      return <DashboardOverview />;
    } else if (currentPath.startsWith('/bridge/')) {
      const bridgeId = currentPath.split('/bridge/')[1] || '';
      return (
        <div>
          <BackButton onBack={goBack} className="mb-4" />
          <div>Bridge Chat Page - {bridgeId}</div>
        </div>
      );
    } else if (currentPath === '/space-mining') {
      return (
        <div>
          <BackButton onBack={goBack} className="mb-4" />
          <SpaceMiningDashboard />
        </div>
      );
    } else if (currentPath === '/harvester') {
      return (
        <div>
          <BackButton onBack={goBack} className="mb-4" />
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Web Crawler Dashboard</h1>
            <p>Web crawler functionality coming soon...</p>
          </div>
        </div>
      );
    } else if (currentPath === '/wallet') {
      return (
        <div>
          <BackButton onBack={goBack} className="mb-4" />
          <WalletDashboard />
        </div>
      );
    } else if (currentPath === '/billing') {
      return (
        <div>
          <BackButton onBack={goBack} className="mb-4" />
          <BillingDashboard />
        </div>
      );
    } else if (currentPath === '/bridge-analytics') {
      return (
        <div>
          <BackButton onBack={goBack} className="mb-4" />
          <BridgeAnalyticsDashboard />
        </div>
      );
    } else if (currentPath === '/seo-optimization') {
      return (
        <div>
          <BackButton onBack={goBack} className="mb-4" />
          <SEOOptimizationDashboard />
        </div>
      );
    }       else if (currentPath === '/metaverse') {
        return (
          <div>
            <BackButton onBack={goBack} className="mb-4" />
            <MetaverseDashboard />
          </div>
        );
      }
      else if (currentPath === '/wallet') {
        return (
          <div>
            <BackButton onBack={goBack} className="mb-4" />
            <WalletDashboard />
          </div>
        );
      } else {
      return (
        <div className="min-h-screen bg-background-primary text-text-primary flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Page Not Found
            </h1>
            <p className="text-xl text-text-secondary mb-8">
              The page you're looking for doesn't exist.
            </p>
            <button 
              className="px-8 py-4 bg-gradient-primary rounded-xl font-semibold text-lg hover:shadow-glow transition-all duration-300"
              onClick={() => setCurrentPath('/')}
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="discord-app">
      {!(currentPath === '/' || currentPath === '/login' || currentPath === '/register') && (
        <EnhancedNavigation currentPath={currentPath} onNavigate={handleNavigate} />
      )}
      <div className="discord-main">
        <div className="discord-content discord-scrollbar">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

// Simple PWA initialization
const initializePWA = async () => {
  try {
    // Register service worker only when served over HTTPS (or localhost) and document is ready
    const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if ('serviceWorker' in navigator && (isLocalhost || location.protocol === 'https:') && document.readyState === 'complete') {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ ServiceWorker registered:', registration.scope);
      } catch (err) {
        console.warn('SW registration skipped:', err);
      }
    }
    console.log('✅ PWA initialized successfully');
  } catch (error) {
    console.error('❌ PWA initialization failed:', error);
  }
};

// Initialize PWA when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePWA);
} else {
  initializePWA();
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <EnhancedAuthProvider>
      <App />
    </EnhancedAuthProvider>
  </React.StrictMode>
);
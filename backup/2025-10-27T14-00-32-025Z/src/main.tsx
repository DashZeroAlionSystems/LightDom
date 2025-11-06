/**
 * Main Application Entry Point
 * LightDom Space Optimization System with Light DOM Slot Support
 */

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import BasicTest from './components/BasicTest';

const Guarded: React.FC<{ children: React.ReactNode, requireAdmin?: boolean }> = ({ children, requireAdmin }) => {
  // Bypass authentication for development
  console.log('Guarded component - Development mode, bypassing authentication');
  return <>{children}</>;
};

const AdminRedirectWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Bypass admin redirect for development
  console.log('AdminRedirectWrapper - Development mode, not redirecting');
  return <>{children}</>;
};

// Simple routing based on URL path
const App = () => {
  const [currentPath, setCurrentPath] = useState('/dashboard'); // Start at dashboard for testing
  
  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    window.history.pushState({}, '', path);
  };

  // Listen for browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const renderContent = () => {
    console.log('renderContent called with currentPath:', currentPath);
    
    if (currentPath === '/login') {
      return <MinimalTest />;
    } else if (currentPath === '/register') {
      return <MinimalTest />;
    } else if (currentPath === '/pricing') {
      return <MinimalTest />;
    } else if (currentPath === '/dashboard') {
      return (
        <Guarded>
          <AdminRedirectWrapper>
            <MinimalTest />
          </AdminRedirectWrapper>
        </Guarded>
      );
    } else if (currentPath === '/admin') {
      console.log('Rendering admin dashboard, currentPath:', currentPath);
      const goBack = () => {
        setCurrentPath('/');
      };
      return (
        <Guarded requireAdmin>
          <div>
            <BackButton onBack={goBack} className="mb-4" />
            <AdminDashboard />
          </div>
        </Guarded>
      );
    } else if (currentPath === '/monitoring') {
      console.log('Rendering monitoring dashboard, currentPath:', currentPath);
      const goBack = () => {
        setCurrentPath('/admin');
      };
      return (
        <Guarded requireAdmin>
          <div>
            <BackButton onBack={goBack} className="mb-4" />
            <MonitoringDashboard />
          </div>
        </Guarded>
      );
    }
    const goBack = () => {
      setCurrentPath('/');
    };

    if (currentPath === '/') {
      // Show minimal test at root
      return <MinimalTest />;
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
    <BasicTest />
  </React.StrictMode>
);
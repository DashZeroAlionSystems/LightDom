/**
 * Main Application Entry Point
 * LightDom Space Optimization System with Light DOM Slot Support
 */

import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
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
import { EnhancedAuthProvider, useEnhancedAuth } from './contexts/EnhancedAuthContext';
import BackButton from './components/ui/BackButton';
import EnhancedNavigation from './components/ui/EnhancedNavigation';
import RealWebCrawlerDashboard from '../dom-space-harvester.tsx';
import './discord-theme.css';
import './index.css';

// Import styles
import './styles/animations.css';
import './styles/design-tokens.css';
import './styles/component-system.css';

const Guarded: React.FC<{ children: React.ReactNode, requireAdmin?: boolean }> = ({ children, requireAdmin }) => {
  const { isAuthenticated, isAdmin, loading } = useEnhancedAuth();
  if (loading) return null;
  if (!isAuthenticated) {
    window.history.replaceState({}, '', '/login');
    return null;
  }
  if (requireAdmin && !isAdmin) {
    window.history.replaceState({}, '', '/dashboard');
    return null;
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
    if (currentPath === '/login') {
      return <LoginPage />;
    } else if (currentPath === '/register') {
      return <RegisterPage />;
    } else if (currentPath === '/pricing') {
      return <LandingPage onGetStarted={() => handleNavigate('/register')} onLogin={() => handleNavigate('/login')} onPricing={() => {}} />;
    } else if (currentPath === '/dashboard') {
      return (
        <Guarded>
          <DashboardOverview />
        </Guarded>
      );
    } else if (currentPath === '/admin') {
      return (
        <Guarded requireAdmin>
          <AdminDashboard />
        </Guarded>
      );
    }
    const goBack = () => {
      setCurrentPath('/');
    };

    if (currentPath === '/space-mining') {
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
          <RealWebCrawlerDashboard />
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
      } else if (currentPath === '/') {
      return <LandingPage onGetStarted={() => handleNavigate('/register')} onLogin={() => handleNavigate('/login')} onPricing={() => handleNavigate('/pricing')} />;
    } else {
      return <LandingPage onGetStarted={() => handleNavigate('/register')} onLogin={() => handleNavigate('/login')} onPricing={() => handleNavigate('/pricing')} />;
    }
  };

  return (
    <div className="discord-app">
      <EnhancedNavigation currentPath={currentPath} onNavigate={handleNavigate} />
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
    if ('serviceWorker' in navigator && (isLocalhost || location.protocol === 'https:') && document.readyState !== 'uninitialized') {
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
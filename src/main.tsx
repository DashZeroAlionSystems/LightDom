/**
 * Main Application Entry Point
 * LightDom Space Optimization System with Light DOM Slot Support
 */

import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import SimpleDashboard from './components/ui/SimpleDashboard';
import SpaceOptimizationDashboardMD3 from './components/ui/SpaceOptimizationDashboardMD3';
import MetaverseMiningDashboard from './components/ui/MetaverseMiningDashboard';
import SpaceMiningDashboard from './components/ui/SpaceMiningDashboard';
import AdvancedNodeDashboardMD3 from './components/ui/AdvancedNodeDashboardMD3';
import BlockchainModelStorageDashboard from './components/ui/BlockchainModelStorageDashboard';
import WorkflowSimulationDashboard from './components/ui/WorkflowSimulationDashboard';
import TestingDashboard from './components/ui/TestingDashboard';
import WalletDashboard from './components/ui/dashboard/WalletDashboard';
import { LightDomSlotDashboard } from './components/ui/LightDomSlotDashboard';
import BridgeChatPage from './BridgeChatPage';
import RealWebCrawlerDashboard from '../dom-space-harvester';
import Navigation from './components/ui/Navigation';
import BackButton from './components/ui/BackButton';
import PWAInitializer from './utils/validation/PWAInitializer';
import './index.css';

// Simple routing based on URL path
const App = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    window.history.pushState({}, '', path);
  };

  const renderContent = () => {
    const goBack = () => {
      setCurrentPath('/');
    };

    if (currentPath === '/') {
      // Show landing page at root
      const LandingPage = React.lazy(() => import('./components/ui/LandingPage'));
      return (
        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background-primary">
          <div className="text-text-primary">Loading...</div>
        </div>}>
          <LandingPage />
        </React.Suspense>
      );
    } else if (currentPath === '/dashboard') {
      return <SimpleDashboard />;
    } else if (currentPath.startsWith('/bridge/')) {
      const bridgeId = currentPath.split('/bridge/')[1] || '';
      return (
        <div>
          <BackButton onBack={goBack} className="mb-4" />
          <BridgeChatPage bridgeId={bridgeId} />
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
    } else if (currentPath === '/advanced-nodes') {
      return (
        <div>
          <BackButton onBack={goBack} className="mb-4" />
          <AdvancedNodeDashboardMD3 />
        </div>
      );
    } else if (currentPath === '/optimization') {
      return (
        <div>
          <BackButton onBack={goBack} className="mb-4" />
          <SpaceOptimizationDashboardMD3 />
        </div>
      );
    } else if (currentPath === '/metaverse-mining') {
      return (
        <div>
          <BackButton onBack={goBack} className="mb-4" />
          <MetaverseMiningDashboard />
        </div>
      );
    } else if (currentPath === '/blockchain-models') {
      return (
        <div>
          <BackButton onBack={goBack} className="mb-4" />
          <BlockchainModelStorageDashboard />
        </div>
      );
    } else if (currentPath === '/workflow-simulation') {
      return (
        <div>
          <BackButton onBack={goBack} className="mb-4" />
          <WorkflowSimulationDashboard />
        </div>
      );
    } else if (currentPath === '/testing') {
      return (
        <div>
          <BackButton onBack={goBack} className="mb-4" />
          <TestingDashboard />
        </div>
      );
    } else if (currentPath === '/lightdom-slots') {
      return (
        <div>
          <BackButton onBack={goBack} className="mb-4" />
          <LightDomSlotDashboard />
        </div>
      );
    } else {
      return <SimpleDashboard />;
    }
  };

  return (
    <div className="discord-app">
      <Navigation currentPath={currentPath} onNavigate={handleNavigate} />
      <div className="discord-main">
        <div className="discord-content discord-scrollbar">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

// Initialize PWA functionality
const initializePWA = async () => {
  try {
    const pwaConfig = {
      cacheName: 'lightdom-cache',
      cacheVersion: '1.0.0',
      urlsToCache: [
        '/',
        '/dashboard',
        '/optimize',
        '/wallet',
        '/settings',
        '/manifest.json',
        '/icons/icon-192x192.png',
        '/icons/icon-512x512.png',
        '/offline.html'
      ],
      offlinePage: '/offline.html'
    };

    const pwaInitializer = new PWAInitializer(pwaConfig);
    await pwaInitializer.initialize();
    
    console.log('PWA initialized successfully');
  } catch (error) {
    console.error('PWA initialization failed:', error);
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
    <App />
  </React.StrictMode>
);
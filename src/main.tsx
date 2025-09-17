/**
 * Main Application Entry Point
 * LightDom Space Optimization System with Light DOM Slot Support
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import DiscordStyleDashboard from './components/DiscordStyleDashboard';
import SpaceOptimizationDashboardMD3 from './components/SpaceOptimizationDashboardMD3';
import MetaverseMiningDashboard from './components/MetaverseMiningDashboard';
import SpaceMiningDashboard from './components/SpaceMiningDashboard';
import AdvancedNodeDashboardMD3 from './components/AdvancedNodeDashboardMD3';
import BlockchainModelStorageDashboard from './components/BlockchainModelStorageDashboard';
import WorkflowSimulationDashboard from './components/WorkflowSimulationDashboard';
import TestingDashboard from './components/TestingDashboard';
import WalletDashboard from './components/dashboard/WalletDashboard';
import { LightDomSlotDashboard } from './components/LightDomSlotDashboard';
import BridgeChatPage from './BridgeChatPage';
import RealWebCrawlerDashboard from '../dom-space-harvester';
import './simple.css';

// Simple routing based on URL path
const App = () => {
  const path = window.location.pathname;
  
  if (path.startsWith('/bridge/')) {
    const bridgeId = path.split('/bridge/')[1] || '';
    return <BridgeChatPage bridgeId={bridgeId} />;
  } else if (path === '/space-mining') {
    return <SpaceMiningDashboard />;
  } else if (path === '/harvester') {
    return <RealWebCrawlerDashboard />;
  } else if (path === '/wallet') {
    return <WalletDashboard />;
  } else if (path === '/advanced-nodes') {
    return <AdvancedNodeDashboardMD3 />;
  } else if (path === '/optimization') {
    return <SpaceOptimizationDashboardMD3 />;
  } else if (path === '/metaverse-mining') {
    return <MetaverseMiningDashboard />;
  } else if (path === '/blockchain-models') {
    return <BlockchainModelStorageDashboard />;
  } else if (path === '/workflow-simulation') {
    return <WorkflowSimulationDashboard />;
  } else if (path === '/testing') {
    return <TestingDashboard />;
  } else if (path === '/lightdom-slots') {
    return <LightDomSlotDashboard />;
  } else {
    return <DiscordStyleDashboard />;
  }
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme, Spin, Typography } from 'antd';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { BlockchainProvider } from './hooks/useBlockchain';
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardOverview from './components/dashboard/DashboardOverview';
import OptimizationDashboard from './components/dashboard/OptimizationDashboard';
import WalletDashboard from './components/dashboard/WalletDashboard';
import BlockchainDashboard from './components/BlockchainDashboard';
import SpaceMiningDashboard from './components/SpaceMiningDashboard';
import MetaverseMiningDashboard from './components/MetaverseMiningDashboard';
import MetaverseMarketplace from './components/MetaverseMarketplace';
import MetaverseMiningRewards from './components/MetaverseMiningRewards';
import WorkflowSimulationDashboard from './components/WorkflowSimulationDashboard';
import TestingDashboard from './components/TestingDashboard';
import AdvancedNodeDashboard from './components/AdvancedNodeDashboard';
import BlockchainModelStorageDashboard from './components/BlockchainModelStorageDashboard';
import SpaceOptimizationDashboard from './components/SpaceOptimizationDashboard';
import { SEOOptimizationDashboard } from './components/SEOOptimizationDashboard';
import { SEOModelMarketplace } from './components/SEOModelMarketplace';
import AutomationOrchestrationDashboard from './components/AutomationOrchestrationDashboard';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import PaymentPage from './components/payment/PaymentPage';
import { FileUploadSettings } from './components/FileUploadSettings';
import AdminDashboard from './components/admin/AdminDashboard';
import './App.css';

// Initialize persistence system
import './scripts/InitializePersistence';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Spin size="large" />
        <Typography.Text style={{ color: 'white', marginTop: 16, fontSize: 16 }}>
          Loading LightDom Platform...
        </Typography.Text>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Main App Component
const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        
        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardOverview />} />
          <Route path="optimization" element={<OptimizationDashboard />} />
          <Route path="wallet" element={<WalletDashboard />} />
          <Route path="blockchain" element={<BlockchainDashboard />} />
          <Route path="space-mining" element={<SpaceMiningDashboard />} />
          <Route path="metaverse-mining" element={<MetaverseMiningDashboard />} />
          <Route path="metaverse-marketplace" element={<MetaverseMarketplace />} />
          <Route path="metaverse-mining-rewards" element={<MetaverseMiningRewards />} />
          <Route path="workflow-simulation" element={<WorkflowSimulationDashboard />} />
          <Route path="testing" element={<TestingDashboard />} />
          <Route path="advanced-nodes" element={<AdvancedNodeDashboard />} />
          <Route path="blockchain-models" element={<BlockchainModelStorageDashboard />} />
          <Route path="space-optimization" element={<SpaceOptimizationDashboard />} />
          <Route path="seo-optimization" element={<SEOOptimizationDashboard />} />
          <Route path="seo-marketplace" element={<SEOModelMarketplace />} />
          <Route path="automation" element={<AutomationOrchestrationDashboard />} />
          <Route path="analytics" element={<div>Analytics Coming Soon</div>} />
          <Route path="websites" element={<div>Websites Coming Soon</div>} />
          <Route path="history" element={<div>History Coming Soon</div>} />
          <Route path="achievements" element={<div>Achievements Coming Soon</div>} />
          <Route path="settings" element={<FileUploadSettings />} />
        </Route>
        
        {/* Default Redirect */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        
        {/* Catch All */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
        components: {
          Layout: {
            headerBg: '#fff',
            siderBg: '#001529',
          },
          Card: {
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          },
          Button: {
            borderRadius: 8,
          },
          Input: {
            borderRadius: 8,
          },
          Select: {
            borderRadius: 8,
          },
        },
      }}
    >
      <AuthProvider>
        <BlockchainProvider>
          <AppContent />
        </BlockchainProvider>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;

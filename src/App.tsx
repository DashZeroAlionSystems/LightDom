import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme, Spin, Typography } from 'antd';
import { AuthProvider, useAuth } from './hooks/state/useAuth';
import { EnhancedAuthProvider } from './contexts/EnhancedAuthContext';
import { BlockchainProvider } from './hooks/useBlockchain';
import ModernFrontPage from './components/ModernFrontPage';
import DashboardLayout from './components/ui/dashboard/DashboardLayout';
import DashboardOverview from './components/ui/dashboard/DashboardOverview';
import OptimizationDashboard from './components/ui/dashboard/OptimizationDashboard';
import WalletDashboard from './components/ui/dashboard/WalletDashboard';
import AnalyticsDashboard from './components/ui/dashboard/AnalyticsDashboard';
import WebsitesManagementPage from './components/ui/dashboard/WebsitesManagementPage';
import HistoryPage from './components/ui/dashboard/HistoryPage';
import AchievementsPage from './components/ui/dashboard/AchievementsPage';
import BlockchainDashboard from './components/ui/BlockchainDashboard';
import SpaceMiningDashboard from './components/ui/SpaceMiningDashboard';
import MetaverseMiningDashboard from './components/ui/MetaverseMiningDashboard';
import MetaverseMarketplace from './components/ui/MetaverseMarketplace';
import MetaverseMiningRewards from './components/ui/MetaverseMiningRewards';
import WorkflowSimulationDashboard from './components/ui/WorkflowSimulationDashboard';
import TestingDashboard from './components/ui/TestingDashboard';
import AdvancedNodeDashboard from './components/ui/AdvancedNodeDashboard';
import BlockchainModelStorageDashboard from './components/ui/BlockchainModelStorageDashboard';
import SpaceOptimizationDashboard from './components/ui/SpaceOptimizationDashboard';
import { SEOOptimizationDashboard } from './components/SEOOptimizationDashboard';
import { SEOModelMarketplace } from './components/SEOModelMarketplace';
import { SEODataMiningDashboard } from './components/SEODataMiningDashboard';
import ClientZone from './components/ui/ClientZone';
import AdminAnalyticsDashboard from './components/ui/AdminAnalyticsDashboard';
import LoginPage from './components/ui/auth/LoginPage';
import RegisterPage from './components/ui/auth/RegisterPage';
import ForgotPasswordPage from './components/ui/auth/ForgotPasswordPage';
import ResetPasswordPage from './components/ui/auth/ResetPasswordPage';
import PaymentPage from './components/ui/payment/PaymentPage';
import { FileUploadSettings } from './components/ui/FileUploadSettings';
import AdminLayout from './components/ui/admin/AdminLayout';
import AdminDashboard from './components/ui/admin/AdminDashboard';
import AdminOverview from './components/ui/admin/AdminOverview';
import EnhancedAdminOverview from './components/ui/admin/EnhancedAdminOverview';
import CopilotUIDemo from './components/ui/admin/CopilotUIDemo';
import UserManagement from './components/ui/admin/UserManagement';
import EnhancedUserManagement from './components/ui/admin/EnhancedUserManagement';
import SystemMonitoring from './components/ui/admin/SystemMonitoring';
import SystemLogs from './components/ui/admin/SystemLogs';
import BillingManagement from './components/ui/admin/BillingManagement';
import CrawlerDashboard from './components/ui/admin/CrawlerDashboard';
import CrawlerWorkloadDashboard from './components/ui/admin/CrawlerWorkloadDashboard';
import TrainingControlPanel from './components/ui/admin/TrainingControlPanel';
import UserManagementWorkflow from './components/ui/admin/UserManagementWorkflow';
import SEOCrawlerWorkflow from './components/ui/admin/SEOCrawlerWorkflow';
import AIAutomationPage from './pages/admin/AIAutomationPage';
import WorkflowDemo from './components/WorkflowDemo';
import TrainingDataPipeline from './components/TrainingDataPipeline';
import DesignSystemGuide from './components/DesignSystemGuide';
import MotionDesignShowcase from './components/MotionDesignShowcase';
import DesignToolsNavigation from './components/DesignToolsNavigation';
import SchemaLinkingDashboard from './components/SchemaLinkingDashboard';
import WorkflowCreationDashboard from './components/WorkflowCreationDashboard';
import ComponentSchemaToolDashboard from './components/ComponentSchemaToolDashboard';
import ChromeLayers3DDashboard from './components/ChromeLayers3DDashboard';
import NeuralNetworkDashboard from './components/ui/dashboard/NeuralNetworkDashboard';
import './App.css';
import './styles/design-system.css';
import './styles/modern-frontpage.css';

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
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        
        {/* Admin Routes - Separate Admin Layout */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<EnhancedAdminOverview />} />
          <Route path="overview" element={<EnhancedAdminOverview />} />
          <Route path="copilot-ui" element={<CopilotUIDemo />} />
          <Route path="users" element={<EnhancedUserManagement />} />
          <Route path="billing" element={<BillingManagement />} />
          <Route path="crawler" element={<CrawlerDashboard />} />
          <Route path="crawler-workload" element={<CrawlerWorkloadDashboard />} />
          <Route path="training" element={<TrainingControlPanel />} />
          <Route path="monitoring" element={<SystemMonitoring />} />
          <Route path="logs" element={<SystemLogs />} />
          <Route path="settings" element={<AdminDashboard />} />
          <Route path="analytics" element={<AdminAnalyticsDashboard />} />
          <Route path="user-workflows" element={<UserManagementWorkflow />} />
          <Route path="seo-workflows" element={<SEOCrawlerWorkflow />} />
          <Route path="training-data" element={<TrainingDataPipeline />} />
          <Route path="design-system" element={<DesignSystemGuide />} />
          <Route path="motion-showcase" element={<MotionDesignShowcase />} />
          <Route path="design-tools" element={<DesignToolsNavigation />} />
          <Route path="schema-linking" element={<SchemaLinkingDashboard />} />
          <Route path="workflow-creation" element={<WorkflowCreationDashboard />} />
          <Route path="chrome-layers" element={<ChromeLayers3DDashboard />} />
        </Route>
        
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
          <Route path="neural-network" element={<NeuralNetworkDashboard />} />
          <Route path="blockchain-models" element={<BlockchainModelStorageDashboard />} />
          <Route path="space-optimization" element={<SpaceOptimizationDashboard />} />
          <Route path="seo-optimization" element={<SEOOptimizationDashboard />} />
          <Route path="seo-datamining" element={<SEODataMiningDashboard />} />
          <Route path="seo-marketplace" element={<SEOModelMarketplace />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="websites" element={<WebsitesManagementPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="achievements" element={<AchievementsPage />} />
          <Route path="settings" element={<FileUploadSettings />} />
          <Route path="workflow-demo" element={<WorkflowDemo />} />
          <Route path="training-data" element={<TrainingDataPipeline />} />
          <Route path="design-system" element={<DesignSystemGuide />} />
          <Route path="motion-showcase" element={<MotionDesignShowcase />} />
          <Route path="design-tools" element={<DesignToolsNavigation />} />
          <Route path="schema-linking" element={<SchemaLinkingDashboard />} />
          <Route path="workflow-creation" element={<WorkflowCreationDashboard />} />
          <Route path="component-schema" element={<ComponentSchemaToolDashboard />} />
          
          {/* Admin Routes within Dashboard */}
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/users" element={<EnhancedUserManagement />} />
          <Route path="admin/monitoring" element={<SystemMonitoring />} />
          <Route path="admin/logs" element={<SystemLogs />} />
          <Route path="admin/billing" element={<BillingManagement />} />
          <Route path="admin/crawler" element={<CrawlerDashboard />} />
          <Route path="admin/crawler-workload" element={<CrawlerWorkloadDashboard />} />
          <Route path="admin/training" element={<TrainingControlPanel />} />
          <Route path="admin/analytics" element={<AdminAnalyticsDashboard />} />
          <Route path="admin/user-workflows" element={<UserManagementWorkflow />} />
          <Route path="admin/seo-workflows" element={<SEOCrawlerWorkflow />} />
          <Route path="admin/ai-automation" element={<AIAutomationPage />} />
        </Route>
        
        {/* Public Landing Page */}
        <Route
          path="/"
          element={<ModernFrontPage />}
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
      <EnhancedAuthProvider>
        <AuthProvider>
          <BlockchainProvider>
            <AppContent />
          </BlockchainProvider>
        </AuthProvider>
      </EnhancedAuthProvider>
    </ConfigProvider>
  );
};

export default App;

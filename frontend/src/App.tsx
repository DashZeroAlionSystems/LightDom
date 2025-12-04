import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React, { useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

// Components
import { ErrorFallback } from '@/components/ErrorFallback';
import { Layout } from '@/components/Layout';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// Theme configuration
import { applyCommandPaletteTheme, loadCommandPaletteTheme } from '@/config/command-palette-theme';

// Pages
import { PromptConsolePage } from '@/pages/PromptConsolePage';
import { ComponentSchemaToolPage } from '@/pages/ComponentSchemaToolPage';
import { SidebarDemoPage } from '@/pages/SidebarDemoPage';
import AdminNavDemoPage from '@/pages/AdminNavDemoPage';
import UnifiedDashboardDemoPage from '@/pages/UnifiedDashboardDemoPage';
import WorkflowWizardDemoPage from '@/pages/WorkflowWizardDemoPage';
import SecurityAuditReportDemoPage from '@/pages/SecurityAuditReportDemoPage';
import SelfOrganizingDashboardDemoPage from '@/pages/SelfOrganizingDashboardDemoPage';
import DevContainerAdminDashboardDemoPage from '@/pages/DevContainerAdminDashboardDemoPage';
import LightDomSlotsDemoPage from '@/pages/LightDomSlotsDemoPage';
import ComponentBundlesDemoPage from '@/pages/ComponentBundlesDemoPage';
import ClientIntegrationDemoPage from '@/pages/ClientIntegrationDemoPage';
import EnterpriseContainerDemoPage from '@/pages/EnterpriseContainerDemoPage';
import SpaceMiningDemoPage from '@/pages/SpaceMiningDemoPage';
import ServiceGraphVisualizerDemoPage from '@/pages/ServiceGraphVisualizerDemoPage';
import MetaverseNftDemoPage from '@/pages/MetaverseNftDemoPage';
import DataMiningOperationsDemoPage from '@/pages/DataMiningOperationsDemoPage';
import CrawleeManager from '@/pages/CrawleeManager';
import NeuralNetworkManagementPage from '@/pages/NeuralNetworkManagementPage';
import { LoginPage } from '@/pages/LoginPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { WorkflowBuilderPage } from '@/pages/WorkflowBuilderPage';
import { WorkflowsPage } from '@/pages/WorkflowsPage';

// Service Dashboards
import CodebaseIndexingDashboard from '@/components/dashboards/CodebaseIndexingDashboard';
import AIResearchDashboard from '@/components/dashboards/AIResearchDashboard';
import DataMiningDashboard from '@/components/dashboards/DataMiningDashboard';
import LeadGenerationDashboard from '@/components/dashboards/LeadGenerationDashboard';
import WorkflowGeneratorDashboard from '@/components/dashboards/WorkflowGeneratorDashboard';
import SchemaLinkingDashboard from '@/components/dashboards/SchemaLinkingDashboard';
import TrainingDataDashboard from '@/components/dashboards/TrainingDataDashboard';
import EmbeddingsDashboard from '@/components/dashboards/EmbeddingsDashboard';
import FeedbackLoopDashboard from '@/components/dashboards/FeedbackLoopDashboard';
import NeuralNetworkDashboard from '@/components/dashboards/NeuralNetworkDashboard';
import UnifiedRAGDashboard from '@/components/dashboards/UnifiedRAGDashboard';
import AgentOrchestrationDashboard from '@/components/dashboards/AgentOrchestrationDashboard';
import DeepSeekAutomationDashboard from '@/components/dashboards/DeepSeekAutomationDashboard';
import WorkflowWizardDashboard from '@/components/dashboards/WorkflowWizardDashboard';
import BlockchainOptimizationDashboard from '@/components/dashboards/BlockchainOptimizationDashboard';
import CrawleeDashboard from '@/components/dashboards/CrawleeDashboard';
import SEOCampaignDashboard from '@/components/dashboards/SEOCampaignDashboard';
import ClientSiteDashboard from '@/components/dashboards/ClientSiteDashboard';
import N8NWorkflowDashboard from '@/components/dashboards/N8NWorkflowDashboard';
import DeepSeekDatabaseDashboard from '@/components/dashboards/DeepSeekDatabaseDashboard';
import MCPServerDashboard from '@/components/dashboards/MCPServerDashboard';

// Hooks
import { useAuth } from '@/hooks/useAuth';

// Services

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to='/login' replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <Navigate to='/admin-dashboard' replace />;
  }

  return <>{children}</>;
};

// Error Boundary Fallback
const ErrorFallbackComponent: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({
  error,
  resetErrorBoundary,
}) => <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />;

const App: React.FC = () => {
  // Initialize command palette theme on app load
  useEffect(() => {
    const savedTheme = loadCommandPaletteTheme();
    applyCommandPaletteTheme(savedTheme);
  }, []);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallbackComponent}>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <Router>
            <div className='min-h-screen bg-background text-foreground'>
              <Routes>
                {/* Public Routes */}
                <Route path='/' element={<Navigate to='/admin-dashboard' replace />} />
                <Route
                  path='/login'
                  element={
                    <PublicRoute>
                      <LoginPage />
                    </PublicRoute>
                  }
                />
                <Route
                  path='/register'
                  element={
                    <PublicRoute>
                      <RegisterPage />
                    </PublicRoute>
                  }
                />

                {/* Demo Route - No Auth Required */}
                <Route path='/sidebar-demo' element={<SidebarDemoPage />} />

                {/* Protected Routes */}
                <Route
                  path='/admin-dashboard'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <PromptConsolePage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/admin-navigation'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <AdminNavDemoPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/unified-dashboard'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <UnifiedDashboardDemoPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/workflow-wizard'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <WorkflowWizardDemoPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/security-audit-report'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <SecurityAuditReportDemoPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/self-organizing-dashboard'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <SelfOrganizingDashboardDemoPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/devcontainer-admin-dashboard'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <DevContainerAdminDashboardDemoPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/lightdom-slot-demo'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <LightDomSlotsDemoPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/component-bundles'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <ComponentBundlesDemoPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/space-mining'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <SpaceMiningDemoPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/service-graph'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <ServiceGraphVisualizerDemoPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/metaverse-nft'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <MetaverseNftDemoPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/client-integration'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <ClientIntegrationDemoPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/enterprise-container'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <EnterpriseContainerDemoPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/data-mining'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <DataMiningOperationsDemoPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/neural-network-management'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <NeuralNetworkManagementPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/workflows'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <WorkflowsPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/workflow-builder'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <WorkflowBuilderPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/component-schema'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <ComponentSchemaToolPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/crawlee-manager'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <CrawleeManager />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/neural-networks'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <NeuralNetworkManagementPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/settings'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <SettingsPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* Service Dashboards */}
                <Route
                  path='/dashboard/codebase-indexing'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <CodebaseIndexingDashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/dashboard/ai-research'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <AIResearchDashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/dashboard/data-mining'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <DataMiningDashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/dashboard/lead-generation'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <LeadGenerationDashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/dashboard/workflow-generator'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <WorkflowGeneratorDashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/dashboard/schema-linking'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <SchemaLinkingDashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/dashboard/training-data-mining'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <TrainingDataDashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/dashboard/embeddings'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <EmbeddingsDashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/dashboard/feedback-loop'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <FeedbackLoopDashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/dashboard/neural-network'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <NeuralNetworkDashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/dashboard/unified-rag'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <UnifiedRAGDashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/dashboard/agent-orchestration'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <AgentOrchestrationDashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/dashboard/deepseek-automation'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <DeepSeekAutomationDashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/dashboard/workflow-wizard'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <WorkflowWizardDashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/dashboard/blockchain-optimization'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <BlockchainOptimizationDashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/dashboard/crawlee'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <CrawleeDashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/dashboard/seo-campaigns'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <SEOCampaignDashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/dashboard/client-sites'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <ClientSiteDashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/dashboard/n8n-workflows'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <N8NWorkflowDashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/dashboard/deepseek-database'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <DeepSeekDatabaseDashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/dashboard/mcp-servers'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <MCPServerDashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* 404 Route */}
                <Route path='*' element={<NotFoundPage />} />
              </Routes>

              {/* Toast Notifications */}
              <Toaster
                position='top-right'
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'hsl(var(--card))',
                    color: 'hsl(var(--card-foreground))',
                    border: '1px solid hsl(var(--border))',
                  },
                }}
              />

              {/* React Query Devtools */}
              {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
            </div>
          </Router>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;

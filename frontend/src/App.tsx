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
import { LoginPage } from '@/pages/LoginPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { WorkflowBuilderPage } from '@/pages/WorkflowBuilderPage';
import { WorkflowsPage } from '@/pages/WorkflowsPage';

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
                  path='/settings'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <SettingsPage />
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

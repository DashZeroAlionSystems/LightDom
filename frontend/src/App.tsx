import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

// Components
import { ErrorFallback } from '@/components/ErrorFallback';
import { Layout } from '@/components/Layout';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// Pages
import { PromptConsolePage } from '@/pages/PromptConsolePage';
import { ComponentSchemaToolPage } from '@/pages/ComponentSchemaToolPage';
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

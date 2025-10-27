import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

// Components
import { Layout } from '@/components/Layout';
import { ErrorFallback } from '@/components/ErrorFallback';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// Pages
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { CompleteDashboardPage } from '@/pages/CompleteDashboardPage';
import { FilesPage } from '@/pages/FilesPage';
import { UploadPage } from '@/pages/UploadPage';
import { HostsPage } from '@/pages/HostsPage';
import { ContractsPage } from '@/pages/ContractsPage';
import { GovernancePage } from '@/pages/GovernancePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { AIContentPage } from '@/pages/AIContentPage';
import { SEOModelTrainingPage } from '@/pages/SEOModelTrainingPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

// Hooks
import { useAuth } from '@/hooks/useAuth';

// Services
import { AuthService } from '@/services/auth';

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
    return <Navigate to="/login" replace />;
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
    return <Navigate to="/dashboard" replace />;
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
            <div className="min-h-screen bg-background text-foreground">
              <Routes>
                {/* Public Routes */}
                <Route
                  path="/"
                  element={
                    <PublicRoute>
                      <HomePage />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <LoginPage />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicRoute>
                      <RegisterPage />
                    </PublicRoute>
                  }
                />

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <DashboardPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/complete-dashboard"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <CompleteDashboardPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/files"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <FilesPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/upload"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <UploadPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hosts"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <HostsPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/contracts"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <ContractsPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/governance"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <GovernancePage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <SettingsPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <ProfilePage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ai-content"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <AIContentPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/seo-training"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <SEOModelTrainingPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* 404 Route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>

              {/* Toast Notifications */}
              <Toaster
                position="top-right"
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

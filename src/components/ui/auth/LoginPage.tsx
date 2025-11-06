import React, { useState } from 'react';
import { useEnhancedAuth } from '../../../contexts/EnhancedAuthContext';
import LoginForm from './LoginForm';
import './AuthForms.css';

const LoginPage: React.FC = () => {
  const { login } = useEnhancedAuth();
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (credentials: any) => {
    try {
      setError(null);
      await login(credentials.email, credentials.password);
      window.location.pathname = '/dashboard';
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
    }
  };

  const handleSignUp = () => { window.location.pathname = '/register'; };

  const handleForgotPassword = () => {
    const email = window.prompt('Enter your account email to receive a reset link:');
    if (!email) return;
    // Simulate success UX; wire to backend when ready
    alert('If an account exists for ' + email + ', a reset link will be sent.');
  };

  return (
    <div className="auth-form-container">
      <LoginForm onSuccess={() => (window.location.pathname = '/dashboard')} />
    </div>
  );
};

export default LoginPage;
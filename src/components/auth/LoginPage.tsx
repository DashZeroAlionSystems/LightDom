import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import SignInForm from './SignInForm';
import './AuthForms.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (credentials: any) => {
    try {
      setError(null);
      await login(credentials.email, credentials.password);
      navigate('/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
    }
  };

  const handleSignUp = () => {
    navigate('/register');
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password flow
    console.log('Forgot password clicked');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>LightDom</h1>
          <p>DOM Optimization & Mining Platform</p>
        </div>
        
        <SignInForm
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
          onForgotPassword={handleForgotPassword}
        />
        
        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
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
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>LightDom</h1>
          <p>DOM Optimization & Mining Platform</p>
        </div>
        
        <LoginForm onSuccess={() => (window.location.pathname = '/dashboard')} />
        
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:8, color:'#9aa3ba' }}>
          <button onClick={handleForgotPassword} style={{ background:'transparent', border:'none', color:'#93c5fd', cursor:'pointer' }}>Forgot password?</button>
          <button onClick={handleSignUp} className="link" style={{ background:'transparent', border:'none', cursor:'pointer' }}>Create account</button>
        </div>
        
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
import React, { useState } from 'react';
import { useEnhancedAuth } from '../../../contexts/EnhancedAuthContext';
import SignupForm from './SignupForm';
import './AuthForms.css';

const RegisterPage: React.FC = () => {
  const { register } = useEnhancedAuth();
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (userData: any) => {
    try {
      setError(null);
      await register({
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.password // SignUpForm doesn't have confirmPassword in the callback
      });
      window.location.pathname = '/dashboard';
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
    }
  };

  const handleSignIn = () => { window.location.pathname = '/login'; };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>LightDom</h1>
          <p>Join the DOM optimization revolution</p>
        </div>
        
        <SignupForm onSuccess={() => (window.location.pathname = '/dashboard')} />
        
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:8, color:'#9aa3ba' }}>
          <span>Already have an account?</span>
          <button onClick={handleSignIn} className="link" style={{ background:'transparent', border:'none', cursor:'pointer' }}>Sign in</button>
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

export default RegisterPage;
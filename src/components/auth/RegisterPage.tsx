import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import SignUpForm from './SignUpForm';
import './AuthForms.css';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
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
      navigate('/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
    }
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>LightDom</h1>
          <p>Join the DOM optimization revolution</p>
        </div>
        
        <SignUpForm
          onSignUp={handleSignUp}
          onSignIn={handleSignIn}
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

export default RegisterPage;
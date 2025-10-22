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
        confirmPassword: userData.password
      });
      window.location.pathname = '/dashboard';
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
    }
  };

  const handleSignIn = () => { window.location.pathname = '/login'; };

  return (
    <div className="auth-form-container">
      <SignupForm onSuccess={() => (window.location.pathname = '/dashboard')} />
    </div>
  );
};

export default RegisterPage;
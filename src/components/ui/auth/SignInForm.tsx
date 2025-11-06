import React, { useState, useEffect } from 'react';
import { Logger } from '../../utils/Logger';
import WebAuthnService from '../../services/WebAuthnService';
import WebOTPService from '../../services/WebOTPService';

interface SignInFormProps {
  onSignIn: (credentials: any) => void;
  onSignUp: () => void;
  onForgotPassword: () => void;
  className?: string;
}

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export const SignInForm: React.FC<SignInFormProps> = ({
  onSignIn,
  onSignUp,
  onForgotPassword,
  className = ''
}) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPasskeyOption, setShowPasskeyOption] = useState(false);
  const [showOTPOption, setShowOTPOption] = useState(false);
  
  const logger = new Logger('SignInForm');
  const webAuthnService = new WebAuthnService({
    rpId: window.location.hostname,
    rpName: 'LightDom',
    origin: window.location.origin
  });
  const webOTPService = new WebOTPService();

  useEffect(() => {
    // Check for passkey support
    webAuthnService.isPasskeySupported().then(supported => {
      setShowPasskeyOption(supported);
    });

    // Check for WebOTP support
    const otpSupport = webOTPService.getSupportStatus();
    setShowOTPOption(otpSupport.webOTP);

    // Setup form autofill
    setupFormAutofill();
  }, []);

  const setupFormAutofill = () => {
    // Enable autofill for email
    const emailInput = document.getElementById('email') as HTMLInputElement;
    if (emailInput) {
      emailInput.setAttribute('autocomplete', 'email');
    }

    // Enable autofill for password
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    if (passwordInput) {
      passwordInput.setAttribute('autocomplete', 'current-password');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      logger.info('Attempting sign in');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real implementation, call your authentication API
      const credentials = {
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      };

      onSignIn(credentials);
      logger.info('Sign in successful');
      
    } catch (error) {
      logger.error('Sign in failed:', error);
      setErrors({ general: 'Invalid email or password' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasskeySignIn = async () => {
    try {
      setIsLoading(true);
      logger.info('Attempting passkey sign in');
      
      const credential = await webAuthnService.authenticateWithPasskey();
      
      if (credential) {
        // In real implementation, send credential to server for verification
        onSignIn({ type: 'passkey', credential });
        logger.info('Passkey sign in successful');
      }
      
    } catch (error) {
      logger.error('Passkey sign in failed:', error);
      setErrors({ general: 'Passkey authentication failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSignIn = () => {
    setShowOTPOption(true);
    // Setup OTP form
    webOTPService.setupOTPFormWithHandlers('otp-container');
  };

  return (
    <div className={`sign-in-form ${className}`}>
      <div className="form-header">
        <h2>Sign In</h2>
        <p>Welcome back! Please sign in to your account.</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        {errors.general && (
          <div className="error-message general-error">
            {errors.general}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={errors.email ? 'error' : ''}
            placeholder="Enter your email"
            autoComplete="email"
            required
          />
          {errors.email && (
            <span className="error-text">{errors.email}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={errors.password ? 'error' : ''}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />
          {errors.password && (
            <span className="error-text">{errors.password}</span>
          )}
        </div>

        <div className="form-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleInputChange}
            />
            <span className="checkmark"></span>
            Remember me
          </label>
          
          <button
            type="button"
            className="forgot-password-link"
            onClick={onForgotPassword}
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-full"
          disabled={isLoading}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>

        {/* Alternative sign-in methods */}
        <div className="alternative-signin">
          <div className="divider">
            <span>or</span>
          </div>

          {showPasskeyOption && (
            <button
              type="button"
              className="btn btn-outline btn-full"
              onClick={handlePasskeySignIn}
              disabled={isLoading}
            >
              🔐 Sign in with Passkey
            </button>
          )}

          {showOTPOption && (
            <button
              type="button"
              className="btn btn-outline btn-full"
              onClick={handleOTPSignIn}
              disabled={isLoading}
            >
              📱 Sign in with SMS
            </button>
          )}
        </div>

        {/* OTP Container */}
        <div id="otp-container" className="otp-container" style={{ display: 'none' }}>
          {/* OTP form will be inserted here */}
        </div>
      </form>

      <div className="form-footer">
        <p>
          Don't have an account?{' '}
          <button
            type="button"
            className="link-button"
            onClick={onSignUp}
          >
            Sign up
          </button>
        </p>
      </div>

      <style>{`
        .sign-in-form {
          max-width: 400px;
          margin: 0 auto;
          padding: 2rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .form-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .form-header h2 {
          margin: 0 0 0.5rem 0;
          color: #333;
          font-size: 1.5rem;
        }

        .form-header p {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333;
        }

        .form-group input {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #4285f4;
          box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
        }

        .form-group input.error {
          border-color: #e74c3c;
        }

        .error-text {
          color: #e74c3c;
          font-size: 0.8rem;
          margin-top: 0.25rem;
        }

        .error-message {
          padding: 0.75rem;
          background: #fee;
          border: 1px solid #e74c3c;
          border-radius: 4px;
          color: #e74c3c;
          font-size: 0.9rem;
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 0.5rem 0;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .checkbox-label input {
          margin-right: 0.5rem;
        }

        .forgot-password-link {
          background: none;
          border: none;
          color: #4285f4;
          cursor: pointer;
          font-size: 0.9rem;
          text-decoration: underline;
        }

        .btn {
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #4285f4;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #3367d6;
        }

        .btn-outline {
          background: white;
          color: #4285f4;
          border: 1px solid #4285f4;
        }

        .btn-outline:hover:not(:disabled) {
          background: #f8f9fa;
        }

        .btn-full {
          width: 100%;
        }

        .alternative-signin {
          margin-top: 1rem;
        }

        .divider {
          text-align: center;
          margin: 1rem 0;
          position: relative;
        }

        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #ddd;
        }

        .divider span {
          background: white;
          padding: 0 1rem;
          color: #666;
          font-size: 0.9rem;
        }

        .form-footer {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.9rem;
          color: #666;
        }

        .link-button {
          background: none;
          border: none;
          color: #4285f4;
          cursor: pointer;
          text-decoration: underline;
        }

        .otp-container {
          margin-top: 1rem;
          padding: 1rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: #f8f9fa;
        }
      `}</style>
    </div>
  );
};

export default SignInForm;

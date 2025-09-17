import React, { useState, useEffect } from 'react';
import { Logger } from '../../utils/Logger';
import WebAuthnService from '../../services/WebAuthnService';
import WebOTPService from '../../services/WebOTPService';

interface SignUpFormProps {
  onSignUp: (userData: any) => void;
  onSignIn: () => void;
  className?: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
  marketingEmails: boolean;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
  general?: string;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({
  onSignUp,
  onSignIn,
  className = ''
}) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    marketingEmails: false
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPasskeyOption, setShowPasskeyOption] = useState(false);
  const [showOTPOption, setShowOTPOption] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const logger = new Logger('SignUpForm');
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
    // Enable autofill for form fields
    const inputs = [
      { id: 'firstName', autocomplete: 'given-name' },
      { id: 'lastName', autocomplete: 'family-name' },
      { id: 'email', autocomplete: 'email' },
      { id: 'password', autocomplete: 'new-password' }
    ];

    inputs.forEach(({ id, autocomplete }) => {
      const input = document.getElementById(id) as HTMLInputElement;
      if (input) {
        input.setAttribute('autocomplete', autocomplete);
      }
    });
  };

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return strength;
  };

  const getPasswordStrengthText = (strength: number): string => {
    if (strength <= 2) return 'Weak';
    if (strength <= 4) return 'Medium';
    if (strength <= 5) return 'Strong';
    return 'Very Strong';
  };

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength <= 2) return '#e74c3c';
    if (strength <= 4) return '#f39c12';
    if (strength <= 5) return '#27ae60';
    return '#2ecc71';
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

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
    } else if (passwordStrength < 3) {
      newErrors.password = 'Password is too weak';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms agreement validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
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

    // Update password strength
    if (name === 'password') {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }

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
      logger.info('Attempting sign up');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real implementation, call your registration API
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        marketingEmails: formData.marketingEmails
      };

      onSignUp(userData);
      logger.info('Sign up successful');
      
    } catch (error) {
      logger.error('Sign up failed:', error);
      setErrors({ general: 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasskeySignUp = async () => {
    try {
      setIsLoading(true);
      logger.info('Attempting passkey registration');
      
      const user = {
        id: crypto.randomUUID(),
        name: formData.email,
        displayName: `${formData.firstName} ${formData.lastName}`,
        icon: undefined
      };

      const credential = await webAuthnService.registerPasskey(user);
      
      if (credential) {
        // In real implementation, send credential to server for storage
        onSignUp({ 
          type: 'passkey', 
          credential,
          user: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email
          }
        });
        logger.info('Passkey registration successful');
      }
      
    } catch (error) {
      logger.error('Passkey registration failed:', error);
      setErrors({ general: 'Passkey registration failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSignUp = () => {
    setShowOTPOption(true);
    // Setup OTP form
    webOTPService.setupOTPFormWithHandlers('otp-container');
  };

  return (
    <div className={`sign-up-form ${className}`}>
      <div className="form-header">
        <h2>Create Account</h2>
        <p>Join LightDom and start optimizing your web presence.</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        {errors.general && (
          <div className="error-message general-error">
            {errors.general}
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className={errors.firstName ? 'error' : ''}
              placeholder="Enter your first name"
              autoComplete="given-name"
              required
            />
            {errors.firstName && (
              <span className="error-text">{errors.firstName}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className={errors.lastName ? 'error' : ''}
              placeholder="Enter your last name"
              autoComplete="family-name"
              required
            />
            {errors.lastName && (
              <span className="error-text">{errors.lastName}</span>
            )}
          </div>
        </div>

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
            placeholder="Create a strong password"
            autoComplete="new-password"
            required
          />
          {formData.password && (
            <div className="password-strength">
              <div className="strength-bar">
                <div 
                  className="strength-fill"
                  style={{ 
                    width: `${(passwordStrength / 6) * 100}%`,
                    backgroundColor: getPasswordStrengthColor(passwordStrength)
                  }}
                />
              </div>
              <span className="strength-text">
                {getPasswordStrengthText(passwordStrength)}
              </span>
            </div>
          )}
          {errors.password && (
            <span className="error-text">{errors.password}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={errors.confirmPassword ? 'error' : ''}
            placeholder="Confirm your password"
            autoComplete="new-password"
            required
          />
          {errors.confirmPassword && (
            <span className="error-text">{errors.confirmPassword}</span>
          )}
        </div>

        <div className="form-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleInputChange}
              required
            />
            <span className="checkmark"></span>
            I agree to the{' '}
            <a href="/terms" target="_blank" rel="noopener noreferrer">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>
          </label>
          
          {errors.agreeToTerms && (
            <span className="error-text">{errors.agreeToTerms}</span>
          )}
        </div>

        <div className="form-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="marketingEmails"
              checked={formData.marketingEmails}
              onChange={handleInputChange}
            />
            <span className="checkmark"></span>
            Send me marketing emails and updates
          </label>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-full"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>

        {/* Alternative sign-up methods */}
        <div className="alternative-signup">
          <div className="divider">
            <span>or</span>
          </div>

          {showPasskeyOption && (
            <button
              type="button"
              className="btn btn-outline btn-full"
              onClick={handlePasskeySignUp}
              disabled={isLoading}
            >
              🔐 Sign up with Passkey
            </button>
          )}

          {showOTPOption && (
            <button
              type="button"
              className="btn btn-outline btn-full"
              onClick={handleOTPSignUp}
              disabled={isLoading}
            >
              📱 Sign up with SMS
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
          Already have an account?{' '}
          <button
            type="button"
            className="link-button"
            onClick={onSignIn}
          >
            Sign in
          </button>
        </p>
      </div>

      <style jsx>{`
        .sign-up-form {
          max-width: 500px;
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

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
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

        .password-strength {
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .strength-bar {
          flex: 1;
          height: 4px;
          background: #eee;
          border-radius: 2px;
          overflow: hidden;
        }

        .strength-fill {
          height: 100%;
          transition: all 0.3s ease;
        }

        .strength-text {
          font-size: 0.8rem;
          font-weight: 500;
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
          flex-direction: column;
          gap: 0.5rem;
        }

        .checkbox-label {
          display: flex;
          align-items: flex-start;
          cursor: pointer;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .checkbox-label input {
          margin-right: 0.5rem;
          margin-top: 0.1rem;
        }

        .checkbox-label a {
          color: #4285f4;
          text-decoration: none;
        }

        .checkbox-label a:hover {
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

        .alternative-signup {
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

        @media (max-width: 600px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default SignUpForm;

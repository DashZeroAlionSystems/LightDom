/**
 * Signup Page - Material Design 3
 * User registration with email verification
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { validateEmail, validatePassword, validateMatch, calculatePasswordStrength } from '@/lib/validators';
import { httpClient } from '@/lib/http-client';
import { Mail, Lock, User, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  
  // Calculate password strength
  const passwordStrength = formData.password 
    ? calculatePasswordStrength(formData.password)
    : null;
  
  const getStrengthColor = (label: string) => {
    switch (label) {
      case 'weak': return 'bg-error';
      case 'fair': return 'bg-warning';
      case 'good': return 'bg-info';
      case 'strong': return 'bg-success';
      case 'very strong': return 'bg-success';
      default: return 'bg-surface-variant';
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    // Email validation
    const emailResult = validateEmail(formData.email);
    if (!emailResult.valid && emailResult.errors) {
      newErrors.email = emailResult.errors[0];
    }
    
    // Password validation
    const passwordResult = validatePassword(formData.password);
    if (!passwordResult.valid && passwordResult.errors) {
      newErrors.password = passwordResult.errors[0];
    }
    
    // Confirm password validation
    const matchResult = validateMatch(formData.password, formData.confirmPassword, 'Passwords');
    if (!matchResult.valid && matchResult.errors) {
      newErrors.confirmPassword = matchResult.errors[0];
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    
    try {
      await httpClient.post('/api/auth/signup', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err: any) {
      setErrors({
        submit: err?.response?.data?.message || 'Signup failed. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
        <Card variant="elevated" padding="lg" className="w-full max-w-md text-center">
          <CardContent>
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-title-lg font-semibold mb-2">Account Created!</h2>
            <p className="text-body-md text-on-surface-variant mb-4">
              We've sent a verification email to <strong>{formData.email}</strong>
            </p>
            <p className="text-body-sm text-on-surface-variant">
              Please check your inbox and click the verification link to activate your account.
            </p>
            <p className="text-body-sm text-on-surface-variant mt-4">
              Redirecting to login...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 to-transparent opacity-50" />
      
      {/* Signup Card */}
      <Card variant="elevated" padding="lg" className="relative w-full max-w-md animate-fade-in">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center">
            <User className="h-6 w-6 text-on-primary" />
          </div>
          <CardTitle className="text-headline-md">Create Account</CardTitle>
          <CardDescription>Join LightDom to start optimizing</CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-label-md font-medium">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant" />
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="pl-10"
                  placeholder="John Doe"
                  disabled={isLoading}
                />
              </div>
              {errors.name && (
                <p className="text-label-sm text-error flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-label-md font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="pl-10"
                  placeholder="you@example.com"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-label-sm text-error flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-label-md font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && passwordStrength && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded ${
                          i <= passwordStrength.score ? getStrengthColor(passwordStrength.label) : 'bg-surface-variant'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-label-sm text-on-surface-variant capitalize">
                    Password strength: {passwordStrength.label}
                  </p>
                </div>
              )}
              
              {errors.password && (
                <p className="text-label-sm text-error flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <label className="text-label-md font-medium">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant" />
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-label-sm text-error flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-3 rounded-lg bg-error/10 border border-error/20">
                <p className="text-label-sm text-error flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="filled"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Button>

            {/* Terms */}
            <p className="text-label-sm text-on-surface-variant text-center">
              By signing up, you agree to our{' '}
              <Link to="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </form>
        </CardContent>
        
        <CardFooter className="text-center">
          <p className="text-body-sm text-on-surface-variant">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

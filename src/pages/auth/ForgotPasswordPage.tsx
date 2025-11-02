/**
 * Forgot Password Page - Material Design 3
 * Request password reset email
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { validateEmail } from '@/lib/validators';
import { httpClient } from '@/lib/http-client';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate email
    const emailResult = validateEmail(email);
    if (!emailResult.valid && emailResult.errors) {
      setError(emailResult.errors[0]);
      return;
    }

    setIsLoading(true);
    
    try {
      await httpClient.post('/api/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
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
            <h2 className="text-title-lg font-semibold mb-2">Check Your Email</h2>
            <p className="text-body-md text-on-surface-variant mb-4">
              We've sent password reset instructions to <strong>{email}</strong>
            </p>
            <p className="text-body-sm text-on-surface-variant mb-6">
              If you don't see the email, check your spam folder.
            </p>
            <Link to="/login">
              <Button variant="text" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 to-transparent opacity-50" />
      
      {/* Forgot Password Card */}
      <Card variant="elevated" padding="lg" className="relative w-full max-w-md animate-fade-in">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center">
            <Mail className="h-6 w-6 text-on-primary" />
          </div>
          <CardTitle className="text-headline-md">Forgot Password?</CardTitle>
          <CardDescription>
            Enter your email and we'll send you instructions to reset your password
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-label-md font-medium">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className="pl-10"
                  placeholder="you@example.com"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-label-sm text-error flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="filled"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="text-center">
          <Link to="/login" className="inline-flex items-center gap-2 text-primary font-medium hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

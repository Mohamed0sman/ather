'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/Icons';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { auth } from '@/utils/auth';
import { useToast } from '@/components/ui/use-toast';
import { getAuthError } from '@/utils/auth-errors';
import { OAuthSignIn } from '@/components/auth/OAuthSignIn';

export function CreateAccountForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const router = useRouter();
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !validateEmail(value)) {
      setIsEmailValid(false);
    } else {
      setIsEmailValid(true);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordStrength(checkPasswordStrength(value));
    if (value && value.length < 8) {
      setIsPasswordValid(false);
    } else {
      setIsPasswordValid(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    if (email && !validateEmail(email)) {
      toast({
        variant: 'destructive',
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        duration: 5000,
      });
      return;
    }

    // Validate password
    if (password && password.length < 8) {
      toast({
        variant: 'destructive',
        title: 'Weak Password',
        description: 'Password must be at least 8 characters long.',
        duration: 5000,
      });
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Password Mismatch',
        description: 'Passwords do not match. Please try again.',
        duration: 5000,
      });
      return;
    }

    if (!email || !password || !confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill in all fields.',
        duration: 5000,
      });
      return;
    }

    try {
      setIsLoading(true);
      await auth.signUp(email, password);
      toast({
        title: 'Account Created!',
        description: 'Your account has been created successfully. Redirecting to login...',
        duration: 3000,
      });
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (error: unknown) {
      // Don't log the full error object to avoid JSON parsing issues
      console.error('Signup error occurred');

      let errorMessage = 'An error occurred. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object') {
        const errObj = error as Record<string, unknown>;
        if (typeof errObj.message === 'string' && errObj.message) {
          errorMessage = errObj.message;
        } else if (typeof errObj.error_description === 'string' && errObj.error_description) {
          errorMessage = errObj.error_description;
        }
      }

      toast({
        variant: 'destructive',
        title: 'Account Creation Failed',
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return 'bg-destructive';
      case 2:
        return 'bg-yellow-500';
      case 3:
        return 'bg-blue-500';
      case 4:
        return 'bg-green-500';
      default:
        return 'bg-muted';
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Strong';
      default:
        return '';
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg border-0 bg-card">
      <form onSubmit={handleSubmit}>
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-3xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-medium hover:underline transition-colors">
              Sign in
            </Link>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={handleEmailChange}
              disabled={isLoading}
              required
              className={`h-11 ${!isEmailValid && email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            />
            {!isEmailValid && email && (
              <p className="text-xs text-destructive">Please enter a valid email address</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a strong password"
              value={password}
              onChange={handlePasswordChange}
              disabled={isLoading}
              required
              className={`h-11 ${!isPasswordValid && password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            />
            {password && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        level <= passwordStrength ? getPasswordStrengthColor() : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                {passwordStrength > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Password strength: <span className={getPasswordStrengthColor().replace('bg-', 'text-')}>{getPasswordStrengthText()}</span>
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
              className={`h-11 ${confirmPassword && password !== confirmPassword ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-destructive">Passwords do not match</p>
            )}
          </div>

          <Button 
            className="w-full h-11 font-medium" 
            type="submit" 
            disabled={isLoading || (!isEmailValid && !!email) || (!isPasswordValid && !!password)}
          >
            {isLoading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-4">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or sign up with
              </span>
            </div>
          </div>
          <OAuthSignIn isLoading={isLoading} onLoadingChange={setIsLoading} />
        </CardFooter>
      </form>
    </Card>
  );
}

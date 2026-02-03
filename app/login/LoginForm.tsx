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

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email before submitting
    if (email && !validateEmail(email)) {
      toast({
        variant: 'destructive',
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        duration: 5000,
      });
      return;
    }

    if (!email || !password) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please enter both email and password.',
        duration: 5000,
      });
      return;
    }

    try {
      setIsLoading(true);
      await auth.signIn(email, password);
      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
        duration: 3000,
      });
      router.push('/projects');
      router.refresh();
    } catch (error) {
      // Don't log the full error object to avoid JSON parsing issues
      console.error('Auth error occurred');
      const { message } = getAuthError(error);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: message,
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg border-0 bg-card">
      <form onSubmit={handleSubmit}>
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-3xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/create-account" className="text-primary font-medium hover:underline transition-colors">
              Create one now
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Link href="/forgot-password" className="text-xs text-primary hover:underline transition-colors">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              className="h-11"
            />
          </div>

          <Button 
            className="w-full h-11 font-medium" 
            type="submit" 
            disabled={isLoading || (!isEmailValid && !!email)}
          >
            {isLoading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
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
                Or continue with
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center max-w-xs">
            Note: You must create an account first before signing in with OAuth providers.
          </p>
          <OAuthSignIn isLoading={isLoading} onLoadingChange={setIsLoading} />
        </CardFooter>
      </form>
    </Card>
  );
}

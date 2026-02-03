'use client';

import { Suspense, useState } from 'react';
import { Icons } from '@/components/Icons';
import { Button } from '@/components/ui/button';
import { auth } from '@/utils/auth';
import { useToast } from '@/components/ui/use-toast';
import { getAuthError } from '@/utils/auth-errors';
import { useSearchParams } from 'next/navigation';

interface Props {
  isLoading?: boolean;
  onLoadingChange?: (loading: boolean) => void;
  redirectUrl?: string;
}

// Separate component to handle search params
function OAuthButtons({ isLoading, onLoadingChange, redirectUrl }: Props) {
  const [internalLoading, setInternalLoading] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();

  // Use either provided redirectUrl or next param from URL
  const nextUrl = redirectUrl || searchParams.get('next') || '/projects';

  // Use either parent loading state or internal state
  const loading = isLoading ?? internalLoading;
  const setLoading = onLoadingChange ?? setInternalLoading;

  const handleOAuthSignIn = async (provider: 'github' | 'google') => {
    try {
      setLoading(true);
      await auth.signInWithOAuth(provider, nextUrl);
    } catch (error) {
      const { message } = getAuthError(error);
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <Button
        variant="outline"
        type="button"
        disabled={loading}
        onClick={() => handleOAuthSignIn('github')}
      >
        <Icons.gitHub className="mr-2 h-4 w-4" />
        Github
      </Button>
      <Button
        variant="outline"
        type="button"
        disabled={loading}
        onClick={() => handleOAuthSignIn('google')}
      >
        <Icons.google className="mr-2 h-4 w-4" />
        Google
      </Button>
    </div>
  );
}

export function OAuthSignIn(props: Props) {
  return (
    <div className="w-full">
      <Suspense
        fallback={
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" disabled className="h-10">
              <Icons.gitHub className="mr-2 h-4 w-4" />
              Github
            </Button>
            <Button variant="outline" disabled className="h-10">
              <Icons.google className="mr-2 h-4 w-4" />
              Google
            </Button>
          </div>
        }
      >
        <OAuthButtons {...props} />
      </Suspense>
    </div>
  );
}

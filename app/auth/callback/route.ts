import { createClient } from '@/utils/supabase/server';
import { users } from '@/utils/users';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const next = requestUrl.searchParams.get('next') || '/projects';

    if (!code) {
      console.error('No code provided in callback');
      throw new Error('No code provided');
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth error:', error);
      throw error;
    }

    // For OAuth sign-ins, check if user already exists
    if (data.user) {
      const { data: existingUserByEmail } = await supabase
        .from('users')
        .select('id, email, provider')
        .eq('email', data.user.email)
        .maybeSingle();

      const currentProvider = data.user.app_metadata.provider;

      // If user doesn't exist by email, reject OAuth sign-in
      if (!existingUserByEmail && currentProvider !== 'email') {
        console.error('OAuth user not found:', data.user.email);
        await supabase.auth.signOut();
        
        const errorUrl = new URL('/auth/auth-error', requestUrl.origin);
        errorUrl.searchParams.set('error', 'Account not found. Please create an account first using email and password.');
        return NextResponse.redirect(errorUrl);
      }

      // If user exists but with different provider, reject
      if (existingUserByEmail && existingUserByEmail.provider !== currentProvider) {
        console.error('User exists with different provider:', data.user.email);
        await supabase.auth.signOut();
        
        const errorUrl = new URL('/auth/auth-error', requestUrl.origin);
        errorUrl.searchParams.set('error', 'This account was created with a different sign-in method.');
        return NextResponse.redirect(errorUrl);
      }
    }

    // Redirect to the intended page
    return NextResponse.redirect(new URL(next, requestUrl.origin));
  } catch (error) {
    console.error('Callback error:', error);
    // Add error to the URL so we can display it
    const errorUrl = new URL('/auth/auth-error', request.url);
    errorUrl.searchParams.set('error', 'Failed to sign in');
    return NextResponse.redirect(errorUrl);
  }
}

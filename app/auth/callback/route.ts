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

    // Check if user already exists in our database
    if (data.user) {
      // Check by email - if this email exists in our users table, allow sign-in
      const { data: existingUserByEmail } = await supabase
        .from('users')
        .select('id, email, provider')
        .eq('email', data.user.email)
        .maybeSingle();

      // If user doesn't have a profile with this email, reject the sign-in
      if (!existingUserByEmail) {
        console.error('User email not found in our system:', data.user.email);
        await supabase.auth.signOut();
        
        const errorUrl = new URL('/auth/auth-error', requestUrl.origin);
        errorUrl.searchParams.set('error', 'Account not found. Please create an account first.');
        return NextResponse.redirect(errorUrl);
      }

      // If user exists but signed up with a different provider, reject
      const currentProvider = data.user.app_metadata.provider;
      if (existingUserByEmail.provider !== currentProvider) {
        console.error('User exists with different provider:', data.user.email);
        await supabase.auth.signOut();
        
        const errorUrl = new URL('/auth/auth-error', requestUrl.origin);
        errorUrl.searchParams.set('error', 'This account was created with a different sign-in method.');
        return NextResponse.redirect(errorUrl);
      }

      // Capture user details after successful OAuth
      try {
        await users.captureUserDetails(data.user);
      } catch (error) {
        console.error('Error capturing user details:', error);
        // Don't throw here - we still want to complete the auth flow
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

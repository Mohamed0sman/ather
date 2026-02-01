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

    // Check if user already exists in our database before allowing sign-in
    if (data.user) {
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single();

      // If user doesn't exist in our database and this is not a sign-up flow
      // (indicated by the error being 'user_not_found'), reject the sign-in
      if (userError && userError.code === 'PGRST116') {
        // User doesn't have a profile - sign them out and show error
        console.error('User has no profile:', data.user.id);
        await supabase.auth.signOut();
        
        const errorUrl = new URL('/auth/auth-error', requestUrl.origin);
        errorUrl.searchParams.set('error', 'Account not found. Please create an account first.');
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

import { useAccessStore } from '@/stores/useAccessStore';
import { createClient } from './supabase/client';
import { users } from './users';

export type AuthError = {
  message: string;
  status?: number;
};

export const auth = {
  // Email & Password Sign Up
  signUp: async (email: string, password: string) => {
    const supabase = createClient();
    
    // Step 1: Sign up the user in Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    // If signup fails
    if (signUpError) {
      throw signUpError;
    }

    // If no user data, something went wrong
    if (!data.user) {
      throw new Error('Failed to create user account');
    }

    // Step 2: Create user profile in the users table
    try {
      await users.captureUserDetails(data.user);
    } catch (profileError) {
      console.error('Error creating user profile:', profileError);
      // Don't fail signup if profile creation fails
      // The trigger might handle it, or we can create it later
    }

    return data;
  },

  // Email & Password Sign In
  signIn: async (email: string, password: string) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    if (data.user) {
      // Ensure user profile exists
      try {
        await users.captureUserDetails(data.user);
      } catch (profileError) {
        console.error('Error ensuring user profile:', profileError);
      }
    }

    return data;
  },

  // OAuth Sign In (Google, GitHub)
  signInWithOAuth: async (provider: 'github' | 'google', nextUrl?: string) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/auth/callback?next=${nextUrl || '/projects'}`,
      },
    });
    if (error) throw error;
    return data;
  },

  // Sign Out
  signOut: async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    useAccessStore.getState().reset();
    if (error) throw { message: error.message, status: error.status };
  },

  // Password Reset Request
  resetPasswordRequest: async (email: string) => {
    const supabase = createClient();

    // Try to get user from users table, but don't fail if table doesn't exist
    let user = null;
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, provider')
        .eq('email', email)
        .single();

      if (!userError && userData) {
        user = userData;
      }
    } catch (e) {
      // Table doesn't exist or other error - proceed without user check
      console.warn('Could not fetch user from users table:', e);
    }

    // If user doesn't exist or doesn't use email auth, still return success
    // This prevents email enumeration attacks
    if (!user || user.provider !== 'email') {
      return {
        success: true,
        message: 'If an account exists, a password reset link will be sent.',
      };
    }

    const resetLink = `${location.origin}/auth/reset-password`;
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: resetLink,
    });

    if (error) throw error;

    return {
      success: true,
      message: 'If an account exists, a password reset link will be sent.',
    };
  },

  // Password Reset
  resetPassword: async (newPassword: string) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw { message: error.message, status: error.status };
    return data;
  },
};

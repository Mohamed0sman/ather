import type { AuthError as SupabaseAuthError } from '@supabase/supabase-js';
import { PostgrestError } from '@supabase/supabase-js';

export type AuthErrorType =
  | 'InvalidCredentials'
  | 'EmailNotConfirmed'
  | 'InvalidEmail'
  | 'WeakPassword'
  | 'EmailInUse'
  | 'DatabaseError'
  | 'Default';

// Helper to safely get string message from error
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (error && typeof error === 'object') {
    const errObj = error as Record<string, unknown>;
    if (typeof errObj.message === 'string' && errObj.message) {
      return errObj.message;
    }
    if (typeof errObj.error_description === 'string' && errObj.error_description) {
      return errObj.error_description;
    }
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An error occurred. Please try again.';
}

export const getAuthError = (
  error: SupabaseAuthError | PostgrestError | unknown
): { type: AuthErrorType; message: string } => {
  // Handle unknown or undefined error types
  if (!error) {
    return {
      type: 'Default',
      message: 'An unknown error occurred. Please try again.',
    };
  }

  const errorMessage = getErrorMessage(error).toLowerCase();

  // Check for specific error codes
  if (error && typeof error === 'object' && 'code' in error) {
    const errWithCode = error as { code: string };
    switch (errWithCode.code) {
      case '23505':
        return {
          type: 'EmailInUse',
          message: 'This email is already registered. Try signing in instead.',
        };
      case '23503':
        return {
          type: 'DatabaseError',
          message: 'Database error. Please try again later.',
        };
    }
  }

  // Handle specific error messages
  if (errorMessage.includes('invalid login credentials')) {
    return {
      type: 'InvalidCredentials',
      message: 'Invalid email or password. Please try again.',
    };
  }

  if (errorMessage.includes('email not confirmed')) {
    return {
      type: 'EmailNotConfirmed',
      message: 'Please verify your email before signing in.',
    };
  }

  if (errorMessage.includes('invalid email')) {
    return {
      type: 'InvalidEmail',
      message: 'Please enter a valid email address.',
    };
  }

  if (errorMessage.includes('password')) {
    return {
      type: 'WeakPassword',
      message: 'Password should be at least 6 characters long.',
    };
  }

  if (
    errorMessage.includes('email already registered') ||
    errorMessage.includes('email is already registered') ||
    errorMessage.includes('user already registered')
  ) {
    return {
      type: 'EmailInUse',
      message: 'This email is already registered. Try signing in instead.',
    };
  }

  // Check for database errors
  if (errorMessage.includes('database error') || errorMessage.includes('saving new user')) {
    return {
      type: 'DatabaseError',
      message: 'Database error. Please try again later or contact support.',
    };
  }

  // Check for rate limiting or too many requests
  if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
    return {
      type: 'Default',
      message: 'Too many attempts. Please wait a moment and try again.',
    };
  }

  // Check for network errors
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('connection')
  ) {
    return {
      type: 'Default',
      message: 'Network error. Please check your connection and try again.',
    };
  }

  // Return the actual error message
  return {
    type: 'Default',
    message: getErrorMessage(error),
  };
};

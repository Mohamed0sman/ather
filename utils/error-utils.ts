/**
 * Helper function to create a proper Error from Supabase or other error sources
 * This ensures all thrown errors are proper Error instances with meaningful messages
 */
export function createError(message: string, originalError?: unknown): Error {
  // If originalError is provided and is an object with details, include it
  if (originalError && typeof originalError === 'object') {
    const errObj = originalError as Record<string, unknown>;
    if (typeof errObj.details === 'string' && errObj.details) {
      return new Error(`${message}: ${errObj.details}`);
    }
    if (typeof errObj.hint === 'string' && errObj.hint) {
      return new Error(`${message}: ${errObj.hint}`);
    }
  }
  return new Error(message);
}

/**
 * Safely extract a string message from any error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  } else if (error && typeof error === 'object') {
    const errObj = error as Record<string, unknown>;
    if (typeof errObj.message === 'string') {
      return errObj.message;
    } else if (typeof errObj.error_description === 'string') {
      return errObj.error_description;
    } else if (typeof errObj.details === 'string') {
      return errObj.details;
    }
    // Safe fallback
    return 'Unknown error';
  }
  if (error !== null && error !== undefined) {
    // Only use String() for primitive values
    const type = typeof error;
    if (type === 'string') return error as string;
    if (type === 'number') return String(error);
    if (type === 'boolean') return String(error);
  }
  return 'Unknown error';
}

/**
 * Throw a proper Error from a Supabase error
 */
export function throwSupabaseError(error: unknown, contextMessage?: string): never {
  const message = contextMessage || getErrorMessage(error);
  throw createError(message, error);
}

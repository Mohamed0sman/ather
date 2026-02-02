import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// paths that don't require authentication
const publicPaths = [
  '/', // Landing page
  '/login', // Auth pages
  '/create-account',
  '/forgot-password',
  '/auth/callback',
  '/auth/reset-password',
  '/auth/auth-error',
  '/invites/:id', // Invite pages
  '/profile/:id', // Public profile pages
];

// Check if path is public (faster check)
const isPublicPath = (path: string): boolean => {
  // Direct exact matches for common paths
  const directPublic = ['/', '/login', '/create-account', '/forgot-password', '/auth/callback', '/auth/reset-password', '/auth/auth-error'];
  if (directPublic.includes(path)) return true;
  
  // Pattern matches
  if (path.startsWith('/invites/')) return true;
  if (path.match(/^\/profile\/[\w-]+$/)) return true;
  
  return false;
};

export async function updateSession(request: NextRequest) {
  let supabaseResponse: NextResponse | undefined;
  
  try {
    supabaseResponse = NextResponse.next({
      request,
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse!.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const currentPath = request.nextUrl.pathname;

    // Skip session check for public paths
    if (isPublicPath(currentPath)) {
      return supabaseResponse;
    }

    // Get session with timeout
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Session timeout')), 5000)
    );
    
    const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as { data: { session: any } };

    if (!session) {
      // no user, redirect to login page
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', currentPath);
      return NextResponse.redirect(url);
    }

    if (currentPath === '/login' || currentPath === '/create-account') {
      const nextPath = request.nextUrl.searchParams.get('next') || '/projects';
      return NextResponse.redirect(new URL(nextPath, request.url));
    }

  } catch (error) {
    // On error, allow the request to proceed for public paths
    const currentPath = request.nextUrl.pathname;
    if (isPublicPath(currentPath)) {
      return supabaseResponse || NextResponse.next({ request });
    }
    
    // For protected paths, redirect to login on error
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', currentPath);
    return NextResponse.redirect(url);
  }

  return supabaseResponse!;
}

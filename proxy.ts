import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const DJANGO_API_HOST = process.env.DJANGO_API_HOST;

export async function refreshAccessToken(refreshToken: string) {
  const refreshResponse = await fetch(`${DJANGO_API_HOST}/auth/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!refreshResponse.ok) {
    console.error('Failed to refresh access token');
    return null;
  }

  const data = await refreshResponse.json();
  return data.access as string | null;
}

export async function proxy(request: NextRequest) {
  // Explicitly handle the health check path to ensure it's always available.
  if (request.nextUrl.pathname === '/api/health') {
    return NextResponse.json({ status: 'ok' });
  }

  const loginUrl = new URL('/login', request.url);
  const accessToken = request.cookies.get('accessToken')?.value;

  // 1. If we have an access token, try to verify it
  try {
    if (accessToken) {
      const verifyResponse = await fetch(`${DJANGO_API_HOST}/auth/token/verify/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: accessToken }),
      });
      
      if (verifyResponse.ok) {
        // Token is valid, proceed
        return NextResponse.next();
      }
    }
  } catch (error) {
    console.error('Error verifying token:', error);
    // Fall through to refresh logic on network error
  }

  // 2. If verification fails or token is missing, try to refresh
  const refreshToken = request.cookies.get('refreshToken')?.value;
  if (refreshToken) {
    const newAccessToken = await refreshAccessToken(refreshToken);
    if (newAccessToken) {
      // If refresh is successful, set the new token and continue
      const response = NextResponse.next();
      response.cookies.set('accessToken', newAccessToken, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === 'production',
        // sameSite: 'strict',
        sameSite: 'lax', // Adjusted for development; change to 'strict' or 'none' in production as needed
        secure: false,
        // sameSite: 'none',  
        path: '/',
        //domain: '.amazonaws.com', // Adjust this to your domain if needed
        maxAge: 60 * 60 * 24, // 1 day
      });
      return response;
    }
  }

  // 3. If all else fails, redirect to login
  const response = NextResponse.redirect(loginUrl);
  if (request.cookies.has('accessToken')) response.cookies.delete('accessToken');
  if (request.cookies.has('refreshToken')) response.cookies.delete('refreshToken');
  if (request.cookies.has('username')) response.cookies.delete('username');
  return response;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/health (health check endpoint)
     * - api/auth (authentication routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (the login page itself)
     */
    '/((?!api/health|api/auth|_next/static|_next/image|favicon.ico|login).*)',
  ],
};
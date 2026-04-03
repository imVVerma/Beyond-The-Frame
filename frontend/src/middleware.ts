import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Next.js Middleware to protect the Admin Dashboard.
 * This runs at the edge before the page even begins to load.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Only protect /admin routes
  if (pathname.startsWith('/admin')) {
    const session = request.cookies.get('auth-session')
    
    // If no session cookie exists, redirect to login immediately
    if (!session) {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

// Ensure the middleware only runs for relevant paths
export const config = {
  matcher: ['/admin/:path*'],
}

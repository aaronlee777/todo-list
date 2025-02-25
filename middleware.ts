import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Skip middleware for API routes, next-auth routes, and static files
  if (
    request.nextUrl.pathname.startsWith('/api/auth') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.includes('/.')
  ) {
    return NextResponse.next()
  }

  const token = await getToken({ req: request })
  const isAuth = !!token
  const isAuthPage = request.nextUrl.pathname === '/auth'
  const isRootPage = request.nextUrl.pathname === '/'

  if (isAuth) {
    if (isAuthPage || isRootPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  } else {
    if (!isAuthPage && !isRootPage) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}

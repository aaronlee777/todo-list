import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Skip middleware for API routes and next-auth routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
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
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}

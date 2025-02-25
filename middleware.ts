import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuth = !!token
  const isAuthPage = request.nextUrl.pathname === '/auth'
  const isRootPage = request.nextUrl.pathname === '/'

  if (isAuth) {
    if (isAuthPage) {
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
  matcher: ['/auth', '/dashboard/:path*']
}

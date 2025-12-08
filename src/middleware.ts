import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Routes admin uniquement
    if (pathname.startsWith('/admin')) {
      if (token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    // Routes formateur
    if (pathname.startsWith('/instructor')) {
      if (token?.role !== 'INSTRUCTOR' && token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Pages publiques
        const publicPaths = ['/', '/courses', '/auth', '/api/auth']
        if (publicPaths.some((path) => pathname.startsWith(path))) {
          return true
        }

        // Tout le reste nécessite une authentification
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/my-courses/:path*',
    '/achievements/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/admin/:path*',
    '/instructor/:path*',
    '/courses/:path*/learn/:path*',
    '/courses/:path*/quiz/:path*',
  ],
}

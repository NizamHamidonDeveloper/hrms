import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequestWithAuth } from 'next-auth/middleware'
import { ROLE_ID } from './lib/roles'

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Defensive: get roleId as number if present
    let roleId: number | undefined = undefined;
    if (token && typeof token === 'object' && token.profile && typeof token.profile === 'object' && 'role_id' in token.profile) {
      const rawRoleId = (token.profile as any).role_id;
      if (rawRoleId !== undefined && rawRoleId !== null && !isNaN(Number(rawRoleId))) {
        roleId = Number(rawRoleId);
      }
    }

    // Redirect to dashboard if trying to access login page while authenticated
    if (path === '/login' && token) {
      // Role priority: hr_admin > manager > employee
      let redirectPath = '/employee/dashboard'
      if (roleId === ROLE_ID.HR_ADMIN) {
        redirectPath = '/admin/dashboard'
      } else if (roleId === ROLE_ID.MANAGER) {
        redirectPath = '/manager/dashboard'
      } else if (roleId === ROLE_ID.EMPLOYEE) {
        redirectPath = '/employee/dashboard'
      }
      return NextResponse.redirect(new URL(redirectPath, req.url))
    }

    // Role-based access control using role_id
    if (path.startsWith('/admin')) {
      if (roleId !== ROLE_ID.HR_ADMIN) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    if (path.startsWith('/manager')) {
      if (roleId !== ROLE_ID.MANAGER) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    if (path.startsWith('/team')) {
      if (!roleId || !([ROLE_ID.MANAGER, ROLE_ID.HR_ADMIN] as number[]).includes(roleId)) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    // Leave management access control
    if (path.startsWith('/leave')) {
      // Allow access to leave balance and summary for all authenticated users
      if (path === '/leave/balance' || path === '/leave/summary') {
        return NextResponse.next()
      }
      // Only HR admin can access leave management features
      if (roleId !== ROLE_ID.HR_ADMIN) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/leave/:path*',
    '/team/:path*',
    '/admin/:path*',
    '/settings/:path*',
    '/calendar/:path*',
    '/manager/:path*',
  ],
} 
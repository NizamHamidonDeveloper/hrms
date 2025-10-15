import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { UserRole } from './auth/types'

// Mock user database is now defined inline in the authorize function

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development',
  debug: process.env.NODE_ENV === 'development',
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.username || !credentials?.password) {
            console.log('DEBUG: Missing username or password', credentials)
            return null
          }

          // Mock user database for development
          const mockUsers = [
            {
              id: '1',
              username: 'employee',
              password: 'password',
              email: 'employee@example.com',
              name: 'Demo Employee',
              role_id: 4, // Employee role
              department: 'Engineering',
            },
            {
              id: '2',
              username: 'manager',
              password: 'password',
              email: 'manager@example.com',
              name: 'Demo Manager',
              role_id: 3, // Manager role
              department: 'Engineering',
            },
            {
              id: '3',
              username: 'admin',
              password: 'password',
              email: 'admin@example.com',
              name: 'Demo Admin',
              role_id: 5, // HR Admin role
              department: 'HR',
            },
          ]

          // Find user by username and password
          const user = mockUsers.find(
            (u) => u.username === credentials.username && u.password === credentials.password
          )

          if (!user) {
            console.log('DEBUG: Invalid credentials')
            return null
          }

          console.log('DEBUG: Login successful for user:', user.name)
          // Map role_id to UserRole string
          let roleString: '4' | '3' | '5' | 'hr_admin' | 'manager' | 'employee';
          switch (user.role_id) {
            case 4:
              roleString = 'employee';
              break;
            case 3:
              roleString = 'manager';
              break;
            case 5:
              roleString = 'hr_admin';
              break;
            default:
              roleString = 'employee';
          }
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            roles: [roleString],
            department: user.department,
            joinDate: new Date(),
            status: 'active' as const,
          }
        } catch (error) {
          console.error('DEBUG: Authentication error:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.roles = user.roles as UserRole[]
        token.id = user.id
        token.name = user.name
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.roles = token.roles as UserRole[]
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.email = token.email as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
}

function isSessionWithUser(session: unknown): session is { user: { roles: string[] } } {
  if (
    typeof session !== 'object' ||
    session === null ||
    !('user' in session)
  ) {
    return false;
  }
  const user = (session as { user?: unknown }).user;
  if (
    typeof user !== 'object' ||
    user === null ||
    !('roles' in user)
  ) {
    return false;
  }
  const roles = (user as { roles?: unknown }).roles;
  return Array.isArray(roles);
}

export function hasRole(session: unknown, role: UserRole): boolean {
  if (!isSessionWithUser(session)) return false;
  return session.user.roles.includes(role);
}

export function hasAnyRole(session: unknown, roles: UserRole[]): boolean {
  if (!isSessionWithUser(session)) return false;
  return session.user.roles.some((r: string) => roles.includes(r as UserRole));
} 
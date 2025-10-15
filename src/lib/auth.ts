import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { User, UserRole } from './auth/types'

// This is a mock user database for the prototype
// In a real application, this would be replaced with a database
const users: User[] = [
  {
    id: '1',
    email: 'employee@example.com',
    name: 'Demo Employee',
    roles: ['employee'],
    department: 'Engineering',
    joinDate: new Date('2023-01-01'),
    status: 'active',
  },
  {
    id: '2',
    email: 'manager@example.com',
    name: 'Demo Manager',
    roles: ['manager', 'employee'],
    department: 'Engineering',
    joinDate: new Date('2023-01-01'),
    status: 'active',
  },
  {
    id: '3',
    email: 'admin@example.com',
    name: 'Demo Admin',
    roles: ['hr_admin', 'employee'],
    department: 'HR',
    joinDate: new Date('2023-01-01'),
    status: 'active',
  },
]

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // For the prototype, we'll accept any password
        // In a real application, you would verify the password against a hashed value
        const user = users.find((user) => user.email === credentials.email)

        if (!user) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          roles: user.roles,
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
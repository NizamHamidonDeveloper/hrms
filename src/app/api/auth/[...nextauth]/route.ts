import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { User, UserRole } from '@/lib/auth/types'

// This is a mock user database for the prototype
// In a real application, this would be replaced with a database
const users: User[] = [
  {
    id: '1',
    email: 'employee@example.com',
    name: 'Demo Employee',
    roles: ['4'],
    department: 'Engineering',
    joinDate: new Date('2023-01-01'),
    status: 'active',
  },
  {
    id: '2',
    email: 'manager@example.com',
    name: 'Demo Manager',
    roles: ['3', '4'],
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

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          console.log('DEBUG: Missing username or password', credentials)
          return null
        }
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          throw new Error('NEXT_PUBLIC_API_URL is not set');
        }
        try {
          // Call Laravel backend login endpoint
          const res = await fetch(`${apiUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: credentials.username, password: credentials.password })
          })
          const data = await res.json()
          if (!data.status || !data.user || !data.token) {
            console.log('DEBUG: Login failed', data)
            return null
          }
          // Store profile at the top level for easy access
          return {
            id: data.user.id?.toString() ?? '',
            email: data.user.email ?? '',
            name: data.user.name ?? '',
            accessToken: data.token.access_token ?? '',
            user: data.user,
            profile: data.profile,
          } as any // Type assertion for NextAuth user
        } catch (e) {
          console.log('DEBUG: Exception during login', e)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id ?? '';
        token.name = (user as any).name ?? '';
        token.email = (user as any).email ?? '';
        token.accessToken = (user as any).accessToken ?? '';
        token.user = (user as any).user ?? null;
        token.profile = (user as any).profile ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.id || '';
        (session.user as any).name = token.name || '';
        (session.user as any).email = token.email || '';
        (session as any).accessToken = token.accessToken || '';
        (session as any).user = token.user || null;
        (session as any).profile = token.profile || null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
})

export { handler as GET, handler as POST } 
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { User } from '@/lib/auth/types'

// Removed unused mock users array

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
            roles: ['4'], // Default to employee role
            department: 'Engineering',
            joinDate: new Date(),
            status: 'active',
          } as User
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
        const userObj = user as { id?: string; name?: string; email?: string; accessToken?: string; user?: unknown; profile?: unknown };
        token.id = userObj.id ?? '';
        token.name = userObj.name ?? '';
        token.email = userObj.email ?? '';
        token.accessToken = userObj.accessToken ?? '';
        token.user = userObj.user ?? null;
        token.profile = userObj.profile ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        const sessionUser = session.user as { id?: string; name?: string; email?: string };
        const sessionObj = session as { accessToken?: string; user?: unknown; profile?: unknown };
        sessionUser.id = (token.id as string) || '';
        sessionUser.name = (token.name as string) || '';
        sessionUser.email = (token.email as string) || '';
        sessionObj.accessToken = (token.accessToken as string) || '';
        sessionObj.user = token.user || null;
        sessionObj.profile = token.profile || null;
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
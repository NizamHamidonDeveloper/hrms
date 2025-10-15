import { getServerSession } from 'next-auth/next'
import { authOptions } from '../lib/auth'
import { GetServerSideProps } from 'next'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { getSession } from 'next-auth/react'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await signIn('credentials', {
      username,
      password,
      remember,
      redirect: false,
    })
    if (!result?.error) {
      const session = await getSession()
      const roles = (session as { user?: { roles?: string[] } })?.user?.roles
      const role = roles?.[0]
      if (role === 'hr_admin') {
        router.push('/admin/dashboard');
        return;
      } else if (role === 'manager') {
        router.push('/manager/dashboard');
        return;
      } else if (role === 'employee') {
        router.push('/employee/dashboard');
        return;
      } else {
        router.push('/');
        return;
      }
    } else {
      setError('Invalid username or password')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-teal-100 to-teal-200 relative overflow-hidden">
      {/* Abstract background shape */}
      <svg className="absolute -top-32 -left-32 w-[500px] h-[500px] opacity-20" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="250" cy="250" rx="250" ry="180" fill="#14b8a6" />
      </svg>
      <div className="relative z-10 max-w-md w-full mx-auto p-8 bg-white rounded-3xl shadow-2xl flex flex-col gap-8">
        <div className="flex flex-col items-center gap-2">
          <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 shadow-lg mb-2">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          </span>
          <h2 className="text-3xl font-extrabold text-teal-800 tracking-tight">Sign in</h2>
          <p className="text-teal-700 text-sm text-center">Welcome back! Please enter your credentials to continue.</p>
        </div>
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="text-sm font-medium text-teal-900">Username</label>
            <input
              id="username"
              name="username"
              autoComplete="username"
              required
              className="block w-full rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-teal-900 placeholder-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 text-base shadow-sm"
              placeholder="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 relative">
            <label htmlFor="password" className="text-sm font-medium text-teal-900">Password</label>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              className="block w-full rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-teal-900 placeholder-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 text-base shadow-sm pr-12"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              aria-describedby="toggle-password-visibility"
            />
            <button
              type="button"
              tabIndex={0}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              id="toggle-password-visibility"
              className="absolute right-3 top-1/2 flex items-center px-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
              onClick={() => setShowPassword(v => !v)}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-teal-400" aria-hidden="true" />
              ) : (
                <EyeIcon className="h-5 w-5 text-teal-400" aria-hidden="true" />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-teal-800 text-sm">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="rounded border-teal-300 text-teal-600 focus:ring-teal-400 focus:outline-none"
              />
              Remember Me
            </label>
            <a href="#" className="text-teal-600 hover:underline text-sm font-medium">Forgot password?</a>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg px-8 py-3 font-bold text-base hover:from-teal-600 hover:to-teal-700 focus:ring-2 focus:ring-teal-400 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          {error && <p className="mt-2 text-sm text-red-600 text-center">{error}</p>}
        </form>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)
  // Use user.roles for role-based redirect
  const roles = (session as { user?: { roles?: string[] } })?.user?.roles;
  const role = roles?.[0];
  console.log('LOGIN PAGE DEBUG: session:', session, 'role:', role);
  if (role === 'hr_admin') {
    return { redirect: { destination: '/admin/dashboard', permanent: false } }
  } else if (role === 'manager') {
    return { redirect: { destination: '/manager/dashboard', permanent: false } }
  } else if (role === 'employee') {
    return { redirect: { destination: '/employee/dashboard', permanent: false } }
  }
  return { props: {} }
} 
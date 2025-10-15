import { Inter } from 'next/font/google'
import { ReactNode } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

interface RootLayoutProps {
  children: ReactNode
  user?: {
    name: string
    role: string
    avatar?: string
  }
}

export default function RootLayout({ children, user }: RootLayoutProps) {
  // For demo purposes, using a default user if none provided
  const currentUser = user || {
    name: 'Demo User',
    role: 'employee',
  }

  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="min-h-screen bg-gray-50">
        <div className="flex min-h-screen">
          <Sidebar activeRole={currentUser.role} />
          <div className="flex-1 flex flex-col">
            <Header
              userName={currentUser.name}
              userRole={currentUser.role}
              userAvatar={currentUser.avatar}
            />
            <main className="flex-1">
              <div className="p-8">
                {children}
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  )
} 
import { Inter } from 'next/font/google'
import Providers from './providers'
import './globals.css'
import ToasterProvider from '@/components/common/ToasterProvider'
import { ThemeProvider } from '@/lib/theme/ThemeContext'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = {
  title: 'HRMS Next.js',
  description: 'Human Resource Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="min-h-screen bg-gray-50">
        <ThemeProvider>
          <Providers>{children}</Providers>
          <ToasterProvider />
        </ThemeProvider>
      </body>
    </html>
  )
}

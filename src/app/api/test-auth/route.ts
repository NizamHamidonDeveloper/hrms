import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    // Test NextAuth functionality with the corrected authOptions
    const session = await getServerSession(authOptions)
    
    return NextResponse.json({
      success: true,
      session: session,
      message: 'Authentication test successful',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Auth test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Authentication test failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

'use client'

import { useSession } from 'next-auth/react'
import LeaveApplicationForm from '@/components/leave/LeaveApplicationForm'

export default function ApplyLeavePage() {
  const { status } = useSession()

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen bg-teal-50 text-lg">Loading...</div>
  }

  if (status === 'unauthenticated') {
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    return null
  }

  return (
    <div className="p-8 bg-teal-50 min-h-screen text-gray-900">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Apply for Leave</h1>
          <p className="text-lg text-gray-600">Submit a new leave request below. All fields marked * are required.</p>
        </div>
        <LeaveApplicationForm />
      </div>
    </div>
  )
} 
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import LeaveApplicationForm from '@/components/leave/LeaveApplicationForm'

export default function ApplyLeavePage() {
  const { status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-gray-900">Loading...</div>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Apply for Leave</h1>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="py-4">
          <LeaveApplicationForm />
        </div>
      </div>
    </div>
  )
} 
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import LeaveBalanceCard from '@/components/leave/LeaveBalanceCard'
import LeaveBalanceBreakdown from '@/components/leave/LeaveBalanceBreakdown'
import { LeaveBalanceDetails } from '@/types/leave'

async function fetchLeaveBalance(): Promise<LeaveBalanceDetails> {
  const res = await fetch('/api/leave/balance')
  if (!res.ok) {
    throw new Error('Failed to fetch leave balance')
  }
  return res.json()
}

export default function LeaveBalancePage() {
  const { status } = useSession()
  const router = useRouter()

  const { data: leaveBalance, isLoading, isError } = useQuery<LeaveBalanceDetails>({
    queryKey: ['leaveBalance'],
    queryFn: fetchLeaveBalance
  })

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

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-gray-900">Loading leave balance...</div>
        </div>
      </div>
    )
  }

  if (isError || !leaveBalance) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-red-600">Error loading leave balance</div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">My Leave Balances</h1>
        <p className="mt-1 text-sm text-gray-600">View your available leave entitlements</p>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="py-4">
          {/* Leave Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {leaveBalance.cards.map((card) => (
              <LeaveBalanceCard key={card.type} data={card} />
            ))}
          </div>

          {/* Leave Balance Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <LeaveBalanceBreakdown data={leaveBalance.breakdown} />

            {/* Leave Policy Information */}
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">Leave Policy Information</h4>
              <div className="bg-blue-50 rounded-lg p-4">
                <h5 className="text-sm font-medium text-blue-800 mb-2">{leaveBalance.policyInfo.title}</h5>
                <p className="text-sm text-blue-700">{leaveBalance.policyInfo.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
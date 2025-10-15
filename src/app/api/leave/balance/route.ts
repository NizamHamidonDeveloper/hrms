import { NextResponse } from 'next/server'
import { LeaveBalanceDetails, LeaveType } from '@/types/leave'

// Mock data for demonstration
const mockLeaveBalance: LeaveBalanceDetails = {
  cards: [
    {
      type: LeaveType.ANNUAL,
      icon: 'fas fa-plane-departure',
      iconBgColor: 'bg-blue-100',
      iconTextColor: 'text-blue-600',
      entitled: 18,
      taken: 5,
      pending: 3,
      available: 10,
      isAvailable: true
    },
    {
      type: LeaveType.SICK,
      icon: 'fas fa-briefcase-medical',
      iconBgColor: 'bg-red-100',
      iconTextColor: 'text-red-600',
      entitled: 14,
      taken: 2,
      pending: 0,
      available: 12,
      isAvailable: true
    },
    {
      type: LeaveType.EMERGENCY,
      icon: 'fas fa-exclamation-triangle',
      iconBgColor: 'bg-yellow-100',
      iconTextColor: 'text-yellow-600',
      entitled: 5,
      taken: 1,
      pending: 1,
      available: 3,
      isAvailable: true
    },
    {
      type: LeaveType.COMPASSIONATE,
      icon: 'fas fa-hand-holding-heart',
      iconBgColor: 'bg-purple-100',
      iconTextColor: 'text-purple-600',
      entitled: 3,
      taken: 0,
      pending: 0,
      available: 3,
      isAvailable: true
    },
    {
      type: LeaveType.REPLACEMENT,
      icon: 'fas fa-exchange-alt',
      iconBgColor: 'bg-indigo-100',
      iconTextColor: 'text-indigo-600',
      entitled: 2,
      taken: 0,
      pending: 0,
      available: 2,
      isAvailable: true
    },
    {
      type: LeaveType.MATERNITY,
      icon: 'fas fa-baby',
      iconBgColor: 'bg-pink-100',
      iconTextColor: 'text-pink-600',
      entitled: 90,
      taken: 0,
      pending: 0,
      available: 90,
      isAvailable: true
    },
    {
      type: LeaveType.PATERNITY,
      icon: 'fas fa-baby-carriage',
      iconBgColor: 'bg-gray-100',
      iconTextColor: 'text-gray-400',
      entitled: 0,
      taken: 0,
      pending: 0,
      available: 0,
      isAvailable: false
    }
  ],
  breakdown: [
    {
      year: 2025,
      entitled: 18,
      taken: 5,
      carriedForward: 2,
      available: 10
    },
    {
      year: 2024,
      entitled: 16,
      taken: 14,
      carriedForward: 2,
      available: 0
    }
  ],
  policyInfo: {
    title: 'Annual Leave Policy',
    description: 'Employees are entitled to 18 days of annual leave per year. Up to 5 days can be carried forward to the next year. Leave must be approved by your manager at least 2 weeks in advance.'
  }
}

export async function GET() {
  try {
    // In a real application, you would fetch this data from a database
    // and potentially filter it based on the user's ID from the session
    return NextResponse.json(mockLeaveBalance)
  } catch (error) {
    console.error('Error fetching leave balance:', error)
    return NextResponse.json(
      { message: 'Failed to fetch leave balance' },
      { status: 500 }
    )
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { LeaveSummary, LeaveType } from '@/types/leave'

// Mock data for demonstration
const mockLeaves: LeaveSummary[] = [
  {
    id: '1',
    employee: 'Alice Johnson',
    type: LeaveType.ANNUAL,
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-03-05'),
    duration: 5,
    reason: 'Family vacation',
    status: 'approved',
    submittedAt: new Date('2024-02-15'),
    approverId: 'HR001',
    approvedAt: new Date('2024-02-16')
  },
  {
    id: '2',
    employee: 'Bob Smith',
    type: LeaveType.SICK,
    startDate: new Date('2024-03-10'),
    endDate: new Date('2024-03-12'),
    duration: 3,
    reason: 'Medical appointment',
    status: 'pending',
    submittedAt: new Date('2024-03-09')
  },
  {
    id: '3',
    employee: 'Carol Lee',
    type: LeaveType.EMERGENCY,
    startDate: new Date('2024-02-20'),
    endDate: new Date('2024-02-21'),
    duration: 2,
    reason: 'Family emergency',
    status: 'approved',
    submittedAt: new Date('2024-02-19'),
    approverId: 'HR001',
    approvedAt: new Date('2024-02-19')
  },
  {
    id: '2025-1',
    employee: 'Test User',
    type: LeaveType.ANNUAL,
    startDate: new Date(Date.UTC(2025, 4, 15)), // May 15, 2025
    endDate: new Date(Date.UTC(2025, 4, 17)),   // May 17, 2025
    duration: 3,
    reason: 'Annual Leave for 2025',
    status: 'approved',
    submittedAt: new Date(Date.UTC(2025, 4, 10)),
    approverId: 'HR001',
    approvedAt: new Date(Date.UTC(2025, 4, 12))
  },
  {
    id: '2025-2',
    employee: 'Test User',
    type: LeaveType.SICK,
    startDate: new Date(Date.UTC(2025, 4, 10)),
    endDate: new Date(Date.UTC(2025, 4, 10)),
    duration: 1,
    reason: 'Sick Leave for 2025',
    status: 'approved',
    submittedAt: new Date(Date.UTC(2025, 4, 9)),
    approverId: 'HR001',
    approvedAt: new Date(Date.UTC(2025, 4, 10))
  },
  {
    id: '2025-3',
    employee: 'Test User',
    type: LeaveType.ANNUAL,
    startDate: new Date(Date.UTC(2025, 5, 3)),
    endDate: new Date(Date.UTC(2025, 5, 5)),
    duration: 3,
    reason: 'Annual Leave in June',
    status: 'pending',
    submittedAt: new Date(Date.UTC(2025, 4, 28)),
    approverId: 'HR001',
    approvedAt: undefined
  },
  {
    id: '2025-4',
    employee: 'Test User',
    type: LeaveType.EMERGENCY,
    startDate: new Date(Date.UTC(2025, 4, 22)),
    endDate: new Date(Date.UTC(2025, 4, 22)),
    duration: 1,
    reason: 'Emergency Leave',
    status: 'rejected',
    submittedAt: new Date(Date.UTC(2025, 4, 21)),
    approverId: 'HR001',
    approvedAt: new Date(Date.UTC(2025, 4, 22))
  },
  {
    id: '2025-5',
    employee: 'Test User',
    type: LeaveType.PUBLIC_HOLIDAY,
    startDate: new Date(Date.UTC(2025, 4, 24)),
    endDate: new Date(Date.UTC(2025, 4, 24)),
    duration: 1,
    reason: 'Wesak Day (Malaysia)',
    status: 'approved',
    submittedAt: new Date(Date.UTC(2025, 4, 20)),
    approverId: 'HR001',
    approvedAt: new Date(Date.UTC(2025, 4, 24))
  }
]

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')
    const search = searchParams.get('search')

    let filteredLeaves = [...mockLeaves]

    // Apply filters
    if (status) {
      filteredLeaves = filteredLeaves.filter(leave => leave.status === status)
    }
    if (type) {
      filteredLeaves = filteredLeaves.filter(leave => leave.type === type)
    }
    if (fromDate) {
      const from = new Date(fromDate)
      filteredLeaves = filteredLeaves.filter(leave => new Date(leave.startDate) >= from)
    }
    if (toDate) {
      const to = new Date(toDate)
      filteredLeaves = filteredLeaves.filter(leave => new Date(leave.endDate) <= to)
    }
    if (search) {
      const searchLower = search.toLowerCase()
      filteredLeaves = filteredLeaves.filter(leave =>
        leave.reason.toLowerCase().includes(searchLower) ||
        leave.type.toLowerCase().includes(searchLower)
      )
    }

    return NextResponse.json({
      leaves: filteredLeaves,
      total: filteredLeaves.length
    })
  } catch (error) {
    console.error('Error fetching leave summary:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
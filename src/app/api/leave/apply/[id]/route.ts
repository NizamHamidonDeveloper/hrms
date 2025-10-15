import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Mock leave applications (in-memory for demo)
const mockLeaves = [
  {
    id: '1',
    userId: 'employee@example.com',
    status: 'pending',
    type: 'annual',
    startDate: '2024-07-01',
    endDate: '2024-07-03',
    reason: 'Family vacation',
    submittedAt: '2024-06-01',
  },
  {
    id: '2',
    userId: 'employee@example.com',
    status: 'pending',
    type: 'sick',
    startDate: '2024-07-10',
    endDate: '2024-07-12',
    reason: 'Medical appointment',
    submittedAt: '2024-07-01',
  },
  {
    id: '3',
    userId: 'employee@example.com',
    status: 'rejected',
    type: 'emergency',
    startDate: '2024-08-15',
    endDate: '2024-08-15',
    reason: 'Urgent family matter',
    submittedAt: '2024-08-10',
  },
  // ... add more mock leaves as needed
];

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Extract id from the URL
  const url = new URL(request.url);
  const idMatch = url.pathname.match(/\/leave\/apply\/(.+)$/);
  const leaveId = idMatch ? idMatch[1] : null;
  if (!leaveId) {
    return NextResponse.json({ success: false, message: 'Invalid leave application id' }, { status: 400 });
  }

  const body = await request.json();
  if (body.status !== 'cancelled') {
    return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });
  }

  // Find the leave application
  const leave = mockLeaves.find(lv => lv.id === leaveId);
  if (!leave) {
    return NextResponse.json({ success: false, message: 'Leave application not found' }, { status: 404 });
  }
  if (leave.userId !== session.user.email) {
    return NextResponse.json({ success: false, message: 'Cannot cancel leave application' }, { status: 400 });
  }
  if (leave.status !== 'pending') {
    return NextResponse.json({ success: false, message: 'Cannot cancel leave application' }, { status: 400 });
  }

  // Update status to cancelled
  leave.status = 'cancelled';

  // (Optional: trigger notification to approver)

  return NextResponse.json({ success: true, message: 'Leave application cancelled', leaveId });
} 
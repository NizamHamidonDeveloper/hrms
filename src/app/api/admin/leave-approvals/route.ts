import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { Session } from 'next-auth';

// Mock leave requests for demonstration (replace with DB integration)
const mockLeaveRequests = [
  {
    id: 'emp00123-1',
    employee: {
      name: 'Sarah Chen',
      id: 'EMP00123',
      avatar: 'https://via.placeholder.com/40x40?text=SC',
    },
    type: 'Annual Leave',
    dates: 'May 22 - May 24, 2025',
    duration: '3 Days',
    reason: 'Personal trip to visit family for a wedding.',
    submitted: '2025-05-10',
    balance: '10 Days AL',
    status: 'Pending',
  },
  {
    id: 'emp00456-1',
    employee: {
      name: 'Michael Johnson',
      id: 'EMP00456',
      avatar: 'https://via.placeholder.com/40x40?text=MJ',
    },
    type: 'Sick Leave',
    dates: 'May 15, 2025',
    duration: '1 Day',
    reason: 'Feeling unwell, doctor\'s appointment scheduled.',
    submitted: '2025-05-14',
    balance: '12 Days SL',
    status: 'Pending',
  },
  // ... more mock data ...
];

function isAdmin(session: Session | null) {
  return !!session?.user?.roles?.includes('hr_admin');
}

// GET /api/admin/leave-approvals
// Fetch all leave requests (with filters: employee, department, leave type, status, date range)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse query params for filters
  const searchParams = req.nextUrl.searchParams;
  const employee = searchParams.get('employee'); // name or ID (partial match)
  const type = searchParams.get('type'); // leave type
  const status = searchParams.get('status'); // leave status
  const fromDate = searchParams.get('fromDate'); // submitted date >=
  const toDate = searchParams.get('toDate'); // submitted date <=
  // TODO: Add department filter if needed

  let filtered = [...mockLeaveRequests];

  if (employee) {
    const empLower = employee.toLowerCase();
    filtered = filtered.filter(req =>
      req.employee.name.toLowerCase().includes(empLower) ||
      req.employee.id.toLowerCase().includes(empLower)
    );
  }
  if (type) {
    filtered = filtered.filter(req => req.type === type);
  }
  if (status) {
    filtered = filtered.filter(req => req.status.toLowerCase() === status.toLowerCase());
  }
  if (fromDate) {
    const from = new Date(fromDate);
    filtered = filtered.filter(req => new Date(req.submitted) >= from);
  }
  if (toDate) {
    const to = new Date(toDate);
    filtered = filtered.filter(req => new Date(req.submitted) <= to);
  }

  // TODO: Integrate with real DB and extend filters as needed
  return NextResponse.json(filtered, { status: 200 });
}

// POST /api/admin/leave-approvals
// Approve/reject a leave request (with optional comments)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, action, comments } = await req.json();
  if (!id || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // TODO: Update leave request status in database
  // For now, simulate success
  return NextResponse.json({ success: true, id, status: action === 'approve' ? 'Approved' : 'Rejected', comments }, { status: 200 });
}

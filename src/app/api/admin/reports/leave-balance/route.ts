import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, hasRole } from '@/lib/auth';

// Mock data for demonstration
const mockLeaveBalances = [
  {
    id: 'EMP00123',
    name: 'Sarah Chen',
    department: 'Engineering',
    leaveType: 'Annual Leave',
    entitled: 20,
    taken: 5,
    pending: 3,
    available: 12,
  },
  {
    id: 'MGR00045',
    name: 'John Doe',
    department: 'Engineering',
    leaveType: 'Annual Leave',
    entitled: 22,
    taken: 3,
    pending: 0,
    available: 19,
  },
  {
    id: 'EMP00789',
    name: 'Lisa Wong',
    department: 'Engineering',
    leaveType: 'Sick Leave',
    entitled: 14,
    taken: 1,
    pending: 0,
    available: 13,
  },
];

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !hasRole(session, 'hr_admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = req.nextUrl;
    let results = [...mockLeaveBalances];
    const department = searchParams.get('department');
    const employee = searchParams.get('employee');
    const leaveType = searchParams.get('leaveType');
    // Filtering logic
    if (department && department !== 'All Departments') {
      results = results.filter(r => r.department === department);
    }
    if (employee) {
      const empLower = employee.toLowerCase();
      results = results.filter(r => r.name.toLowerCase().includes(empLower) || r.id.toLowerCase().includes(empLower));
    }
    if (leaveType && leaveType !== 'All Leave Types') {
      results = results.filter(r => r.leaveType === leaveType);
    }
    // fromDate, toDate are ignored in mock
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
} 
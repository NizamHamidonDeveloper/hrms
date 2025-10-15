import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, hasRole } from '@/lib/auth';

const mockData = [
  {
    department: 'Engineering',
    leaveType: 'Annual Leave',
    totalDays: 42,
    numEmployees: 12,
    avgDays: 3.5,
  },
  {
    department: 'Engineering',
    leaveType: 'Sick Leave',
    totalDays: 18,
    numEmployees: 8,
    avgDays: 2.25,
  },
  {
    department: 'Sales',
    leaveType: 'Annual Leave',
    totalDays: 30,
    numEmployees: 10,
    avgDays: 3,
  },
];

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !hasRole(session, 'hr_admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  let results = mockData;

  const department = searchParams.get('department');
  const leaveType = searchParams.get('leaveType');
  // periodStart and periodEnd are accepted but not used for mock filtering

  if (department && department !== 'All Departments') {
    results = results.filter(r => r.department === department);
  }
  if (leaveType && leaveType !== 'All Leave Types') {
    results = results.filter(r => r.leaveType === leaveType);
  }

  return NextResponse.json(results, { status: 200 });
} 
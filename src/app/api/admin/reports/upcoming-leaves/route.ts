import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, hasRole } from '@/lib/auth';

const mockData = [
  {
    name: 'Sarah Chen',
    department: 'Engineering',
    leaveType: 'Annual Leave',
    startDate: '2025-07-01',
    endDate: '2025-07-05',
    duration: 5,
  },
  {
    name: 'John Doe',
    department: 'Sales',
    leaveType: 'Sick Leave',
    startDate: '2025-07-03',
    endDate: '2025-07-04',
    duration: 2,
  },
  {
    name: 'Lisa Wong',
    department: 'Engineering',
    leaveType: 'Annual Leave',
    startDate: '2025-07-10',
    endDate: '2025-07-12',
    duration: 3,
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
  const employee = searchParams.get('employee');
  const dateStart = searchParams.get('dateStart');
  const dateEnd = searchParams.get('dateEnd');

  if (department && department !== 'All Departments') {
    results = results.filter(r => r.department === department);
  }
  if (employee) {
    const emp = employee.toLowerCase();
    results = results.filter(r => r.name.toLowerCase().includes(emp));
  }
  if (dateStart) {
    results = results.filter(r => r.startDate >= dateStart);
  }
  if (dateEnd) {
    results = results.filter(r => r.endDate <= dateEnd);
  }

  return NextResponse.json(results, { status: 200 });
} 
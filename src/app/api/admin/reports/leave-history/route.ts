import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, hasRole } from '@/lib/auth';

const mockData = [
  {
    id: 'LVE-SC002',
    name: 'Sarah Chen',
    department: 'Engineering',
    leaveType: 'Sick Leave',
    dates: '2025-04-15',
    duration: '1 Day',
    status: 'Approved',
    submitted: '2025-04-14',
  },
  {
    id: 'LVE-JD005',
    name: 'John Doe',
    department: 'Engineering',
    leaveType: 'Annual Leave',
    dates: '2025-03-10 to 2025-03-12',
    duration: '3 Days',
    status: 'Approved',
    submitted: '2025-02-20',
  },
  {
    id: 'LVE-MJ001',
    name: 'Michael Johnson',
    department: 'Engineering',
    leaveType: 'Annual Leave',
    dates: '2025-05-10 to 2025-05-12',
    duration: '3 Days',
    status: 'Pending',
    submitted: '2025-04-28',
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
  const leaveStatus = searchParams.get('leaveStatus');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (department && department !== 'All Departments') {
    results = results.filter(r => r.department === department);
  }
  if (employee) {
    const emp = employee.toLowerCase();
    results = results.filter(r => r.name.toLowerCase().includes(emp) || r.id.toLowerCase().includes(emp));
  }
  if (leaveStatus && leaveStatus !== 'All Statuses') {
    results = results.filter(r => r.status === leaveStatus);
  }
  if (startDate) {
    results = results.filter(r => {
      // If range, check start of range; if single date, check that date
      const dateStr = r.dates.includes(' to ')
        ? r.dates.split(' to ')[0]
        : r.dates;
      return dateStr >= startDate;
    });
  }
  if (endDate) {
    results = results.filter(r => {
      // If range, check end of range; if single date, check that date
      const dateStr = r.dates.includes(' to ')
        ? r.dates.split(' to ')[1]
        : r.dates;
      return dateStr <= endDate;
    });
  }

  return NextResponse.json(results, { status: 200 });
} 
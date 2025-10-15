import { NextRequest, NextResponse } from 'next/server';

// Mock log data (same as frontend)
const mockLogs = [
  {
    timestamp: '2025-06-01T09:15:00Z',
    user: 'Emily Carter',
    email: 'emily.carter@acme.com',
    role: 'HR Admin',
    action: 'Created Employee',
    target: 'David Lee (EMP00153)',
    status: 'Success',
    details: 'Initial onboarding, department: Engineering',
  },
  {
    timestamp: '2025-06-01T10:22:00Z',
    user: 'Emily Carter',
    email: 'emily.carter@acme.com',
    role: 'HR Admin',
    action: 'Updated Policy',
    target: 'Annual Leave',
    status: 'Success',
    details: 'Carry-forward limit changed from 5 to 7 days',
  },
  {
    timestamp: '2025-06-01T11:05:00Z',
    user: 'System',
    email: '',
    role: 'System',
    action: 'Generated Report',
    target: 'Monthly Leave Balance',
    status: 'Success',
    details: 'Report for May 2025',
  },
  {
    timestamp: '2025-06-01T12:30:00Z',
    user: 'John Doe',
    email: 'john.doe@acme.com',
    role: 'Manager',
    action: 'Approved Leave',
    target: 'Lisa Wong (EMP00789)',
    status: 'Success',
    details: 'Annual Leave, 2025-06-10 to 2025-06-12',
  },
  {
    timestamp: '2025-06-01T13:00:00Z',
    user: 'Emily Carter',
    email: 'emily.carter@acme.com',
    role: 'HR Admin',
    action: 'Rejected Leave',
    target: 'Sarah Chen (EMP00123)',
    status: 'Success',
    details: 'Sick Leave, insufficient documentation',
  },
  {
    timestamp: '2025-06-01T13:30:00Z',
    user: 'System',
    email: '',
    role: 'System',
    action: 'Login Attempt',
    target: 'john.doe@acme.com',
    status: 'Failure',
    details: 'Invalid password',
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  if (searchParams.get('fail') === 'true') {
    return NextResponse.json({ error: 'Simulated backend failure' }, { status: 500 });
  }
  let logs = [...mockLogs];
  // Filtering
  const user = searchParams.get('user');
  const action = searchParams.get('action');
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  if (user && user !== 'All') logs = logs.filter(l => l.user === user);
  if (action && action !== 'All') logs = logs.filter(l => l.action === action);
  if (status && status !== 'All') logs = logs.filter(l => l.status === status);
  if (search) {
    const s = search.toLowerCase();
    logs = logs.filter(l =>
      l.user.toLowerCase().includes(s) ||
      l.action.toLowerCase().includes(s) ||
      l.target.toLowerCase().includes(s) ||
      l.details.toLowerCase().includes(s)
    );
  }
  // Pagination
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '5', 10);
  const total = logs.length;
  const paged = logs.slice((page - 1) * pageSize, page * pageSize);
  return NextResponse.json({ logs: paged, total });
} 
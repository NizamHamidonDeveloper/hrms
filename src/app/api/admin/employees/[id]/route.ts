import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, hasRole } from '@/lib/auth';

// Import or share the in-memory employees array from the parent route file if possible
// For this mock, redefine it here (in real app, use a shared DB or module)
const employees = [
  {
    id: 'EMP00123',
    userId: 'EMP00123',
    firstName: 'Sarah',
    lastName: 'Chen',
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    department: 'Engineering',
    role: 'employee',
    reportingManager: 'John Doe',
    status: 'active',
    state: 'Selangor',
    gender: 'Female',
    race: 'Chinese',
  },
  {
    id: 'EMP00155',
    userId: 'EMP00155',
    firstName: 'Michael',
    lastName: 'Johnson',
    name: 'Michael Johnson',
    email: 'michael.johnson@example.com',
    department: 'Engineering',
    role: 'employee',
    reportingManager: 'John Doe',
    status: 'active',
    state: 'Selangor',
    gender: 'Male',
    race: 'Malay',
  },
];

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !hasRole(session, 'hr_admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const id = req.nextUrl.pathname.split('/').pop();
  const emp = employees.find(e => e.id === id);
  if (!emp) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
  }
  return NextResponse.json(emp);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !hasRole(session, 'hr_admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const id = req.nextUrl.pathname.split('/').pop();
    const data = await req.json();
    const idx = employees.findIndex(e => e.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    const updated = {
      ...employees[idx],
      ...data,
      name: (data.firstName && data.lastName) ? data.firstName + ' ' + data.lastName : employees[idx].name,
    };
    employees[idx] = updated;
    return NextResponse.json({ success: true, employee: updated });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !hasRole(session, 'hr_admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const id = req.nextUrl.pathname.split('/').pop();
  const idx = employees.findIndex(e => e.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
  }
  employees.splice(idx, 1);
  return NextResponse.json({ success: true, message: 'Employee deleted' });
} 
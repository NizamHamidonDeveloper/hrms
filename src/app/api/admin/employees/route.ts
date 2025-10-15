import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, hasRole } from '@/lib/auth';

// In-memory mock data (module-level, resets on server restart)
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

export async function GET() {
  // Disabled session/role check for now
  return NextResponse.json(employees);
}

export async function POST(req: Request) {
  // Disabled session/role check for now
  try {
    const data = await req.json();
    // Validate required fields
    const required = ['userId', 'firstName', 'lastName', 'email', 'department', 'role', 'status'];
    for (const field of required) {
      if (!data[field]) {
        return NextResponse.json({ success: false, message: `Missing field: ${field}` }, { status: 400 });
      }
    }
    const newEmployee = {
      ...data,
      id: data.userId,
      name: data.firstName + ' ' + data.lastName,
    };
    employees.push(newEmployee);
    return NextResponse.json({ success: true, employee: newEmployee }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
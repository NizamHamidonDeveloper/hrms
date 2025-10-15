import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Define a Profile interface for type safety
interface Profile {
  name: string;
  email: string;
  department: string;
  employeeId: string;
  manager: string;
  joined: string;
  phone: string;
  address: string;
  emergencyContact: string;
  image: string;
}

// In-memory per-user profile (for demo; use DB in production)
const userProfiles: Record<string, Profile> = {};

const DEFAULT_PROFILE: Profile = {
  name: 'Sarah Chen',
  email: 'sarah.chen@example.com',
  department: 'Engineering',
  employeeId: 'EMP00123',
  manager: 'John Doe',
  joined: '15 March 2022',
  phone: '+6012-3456789',
  address: '123 Jalan ABC, Taman DEF, 55100 Kuala Lumpur, Malaysia',
  emergencyContact: 'Michael Chen (Father) - +6012-9876543',
  image: '',
};

function validateProfile(data: Profile) {
  if (typeof data.email !== 'string' || !data.email.includes('@')) return false;
  if (typeof data.name !== 'string' || !data.name) return false;
  return true;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const email = session.user.email;
  if (!userProfiles[email]) {
    userProfiles[email] = { ...DEFAULT_PROFILE, email, name: session.user.name || DEFAULT_PROFILE.name, image: session.user.image || '' };
  }
  return NextResponse.json(userProfiles[email]);
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const email = session.user.email;
  const data = await request.json();
  if (!validateProfile(data)) {
    return NextResponse.json({ error: 'Validation error' }, { status: 400 });
  }
  userProfiles[email] = { ...userProfiles[email], ...data };
  return NextResponse.json(userProfiles[email]);
} 
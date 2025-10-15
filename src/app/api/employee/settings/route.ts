import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Define a Settings interface for type safety
interface Settings {
  email: string;
  emailNotif: boolean;
  pushNotif: boolean;
  theme: 'light' | 'dark';
}

// In-memory per-user settings (for demo; use DB in production)
const userSettings: Record<string, Settings> = {};

const DEFAULT_SETTINGS: Settings = {
  email: '',
  emailNotif: true,
  pushNotif: false,
  theme: 'light',
};

function validateSettings(data: Settings) {
  if (typeof data.email !== 'string' || !data.email.includes('@')) return false;
  if (data.theme && !['light', 'dark'].includes(data.theme)) return false;
  return true;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const email = session.user.email;
  if (!userSettings[email]) {
    userSettings[email] = { ...DEFAULT_SETTINGS, email };
  }
  return NextResponse.json(userSettings[email]);
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const email = session.user.email;
  const data = await request.json();
  if (!validateSettings({ ...userSettings[email], ...data })) {
    return NextResponse.json({ error: 'Validation error' }, { status: 400 });
  }
  userSettings[email] = { ...userSettings[email], ...data };
  return NextResponse.json(userSettings[email]);
} 
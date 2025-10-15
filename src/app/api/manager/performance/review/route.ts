import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const data = await request.json();
  // In a real implementation, validate and persist data
  if (!data.employee || !data.cycle || !data.feedback || typeof data.rating !== 'number') {
    return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
  }
  return NextResponse.json({ success: true, message: 'Review submitted' });
}

export async function GET() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
} 
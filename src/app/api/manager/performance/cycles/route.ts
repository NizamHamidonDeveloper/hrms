import { NextResponse } from 'next/server';

const mockReviewCycles = [
  {
    id: 'cycle-1',
    name: '2024 Mid-Year Review',
    period: 'Jan 2024 - Jun 2024',
    status: 'Open',
  },
  {
    id: 'cycle-2',
    name: '2023 Year-End Review',
    period: 'Jul 2023 - Dec 2023',
    status: 'Closed',
  },
];

export async function GET() {
  return NextResponse.json(mockReviewCycles);
}

export async function POST() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
} 
import { NextResponse } from 'next/server';

const mockReviewHistory = [
  {
    id: 'hist-1',
    employee: 'Alice Johnson',
    cycle: '2023 Year-End Review',
    feedback: 'Consistently exceeded expectations.',
    rating: 5,
    date: '2024-01-15',
  },
  {
    id: 'hist-2',
    employee: 'Bob Smith',
    cycle: '2023 Year-End Review',
    feedback: 'Met most goals, room for improvement.',
    rating: 4,
    date: '2024-01-16',
  },
  {
    id: 'hist-3',
    employee: 'Carol Lee',
    cycle: '2024 Mid-Year Review',
    feedback: 'Strong team player, great attitude.',
    rating: 5,
    date: '2024-06-10',
  },
];

export async function GET() {
  return NextResponse.json(mockReviewHistory);
}

export async function POST() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
} 
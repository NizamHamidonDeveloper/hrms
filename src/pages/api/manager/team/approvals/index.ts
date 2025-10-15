import type { NextApiRequest, NextApiResponse } from 'next';

const mockApprovals = [
  {
    id: 'emp00123-1',
    employee: {
      name: 'Sarah Chen',
      id: 'EMP00123',
      avatar: 'https://via.placeholder.com/40x40?text=SC',
    },
    type: 'Annual Leave',
    dates: 'May 22 - May 24, 2025',
    duration: '3 Days',
    reason: 'Personal trip to visit family for a wedding.',
    submitted: 'May 10, 2025',
    balance: '10 Days AL',
    status: 'Pending',
  },
  {
    id: 'emp00456-1',
    employee: {
      name: 'Michael Johnson',
      id: 'EMP00456',
      avatar: 'https://via.placeholder.com/40x40?text=MJ',
    },
    type: 'Sick Leave',
    dates: 'May 15, 2025',
    duration: '1 Day',
    reason: 'Feeling unwell, doctor\'s appointment scheduled.',
    submitted: 'May 14, 2025',
    balance: '12 Days SL',
    status: 'Pending',
  },
  {
    id: 'emp00789-1',
    employee: {
      name: 'Lisa Wong',
      id: 'EMP00789',
      avatar: 'https://via.placeholder.com/40x40?text=LW',
    },
    type: 'Emergency Leave',
    dates: 'May 20, 2025',
    duration: '0.5 Day (PM)',
    reason: 'Urgent family matter that requires immediate attention.',
    submitted: 'May 20, 2025',
    balance: '3 Days EL',
    status: 'Pending',
  },
  {
    id: 'emp00999-1',
    employee: {
      name: 'Alicia Tan',
      id: 'EMP00999',
      avatar: 'https://via.placeholder.com/40x40?text=AT',
    },
    type: 'Maternity Leave',
    dates: 'Jun 1 - Sep 1, 2025',
    duration: '3 Months',
    reason: 'Maternity leave for childbirth.',
    submitted: 'Apr 15, 2025',
    balance: '90 Days ML',
    status: 'Approved',
  },
  {
    id: 'emp00234-1',
    employee: {
      name: 'Ravi Kumar',
      id: 'EMP00234',
      avatar: 'https://via.placeholder.com/40x40?text=RK',
    },
    type: 'Unpaid Leave',
    dates: 'May 28 - May 30, 2025',
    duration: '3 Days',
    reason: 'Personal reasons, no leave balance left.',
    submitted: 'May 18, 2025',
    balance: '0 Days UL',
    status: 'Rejected',
  },
  {
    id: 'emp00555-1',
    employee: {
      name: 'Emily Davis',
      id: 'EMP00555',
      avatar: 'https://via.placeholder.com/40x40?text=ED',
    },
    type: 'Annual Leave',
    dates: 'Jun 10 - Jun 14, 2025',
    duration: '5 Days',
    reason: 'Family vacation to Bali.',
    submitted: 'May 25, 2025',
    balance: '8 Days AL',
    status: 'Pending',
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json(mockApprovals);
  }
  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 
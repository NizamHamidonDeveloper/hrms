import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { action } = req.body;
    if (action === 'approve' || action === 'reject') {
      return res.status(200).json({ success: true, status: action === 'approve' ? 'Approved' : 'Rejected' });
    }
    return res.status(400).json({ success: false, message: 'Invalid action' });
  }
  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 
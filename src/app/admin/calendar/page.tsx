'use client'

import React, { useEffect, useState } from "react";
import LeaveCalendar, { LeaveEvent } from '@/components/calendar/LeaveCalendar';

const mockEvents: Record<string, LeaveEvent[]> = {
  '2025-05-05': [{ type: 'Rejected Leave', description: 'Vacation request (May 5-6) - Rejected' }],
  '2025-05-06': [{ type: 'Rejected Leave', description: 'Vacation request (May 5-6) - Rejected' }],
  '2025-05-15': [{ type: 'Annual Leave', description: 'Annual Leave (May 15-17) - Approved' }],
  '2025-05-16': [{ type: 'Annual Leave', description: 'Annual Leave (May 15-17) - Approved' }],
  '2025-05-17': [{ type: 'Annual Leave', description: 'Annual Leave (May 15-17) - Approved' }],
  '2025-05-22': [{ type: 'Pending Leave', description: 'Personal Day (May 22) - Pending' }],
  '2025-05-24': [{ type: 'Public Holiday', description: 'Wesak Day' }],
};

// Define a LeaveSummary type for the function
interface LeaveSummary {
  startDate: string;
  endDate: string;
  status: string;
  type: string;
}

function mapLeaveSummaryToEvents(leaves: LeaveSummary[]): Record<string, LeaveEvent[]> {
  const events: Record<string, LeaveEvent[]> = {};
  leaves.forEach((leave) => {
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().slice(0, 10);
      let type = '';
      if (leave.status === 'pending') type = 'Pending Leave';
      else if (leave.status === 'rejected') type = 'Rejected Leave';
      else if (leave.status === 'approved') type = 'Annual Leave';
      else type = 'Leave';
      if (leave.type === 'public_holiday') type = 'Public Holiday';
      const description = `${leave.type.charAt(0).toUpperCase() + leave.type.slice(1)} (${leave.startDate} - ${leave.endDate}) - ${leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}`;
      if (!events[dateStr]) events[dateStr] = [];
      events[dateStr].push({ type, description });
    }
  });
  return events;
}

export default function AdminCalendarPage() {
  const [events, setEvents] = useState<Record<string, LeaveEvent[]>>(mockEvents);
  const [loading, setLoading] = useState(true);
  const [fallbackWarning, setFallbackWarning] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setFallbackWarning(null);
    fetch('/api/leave/summary')
      .then(res => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then(data => {
        if (data && data.leaves) {
          setEvents(mapLeaveSummaryToEvents(data.leaves));
        } else {
          setEvents(mockEvents);
          setFallbackWarning('Failed to fetch calendar events from API, using mock data.');
        }
        setLoading(false);
      })
      .catch(() => {
        setEvents(mockEvents);
        setFallbackWarning('Failed to fetch calendar events from API, using mock data.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div>
      {fallbackWarning && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded">{fallbackWarning}</div>
      )}
      <LeaveCalendar
        events={events}
        title="My Leave Calendar"
        subtitle="View your scheduled leaves and public holidays"
        readOnly={false}
      />
    </div>
  );
} 
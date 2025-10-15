'use client'
import React, { useEffect, useState } from "react";
import LeaveCalendar, { LeaveEvent } from '@/components/calendar/LeaveCalendar';

const mockEvents: Record<string, LeaveEvent[]> = {
  '2025-05-01': [{ type: 'Public Holiday', description: 'Labour Day (Malaysia)' }],
  '2025-05-05': [{ type: 'Rejected Leave', description: 'Vacation request (May 5-6) - Rejected' }],
  '2025-05-06': [{ type: 'Rejected Leave', description: 'Vacation request (May 5-6) - Rejected' }],
  '2025-05-15': [{ type: 'Annual Leave', description: 'Annual Leave (May 15-17) - Approved' }],
  '2025-05-16': [
    { type: 'Annual Leave', description: 'Annual Leave (May 15-17) - Approved' },
    { type: 'Public Holiday', description: 'Wesak Day (Malaysia)' }
  ],
  '2025-05-17': [{ type: 'Annual Leave', description: 'Annual Leave (May 15-17) - Approved' }],
  '2025-05-22': [{ type: 'Pending Leave', description: 'Personal Day (May 22) - Pending' }],
  '2025-05-24': [{ type: 'Public Holiday', description: 'Wesak Day (Malaysia)' }],
  '2025-06-02': [{ type: 'Public Holiday', description: "Agong's Birthday (Malaysia)" }],
  '2025-06-03': [{ type: 'Annual Leave', description: 'Annual Leave (June 3-5) - Approved' }],
  '2025-06-04': [{ type: 'Annual Leave', description: 'Annual Leave (June 3-5) - Approved' }],
  '2025-06-05': [{ type: 'Annual Leave', description: 'Annual Leave (June 3-5) - Approved' }],
  '2025-06-07': [{ type: 'Public Holiday', description: 'Awal Zulhijjah (Malaysia)' }],
  '2025-06-10': [{ type: 'Sick Leave', description: 'Sick Leave (June 10) - Approved' }],
  '2025-06-15': [{ type: 'Pending Leave', description: 'Annual Leave (June 15-17) - Pending' }],
  '2025-06-16': [{ type: 'Pending Leave', description: 'Annual Leave (June 15-17) - Pending' }],
  '2025-06-17': [{ type: 'Pending Leave', description: 'Annual Leave (June 15-17) - Pending' }],
  '2025-06-24': [{ type: 'Public Holiday', description: 'Demo Public Holiday' }],
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

export default function ManagerCalendarPage() {
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
        let useMock = false;
        if (data && data.leaves && data.leaves.length > 0) {
          const mapped = mapLeaveSummaryToEvents(data.leaves);
          const has2025 = Object.keys(mapped).some(date => date.startsWith('2025-'));
          if (has2025) {
            setEvents(mapped);
          } else {
            useMock = true;
          }
        } else {
          useMock = true;
        }
        if (useMock) {
          setEvents(mockEvents);
          setFallbackWarning('No leave events for 2025 from API, using mock data including Malaysian Public Holidays.');
        }
        setLoading(false);
      })
      .catch(() => {
        setEvents(mockEvents);
        setFallbackWarning('Failed to fetch calendar events from API, using mock data including Malaysian Public Holidays.');
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
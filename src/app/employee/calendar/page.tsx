"use client"
import React, { useEffect, useState } from "react";
import LeaveCalendar, { LeaveEvent } from '@/components/calendar/LeaveCalendar';
import toast from 'react-hot-toast';

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

function formatDateRange(start: Date, end: Date) {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  const startStr = start.toLocaleDateString(undefined, options);
  const endStr = end.toLocaleDateString(undefined, options);
  if (startStr === endStr) return startStr;
  return `${startStr} – ${endStr}`;
}

function mapLeaveSummaryToEvents(leaves: LeaveSummary[]): Record<string, LeaveEvent[]> {
  const events: Record<string, LeaveEvent[]> = {};
  leaves.forEach((leave) => {
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    const dateRange = formatDateRange(start, end);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().slice(0, 10);
      let type = '';
      if (leave.status === 'pending') type = 'Pending Leave';
      else if (leave.status === 'rejected') type = 'Rejected Leave';
      else if (leave.status === 'approved') type = 'Annual Leave';
      else type = 'Leave';
      if (leave.type === 'public_holiday') type = 'Public Holiday';
      // Format description: 'Annual Leave: May 15–17, 2025 - Approved'
      const description = `${leave.type.charAt(0).toUpperCase() + leave.type.slice(1).replace('_', ' ')}${dateRange ? `: ${dateRange}` : ''} - ${leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}`;
      if (!events[dateStr]) events[dateStr] = [];
      events[dateStr].push({ type, description });
    }
  });
  return events;
}

export default function EmployeeCalendarPage() {
  const [events, setEvents] = useState<Record<string, LeaveEvent[]>>(mockEvents);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState<string | null>(null);
  const [modalEvents, setModalEvents] = useState<LeaveEvent[]>([]);

  useEffect(() => {
    setLoading(true);
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
          toast.error('No leave events for 2025 from API, using mock data.');
        }
        setLoading(false);
      })
      .catch(() => {
        setEvents(mockEvents);
        toast.error('Failed to fetch calendar events from API, using mock data.');
        setLoading(false);
      });
  }, []);

  const handleDayClick = (dateStr: string, dayEvents: LeaveEvent[]) => {
    setModalDate(dateStr);
    setModalEvents(dayEvents);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setModalDate(null);
    setModalEvents([]);
  };
  useEffect(() => {
    if (!modalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalOpen]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
          <svg className="animate-spin h-8 w-8 text-teal-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
          <span className="text-gray-700 font-medium">Loading calendar...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 bg-teal-50 min-h-screen text-gray-900">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-teal-700 mb-1">My Leave Calendar</h1>
            <p className="text-gray-600">View your scheduled leaves and public holidays</p>
          </div>
        </div>
        <div>
          <LeaveCalendar
            events={events}
            title=""
            subtitle=""
            readOnly={false}
            onDayClick={handleDayClick}
          />
        </div>
        {/* Modal for day details */}
        {modalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            aria-modal="true"
            role="dialog"
            onClick={closeModal}
            style={{ background: 'transparent' }}
          >
            <div
              className="bg-white rounded-xl shadow-xl border border-gray-100 p-6 max-w-md w-full relative mx-2"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-teal-600 text-2xl font-bold focus:outline-none"
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Events for {modalDate}</h2>
              {modalEvents.length === 0 ? (
                <div className="text-gray-500 text-center">No events for this day.</div>
              ) : (
                <ul className="space-y-2">
                  {modalEvents.map((event, idx) => (
                    <li key={idx} className="p-3 rounded-lg bg-teal-50 border border-teal-100 text-gray-800 text-sm">
                      <span className="font-semibold">{event.type}:</span> {event.description}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
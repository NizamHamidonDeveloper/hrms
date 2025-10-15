'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import LeaveCalendar, { LeaveEvent } from "@/components/calendar/LeaveCalendar";

const mockMembers = [
  { id: "EMP00456", name: "Michael Johnson" },
  { id: "EMP00789", name: "Lisa Wong" },
  { id: "EMP00999", name: "Alex Rodriguez" },
];

// Mock data for both May and June 2025
const mockEvents: Record<string, LeaveEvent[]> = {
  // May events
  "2025-05-10": [
    { type: "Annual Leave", description: "Michael Johnson - Annual Leave (May 10-11)", member: "Michael Johnson" },
  ],
  "2025-05-11": [
    { type: "Annual Leave", description: "Michael Johnson - Annual Leave (May 10-11)", member: "Michael Johnson" },
  ],
  "2025-05-15": [
    { type: "Sick Leave", description: "Michael Johnson - Sick Leave (May 15)", member: "Michael Johnson" },
  ],
  "2025-05-16": [
    { type: "Annual Leave", description: "You - Annual Leave (May 16-17)", member: "You" },
  ],
  "2025-05-17": [
    { type: "Annual Leave", description: "You - Annual Leave (May 16-17)", member: "You" },
  ],
  "2025-05-20": [
    { type: "Emergency Leave", description: "Lisa Wong - Emergency Leave (May 20)", member: "Lisa Wong" },
  ],
  "2025-05-22": [
    { type: "Pending Leave", description: "Alex Rodriguez - Annual Leave (May 22-24) - Pending", member: "Alex Rodriguez" },
  ],
  "2025-05-23": [
    { type: "Pending Leave", description: "Alex Rodriguez - Annual Leave (May 22-24) - Pending", member: "Alex Rodriguez" },
  ],
  "2025-05-24": [
    { type: "Public Holiday", description: "Wesak Day" },
    { type: "Pending Leave", description: "Alex Rodriguez - Annual Leave (May 22-24) - Pending", member: "Alex Rodriguez" },
  ],
  // June events
  "2025-06-03": [
    { type: "Annual Leave", description: "Lisa Wong - Annual Leave (June 3-5)", member: "Lisa Wong" },
  ],
  "2025-06-05": [
    { type: "Annual Leave", description: "Lisa Wong - Annual Leave (June 3-5)", member: "Lisa Wong" },
  ],
  "2025-06-10": [
    { type: "Emergency Leave", description: "Michael Johnson - Emergency Leave (June 10)", member: "Michael Johnson" },
  ],
  "2025-06-12": [
    { type: "Sick Leave", description: "Michael Johnson - Sick Leave (June 12)", member: "Michael Johnson" },
  ],
  "2025-06-15": [
    { type: "Pending Leave", description: "You - Annual Leave (June 15-17) - Pending", member: "You" },
  ],
  "2025-06-16": [
    { type: "Pending Leave", description: "You - Annual Leave (June 15-17) - Pending", member: "You" },
  ],
  "2025-06-17": [
    { type: "Pending Leave", description: "You - Annual Leave (June 15-17) - Pending", member: "You" },
  ],
  "2025-06-18": [
    { type: "Annual Leave", description: "Alex Rodriguez - Annual Leave (June 18)", member: "Alex Rodriguez" },
  ],
  "2025-06-20": [
    { type: "Sick Leave", description: "Lisa Wong - Sick Leave (June 20)", member: "Lisa Wong" },
  ],
  "2025-06-24": [
    { type: "Public Holiday", description: "Demo Public Holiday" },
  ],
};

export default function EmployeeTeamCalendarPage() {
  const { status } = useSession()
  const [memberFilter, setMemberFilter] = useState("all");

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (status === 'unauthenticated') {
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    return null
  }

  return (
    <LeaveCalendar
      events={mockEvents}
      members={mockMembers}
      memberFilter={memberFilter}
      onMemberFilterChange={setMemberFilter}
      readOnly={true}
      title="Team Calendar"
      subtitle="View approved leave for your team members (Engineering Department)."
    />
  )
} 
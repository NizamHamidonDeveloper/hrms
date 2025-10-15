"use client";
import React, { useState } from "react";
import LeaveCalendar, { LeaveEvent } from "@/components/calendar/LeaveCalendar";

const mockMembers = [
  { id: "EMP00123", name: "Sarah Chen" },
  { id: "EMP00456", name: "Michael Johnson" },
  { id: "EMP00789", name: "Lisa Wong" },
];

const mockEvents: Record<string, LeaveEvent[]> = {
  // May events
  "2025-05-10": [
    { type: "Annual Leave", description: "M. Johnson - Annual Leave (May 10-12)", member: "Michael Johnson" },
  ],
  "2025-05-11": [
    { type: "Annual Leave", description: "M. Johnson - Annual Leave (May 10-12)", member: "Michael Johnson" },
  ],
  "2025-05-12": [
    { type: "Annual Leave", description: "M. Johnson - Annual Leave (May 10-12)", member: "Michael Johnson" },
  ],
  "2025-05-15": [
    { type: "Sick Leave", description: "M. Johnson - Sick Leave (May 15)", member: "Michael Johnson" },
  ],
  "2025-05-20": [
    { type: "Emergency Leave", description: "L. Wong - Emergency Leave (May 20 - PM)", member: "Lisa Wong" },
  ],
  "2025-05-22": [
    { type: "Pending Leave", description: "S. Chen - Annual Leave (May 22-24) - Pending", member: "Sarah Chen" },
  ],
  "2025-05-23": [
    { type: "Pending Leave", description: "S. Chen - Annual Leave (May 22-24) - Pending", member: "Sarah Chen" },
  ],
  "2025-05-24": [
    { type: "Public Holiday", description: "Wesak Day" },
    { type: "Pending Leave", description: "S. Chen - Annual Leave (May 22-24) - Pending", member: "Sarah Chen" },
  ],
  // June events
  "2025-06-03": [
    { type: "Annual Leave", description: "M. Johnson - Annual Leave (June 3-5)", member: "Michael Johnson" },
  ],
  "2025-06-05": [
    { type: "Annual Leave", description: "M. Johnson - Annual Leave (June 3-5)", member: "Michael Johnson" },
  ],
  "2025-06-10": [
    { type: "Emergency Leave", description: "L. Wong - Emergency Leave (June 10 - PM)", member: "Lisa Wong" },
  ],
  "2025-06-12": [
    { type: "Sick Leave", description: "M. Johnson - Sick Leave (June 12)", member: "Michael Johnson" },
  ],
  "2025-06-15": [
    { type: "Pending Leave", description: "S. Chen - Annual Leave (June 15-17) - Pending", member: "Sarah Chen" },
  ],
  "2025-06-16": [
    { type: "Pending Leave", description: "S. Chen - Annual Leave (June 15-17) - Pending", member: "Sarah Chen" },
  ],
  "2025-06-17": [
    { type: "Pending Leave", description: "S. Chen - Annual Leave (June 15-17) - Pending", member: "Sarah Chen" },
  ],
  "2025-06-24": [
    { type: "Public Holiday", description: "Demo Public Holiday" },
  ],
};

export default function ManagerTeamCalendarPage() {
  const [memberFilter, setMemberFilter] = useState("all");

  return (
    <LeaveCalendar
      events={mockEvents}
      members={mockMembers}
      memberFilter={memberFilter}
      onMemberFilterChange={setMemberFilter}
      readOnly={true}
      title="Team Leave Calendar"
      subtitle="View approved and pending leave for your team members."
    />
  );
} 
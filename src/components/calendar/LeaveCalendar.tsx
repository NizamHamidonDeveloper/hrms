'use client'

import React, { useState } from "react";

export interface LeaveEvent {
  type: string;
  description: string;
  member?: string; // For team events
}

export interface LeaveCalendarProps {
  events: Record<string, LeaveEvent[]>; // date string (YYYY-MM-DD) -> events
  members?: { id: string; name: string }[];
  memberFilter?: string;
  onMemberFilterChange?: (value: string) => void;
  readOnly?: boolean;
  title?: string;
  subtitle?: string;
  onDayClick?: (dateStr: string, events: LeaveEvent[]) => void;
}

const eventColor = (type: string) => {
  // Match legend colors exactly
  if (type === "Annual Leave" || type === "My Approved Leave") return "bg-green-100 border-green-300"; // Approved
  if (type === "Pending Leave") return "bg-yellow-100 border-yellow-300";
  if (type === "Rejected Leave") return "bg-red-100 border-red-300";
  if (type === "Public Holiday") return "bg-purple-100 border-purple-300";
  if (type === "Childcare Leave") return "bg-blue-100 border-blue-300";
  if (type === "Sick Leave") return "bg-pink-100 border-pink-300";
  return "bg-gray-200 border-gray-400";
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
function pad(num: number) {
  return num.toString().padStart(2, "0");
}

// Helper to get initials from a name
function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

export default function LeaveCalendar({
  events,
  members = [],
  memberFilter = "all",
  onMemberFilterChange,
  readOnly = false,
  title = "Leave Calendar",
  subtitle = "View scheduled leaves and public holidays.",
  onDayClick,
}: LeaveCalendarProps) {
  // Default to May 2025 for demo
  const [currentDate, setCurrentDate] = useState(new Date(2025, 4, 1));
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Build days for the grid (including prev/next month padding)
  const days: { day: number; isOtherMonth: boolean; dateStr: string }[] = [];
  const daysInPrevMonth = getDaysInMonth(year, month - 1);
  for (let i = 0; i < firstDay; i++) {
    days.push({ day: daysInPrevMonth - firstDay + 1 + i, isOtherMonth: true, dateStr: "" });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
    days.push({ day, isOtherMonth: false, dateStr });
  }
  while (days.length % 7 !== 0) {
    days.push({ day: days.length, isOtherMonth: true, dateStr: "" });
  }

  function handlePrevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }
  function handleNextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }
  function handleToday() {
    setCurrentDate(new Date(2025, 4, 1));
  }
  function handleDayClick(dateStr: string, evs: LeaveEvent[]) {
    if (readOnly) return;
    if (onDayClick) {
      onDayClick(dateStr, evs);
    }
  }

  // Filter events by member if applicable
  let filteredEvents: Record<string, LeaveEvent[]> = events;
  if (members.length > 0 && memberFilter && memberFilter !== "all") {
    filteredEvents = {};
    Object.entries(events).forEach(([date, evs]) => {
      filteredEvents[date] = evs.filter((e) => e.member === members.find(m => m.id === memberFilter)?.name);
    });
  }

  // Debug log for current month and events
  if (typeof window !== 'undefined') {
    console.log('LeaveCalendar: year', year, 'month', month + 1, 'events', events);
  }

  return (
    <div className="w-full bg-teal-50 min-h-screen text-gray-600 p-0 sm:p-8">
      <div className="w-full max-w-none mx-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-700">{title}</h1>
          <p className="text-gray-500">{subtitle}</p>
        </div>
        {/* Member Filter */}
        {members.length > 0 && onMemberFilterChange && (
          <div className="mb-4 max-w-xs">
            <label className="block text-sm font-medium text-gray-600">Team Member</label>
            <select
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
              value={memberFilter}
              onChange={(e) => onMemberFilterChange(e.target.value)}
            >
              <option value="all">All Members</option>
              {members.map((m) => (
                <option key={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        )}
        {/* Calendar Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={handlePrevMonth} className="p-2 rounded-full bg-gradient-to-r from-teal-500 to-teal-400 text-white shadow hover:from-teal-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500">
                <span className="sr-only">Previous Month</span>◀️
              </button>
              <h2 className="text-xl font-semibold text-gray-700">
                {currentDate.toLocaleString("default", { month: "long" })} {year}
              </h2>
              <button onClick={handleNextMonth} className="p-2 rounded-full bg-gradient-to-r from-teal-500 to-teal-400 text-white shadow hover:from-teal-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500">
                <span className="sr-only">Next Month</span>▶️
              </button>
              <button onClick={handleToday} className="px-4 py-2 rounded-full bg-gradient-to-r from-teal-500 to-teal-400 text-white shadow hover:from-teal-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-semibold">
                Today
              </button>
            </div>
          </div>
        </div>
        {/* Calendar Grid */}
        <div className="calendar-view bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto w-full">
          <div className="grid grid-cols-7 gap-px bg-gray-200 w-full">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
              <div
                key={d}
                className="bg-gray-100 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px bg-gray-200 w-full"
            style={{ gridAutoRows: 'minmax(0, 1fr)' }}>
            {days.map((dayObj, idx) => {
              const evs = dayObj.isOtherMonth || !dayObj.dateStr ? [] : filteredEvents[dayObj.dateStr] || [];
              if (!dayObj.isOtherMonth) {
                // Debug log for dateStr and events
                console.log('Calendar day', dayObj.dateStr, 'events:', evs);
              }
              return (
                <div
                  key={idx}
                  className={`aspect-square p-1 sm:p-2 overflow-y-auto ${readOnly ? "" : "cursor-pointer hover:bg-gray-100 transition-colors duration-150"} ${dayObj.isOtherMonth ? "bg-gray-50 text-gray-400" : "bg-white text-gray-600"}`}
                  onClick={() => !readOnly && !dayObj.isOtherMonth && handleDayClick(dayObj.dateStr, evs)}
                  tabIndex={readOnly || dayObj.isOtherMonth ? -1 : 0}
                  role="button"
                  aria-label={`Day ${dayObj.day}${evs.length > 0 ? ", has events" : ""}`}
                  onKeyDown={e => {
                    if (!readOnly && !dayObj.isOtherMonth && (e.key === 'Enter' || e.key === ' ')) handleDayClick(dayObj.dateStr, evs);
                  }}
                  style={{ minWidth: 0 }}
                >
                  <div className="flex justify-end text-sm">{dayObj.day}</div>
                  {/* Compact event indicators: show up to 3 colored dots, then '+X' if more */}
                  {members.length > 0 && !dayObj.isOtherMonth && evs.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {evs.slice(0, 2).map((event, i) => (
                        <span
                          key={i}
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${eventColor(event.type)} whitespace-nowrap`}
                          title={event.description}
                        >
                          {event.member ? getInitials(event.member) : event.description.split(' ')[0]}
                        </span>
                      ))}
                      {evs.length > 2 && (
                        <span className="ml-1 text-xs font-semibold text-gray-500 bg-gray-100 rounded-full px-1.5 py-0.5">
                          +{evs.length - 2} more
                        </span>
                      )}
                    </div>
                  ) :
                  // fallback to dots for non-team calendars
                  (!dayObj.isOtherMonth && evs.length > 0) && (
                    <div className="flex items-center flex-wrap gap-1 mt-2">
                      {evs.slice(0, 3).map((event, i) => (
                        <span
                          key={i}
                          className={`w-4 h-4 rounded-full border-2 shadow-md inline-block ${eventColor(event.type)}`}
                          title={event.type}
                        />
                      ))}
                      {evs.length > 3 && (
                        <span className="ml-1 text-xs font-semibold text-gray-500 bg-gray-100 rounded-full px-1.5 py-0.5">
                          +{evs.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {/* Legend */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Legend</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-100 border border-green-300 mr-2"></div>
              <span className="text-sm text-gray-600">Approved Leave</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-100 border border-yellow-300 mr-2"></div>
              <span className="text-sm text-gray-600">Pending Leave</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-100 border border-red-300 mr-2"></div>
              <span className="text-sm text-gray-600">Rejected Leave</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-purple-100 border border-purple-300 mr-2"></div>
              <span className="text-sm text-gray-600">Public Holiday</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-300 mr-2"></div>
              <span className="text-sm text-gray-600">Childcare Leave</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-pink-100 border border-pink-300 mr-2"></div>
              <span className="text-sm text-gray-600">Sick Leave</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
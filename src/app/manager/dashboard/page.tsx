"use client";
import React from "react";

export default function ManagerDashboardPage() {
  // Mock data for dashboard widgets
  const pendingApprovals = 3;
  const teamSize = 8;
  const upcomingLeaves = 2;

  // Mock data for recent leave requests
  const recentRequests = [
    {
      id: 'emp00123-1',
      name: 'Sarah Chen',
      type: 'Annual Leave',
      dates: 'May 22 - May 24',
      status: 'Pending',
    },
    {
      id: 'emp00456-1',
      name: 'Michael Johnson',
      type: 'Sick Leave',
      dates: 'May 15',
      status: 'Approved',
    },
    {
      id: 'emp00789-1',
      name: 'Lisa Wong',
      type: 'Emergency Leave',
      dates: 'May 20',
      status: 'Rejected',
    },
  ];

  // Mock data for team on leave today
  const onLeaveToday = [
    { name: 'Sarah Chen', type: 'Annual Leave' },
    { name: 'Lisa Wong', type: 'Emergency Leave' },
  ];

  // Mock data for announcements
  const announcements = [
    { id: 1, message: 'HR Policy Update: New leave types available from June 2025.' },
    { id: 2, message: 'Reminder: Submit Q2 performance reviews by June 15.' },
  ];

  return (
    <main className="max-w-7xl mx-auto p-8 min-h-screen bg-white dark:bg-gray-900" role="main" aria-labelledby="dashboard-title">
      <h1 id="dashboard-title" className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Manager Dashboard</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">Overview of your team and leave management.</p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" role="region" aria-label="Dashboard Summary">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col items-center" role="status" aria-label="Pending Approvals">
          <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2" aria-label={`${pendingApprovals} pending approvals`}>{pendingApprovals}</div>
          <div className="text-gray-700 dark:text-gray-200 font-medium">Pending Approvals</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col items-center" role="status" aria-label="Team Size">
          <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2" aria-label={`${teamSize} team members`}>{teamSize}</div>
          <div className="text-gray-700 dark:text-gray-200 font-medium">Team Members</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col items-center" role="status" aria-label="Upcoming Leaves">
          <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2" aria-label={`${upcomingLeaves} upcoming leaves`}>{upcomingLeaves}</div>
          <div className="text-gray-700 dark:text-gray-200 font-medium">Upcoming Leaves</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Recent Leave Requests */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 col-span-2" role="region" aria-labelledby="recent-requests-title">
          <h2 id="recent-requests-title" className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Recent Leave Requests</h2>
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm" role="table" aria-label="Recent leave requests">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-300">Employee</th>
                <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-300">Type</th>
                <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-300">Dates</th>
                <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentRequests.map((req) => (
                <tr key={req.id} tabIndex={0} role="row" className="hover:bg-teal-50 dark:hover:bg-teal-900 focus:outline-none focus:bg-teal-50 dark:focus:bg-teal-900 transition-colors">
                  <td className="px-4 py-2 text-gray-800 dark:text-gray-100">{req.name}</td>
                  <td className="px-4 py-2 text-gray-700 dark:text-gray-200">{req.type}</td>
                  <td className="px-4 py-2 text-gray-700 dark:text-gray-200">{req.dates}</td>
                  <td className="px-4 py-2">
                    <span 
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        req.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        req.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                      role="status"
                      aria-label={`Status: ${req.status}`}
                    >
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Team On Leave Today */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6" role="region" aria-labelledby="team-leave-title">
          <h2 id="team-leave-title" className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Team On Leave Today</h2>
          {onLeaveToday.length === 0 ? (
            <div className="text-gray-600 dark:text-gray-300" role="status">No team members on leave today.</div>
          ) : (
            <ul className="space-y-2" role="list" aria-label="Team members on leave today">
              {onLeaveToday.map((member, idx) => (
                <li key={idx} className="flex items-center">
                  <span className="font-medium text-gray-700 dark:text-gray-200 mr-2">{member.name}</span>
                  <span className="text-xs bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-200 px-2 py-1 rounded" role="status" aria-label={`Leave type: ${member.type}`}>{member.type}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Announcements */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8" role="region" aria-labelledby="announcements-title">
        <h2 id="announcements-title" className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Announcements</h2>
        <ul className="list-disc pl-5 space-y-2" role="list" aria-label="Important announcements">
          {announcements.map((a) => (
            <li key={a.id} className="text-gray-700 dark:text-gray-200">{a.message}</li>
          ))}
        </ul>
      </div>

      {/* Quick Links */}
      <nav className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6" role="navigation" aria-labelledby="quick-links-title">
        <h2 id="quick-links-title" className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Quick Links</h2>
        <div className="flex flex-wrap gap-4">
          <a 
            href="/manager/team/approvals" 
            className="px-4 py-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 dark:hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 font-medium transition-colors"
            aria-label="Go to team leave approvals"
          >
            Team Leave Approvals
          </a>
          <a 
            href="/manager/team" 
            className="px-4 py-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 dark:hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 font-medium transition-colors"
            aria-label="Go to team management"
          >
            Team Management
          </a>
          <a 
            href="/manager/calendar" 
            className="px-4 py-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 dark:hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 font-medium transition-colors"
            aria-label="Go to my calendar"
          >
            My Calendar
          </a>
        </div>
      </nav>
    </main>
  );
} 
import React from 'react';
import Link from 'next/link';
import { UserGroupIcon, DocumentTextIcon, BellAlertIcon, Cog6ToothIcon, ChartBarIcon, UsersIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

// Mock stats data
const stats = [
  {
    label: 'Total Active Users',
    value: 152,
    icon: <UserGroupIcon className="h-7 w-7 text-teal-600" />, // Teal accent
    link: '/admin/employees',
    linkLabel: 'Manage Users',
  },
  {
    label: 'Total Leave Policies',
    value: 8,
    icon: <DocumentTextIcon className="h-7 w-7 text-teal-600" />, // Teal accent
    link: '/admin/policies',
    linkLabel: 'Configure Policies',
  },
  {
    label: 'Pending System Alerts',
    value: 2,
    icon: <BellAlertIcon className="h-7 w-7 text-yellow-500" />, // Yellow for alerts
    link: '/admin/alerts',
    linkLabel: 'View Alerts',
  },
];

// Mock recent activity
const recentActivity = [
  {
    icon: <UsersIcon className="h-6 w-6 text-green-500" />,
    message: (
      <>
        New user <span className="font-semibold">David Lee (EMP00153)</span> created.
      </>
    ),
    time: '2 hours ago by Admin',
  },
  {
    icon: <DocumentTextIcon className="h-6 w-6 text-blue-500" />,
    message: (
      <>Annual Leave Policy updated: Carry-forward limit changed.</>
    ),
    time: '1 day ago by Emily Carter',
  },
  {
    icon: <ChartBarIcon className="h-6 w-6 text-purple-500" />,
    message: (
      <>Monthly Leave Balance Report generated successfully.</>
    ),
    time: 'May 01, 2025 by System',
  },
];

// Quick links
const quickLinks = [
  {
    href: '/admin/employees',
    icon: <UserGroupIcon className="h-6 w-6 text-teal-600" />,
    title: 'Add New User',
    desc: 'Onboard a new employee.',
  },
  {
    href: '/admin/reports',
    icon: <ChartBarIcon className="h-6 w-6 text-green-600" />,
    title: 'Generate Report',
    desc: 'Access system reports.',
  },
  {
    href: '/admin/leave-approvals',
    icon: <CalendarDaysIcon className="h-6 w-6 text-purple-600" />,
    title: 'View All Leaves',
    desc: 'System-wide leave overview.',
  },
  {
    href: '/admin/settings',
    icon: <Cog6ToothIcon className="h-6 w-6 text-gray-500" />,
    title: 'System Settings',
    desc: 'Configure HRMS parameters.',
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome! Overview of the HRMS system and quick access to key admin features.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{stat.value}</p>
              </div>
              <div className="p-3 rounded-full bg-teal-50">{stat.icon}</div>
            </div>
            <div className="mt-4">
              <Link href={stat.link} className="inline-block text-sm font-medium text-teal-700 hover:text-teal-900 transition-colors">
                {stat.linkLabel} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link, i) => (
            <Link key={i} href={link.href} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md flex items-center space-x-3 transition-all">
              {link.icon}
              <div>
                <h3 className="text-sm font-medium text-gray-900">{link.title}</h3>
                <p className="text-xs text-gray-500">{link.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent System Activity</h2>
        </div>
        <ul className="divide-y divide-gray-200">
          {recentActivity.map((item, i) => (
            <li key={i} className="px-6 py-4 hover:bg-gray-50 flex items-center space-x-3">
              {item.icon}
              <div>
                <p className="text-sm text-gray-700">{item.message}</p>
                <p className="text-xs text-gray-500">{item.time}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="px-6 py-4 border-t border-gray-200 text-center">
          <Link href="/admin/activity-logs" className="text-sm font-medium text-teal-700 hover:text-teal-900 transition-colors">
            View All Activity Logs <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
} 
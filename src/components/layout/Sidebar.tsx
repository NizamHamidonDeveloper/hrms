"use client";

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  CalendarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  ClipboardDocumentListIcon,
  Bars3Icon,
  XMarkIcon,
  ClipboardDocumentListIcon as ActivityLogIcon,
} from '@heroicons/react/24/outline'
import { ROLE_ID } from '@/lib/roles'

interface NavItem {
  name: string
  href: string
  icon: typeof HomeIcon
}

const adminNavigation: NavItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Employee Management', href: '/admin/employees', icon: UserGroupIcon },
  { name: 'Leave Policies', href: '/admin/policies', icon: DocumentTextIcon },
  { name: 'Leave Approvals', href: '/admin/leave-approvals', icon: ClipboardDocumentListIcon },
  { name: 'Reports', href: '/admin/reports', icon: ChartBarIcon },
  { name: 'Activity Logs', href: '/admin/activity-logs', icon: ActivityLogIcon },
  { name: 'Settings', href: '/admin/settings', icon: CogIcon },
]

const employeeNavigation: NavItem[] = [
  { name: 'Dashboard', href: '/employee/dashboard', icon: HomeIcon },
  { name: 'Apply Leave', href: '/employee/leave/apply', icon: CalendarIcon },
  { name: 'Leave Summary', href: '/employee/leave/summary', icon: ClipboardDocumentListIcon },
  { name: 'Leave Balance', href: '/employee/leave/balance', icon: CalendarIcon },
  { name: 'My Calendar', href: '/employee/calendar', icon: CalendarIcon },
  { name: 'Team Calendar', href: '/employee/team/calendar', icon: CalendarIcon },
  { name: 'Settings', href: '/employee/settings', icon: CogIcon },
]

const managerNavigation: NavItem[] = [
  { name: 'Dashboard', href: '/manager/dashboard', icon: HomeIcon },
  { name: 'Team Leave Approvals', href: '/manager/leave/approvals', icon: ClipboardDocumentListIcon },
  { name: 'Team Management', href: '/manager/team', icon: UserGroupIcon },
  { name: 'Performance Reviews', href: '/manager/performance', icon: ClipboardDocumentListIcon },
  { name: 'Reports', href: '/manager/reports', icon: ChartBarIcon },
  { name: 'Settings', href: '/manager/settings', icon: CogIcon },
]

interface SidebarProps {
  activeRoleId: number
}

export default function Sidebar({ activeRoleId }: SidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Use numeric roleId for navigation
  let navItems: NavItem[] = [];
  if (activeRoleId === ROLE_ID.HR_ADMIN) {
    navItems = adminNavigation;
  } else if (activeRoleId === ROLE_ID.MANAGER) {
    navItems = managerNavigation;
  } else {
    navItems = employeeNavigation;
  }

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded bg-white border border-gray-200 shadow"
        onClick={() => setOpen(true)}
        aria-label="Open sidebar"
      >
        <Bars3Icon className="h-6 w-6 text-teal-700" />
      </button>
      {/* Sidebar overlay for mobile */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-30 md:hidden" onClick={() => setOpen(false)} />
      )}
      <aside
        className={`fixed md:static z-50 top-0 left-0 h-full w-64 bg-white shadow-sm border-r border-gray-100 flex flex-col transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        style={{ minHeight: '100vh' }}
      >
        {/* Logo/HRMS wording */}
        <div className="flex items-center justify-center h-20 border-b border-gray-100">
          <span className="text-2xl font-bold text-teal-700 tracking-wide">HRMS</span>
        </div>
        {/* Close button for mobile */}
        <button
          className="md:hidden absolute top-4 right-4 p-2 rounded bg-white border border-gray-200 shadow"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
        >
          <XMarkIcon className="h-6 w-6 text-teal-700" />
        </button>
        <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
          <nav className="mt-5 flex-1 space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-teal-50 text-teal-800 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-teal-700'
                  }`}
                  onClick={() => setOpen(false)}
                >
                  <Icon
                    className={`mr-3 h-6 w-6 flex-shrink-0 ${
                      isActive ? 'text-teal-700' : 'text-gray-400 group-hover:text-teal-600'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
} 
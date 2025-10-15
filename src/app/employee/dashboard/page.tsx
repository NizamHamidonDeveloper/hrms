'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { FaCalendarAlt, FaCheckCircle, FaPlaneDeparture, FaUserCircle, FaBullhorn } from 'react-icons/fa'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const mockUpcomingLeave = {
  type: 'Annual Leave',
  start: '2024-07-10',
  end: '2024-07-12',
  status: 'Approved',
}

const mockLeaveBalance = [
  { type: 'Annual', available: 10 },
  { type: 'Sick', available: 12 },
]

const mockRecentActivity = [
  { action: 'Applied for Annual Leave', date: '2024-06-01' },
  { action: 'Profile updated', date: '2024-05-28' },
  { action: 'Leave approved', date: '2024-05-20' },
]

const leaveStatusData = [
  { name: 'Approved', value: 8, color: '#089e8e' },
  { name: 'Pending', value: 2, color: '#5eead4' },
  { name: 'Rejected', value: 1, color: '#b2f5ea' },
]

const mockAnnouncements = [
  { title: 'Wesak Day Public Holiday', content: 'The office will be closed on May 24 for Wesak Day.' },
  { title: 'New HR Policy', content: 'Please review the updated leave policy in the HR portal.' },
]

function getNextLeaveCountdown() {
  const nextLeave = new Date('2024-07-10')
  const now = new Date()
  const diff = Math.max(0, Math.floor((nextLeave.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
  return diff
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const countdown = getNextLeaveCountdown()
  const [today, setToday] = useState('')

  useEffect(() => {
    setToday(new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
  }, [])

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
    <div className="p-6 bg-teal-50 min-h-screen text-gray-900">
      <div className="max-w-6xl mx-auto">
        {/* Personalized Greeting */}
        <div className="flex items-center mb-6 gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-4xl text-gray-500">
            <FaUserCircle />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome back, {session?.user?.name}!</h1>
            <p className="text-gray-600">Today is {today}</p>
          </div>
        </div>
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Upcoming Leave */}
          <div className="bg-white border-2 border-gray-100 rounded-xl p-6 shadow-md hover:shadow-lg transition flex flex-col" aria-label="Upcoming Leave" tabIndex={0}>
            <div className="flex items-center mb-2">
              <FaPlaneDeparture className="text-teal-600 mr-2" />
              <span className="text-lg font-semibold text-gray-800">Upcoming Leave</span>
            </div>
            <div className="text-sm text-gray-900">
              <div>{mockUpcomingLeave.type}</div>
              <div>{mockUpcomingLeave.start} to {mockUpcomingLeave.end}</div>
              <div className="mt-1 inline-block px-3 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold">{mockUpcomingLeave.status}</div>
            </div>
          </div>
          {/* Leave Balance */}
          <div className="bg-white border-2 border-gray-100 rounded-xl p-6 shadow-md hover:shadow-lg transition flex flex-col" aria-label="Leave Balance" tabIndex={0}>
            <div className="flex items-center mb-2">
              <FaCheckCircle className="text-teal-600 mr-2" />
              <span className="text-lg font-semibold text-gray-800">Leave Balance</span>
            </div>
            <div className="flex flex-col gap-1">
              {mockLeaveBalance.map((bal, idx) => (
                <span key={idx} className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">{bal.type}: {bal.available} days</span>
              ))}
            </div>
          </div>
          {/* Leave Status Chart */}
          <div className="bg-white border-2 border-gray-100 rounded-xl p-6 shadow-md hover:shadow-lg transition flex flex-col items-center" aria-label="Leave Status Overview" tabIndex={0}>
            <span className="text-lg font-semibold text-gray-800 mb-2">Leave Status</span>
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie data={leaveStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={40} innerRadius={25}>
                  {leaveStatusData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle"/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Next Leave Countdown */}
          <div className="bg-white border-2 border-gray-100 rounded-xl p-6 shadow-md hover:shadow-lg transition flex flex-col items-center justify-center" aria-label="Next Leave Countdown" tabIndex={0}>
            <span className="text-lg font-semibold text-gray-800 mb-2">Next Leave In</span>
            <span className="text-4xl font-bold text-teal-700">{countdown}</span>
            <span className="text-sm text-teal-700">day{countdown !== 1 ? 's' : ''}</span>
          </div>
        </div>
        {/* Action Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <a href="/employee/leave/apply" className="flex items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-teal-400 text-white shadow px-6 py-3 font-semibold text-lg transition hover:from-teal-600 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500">
            <FaCalendarAlt className="mr-2" /> Apply for Leave
          </a>
          <a href="/employee/calendar" className="flex items-center justify-center rounded-full bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow px-6 py-3 font-semibold text-lg transition hover:from-teal-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500">
            <FaCalendarAlt className="mr-2" /> View My Calendar
          </a>
          <a href="/employee/leave/balance" className="flex items-center justify-center rounded-full bg-gradient-to-r from-teal-700 to-teal-600 text-white shadow px-6 py-3 font-semibold text-lg transition hover:from-teal-800 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500">
            <FaCheckCircle className="mr-2" /> Check Leave Balance
          </a>
        </div>
        {/* Recent Activity & Announcements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white border-2 border-gray-100 rounded-xl p-6 shadow-md hover:shadow-lg transition" aria-label="Recent Activity" tabIndex={0}>
            <span className="text-lg font-semibold text-gray-800 mb-2 block">Recent Activity</span>
            <ul className="text-gray-900 text-sm">
              {mockRecentActivity.map((a, idx) => (
                <li key={idx} className="mb-1">{a.action} <span className="block text-xs text-gray-500">{a.date}</span></li>
              ))}
              {mockRecentActivity.length === 0 && <li>No recent activity</li>}
            </ul>
          </div>
          {/* Announcements */}
          <div className="bg-white border-2 border-gray-100 rounded-xl p-6 shadow-md hover:shadow-lg transition" aria-label="Announcements" tabIndex={0}>
            <div className="flex items-center mb-2">
              <FaBullhorn className="text-teal-600 mr-2" />
              <span className="text-lg font-semibold text-gray-800">Announcements</span>
            </div>
            <ul className="text-gray-900 text-sm">
              {mockAnnouncements.map((a, idx) => (
                <li key={idx} className="mb-2">
                  <span className="font-semibold">{a.title}</span>
                  <div className="text-xs text-gray-700">{a.content}</div>
                </li>
              ))}
              {mockAnnouncements.length === 0 && <li>No announcements</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 
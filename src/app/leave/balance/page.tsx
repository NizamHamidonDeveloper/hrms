// SHARED LEAVE BALANCE PAGE FOR ALL ROLES
'use client'

import React, { useState, useEffect } from 'react'
import { FaPlaneDeparture, FaBriefcaseMedical, FaExclamationTriangle, FaHandHoldingHeart, FaExchangeAlt, FaBaby, FaBabyCarriage } from 'react-icons/fa'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import { FiInfo } from 'react-icons/fi'
import Head from 'next/head'

const colorMap = {
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    available: 'text-blue-600',
  },
  red: {
    bg: 'bg-red-100',
    text: 'text-red-600',
    available: 'text-red-600',
  },
  yellow: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-600',
    available: 'text-yellow-600',
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-600',
    available: 'text-purple-600',
  },
  indigo: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-600',
    available: 'text-indigo-600',
  },
  pink: {
    bg: 'bg-pink-100',
    text: 'text-pink-600',
    available: 'text-pink-600',
  },
  gray: {
    bg: 'bg-gray-100',
    text: 'text-gray-400',
    available: 'text-gray-400',
  },
}

// Define minimal interfaces for LeaveBalanceCard and LeaveBalanceBreakdown
interface LeaveBalanceCard {
  type: string;
  label?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconTextColor?: string;
  entitled: number | string;
  taken: number | string;
  pending: number | string;
  available: number | string;
  isAvailable: boolean;
  color?: string;
  disabled?: boolean;
}

interface LeaveBalanceBreakdown {
  year: number;
  entitled: number;
  taken: number;
  carriedForward: number;
  available: number;
}

// Update LeaveCard to use LeaveBalanceCard
function LeaveCard({ type }: { type: LeaveBalanceCard }) {
  const color = colorMap[type.color as keyof typeof colorMap]
  const isDisabled = type.disabled
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-100 p-6 transition-transform duration-150 hover:scale-[1.025] hover:shadow-md ${isDisabled ? 'opacity-50' : ''}`}
      aria-label={type.label}
      tabIndex={0}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-medium ${isDisabled ? 'text-gray-400' : 'text-gray-900'}`}>{type.label || 'Leave'}</h3>
        <div className={`p-2 rounded-full ${color.bg} ${color.text}`}>{type.icon}</div>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between"><span className={`${isDisabled ? 'text-gray-400' : 'text-gray-500'}`}>Entitled:</span><span className={`font-medium ${isDisabled ? 'text-gray-400' : 'text-gray-900'}`}>{type.entitled}{typeof type.entitled === 'number' ? ' Days' : ''}</span></div>
        <div className="flex justify-between"><span className={`${isDisabled ? 'text-gray-400' : 'text-gray-500'}`}>Taken:</span><span className={`font-medium ${isDisabled ? 'text-gray-400' : 'text-gray-900'}`}>{type.taken}{typeof type.taken === 'number' ? ' Days' : ''}</span></div>
        <div className="flex justify-between"><span className={`${isDisabled ? 'text-gray-400' : 'text-gray-500'}`}>Pending:</span><span className={`font-medium ${isDisabled ? 'text-gray-400' : 'text-gray-900'}`}>{type.pending}{typeof type.pending === 'number' ? ' Days' : ''}</span></div>
        <hr className="my-2" />
        <div className="flex justify-between text-lg font-semibold">
          <span className={`${isDisabled ? 'text-gray-400' : 'text-gray-700'}`}>Available:</span>
          <span className={`${color.available}`}>{type.available}{typeof type.available === 'number' ? ' Days' : ''}</span>
        </div>
      </div>
    </div>
  )
}

const mockLeaveBalance = {
  cards: [
    {
      type: 'annual',
      label: 'Annual Leave',
      icon: <FaPlaneDeparture />,
      color: 'blue',
      entitled: 18,
      taken: 5,
      pending: 3,
      available: 10,
      isAvailable: true,
    },
    {
      type: 'sick',
      label: 'Sick Leave',
      icon: <FaBriefcaseMedical />,
      color: 'red',
      entitled: 14,
      taken: 2,
      pending: 0,
      available: 12,
      isAvailable: true,
    },
    {
      type: 'emergency',
      label: 'Emergency Leave',
      icon: <FaExclamationTriangle />,
      color: 'yellow',
      entitled: 5,
      taken: 1,
      pending: 1,
      available: 3,
      isAvailable: true,
    },
    {
      type: 'compassionate',
      label: 'Compassionate Leave',
      icon: <FaHandHoldingHeart />,
      color: 'purple',
      entitled: '3/occurrence',
      taken: 0,
      pending: 0,
      available: 'Policy Based',
      isAvailable: true,
    },
    {
      type: 'replacement',
      label: 'Replacement Leave',
      icon: <FaExchangeAlt />,
      color: 'indigo',
      entitled: 2,
      taken: 0,
      pending: 0,
      available: 2,
      isAvailable: true,
    },
    {
      type: 'maternity',
      label: 'Maternity Leave',
      icon: <FaBaby />,
      color: 'pink',
      entitled: 90,
      taken: 0,
      pending: 0,
      available: 90,
      isAvailable: true,
    },
    {
      type: 'paternity',
      label: 'Paternity Leave',
      icon: <FaBabyCarriage />,
      color: 'gray',
      entitled: 'N/A',
      taken: 'N/A',
      pending: 'N/A',
      available: 'N/A',
      isAvailable: false,
    },
  ],
  breakdown: [
    { year: 2025, entitled: 18, taken: 5, carriedForward: 2, available: 10 },
    { year: 2024, entitled: 16, taken: 14, carriedForward: 2, available: 0 },
  ],
  policyInfo: {
    title: 'Annual Leave Policy',
    description: 'Employees are entitled to 18 days of annual leave per year. Up to 5 days can be carried forward to the next year. Leave must be approved by your manager at least 2 weeks in advance.'
  }
};

export default function SharedLeaveBalancePage() {
  const { status } = useSession()
  const [balance, setBalance] = useState(mockLeaveBalance);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/leave/balance')
      .then(res => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then(data => {
        if (!data || !data.cards || !Array.isArray(data.cards) || data.cards.length === 0) {
          throw new Error('No leave balance data');
        }
        setBalance({
          ...mockLeaveBalance,
          ...data,
          cards: (data.cards || []).map((card: LeaveBalanceCard) => {
            const match = mockLeaveBalance.cards.find((c: LeaveBalanceCard) => c.type === card.type);
            return {
              ...card,
              label: match?.label || card.type,
              icon: match?.icon,
              color: match?.color || 'gray',
            };
          })
        });
        setLoading(false);
      })
      .catch(() => {
        setBalance(mockLeaveBalance);
        setLoading(false);
        toast.error('Failed to fetch leave balance from API, using mock data.');
      });
  }, []);

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
          <svg className="animate-spin h-8 w-8 text-teal-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
          <span className="text-gray-700 font-medium">Loading leave balances...</span>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    return null
  }

  return (
    <>
      <Head>
        <style>{`
          @media print {
            .no-print, .no-print * { display: none !important; }
            body * { visibility: hidden !important; }
            #print-area, #print-area * { display: block !important; visibility: visible !important; }
            #print-area { position: absolute !important; left: 0; top: 0; width: 100vw; background: white !important; box-shadow: none !important; }
          }
        `}</style>
      </Head>
      <div className="p-4 sm:p-8 bg-teal-50 min-h-screen text-gray-900">
        <div className="max-w-5xl mx-auto">
          {/* Printable Area Start */}
          <div id="print-area">
            <h1 className="sr-only print:block print:mb-4 print:text-2xl print:font-bold">My Leave Balances</h1>
            {/* Leave Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {balance.cards.map((type: LeaveBalanceCard) => (
                <LeaveCard key={type.type} type={type} />
              ))}
            </div>
            {/* Leave Balance Details Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
              <h3 className="text-lg font-bold text-teal-700 mb-4">Leave Balance Details</h3>
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-700 mb-3">Annual Leave Breakdown</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full rounded-lg overflow-hidden">
                    <thead className="bg-teal-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-teal-700 uppercase tracking-wider">Year</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-teal-700 uppercase tracking-wider">Entitled</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-teal-700 uppercase tracking-wider">Taken</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-teal-700 uppercase tracking-wider">Carried Forward</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-teal-700 uppercase tracking-wider">Available</th>
                      </tr>
                    </thead>
                    <tbody>
                      {balance.breakdown.map((row: LeaveBalanceBreakdown, idx: number) => (
                        <tr key={row.year} className={idx % 2 === 0 ? 'bg-white' : 'bg-teal-50'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.year}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.entitled} days</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.taken} days</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.carriedForward} days</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-teal-700">{row.available} days</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="mt-6">
                <div className="flex items-center gap-3 bg-teal-50 border-l-4 border-teal-400 rounded-xl p-4">
                  <FiInfo className="text-teal-500 text-2xl flex-shrink-0" />
                  <div className="text-sm text-gray-700">
                    <strong className="text-teal-700">{balance.policyInfo.title}</strong>: {balance.policyInfo.description}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Printable Area End */}
        </div>
      </div>
    </>
  );
} 
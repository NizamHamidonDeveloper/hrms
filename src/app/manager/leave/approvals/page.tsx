"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface LeaveRequest {
  id: string;
  employee: {
    name: string;
    id: string;
    avatar: string;
  };
  type: string;
  dates: string;
  duration: string;
  reason: string;
  submitted: string;
  balance: string;
  status: string;
}

const mockApprovals: LeaveRequest[] = [
  {
    id: 'emp00123-1',
    employee: {
      name: 'Sarah Chen',
      id: 'EMP00123',
      avatar: 'https://via.placeholder.com/40x40?text=SC',
    },
    type: 'Annual Leave',
    dates: 'May 22 - May 24, 2025',
    duration: '3 Days',
    reason: 'Personal trip to visit family for a wedding.',
    submitted: 'May 10, 2025',
    balance: '10 Days AL',
    status: 'Pending',
  },
  {
    id: 'emp00456-1',
    employee: {
      name: 'Michael Johnson',
      id: 'EMP00456',
      avatar: 'https://via.placeholder.com/40x40?text=MJ',
    },
    type: 'Sick Leave',
    dates: 'May 15, 2025',
    duration: '1 Day',
    reason: 'Feeling unwell, doctor\'s appointment scheduled.',
    submitted: 'May 14, 2025',
    balance: '12 Days SL',
    status: 'Pending',
  },
  {
    id: 'emp00789-1',
    employee: {
      name: 'Lisa Wong',
      id: 'EMP00789',
      avatar: 'https://via.placeholder.com/40x40?text=LW',
    },
    type: 'Emergency Leave',
    dates: 'May 20, 2025',
    duration: '0.5 Day (PM)',
    reason: 'Urgent family matter that requires immediate attention.',
    submitted: 'May 20, 2025',
    balance: '3 Days EL',
    status: 'Pending',
  },
];

const employees = ['All Employees', 'Sarah Chen', 'Michael Johnson', 'Lisa Wong'];
const leaveTypes = ['All Types', 'Annual Leave', 'Sick Leave', 'Emergency Leave'];
const statuses = ['Pending', 'All', 'Approved', 'Rejected'];

const ManagerLeaveApprovalsPage = () => {
  const [employeeFilter, setEmployeeFilter] = useState('All Employees');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('Pending');

  const [approvals, setApprovals] = useState<LeaveRequest[]>(mockApprovals);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('/api/manager/team/approvals')
      .then(res => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then(data => {
        setApprovals(data);
        setLoading(false);
      })
      .catch(() => {
        setApprovals(mockApprovals);
        setError('Failed to fetch from API, using mock data.');
        setLoading(false);
      });
  }, []);

  const filteredApprovals = approvals.filter((req) => {
    const matchEmployee = employeeFilter === 'All Employees' || req.employee.name === employeeFilter;
    const matchType = leaveTypeFilter === 'All Types' || req.type === leaveTypeFilter;
    const matchStatus = statusFilter === 'All' || req.status === statusFilter;
    return matchEmployee && matchType && matchStatus;
  });

  const handleApprove = () => {
    // Implement approve logic
  };

  const handleReject = () => {
    // Implement reject logic
  };

  const openModal = () => {
    // Implement open modal logic
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 id="page-title" className="text-2xl font-bold text-theme-primary">Team Leave Approvals</h1>
            <p className="text-theme">Review and manage leave requests from your team.</p>
          </div>
          <a 
            href="#" 
            className="text-sm font-medium text-teal-600 hover:text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded-full px-3 py-1"
            aria-label="View approval history"
          >
            View Approval History <i className="fas fa-history ml-1" aria-hidden="true" />
          </a>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-theme p-4 mb-6" role="search" aria-label="Leave request filters">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label id="employee-filter-label" className="block text-sm font-medium text-theme-secondary">Employee</label>
              <select
                aria-labelledby="employee-filter-label"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-theme focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md bg-white dark:bg-gray-900 text-theme"
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
              >
                {employees.map((emp) => (
                  <option key={emp}>{emp}</option>
                ))}
              </select>
            </div>
            <div>
              <label id="leave-type-filter-label" className="block text-sm font-medium text-theme-secondary">Leave Type</label>
              <select
                aria-labelledby="leave-type-filter-label"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-theme focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md bg-white dark:bg-gray-900 text-theme"
                value={leaveTypeFilter}
                onChange={(e) => setLeaveTypeFilter(e.target.value)}
              >
                {leaveTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label id="status-filter-label" className="block text-sm font-medium text-theme-secondary">Status</label>
              <select
                aria-labelledby="status-filter-label"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-theme focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md bg-white dark:bg-gray-900 text-theme"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading/Error States */}
        {loading ? (
          <div className="p-8 text-center text-theme" role="status" aria-live="polite">Loading approvals...</div>
        ) : error ? (
          <div className="p-8 text-center text-yellow-600" role="alert">{error}</div>
        ) : null}

        {/* Approvals Table */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-theme overflow-x-auto">
          <table className="min-w-full divide-y divide-theme" role="table" aria-label="Leave requests">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">Leave Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-theme">
              {filteredApprovals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-500" role="status">
                    <i className="fas fa-inbox fa-3x text-gray-300 mb-2" aria-hidden="true" />
                    <p>No pending approvals at the moment.</p>
                  </td>
                </tr>
              ) : (
                filteredApprovals.map((req, idx) => (
                  <tr 
                    key={req.id} 
                    className={`${idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'} hover:bg-teal-50 dark:hover:bg-teal-900 transition-colors`}
                    tabIndex={0}
                    role="row"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-primary">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <Image 
                            className="h-10 w-10 rounded-full" 
                            src={req.employee.avatar} 
                            alt="" 
                            width={40} 
                            height={40} 
                            aria-hidden="true"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-theme-primary">{req.employee.name}</div>
                          <div className="text-sm text-theme-secondary" aria-label={`Employee ID: ${req.employee.id}`}>{req.employee.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-theme">{req.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-theme">{req.dates}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-theme">{req.duration}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-theme truncate max-w-xs" title={req.reason}>
                      <span aria-label={`Reason: ${req.reason}`}>
                        {req.reason.length > 25 ? req.reason.slice(0, 22) + '...' : req.reason}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-theme">{req.submitted}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-theme">{req.balance}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center gap-2">
                      <button 
                        className="rounded-full bg-gradient-to-r from-teal-500 to-teal-400 text-white shadow px-4 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-theme-primary focus:ring-offset-2" 
                        onClick={() => handleApprove()}
                        aria-label={`Approve leave request for ${req.employee.name}`}
                      >
                        <i className="fas fa-check" aria-hidden="true"></i> Approve
                      </button>
                      <button 
                        className="rounded-full bg-gradient-to-r from-red-500 to-red-400 text-white shadow px-4 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2" 
                        onClick={() => handleReject()}
                        aria-label={`Reject leave request for ${req.employee.name}`}
                      >
                        <i className="fas fa-times" aria-hidden="true"></i> Reject
                      </button>
                      <button 
                        className="rounded-full border border-theme text-theme bg-white dark:bg-gray-900 shadow px-4 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-theme-primary focus:ring-offset-2" 
                        onClick={() => openModal()}
                        aria-label={`View details of leave request for ${req.employee.name}`}
                      >
                        <i className="fas fa-eye" aria-hidden="true"></i> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination (static for now) */}
        <nav className="mt-6 flex items-center justify-between" role="navigation" aria-label="Pagination">
          <div className="text-sm text-theme" role="status" aria-live="polite">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredApprovals.length}</span> of <span className="font-medium">{filteredApprovals.length}</span> pending requests
          </div>
          <div className="flex space-x-1">
            <button 
              className="px-3 py-1 border border-theme rounded-full text-sm font-medium text-theme-secondary bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-theme-primary focus:ring-offset-2" 
              disabled
              aria-label="Go to previous page"
            >
              Previous
            </button>
            <button 
              className="px-3 py-1 border border-theme rounded-full text-sm font-medium text-theme bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-theme-primary focus:ring-offset-2" 
              disabled
              aria-label="Go to next page"
            >
              Next
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default ManagerLeaveApprovalsPage; 
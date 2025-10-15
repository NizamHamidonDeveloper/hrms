"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Dialog } from '@headlessui/react';
import Image from 'next/image'

// ApprovalRequest interface based on mock data and usage
interface ApprovalRequest {
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

export default function TeamLeaveApprovalsPage() {
  const [employeeFilter, setEmployeeFilter] = useState('All Employees');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);

  // Dynamically generate filter options from data
  const employeeOptions = useMemo(() => ['All Employees', ...Array.from(new Set(approvals.map(a => a.employee.name)))], [approvals]);
  const leaveTypeOptions = useMemo(() => ['All Types', ...Array.from(new Set(approvals.map(a => a.type)))], [approvals]);
  const statusOptions = useMemo(() => ['All', ...Array.from(new Set(approvals.map(a => a.status)))], [approvals]);

  // If the current filter is not in the options, reset to default
  useEffect(() => {
    if (!employeeOptions.includes(employeeFilter)) setEmployeeFilter('All Employees');
    if (!leaveTypeOptions.includes(leaveTypeFilter)) setLeaveTypeFilter('All Types');
    if (!statusOptions.includes(statusFilter)) setStatusFilter('All');
  }, [approvals, employeeFilter, employeeOptions, leaveTypeFilter, leaveTypeOptions, statusFilter, statusOptions]);

  useEffect(() => {
    fetch('/api/manager/team/approvals')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch approvals');
        return res.json();
      })
      .then((data) => {
        console.log('[TeamLeaveApprovals] Fetched approvals:', data);
        setApprovals(data);
      })
      .catch((err) => {
        console.error('[TeamLeaveApprovals] Fetch error:', err);
        setActionMessage(err.message);
      });
  }, []);

  const filteredApprovals = approvals.filter((req: ApprovalRequest) => {
    const matchEmployee = employeeFilter === 'All Employees' || req.employee.name === employeeFilter;
    const matchType = leaveTypeFilter === 'All Types' || req.type === leaveTypeFilter;
    const matchStatus = statusFilter === 'All' || req.status === statusFilter;
    return matchEmployee && matchType && matchStatus;
  });

  const openModal = (req: ApprovalRequest) => {
    setSelectedRequest(req);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const handleApprove = async (req: ApprovalRequest) => {
    try {
      const res = await fetch(`/api/manager/team/approvals/${req.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });
      if (!res.ok) throw new Error('Failed to approve request');
      setApprovals((prev) => prev.map((r) => r.id === req.id ? { ...r, status: 'Approved' } : r));
      setActionMessage(`Request for ${req.employee.name} approved!`);
    } catch {
      setActionMessage('Error: Could not approve request.');
    }
    setIsModalOpen(false);
    setTimeout(() => setActionMessage(null), 2000);
  };
  const handleReject = async (req: ApprovalRequest) => {
    try {
      const res = await fetch(`/api/manager/team/approvals/${req.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      });
      if (!res.ok) throw new Error('Failed to reject request');
      setApprovals((prev) => prev.map((r) => r.id === req.id ? { ...r, status: 'Rejected' } : r));
      setActionMessage(`Request for ${req.employee.name} rejected!`);
    } catch {
      setActionMessage('Error: Could not approve request.');
    }
    setIsModalOpen(false);
    setTimeout(() => setActionMessage(null), 2000);
  };

  return (
    <main className="p-8 max-w-7xl mx-auto min-h-screen bg-white dark:bg-gray-900" role="main" aria-labelledby="page-title">
      <h1 id="page-title" className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Team Approvals (Manager)</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">Review and approve leave requests from your team members below.</p>
      <section className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-100 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Pending Approvals</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" role="table" aria-label="Pending approvals">
            <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredApprovals.length === 0 ? (
              <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-theme-secondary">
                    <i className="fas fa-inbox fa-3x text-theme-secondary mb-2" />
                  <p>No pending approvals at the moment.</p>
                </td>
              </tr>
            ) : (
                filteredApprovals.map((req: ApprovalRequest, idx) => (
                  <tr key={req.id} className={`${idx % 2 === 0 ? 'bg-teal-50 dark:bg-teal-900' : 'bg-gray-50 dark:bg-gray-800'} hover:bg-teal-100 dark:hover:bg-teal-800 transition-colors`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-100">{req.employee.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-200">{req.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-200">{req.dates}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-200">{req.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                      <button className="px-3 py-1 rounded bg-theme-primary text-white dark:bg-theme-primary hover:bg-teal-700 dark:hover:bg-teal-800 transition-colors" onClick={() => handleApprove(req)}>Approve</button>
                      <button className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" onClick={() => handleReject(req)}>Reject</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </section>
      {/* ...other sections, update classes similarly... */}

      {/* Detail Modal Skeleton */}
      <Dialog open={isModalOpen} onClose={closeModal} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
          <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full mx-auto p-6 z-10">
            <Dialog.Title className="text-lg font-bold text-theme-primary mb-2">Leave Request Details</Dialog.Title>
            {selectedRequest && (
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Image src={selectedRequest.employee.avatar} alt={selectedRequest.employee.name} width={48} height={48} className="h-12 w-12 rounded-full" />
                  <div>
                    <div className="font-semibold text-theme-primary">{selectedRequest.employee.name}</div>
                    <div className="text-theme-secondary text-sm">{selectedRequest.employee.id}</div>
                  </div>
                </div>
                <div><span className="font-medium text-theme-secondary">Type:</span> <span className="text-theme-secondary">{selectedRequest.type}</span></div>
                <div><span className="font-medium text-theme-secondary">Dates:</span> <span className="text-theme-secondary">{selectedRequest.dates}</span></div>
                <div><span className="font-medium text-theme-secondary">Duration:</span> <span className="text-theme-secondary">{selectedRequest.duration}</span></div>
                <div><span className="font-medium text-theme-secondary">Reason:</span> <span className="text-theme-secondary">{selectedRequest.reason}</span></div>
                <div><span className="font-medium text-theme-secondary">Submitted:</span> <span className="text-theme-secondary">{selectedRequest.submitted}</span></div>
                <div><span className="font-medium text-theme-secondary">Balance:</span> <span className="text-theme-secondary">{selectedRequest.balance}</span></div>
                <div><span className="font-medium text-theme-secondary">Status:</span> <span className="text-theme-secondary">{selectedRequest.status}</span></div>
                <div className="flex space-x-2 mt-4">
                  <button className="flex-1 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700" onClick={() => handleApprove(selectedRequest)}>Approve</button>
                  <button className="flex-1 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700" onClick={() => handleReject(selectedRequest)}>Reject</button>
                </div>
              </div>
            )}
            <button onClick={closeModal} className="mt-6 w-full py-2 rounded bg-teal-600 text-white font-semibold hover:bg-teal-700">Close</button>
          </div>
        </div>
      </Dialog>
    </main>
  );
} 
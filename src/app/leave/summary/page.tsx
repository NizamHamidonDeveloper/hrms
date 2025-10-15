// SHARED LEAVE SUMMARY PAGE FOR ALL ROLES
"use client";
import React, { useState, useEffect } from "react";
import LeaveSummaryTable from '@/components/leave/LeaveSummaryTable';
import LeaveSummaryFilters from '@/components/leave/LeaveSummaryFilters';
import { LeaveSummary, LeaveSummaryFilters as LeaveSummaryFiltersType, LeaveType } from '@/types/leave';
import toast from 'react-hot-toast';

// Mock data for demonstration
const mockLeaves: LeaveSummary[] = [
  {
    id: '1',
    type: LeaveType.ANNUAL,
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-06-05'),
    duration: 5,
    reason: 'Family vacation',
    status: 'approved',
    submittedAt: new Date('2024-05-20'),
    approverId: 'Manager',
    approvedAt: new Date('2024-05-22'),
  },
  {
    id: '2',
    type: LeaveType.SICK,
    startDate: new Date('2024-07-10'),
    endDate: new Date('2024-07-12'),
    duration: 3,
    reason: 'Medical appointment',
    status: 'pending',
    submittedAt: new Date('2024-07-01'),
    approverId: undefined,
    approvedAt: undefined,
  },
  {
    id: '3',
    type: LeaveType.EMERGENCY,
    startDate: new Date('2024-08-15'),
    endDate: new Date('2024-08-15'),
    duration: 1,
    reason: 'Urgent family matter',
    status: 'rejected',
    submittedAt: new Date('2024-08-10'),
    approverId: 'Manager',
    approvedAt: new Date('2024-08-12'),
  },
];

export default function SharedLeaveSummaryPage() {
  const [leaves, setLeaves] = useState<LeaveSummary[]>(mockLeaves);
  const [filteredLeaves, setFilteredLeaves] = useState<LeaveSummary[]>(mockLeaves);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fallbackWarning, setFallbackWarning] = useState<string | null>(null);
  const [selectedLeave, setSelectedLeave] = useState<LeaveSummary | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setFallbackWarning(null);
    fetch('/api/leave/summary')
      .then(res => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then(data => {
        setLeaves(data.leaves || []);
        setFilteredLeaves(data.leaves || []);
        setLoading(false);
      })
      .catch(() => {
        setLeaves(mockLeaves);
        setFilteredLeaves(mockLeaves);
        setFallbackWarning('Failed to fetch leave summary from API, using mock data.');
        setLoading(false);
      });
  }, []);

  const handleFilter = (filters: LeaveSummaryFiltersType) => {
    let filtered = leaves;
    if (filters.status) {
      filtered = filtered.filter(lv => lv.status === filters.status);
    }
    if (filters.type) {
      filtered = filtered.filter(lv => lv.type === filters.type);
    }
    if (filters.fromDate) {
      filtered = filtered.filter(lv => filters.fromDate && lv.startDate >= filters.fromDate);
    }
    if (filters.toDate) {
      filtered = filtered.filter(lv => filters.toDate && lv.endDate <= filters.toDate);
    }
    setFilteredLeaves(filtered);
  };

  const handleReset = () => {
    setFilteredLeaves(leaves);
  };

  const handleViewDetails = (leaveId: string) => {
    const leave = filteredLeaves.find(lv => lv.id === leaveId) || null;
    // Defensive: ensure date fields are Date objects
    if (leave) {
      const safeLeave = {
        ...leave,
        startDate: leave.startDate instanceof Date ? leave.startDate : new Date(leave.startDate),
        endDate: leave.endDate instanceof Date ? leave.endDate : new Date(leave.endDate),
        approvedAt: leave.approvedAt ? (leave.approvedAt instanceof Date ? leave.approvedAt : new Date(leave.approvedAt)) : undefined,
        submittedAt: leave.submittedAt instanceof Date ? leave.submittedAt : new Date(leave.submittedAt),
      };
      setSelectedLeave(safeLeave);
      setModalOpen(true);
    } else {
      setSelectedLeave(null);
      setModalOpen(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedLeave(null);
  };

  // Cancel leave logic with real API + fallback
  const handleCancelLeave = async (leaveId: string) => {
    if (!window.confirm('Are you sure you want to cancel this leave application?')) return;
    try {
      const res = await fetch(`/api/leave/apply/${leaveId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      let data = null;
      try {
        data = await res.json();
      } catch {}
      if (res.ok && data && data.success) {
        setLeaves(prev => prev.map(lv => lv.id === leaveId ? { ...lv, status: 'cancelled' } : lv));
        setFilteredLeaves(prev => prev.map(lv => lv.id === leaveId ? { ...lv, status: 'cancelled' } : lv));
        toast.success('Leave application cancelled.');
      } else {
        // Fallback: mock cancel
        setLeaves(prev => prev.map(lv => lv.id === leaveId ? { ...lv, status: 'cancelled' } : lv));
        setFilteredLeaves(prev => prev.map(lv => lv.id === leaveId ? { ...lv, status: 'cancelled' } : lv));
        toast.error((data && data.message) ? `API error: ${data.message} (mock fallback)` : 'API unavailable. Leave cancelled locally (mock fallback).');
      }
    } catch {
      // Fallback: mock cancel
      setLeaves(prev => prev.map(lv => lv.id === leaveId ? { ...lv, status: 'cancelled' } : lv));
      setFilteredLeaves(prev => prev.map(lv => lv.id === leaveId ? { ...lv, status: 'cancelled' } : lv));
      toast.error('API unavailable. Leave cancelled locally (mock fallback).');
    } finally {
      setModalOpen(false);
      setSelectedLeave(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">My Leave</h1>
      <p className="text-gray-600 mb-8">View your leave history and status.</p>
      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading leave summary...</div>
      ) : error ? (
        <div className="p-8 text-center text-red-600">{error}</div>
      ) : null}
      {fallbackWarning && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded">{fallbackWarning}</div>
      )}
      <LeaveSummaryFilters onFilter={handleFilter} onReset={handleReset} />
      <LeaveSummaryTable leaves={filteredLeaves} onViewDetails={handleViewDetails} />

      {/* Leave Details Modal */}
      {modalOpen && selectedLeave && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl shadow-xl border border-gray-100 p-8 max-w-md w-full relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-teal-600 text-2xl font-bold focus:outline-none"
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Leave Details</h2>
            <div className="space-y-3 text-gray-700 text-sm mb-6">
              <div><span className="font-semibold">Type:</span> {selectedLeave.type.charAt(0).toUpperCase() + selectedLeave.type.slice(1)}</div>
              <div><span className="font-semibold">Dates:</span> {selectedLeave.startDate.toLocaleDateString()} - {selectedLeave.endDate.toLocaleDateString()}</div>
              <div><span className="font-semibold">Duration:</span> {selectedLeave.duration} days</div>
              <div><span className="font-semibold">Status:</span> <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${selectedLeave.status === 'approved' ? 'bg-green-100 text-green-800' : selectedLeave.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : selectedLeave.status === 'rejected' ? 'bg-red-100 text-red-800' : selectedLeave.status === 'cancelled' ? 'bg-gray-200 text-gray-500' : 'bg-gray-100 text-gray-800'}`}>{selectedLeave.status.charAt(0).toUpperCase() + selectedLeave.status.slice(1)}</span></div>
              <div><span className="font-semibold">Reason:</span> {selectedLeave.reason}</div>
              {selectedLeave.approverId && <div><span className="font-semibold">Approver:</span> {selectedLeave.approverId}</div>}
              {selectedLeave.approvedAt && <div><span className="font-semibold">Approved At:</span> {selectedLeave.approvedAt.toLocaleDateString()}</div>}
              <div><span className="font-semibold">Submitted On:</span> {selectedLeave.submittedAt.toLocaleDateString()}</div>
            </div>
            {/* Cancel Leave button for pending status */}
            {selectedLeave.status === 'pending' && (
              <button
                onClick={() => handleCancelLeave(selectedLeave.id)}
                className="w-full px-8 py-3 border border-transparent rounded-full shadow-md text-base font-bold text-white bg-gradient-to-r from-red-500 to-red-400 hover:from-red-600 hover:to-red-500 focus:ring-2 focus:ring-red-500 focus:outline-none transition-colors"
              >
                Cancel Leave
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 
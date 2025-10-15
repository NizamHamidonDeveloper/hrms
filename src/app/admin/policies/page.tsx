'use client';
import LeavePolicyList, { LeavePolicy } from '@/components/admin/LeavePolicyList';
import LeavePolicyDetailModal from '@/components/admin/LeavePolicyDetailModal';
import LeavePolicyFormModal from '@/components/admin/LeavePolicyFormModal';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { LeavePolicyFormData } from '@/components/admin/LeavePolicyFormModal';

const mockPolicies: LeavePolicy[] = [
  {
    id: 'annual_leave',
    name: 'Annual Leave',
    description: 'Paid time off for vacation and personal needs. Accrues based on years of service.',
    keyEntitlementRule: '14-25 days/year based on tenure',
    status: 'active',
    lastUpdated: '2025-03-15',
  },
  {
    id: 'sick_leave',
    name: 'Sick Leave',
    description: 'Paid time off for illness or medical appointments. Medical certificate may be required.',
    keyEntitlementRule: '14 days/year',
    status: 'active',
    lastUpdated: '2024-12-01',
  },
  {
    id: 'maternity_leave',
    name: 'Maternity Leave',
    description: 'Leave for expectant and new mothers, as per statutory requirements.',
    keyEntitlementRule: '90 calendar days',
    status: 'active',
    lastUpdated: '2023-01-10',
  },
  {
    id: 'unpaid_leave',
    name: 'Unpaid Leave',
    description: 'Time off without pay for extended personal reasons, subject to management approval.',
    keyEntitlementRule: 'Case-by-case basis',
    status: 'requires_approval',
    lastUpdated: '2022-06-01',
  },
];

const policyDetailData: Record<string, {
  id: string;
  name: string;
  description: string;
  entitlement: string;
  conditions: string;
  documentation: string;
}> = {
  annual_leave: {
    id: 'annual_leave',
    name: 'Annual Leave Policy',
    description: 'Paid time off for vacation, personal errands, and rest. Accrual rates increase with years of service. Maximum carry-forward of 5 days to the next calendar year, subject to approval.',
    entitlement: '1-3 Years Service: 14 days/year. 4-7 Years Service: 18 days/year. 8+ Years Service: 22 days/year. Pro-rated for new hires.',
    conditions: 'Must be applied for at least 2 weeks in advance, unless for urgent matters. Minimum 0.5 day application. Subject to manager approval and team schedule.',
    documentation: 'No specific documents required for standard annual leave.'
  },
  sick_leave: {
    id: 'sick_leave',
    name: 'Sick Leave Policy',
    description: 'Paid time off for personal illness or injury, or to care for an immediate family member who is ill. Employees are expected to notify their manager as early as possible on the first day of absence.',
    entitlement: '14 days per calendar year. Unused sick leave is not carried forward.',
    conditions: 'For absences of 3 or more consecutive days, a medical certificate from a registered practitioner is required. For shorter absences, self-certification is usually sufficient.',
    documentation: 'Medical Certificate (for >2 days), Self-declaration.'
  },
  maternity_leave: {
    id: 'maternity_leave',
    name: 'Maternity Leave Policy',
    description: 'Provides eligible female employees with paid time off for childbirth and recovery. Aligns with national statutory requirements.',
    entitlement: '90 consecutive calendar days of paid leave. Can commence up to 30 days before the expected due date.',
    conditions: 'Employee must have completed at least 90 days of continuous service. Notification to HR at least 4 months before expected delivery.',
    documentation: 'Doctor\'s letter confirming pregnancy and expected due date. Birth certificate after delivery.'
  },
  unpaid_leave: {
    id: 'unpaid_leave',
    name: 'Unpaid Leave Policy',
    description: 'Allows employees to request time off without pay for reasons not covered by other leave policies, such as extended travel, personal development, or family emergencies beyond standard entitlements.',
    entitlement: 'Granted on a case-by-case basis, subject to operational requirements and management discretion. Duration is mutually agreed upon.',
    conditions: 'Must be discussed and approved by the reporting manager and HR well in advance. Employee benefits (e.g., health insurance) may be affected during extended unpaid leave.',
    documentation: 'Formal written request outlining the reason and duration.'
  }
};

const policyTypes = [
  { value: '', label: 'All Types' },
  { value: 'annual', label: 'Annual Leave' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'maternity', label: 'Maternity Leave' },
  { value: 'unpaid', label: 'Unpaid Leave' },
];

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'requires_approval', label: 'Requires Approval' },
];

function getTypeFromId(id: string) {
  if (id.startsWith('annual')) return 'annual';
  if (id.startsWith('sick')) return 'sick';
  if (id.startsWith('maternity')) return 'maternity';
  if (id.startsWith('unpaid')) return 'unpaid';
  return '';
}

export default function AdminPoliciesPage() {
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formInitialData, setFormInitialData] = useState<LeavePolicyFormData | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [policies, setPolicies] = useState<LeavePolicy[]>(mockPolicies);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [approveTargetId, setApproveTargetId] = useState<string | null>(null);
  const [approveComment, setApproveComment] = useState('');

  // Fetch policies from API on mount
  useEffect(() => {
    async function fetchPolicies() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/policies');
        if (!res.ok) throw new Error('Failed to fetch policies');
        const data = await res.json();
        setPolicies(data);
      } catch {
        setError('Could not load policies from API. Showing mock data.');
        setPolicies(mockPolicies);
      } finally {
        setLoading(false);
      }
    }
    fetchPolicies();
  }, []);

  const handleViewDetails = (policyId: string) => {
    setSelectedPolicyId(policyId);
    setModalOpen(true);
  };

  const handleEdit = (policyId: string) => {
    const policy = policies.find(p => p.id === policyId);
    const detail = policyDetailData[policyId];
    setFormInitialData({
      id: policy?.id || '',
      name: policy?.name || '',
      description: policy?.description || '',
      keyEntitlementRule: policy?.keyEntitlementRule || '',
      status: policy?.status || 'active',
      lastUpdated: policy?.lastUpdated || '',
      entitlement: detail?.entitlement || '',
      conditions: detail?.conditions || '',
      documentation: detail?.documentation || '',
    });
    setFormMode('edit');
    setFormOpen(true);
  };

  const handleAdd = () => {
    setFormInitialData(null);
    setFormMode('create');
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: LeavePolicyFormData) => {
    setError(null);
    if (formMode === 'create') {
      try {
        const res = await fetch('/api/admin/policies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to create policy');
        const newPolicy = await res.json();
        setPolicies(prev => [...prev, newPolicy]);
        policyDetailData[newPolicy.id] = {
          id: newPolicy.id,
          name: newPolicy.name,
          description: newPolicy.description,
          entitlement: data.entitlement,
          conditions: data.conditions,
          documentation: data.documentation,
        };
        toast.success('Policy created successfully');
      } catch {
        setError('Failed to create policy.');
        toast.error('Failed to create policy');
      }
    } else if (formMode === 'edit' && formInitialData) {
      try {
        const res = await fetch('/api/admin/policies', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, id: formInitialData.id }),
        });
        if (!res.ok) throw new Error('Failed to update policy');
        const updated = await res.json();
        setPolicies(prev => prev.map(p => (p.id === updated.id ? updated : p)));
        policyDetailData[updated.id] = {
          id: updated.id,
          name: updated.name,
          description: updated.description,
          entitlement: data.entitlement,
          conditions: data.conditions,
          documentation: data.documentation,
        };
        toast.success('Policy updated successfully');
      } catch {
        setError('Failed to update policy.');
        toast.error('Failed to update policy');
      }
    }
    setFormOpen(false);
    setFormInitialData(null);
  };

  const handleDelete = async (policyId: string) => {
    setDeleteTargetId(policyId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteTargetId) {
      try {
        const res = await fetch('/api/admin/policies', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: deleteTargetId }),
        });
        if (!res.ok) throw new Error('Failed to delete policy');
        setPolicies(prev => prev.filter(p => p.id !== deleteTargetId));
        delete policyDetailData[deleteTargetId];
        toast.success('Policy deleted successfully');
      } catch {
        setError('Failed to delete policy.');
        toast.error('Failed to delete policy');
      }
    }
    setDeleteConfirmOpen(false);
    setDeleteTargetId(null);
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDeleteTargetId(null);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPolicyId(null);
  };

  const handleApproveClick = (policyId: string) => {
    setApproveTargetId(policyId);
    setApproveModalOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (approveTargetId) {
      try {
        const res = await fetch('/api/admin/policies', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: approveTargetId, status: 'active' }),
        });
        if (!res.ok) throw new Error('Failed to approve policy');
        const updated = await res.json();
        setPolicies(prev => prev.map(p => (p.id === updated.id ? updated : p)));
        policyDetailData[updated.id] = {
          id: updated.id,
          name: updated.name,
          description: updated.description,
          entitlement: updated.keyEntitlementRule,
          conditions: updated.conditions,
          documentation: updated.documentation,
        };
        toast.success('Policy approved successfully');
      } catch {
        setError('Failed to approve policy.');
        toast.error('Failed to approve policy');
      }
    }
    setApproveModalOpen(false);
    setApproveTargetId(null);
    setApproveComment('');
  };

  const handleApproveCancel = () => {
    setApproveModalOpen(false);
    setApproveTargetId(null);
    setApproveComment('');
  };

  const filteredPolicies = policies.filter((policy) => {
    const matchesStatus = status === '' || policy.status === status;
    const matchesType = type === '' || getTypeFromId(policy.id) === type;
    return matchesStatus && matchesType;
  });

  const selectedPolicyDetail = selectedPolicyId ? policyDetailData[selectedPolicyId] : null;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto bg-white shadow rounded-lg p-4 sm:p-8">
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading policies...</div>
        ) : (
          <>
            <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Leave Policy Management</h1>
                <p className="text-gray-600 mt-1">Configure and manage all leave policies for the organization.</p>
              </div>
              <button
                className="rounded-full bg-gradient-to-r from-teal-500 to-teal-400 text-white shadow px-6 py-2 font-semibold"
                onClick={handleAdd}
              >
                <i className="fas fa-plus mr-2"></i>Add New Leave Policy
              </button>
            </div>
            {/* Filter Bar */}
            <div className="mb-6 flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch sm:items-end">
              <div className="flex-1">
                <label htmlFor="status" className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select
                  id="status"
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="bg-white border border-gray-200 rounded h-10 px-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
                >
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label htmlFor="type" className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                <select
                  id="type"
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="bg-white border border-gray-200 rounded h-10 px-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
                >
                  {policyTypes.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="pt-2 pb-4">
              <LeavePolicyList
                policies={filteredPolicies}
                onViewDetails={handleViewDetails}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onApprove={handleApproveClick}
                isHRAdmin={true}
              />
            </div>
            <LeavePolicyDetailModal
              open={modalOpen}
              onClose={handleCloseModal}
              policy={selectedPolicyDetail}
              onEdit={handleEdit}
            />
            <LeavePolicyFormModal
              open={formOpen}
              onClose={() => setFormOpen(false)}
              onSubmit={handleFormSubmit}
              initialData={formInitialData}
              mode={formMode}
            />
            {/* Delete Confirmation Dialog */}
            {deleteConfirmOpen && (
              <div className="fixed z-50 inset-0 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Policy?</h3>
                  <p className="text-gray-700 mb-4">Are you sure you want to delete this policy? This action cannot be undone.</p>
                  <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
                    <button
                      onClick={confirmDelete}
                      className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Delete
                    </button>
                    <button
                      onClick={cancelDelete}
                      className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Approve Confirmation Dialog */}
            {approveModalOpen && (
              <div className="fixed z-50 inset-0 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Approve Policy?</h3>
                  <p className="text-gray-700 mb-4">Are you sure you want to approve this policy? This action cannot be undone.</p>
                  <div className="mb-4">
                    <label htmlFor="approveComment" className="block text-xs font-medium text-gray-700 mb-1">Comment</label>
                    <textarea
                      id="approveComment"
                      value={approveComment}
                      onChange={e => setApproveComment(e.target.value)}
                      className="bg-white border border-gray-200 rounded h-10 px-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
                    <button
                      onClick={handleApproveConfirm}
                      className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                      Approve
                    </button>
                    <button
                      onClick={handleApproveCancel}
                      className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 
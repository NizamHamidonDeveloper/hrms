"use client";
import { useState, useEffect, useRef, useContext } from "react";
import AdminReportFilterForm from "@/components/admin/AdminReportFilterForm";
import Image from "next/image";
import toast from "react-hot-toast";
import { RoleContext } from "@/components/common/RoleProvider";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const leaveTypes = ["All Types", "Annual Leave", "Sick Leave", "Emergency Leave"];
const statuses = ["All", "Pending", "Approved", "Rejected", "Cancelled"];

type LeaveApproval = {
  id: string;
  employee: { name: string; id: string; avatar: string };
  type: string;
  dates: string;
  duration: string;
  reason: string;
  submitted: string;
  balance: string;
  status: string;
};

export default function AdminLeaveApprovalsPage() {
  const [showResults, setShowResults] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"approve" | "reject" | null>(null);
  const [modalTargetId, setModalTargetId] = useState<string | null>(null);
  const [modalComment, setModalComment] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const modalRef = useRef<HTMLFormElement | null>(null);
  const { activeRole } = useContext(RoleContext);
  const queryClient = useQueryClient();

  // Query params state
  const [queryParams, setQueryParams] = useState({ employee: '', leaveType: 'All Types', status: 'All', fromDate: '', toDate: '' });

  // React Query: Fetch leave approvals
  const {
    data: results = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['leave-approvals', queryParams],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (queryParams.employee) params.append('employee', queryParams.employee);
      if (queryParams.leaveType && queryParams.leaveType !== 'All Types') params.append('type', queryParams.leaveType);
      if (queryParams.status && queryParams.status !== 'All') params.append('status', queryParams.status);
      if (queryParams.fromDate) params.append('fromDate', queryParams.fromDate);
      if (queryParams.toDate) params.append('toDate', queryParams.toDate);
      const res = await fetch(`/api/admin/leave-approvals?${params.toString()}`);
      if (!res.ok) throw new Error('API error');
      return res.json();
    },
  });

  // React Query: Approve/Reject mutation
  const mutation = useMutation({
    mutationFn: async ({ id, action, comments }: { id: string; action: 'approve' | 'reject'; comments: string }) => {
      const res = await fetch('/api/admin/leave-approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, comments }),
      });
      if (!res.ok) throw new Error('Failed to update leave request.');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-approvals'] });
      closeModal();
      toast.success(`Leave request ${modalAction === 'approve' ? 'approved' : 'rejected'}.`);
    },
    onError: () => {
      setModalLoading(false);
      toast.error('Failed to update leave request.');
    },
  });

  const filterFields = [
    { type: "text" as const, label: "Employee (Name or ID)", name: "employee", placeholder: "Enter Employee Name or ID" },
    { type: "select" as const, label: "Leave Type", name: "leaveType", options: leaveTypes },
    { type: "select" as const, label: "Status", name: "status", options: statuses },
    { type: "date" as const, label: "From Date", name: "fromDate" },
    { type: "date" as const, label: "To Date", name: "toDate" },
  ];
  function handleFilterChange(name: string, value: string) {
    setQueryParams((prev) => ({ ...prev, [name]: value }));
  }
  function handleReset() {
    setQueryParams({ employee: '', leaveType: 'All Types', status: 'All', fromDate: '', toDate: '' });
    setShowResults(false);
  }
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setShowResults(true);
    refetch();
  }
  function openModal(action: "approve" | "reject", id: string) {
    setModalAction(action);
    setModalTargetId(id);
    setModalComment("");
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
    setModalAction(null);
    setModalTargetId(null);
    setModalComment("");
    setModalLoading(false);
  }
  function handleModalSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!modalTargetId || !modalAction) return;
    setModalLoading(true);
    mutation.mutate({ id: modalTargetId, action: modalAction, comments: modalComment });
  }

  // Trap focus in modal
  useEffect(() => {
    if (modalOpen && modalRef.current) {
      const firstInput = modalRef.current.querySelector<HTMLElement>("textarea,button");
      firstInput?.focus();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") closeModal();
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [modalOpen]);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Global Leave Approvals</h1>
      <p className="text-gray-600 mb-8">Admins can view and act on all leave requests across the organization. Use the filters below to find requests and take action.</p>
      {activeRole !== 'hr_admin' && (
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-center">
          <strong>Access Restricted:</strong> Only HR Admins can approve or reject leave requests.
        </div>
      )}
      <div className="mb-8">
        <AdminReportFilterForm
          fields={filterFields}
          values={queryParams}
          onChange={handleFilterChange}
          onSubmit={handleSubmit}
          onReset={handleReset}
          loading={loading}
        />
      </div>
      {loading && <div className="p-8 text-center text-gray-500" role="status">Loading leave requests...</div>}
      {error && <div className="p-8 text-center text-red-600" role="alert">{error instanceof Error ? error.message : String(error)}</div>}
      {showResults && !loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200" aria-label="Leave Approvals Table">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-sm text-gray-500">
                    <i className="fas fa-inbox fa-3x text-gray-300 mb-2" aria-hidden="true" />
                    <span className="sr-only">No leave requests found for the selected filters.</span>
                    <p>No leave requests found for the selected filters.</p>
                  </td>
                </tr>
              ) : (
                results.map((req: LeaveApproval) => (
                  <tr key={req.id} tabIndex={0} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 transition-shadow hover:bg-teal-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <Image className="h-10 w-10 rounded-full" src={req.employee.avatar} alt={req.employee.name} width={40} height={40} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{req.employee.name}</div>
                          <div className="text-sm text-gray-500">{req.employee.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.dates}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.duration}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs" title={req.reason}>{req.reason.length > 25 ? req.reason.slice(0, 22) + '...' : req.reason}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.submitted}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.balance}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {req.status}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 align-middle">
                      {req.status === "Pending" && activeRole === 'hr_admin' && (
                        <div className="flex gap-2 items-center">
                          <button
                            className="rounded-full bg-gradient-to-r from-teal-500 to-teal-400 text-white shadow px-4 py-2 text-sm font-semibold flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 transition-shadow"
                            onClick={() => openModal("approve", req.id)}
                            aria-label={`Approve leave request for ${req.employee.name}`}
                          >
                            <i className="fas fa-check" aria-hidden="true" /> Approve
                          </button>
                          <button
                            className="rounded-full bg-gradient-to-r from-red-500 to-red-400 text-white shadow px-4 py-2 text-sm font-semibold flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition-shadow"
                            onClick={() => openModal("reject", req.id)}
                            aria-label={`Reject leave request for ${req.employee.name}`}
                          >
                            <i className="fas fa-times" aria-hidden="true" /> Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {modalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-30 flex items-center justify-center z-50" aria-modal="true" role="dialog">
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl border border-gray-100 w-full max-w-md mx-2 relative">
            <h2 className="text-2xl font-bold mb-4">Leave Request Action</h2>
            <p className="text-gray-600 mb-8">Please provide a comment for the action.</p>
            <form onSubmit={handleModalSubmit} ref={modalRef} className="space-y-4">
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Comment</label>
                <textarea
                  id="comment"
                  name="comment"
                  value={modalComment}
                  onChange={(e) => setModalComment(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
                  required
                  rows={3}
                  aria-label="Comment for leave action"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="submit"
                  className="rounded-full bg-gradient-to-r from-teal-500 to-teal-400 text-white shadow px-4 py-2 text-sm font-semibold flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 transition-shadow"
                  disabled={modalLoading}
                  aria-busy={modalLoading}
                >
                  {modalLoading ? "Processing..." : "Submit"}
                </button>
                <button
                  type="button"
                  className="rounded-full bg-gradient-to-r from-red-500 to-red-400 text-white shadow px-4 py-2 text-sm font-semibold flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition-shadow"
                  onClick={closeModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
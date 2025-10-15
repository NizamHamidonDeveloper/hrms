'use client';
import React, { useState } from 'react';
import { ArrowDownTrayIcon, PrinterIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

// Log entry type
interface LogEntry {
  timestamp: string;
  user: string;
  email: string;
  role: string;
  action: string;
  target: string;
  status: string;
  details: string;
}

// Mock log data
const mockLogs: LogEntry[] = [
  {
    timestamp: '2025-06-01T09:15:00Z',
    user: 'Emily Carter',
    email: 'emily.carter@acme.com',
    role: 'HR Admin',
    action: 'Created Employee',
    target: 'David Lee (EMP00153)',
    status: 'Success',
    details: 'Initial onboarding, department: Engineering',
  },
  {
    timestamp: '2025-06-01T10:22:00Z',
    user: 'Emily Carter',
    email: 'emily.carter@acme.com',
    role: 'HR Admin',
    action: 'Updated Policy',
    target: 'Annual Leave',
    status: 'Success',
    details: 'Carry-forward limit changed from 5 to 7 days',
  },
  {
    timestamp: '2025-06-01T11:05:00Z',
    user: 'System',
    email: '',
    role: 'System',
    action: 'Generated Report',
    target: 'Monthly Leave Balance',
    status: 'Success',
    details: 'Report for May 2025',
  },
  {
    timestamp: '2025-06-01T12:30:00Z',
    user: 'John Doe',
    email: 'john.doe@acme.com',
    role: 'Manager',
    action: 'Approved Leave',
    target: 'Lisa Wong (EMP00789)',
    status: 'Success',
    details: 'Annual Leave, 2025-06-10 to 2025-06-12',
  },
  {
    timestamp: '2025-06-01T13:00:00Z',
    user: 'Emily Carter',
    email: 'emily.carter@acme.com',
    role: 'HR Admin',
    action: 'Rejected Leave',
    target: 'Sarah Chen (EMP00123)',
    status: 'Success',
    details: 'Sick Leave, insufficient documentation',
  },
  {
    timestamp: '2025-06-01T13:30:00Z',
    user: 'System',
    email: '',
    role: 'System',
    action: 'Login Attempt',
    target: 'john.doe@acme.com',
    status: 'Failure',
    details: 'Invalid password',
  },
  // Add more mock entries as needed
];

const PAGE_SIZE = 5;

function exportToCSV(logs: LogEntry[]) {
  const header = ['Date/Time', 'User', 'Role', 'Action', 'Target', 'Status', 'Details'];
  const rows = logs.map((l: LogEntry) => [
    format(new Date(l.timestamp), 'yyyy-MM-dd HH:mm:ss'),
    l.user,
    l.role,
    l.action,
    l.target,
    l.status,
    l.details.replace(/\n/g, ' ')
  ]);
  const csv = [header, ...rows].map((r: string[]) => r.map((f: string) => '"' + String(f).replace(/"/g, '""') + '"').join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'activity-logs.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function ActivityLogsPage() {
  // Filters
  const [user, setUser] = useState('All');
  const [action, setAction] = useState('All');
  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalLog, setModalLog] = useState<LogEntry | null>(null);
  const [fallbackWarning, setFallbackWarning] = useState<string | null>(null);

  // Fetch logs from API with React Query
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery<{ logs: LogEntry[]; total: number }>({
    queryKey: ['activity-logs', { user, action, status, search, page }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (user !== 'All') params.append('user', user);
      if (action !== 'All') params.append('action', action);
      if (status !== 'All') params.append('status', status);
      if (search) params.append('search', search);
      params.append('page', String(page));
      params.append('pageSize', String(PAGE_SIZE));
      const res = await fetch(`/api/admin/activity-logs?${params.toString()}`);
      if (!res.ok) throw new Error('API error');
      return res.json();
    },
    retry: false,
    staleTime: 0,
  });

  // Fallback to mock data if API fails
  let logs: LogEntry[] = [];
  let total = 0;
  if (data && !isError) {
    logs = data.logs;
    total = data.total;
    if (fallbackWarning) setFallbackWarning(null);
  } else {
    logs = mockLogs.filter(l =>
      (user === 'All' || l.user === user) &&
      (action === 'All' || l.action === action) &&
      (status === 'All' || l.status === status) &&
      (search === '' ||
        l.user.toLowerCase().includes(search.toLowerCase()) ||
        l.action.toLowerCase().includes(search.toLowerCase()) ||
        l.target.toLowerCase().includes(search.toLowerCase()) ||
        l.details.toLowerCase().includes(search.toLowerCase())
      )
    );
    total = mockLogs.length;
  }
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Show fallback warning if API fails
  React.useEffect(() => {
    if (isError) {
      setFallbackWarning('Failed to fetch logs from API. Showing mock data.');
      toast.error('Failed to fetch logs from API. Showing mock data.');
    }
  }, [isError]);

  // For filter dropdowns, always use all possible values from mockLogs (for now)
  const actions = Array.from(new Set(mockLogs.map((l: LogEntry) => l.action)));
  const users = Array.from(new Set(mockLogs.map((l: LogEntry) => l.user)));
  const statuses = Array.from(new Set(mockLogs.map((l: LogEntry) => l.status)));

  function handlePrint() {
    window.print();
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #activity-log-table, #activity-log-table * { visibility: visible !important; }
          #activity-log-table { position: absolute !important; left: 0; top: 0; width: 100vw !important; background: white !important; box-shadow: none !important; }
        }
      `}</style>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">System Activity Logs</h1>
            <p className="text-gray-600">Audit trail of all key admin and system actions.</p>
          </div>
          <div className="flex gap-2 print:hidden">
            <button
              onClick={() => exportToCSV(logs)}
              className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold shadow hover:from-teal-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
              title="Export to CSV"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" /> Export CSV
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-teal-500 text-teal-700 font-semibold shadow hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-400"
              title="Print logs"
            >
              <PrinterIcon className="h-5 w-5 mr-2" /> Print
            </button>
          </div>
        </div>
        {fallbackWarning && (
          <div className="mb-4 p-3 rounded bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
            {fallbackWarning}
          </div>
        )}
        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4 relative z-10 print:hidden">
          <div className="z-20">
            <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
            <select
              className="w-full md:w-40 rounded-lg border-gray-200 focus:ring-teal-500 focus:border-teal-500"
              value={user}
              onChange={e => { setUser(e.target.value); setPage(1); refetch(); }}
            >
              <option value="All">All</option>
              {users.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div className="z-20">
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <select
              className="w-full md:w-40 rounded-lg border-gray-200 focus:ring-teal-500 focus:border-teal-500"
              value={action}
              onChange={e => { setAction(e.target.value); setPage(1); refetch(); }}
            >
              <option value="All">All</option>
              {actions.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="z-30">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full md:w-32 rounded-lg border-gray-200 focus:ring-teal-500 focus:border-teal-500"
              value={status}
              onChange={e => { setStatus(e.target.value); setPage(1); refetch(); }}
              style={{ zIndex: 30 }}
            >
              <option value="All">All</option>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex-1 z-10">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <input
                type="text"
                className="w-full rounded-lg border-gray-200 focus:ring-teal-500 focus:border-teal-500 pl-10"
                placeholder="Search logs..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); refetch(); }}
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
        {/* Table */}
        <div id="activity-log-table" className="overflow-x-auto print:shadow-none print:border-0 print:rounded-none">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Date/Time</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">User</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Role</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Action</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Target</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Status</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Details</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center text-gray-400 py-8">Loading...</td></tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-gray-400 py-8">No logs found.</td>
                </tr>
              ) : (
                logs.map((log, i) => (
                  <tr
                    key={i}
                    className="hover:bg-teal-50 transition-colors cursor-pointer"
                    onClick={() => setModalLog(log)}
                  >
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{log.user}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{log.role}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{log.action}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{log.target}</td>
                    <td className={`px-4 py-2 whitespace-nowrap text-sm font-semibold ${log.status === 'Success' ? 'text-green-600' : 'text-red-600'}`}>{log.status}</td>
                    <td className="px-4 py-2 text-sm text-gray-700 max-w-xs truncate" title={log.details}>{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex justify-between items-center mt-6 print:hidden">
          <div className="text-sm text-gray-500">
            Showing {logs.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, total)} of {total} logs
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 rounded-lg border border-gray-200 bg-white text-gray-700 disabled:opacity-50"
              onClick={() => { setPage(p => Math.max(1, p - 1)); refetch(); }}
              disabled={page === 1}
            >
              Previous
            </button>
            <span className="px-2 text-gray-700">Page {page} of {totalPages}</span>
            <button
              className="px-3 py-1 rounded-lg border border-gray-200 bg-white text-gray-700 disabled:opacity-50"
              onClick={() => { setPage(p => Math.min(totalPages, p + 1)); refetch(); }}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      {/* Modal for log details */}
      {modalLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 max-w-lg w-full p-6 relative animate-fade-in">
            <button
              className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={() => setModalLog(null)}
              aria-label="Close details"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Log Details</h2>
            <div className="space-y-2">
              <div><span className="font-medium text-gray-700">Date/Time:</span> {format(new Date(modalLog.timestamp), 'yyyy-MM-dd HH:mm:ss')}</div>
              <div><span className="font-medium text-gray-700">User:</span> {modalLog.user}</div>
              <div><span className="font-medium text-gray-700">Email:</span> {modalLog.email || <span className="italic text-gray-400">N/A</span>}</div>
              <div><span className="font-medium text-gray-700">Role:</span> {modalLog.role}</div>
              <div><span className="font-medium text-gray-700">Action:</span> {modalLog.action}</div>
              <div><span className="font-medium text-gray-700">Target:</span> {modalLog.target}</div>
              <div><span className="font-medium text-gray-700">Status:</span> <span className={modalLog.status === 'Success' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{modalLog.status}</span></div>
              <div><span className="font-medium text-gray-700">Details:</span> {modalLog.details}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
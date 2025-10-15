'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const isManager = true; // TODO: Replace with real role check

const TABS = [
  { key: 'leave', label: 'Leave Reports', icon: CalendarIcon },
  // { key: 'attendance', label: 'Attendance Reports', icon: UserGroupIcon }, // Attendance hidden for now
  { key: 'performance', label: 'Performance Reports', icon: ChartBarIcon },
];

const leaveMockRows = [
  { employee: 'Alice Johnson', type: 'annual', days: 5, status: 'approved', from: '2024-03-01', to: '2024-03-05' },
  { employee: 'Bob Smith', type: 'sick', days: 3, status: 'pending', from: '2024-03-10', to: '2024-03-12' },
  { employee: 'Carol Lee', type: 'emergency', days: 2, status: 'approved', from: '2024-02-20', to: '2024-02-21' },
];

// Add LeaveRow type
interface LeaveRow {
  employee: string;
  type: string;
  days: number;
  status: string;
  from: string;
  to: string;
}

interface PerformanceRow {
  employee: string;
  cycle: string;
  rating: number;
  feedback: string;
  date: string;
}

const performanceMockRows = [
  { employee: 'Alice Johnson', cycle: '2023 Year-End Review', rating: 5, feedback: 'Consistently exceeded expectations.', date: '2024-01-15' },
  { employee: 'Bob Smith', cycle: '2023 Year-End Review', rating: 4, feedback: 'Met most goals, room for improvement.', date: '2024-01-16' },
  { employee: 'Carol Lee', cycle: '2024 Mid-Year Review', rating: 5, feedback: 'Strong team player, great attitude.', date: '2024-06-10' },
];

export default function ManagerReportsPage() {
  const router = useRouter();
  const [tab, setTab] = useState('leave');

  // Leave state
  const [leaveRows, setLeaveRows] = useState<LeaveRow[]>([]);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);
  const [leaveFilters, setLeaveFilters] = useState({
    employee: '',
    type: '',
    status: '',
    from: '',
    to: '',
  });

  // Performance state
  const [perfRows, setPerfRows] = useState<unknown[]>([]);
  const [perfLoading, setPerfLoading] = useState(false);
  const [perfError, setPerfError] = useState<string | null>(null);
  const [perfFilters, setPerfFilters] = useState({
    employee: '',
    cycle: '',
    rating: '',
  });

  // Card summary data (mock for now)
  const summary = {
    leave: { total: leaveRows.length, approved: leaveRows.filter((r) => (r as LeaveRow).status === 'approved').length, pending: leaveRows.filter((r) => (r as LeaveRow).status === 'pending').length },
    attendance: { present: 38, absent: 6, late: 1 },
    performance: {
      avgRating: perfRows.length
        ? ((perfRows as PerformanceRow[]).reduce((a: number, b: PerformanceRow) => a + (b.rating || 0), 0) / perfRows.length).toFixed(1)
        : '-',
      reviews: perfRows.length,
    },
  };

  const [fallbackWarning, setFallbackWarning] = useState<string | null>(null);

  // Fetch Leave Data
  useEffect(() => {
    if (tab !== 'leave') return;
    setLeaveLoading(true);
    setLeaveError(null);
    setFallbackWarning(null);
    const params = new URLSearchParams();
    if (leaveFilters.status && leaveFilters.status !== 'All') params.append('status', leaveFilters.status.toLowerCase());
    if (leaveFilters.type && leaveFilters.type !== 'All') params.append('type', leaveFilters.type.toLowerCase());
    if (leaveFilters.from) params.append('fromDate', leaveFilters.from);
    if (leaveFilters.to) params.append('toDate', leaveFilters.to);
    if (leaveFilters.employee) params.append('search', leaveFilters.employee);
    fetch(`/api/leave/summary?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then((data) => {
        setLeaveRows(
          ((data.leaves || []) as unknown[]).map((row): LeaveRow => {
            const r = row as LeaveRow & { duration?: number; startDate?: string; endDate?: string };
            return {
              employee: r.employee || '-',
              type: r.type,
              days: r.days ?? r.duration ?? 0,
              status: r.status,
              from: r.from ?? (r.startDate ? new Date(r.startDate).toISOString().slice(0, 10) : '-'),
              to: r.to ?? (r.endDate ? new Date(r.endDate).toISOString().slice(0, 10) : '-'),
            };
          })
        );
        setLeaveLoading(false);
      })
      .catch(() => {
        setLeaveRows(leaveMockRows);
        setFallbackWarning('Failed to fetch leave data from API, using mock data.');
        setLeaveLoading(false);
      });
  }, [tab, leaveFilters]);

  // Fetch Performance Data
  useEffect(() => {
    if (tab !== 'performance') return;
    setPerfLoading(true);
    setPerfError(null);
    setFallbackWarning(null);
    fetch('/api/manager/performance/reviews')
      .then((res) => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then((data) => {
        let rows = data;
        if (perfFilters.employee) {
          rows = rows.filter((r: unknown) => (r as PerformanceRow).employee.toLowerCase().includes(perfFilters.employee.toLowerCase()));
        }
        if (perfFilters.cycle && perfFilters.cycle !== 'All') {
          rows = rows.filter((r: unknown) => (r as PerformanceRow).cycle === perfFilters.cycle);
        }
        if (perfFilters.rating && perfFilters.rating !== 'All') {
          rows = rows.filter((r: unknown) => String((r as PerformanceRow).rating) === perfFilters.rating);
        }
        setPerfRows(rows);
        setPerfLoading(false);
      })
      .catch(() => {
        let rows = performanceMockRows;
        if (perfFilters.employee) {
          rows = rows.filter((r: unknown) => (r as PerformanceRow).employee.toLowerCase().includes(perfFilters.employee.toLowerCase()));
        }
        if (perfFilters.cycle && perfFilters.cycle !== 'All') {
          rows = rows.filter((r: unknown) => (r as PerformanceRow).cycle === perfFilters.cycle);
        }
        if (perfFilters.rating && perfFilters.rating !== 'All') {
          rows = rows.filter((r: unknown) => String((r as PerformanceRow).rating) === perfFilters.rating);
        }
        setPerfRows(rows);
        setFallbackWarning('Failed to fetch performance data from API, using mock data.');
        setPerfLoading(false);
      });
  }, [tab, perfFilters]);

  useEffect(() => {
    if (!isManager) {
      router.replace('/');
    }
  }, [router]);

  return (
    <main className="p-8 max-w-7xl mx-auto min-h-screen bg-white dark:bg-gray-900" role="main" aria-labelledby="page-title">
      <h1 id="page-title" className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Reports (Manager)</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">View and export actionable reports for your team. Use filters to customize the data below.</p>
      {fallbackWarning && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded" role="alert">{fallbackWarning}</div>
      )}
      <div className="mb-6 flex gap-4 border-b" role="tablist" aria-label="Report types">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            aria-controls={`${t.key}-panel`}
            className={`flex items-center gap-2 px-4 py-2 font-semibold border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${tab === t.key ? 'border-teal-600 text-teal-700 bg-teal-50' : 'border-transparent text-gray-600 hover:text-teal-600'}`}
            onClick={() => setTab(t.key)}
          >
            <t.icon className="h-5 w-5" aria-hidden="true" /> {t.label}
          </button>
        ))}
      </div>
      {/* Card summary */}
      <div className="flex gap-6 mb-6" role="region" aria-label="Summary statistics">
        {tab === 'leave' && (
          <>
            <div className="bg-white dark:bg-gray-900 rounded shadow p-4 flex-1" role="status">
              <div className="text-xs text-gray-500">Total Leaves</div>
              <div className="text-xl font-bold" aria-label={`Total leaves: ${summary.leave.total}`}>{summary.leave.total}</div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded shadow p-4 flex-1" role="status">
              <div className="text-xs text-gray-500">Approved</div>
              <div className="text-xl font-bold" aria-label={`Approved leaves: ${summary.leave.approved}`}>{summary.leave.approved}</div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded shadow p-4 flex-1" role="status">
              <div className="text-xs text-gray-500">Pending</div>
              <div className="text-xl font-bold" aria-label={`Pending leaves: ${summary.leave.pending}`}>{summary.leave.pending}</div>
            </div>
          </>
        )}
        {tab === 'attendance' && (
          <>
            <div className="bg-white dark:bg-gray-900 rounded shadow p-4 flex-1">
              <div className="text-xs text-gray-500">Present</div>
              <div className="text-xl font-bold">{summary.attendance.present}</div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded shadow p-4 flex-1">
              <div className="text-xs text-gray-500">Absent</div>
              <div className="text-xl font-bold">{summary.attendance.absent}</div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded shadow p-4 flex-1">
              <div className="text-xs text-gray-500">Late</div>
              <div className="text-xl font-bold">{summary.attendance.late}</div>
            </div>
          </>
        )}
        {tab === 'performance' && (
          <>
            <div className="bg-white dark:bg-gray-900 rounded shadow p-4 flex-1" role="status">
              <div className="text-xs text-gray-500">Avg. Rating</div>
              <div className="text-xl font-bold" aria-label={`Average rating: ${summary.performance.avgRating}`}>{summary.performance.avgRating}</div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded shadow p-4 flex-1" role="status">
              <div className="text-xs text-gray-500">Reviews</div>
              <div className="text-xl font-bold" aria-label={`Total reviews: ${summary.performance.reviews}`}>{summary.performance.reviews}</div>
            </div>
          </>
        )}
      </div>
      {/* Filters section */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6 flex flex-wrap gap-4 items-end" role="search" aria-label="Report filters">
        {tab === 'leave' && (
          <>
            <div>
              <label id="leave-employee-label" className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">Employee</label>
              <input 
                aria-labelledby="leave-employee-label"
                className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2" 
                placeholder="Name..." 
                value={leaveFilters.employee} 
                onChange={e => setLeaveFilters(f => ({ ...f, employee: e.target.value }))} 
              />
            </div>
            <div>
              <label id="leave-type-label" className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">Type</label>
              <select 
                aria-labelledby="leave-type-label"
                className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2" 
                value={leaveFilters.type} 
                onChange={e => setLeaveFilters(f => ({ ...f, type: e.target.value }))}
              >
                <option>All</option>
                <option>Annual</option>
                <option>Sick</option>
                <option>Emergency</option>
              </select>
            </div>
            <div>
              <label id="leave-status-label" className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">Status</label>
              <select 
                aria-labelledby="leave-status-label"
                className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2" 
                value={leaveFilters.status} 
                onChange={e => setLeaveFilters(f => ({ ...f, status: e.target.value }))}
              >
                <option>All</option>
                <option>Approved</option>
                <option>Pending</option>
              </select>
            </div>
            <div>
              <label id="leave-date-range-label" className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">Date Range</label>
              <div role="group" aria-labelledby="leave-date-range-label">
                <input 
                  type="date" 
                  className="border rounded px-2 py-1 mr-1 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2" 
                  value={leaveFilters.from} 
                  onChange={e => setLeaveFilters(f => ({ ...f, from: e.target.value }))}
                  aria-label="From date"
                />
                <input 
                  type="date" 
                  className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2" 
                  value={leaveFilters.to} 
                  onChange={e => setLeaveFilters(f => ({ ...f, to: e.target.value }))}
                  aria-label="To date"
                />
              </div>
            </div>
          </>
        )}
        {tab === 'attendance' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-200 mb-1">Employee</label>
              <input className="border rounded px-2 py-1" placeholder="Name..." disabled />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-200 mb-1">Month</label>
              <input type="month" className="border rounded px-2 py-1" disabled />
            </div>
            <div className="text-gray-400 italic pl-2 dark:text-gray-500">Attendance API not implemented yet.</div>
          </>
        )}
        {tab === 'performance' && (
          <>
            <div>
              <label id="perf-employee-label" className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">Employee</label>
              <input 
                aria-labelledby="perf-employee-label"
                className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2" 
                placeholder="Name..." 
                value={perfFilters.employee} 
                onChange={e => setPerfFilters(f => ({ ...f, employee: e.target.value }))} 
              />
            </div>
            <div>
              <label id="perf-cycle-label" className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">Cycle</label>
              <select 
                aria-labelledby="perf-cycle-label"
                className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2" 
                value={perfFilters.cycle} 
                onChange={e => setPerfFilters(f => ({ ...f, cycle: e.target.value }))}
              >
                <option>All</option>
                <option>2024 Mid-Year Review</option>
                <option>2023 Year-End Review</option>
              </select>
            </div>
            <div>
              <label id="perf-rating-label" className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">Rating</label>
              <select 
                aria-labelledby="perf-rating-label"
                className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2" 
                value={perfFilters.rating} 
                onChange={e => setPerfFilters(f => ({ ...f, rating: e.target.value }))}
              >
                <option>All</option>
                <option>5</option>
                <option>4</option>
                <option>3</option>
                <option>2</option>
                <option>1</option>
              </select>
            </div>
          </>
        )}
        <button 
          className="rounded-full bg-gradient-to-r from-teal-500 to-teal-400 text-white shadow px-4 py-2 font-semibold text-sm ml-auto focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2" 
          onClick={() => {}}
          aria-label={`Export ${tab} report to CSV`}
        >
          <i className="fas fa-download" aria-hidden="true"></i> Export CSV
        </button>
      </div>
      {/* Table section */}
      <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded shadow">
        {tab === 'leave' && (
          leaveLoading ? (
            <div className="p-8 text-center text-gray-500" role="status" aria-live="polite">Loading...</div>
          ) : leaveError ? (
            <div className="p-8 text-center text-red-500" role="alert">{leaveError}</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" role="table" aria-label="Leave report">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Days</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">From</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">To</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {leaveRows.map((row, idx) => (
                  <tr 
                    key={`${row.employee}-${row.from}-${row.to}-${idx}`} 
                    className={`${idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800'} hover:bg-teal-50 dark:hover:bg-teal-900 transition-colors`}
                    tabIndex={0}
                    role="row"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-100">{!row.employee || row.employee === '-' ? 'N/A' : row.employee}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{row.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{row.days}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                      <span 
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          row.status === 'approved' ? 'bg-green-100 text-green-800' :
                          row.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                        role="status"
                        aria-label={`Status: ${row.status}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{row.from}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{row.to}</td>
                  </tr>
                ))}
                {leaveRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-600 dark:text-gray-300" role="status">No leave records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )
        )}
        {tab === 'attendance' && (
          <div className="p-8 text-center text-gray-400" role="status">Attendance report API not implemented yet.</div>
        )}
        {tab === 'performance' && (
          perfLoading ? (
            <div className="p-8 text-center text-gray-500" role="status" aria-live="polite">Loading...</div>
          ) : perfError ? (
            <div className="p-8 text-center text-red-500" role="alert">{perfError}</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" role="table" aria-label="Performance report">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cycle</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rating</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Feedback</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {perfRows.map((row, idx) => {
                  const r = row as PerformanceRow;
                  return (
                    <tr 
                      key={`${r.employee}-${r.cycle}-${r.date}-${idx}`} 
                      className={`${idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800'} hover:bg-teal-50 dark:hover:bg-teal-900 transition-colors`}
                      tabIndex={0}
                      role="row"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-100">{r.employee}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{r.cycle}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200" aria-label={`Rating: ${r.rating} out of 5`}>{r.rating}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{r.feedback}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{r.date}</td>
                    </tr>
                  );
                })}
                {perfRows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-400 dark:text-gray-500" role="status">No performance records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )
        )}
      </div>
    </main>
  );
} 
"use client";
import { useState } from 'react';
import type { FormEvent, MouseEvent } from 'react';
import toast from 'react-hot-toast';
import AdminReportFilterForm from "@/components/admin/AdminReportFilterForm";

const mockData = [
  {
    id: 'EMP00123',
    name: 'Sarah Chen',
    department: 'Engineering',
    leaveType: 'Annual Leave',
    entitled: 20,
    taken: 5,
    pending: 3,
    available: 12,
  },
  {
    id: 'MGR00045',
    name: 'John Doe',
    department: 'Engineering',
    leaveType: 'Annual Leave',
    entitled: 22,
    taken: 3,
    pending: 0,
    available: 19,
  },
  {
    id: 'EMP00789',
    name: 'Lisa Wong',
    department: 'Engineering',
    leaveType: 'Sick Leave',
    entitled: 14,
    taken: 1,
    pending: 0,
    available: 13,
  },
];

const departments = ['All Departments', 'Engineering', 'Human Resources', 'Sales', 'Marketing'];
const leaveTypes = ['All Leave Types', 'Annual Leave', 'Sick Leave', 'Emergency Leave'];
const rangeTypes = ['Weekly', 'Monthly', 'Yearly', 'Custom'] as const;
type RangeType = typeof rangeTypes[number];

function getCurrentYear() {
  return new Date().getFullYear();
}
function getCurrentMonth() {
  return new Date().getMonth() + 1;
}
function getCurrentWeek() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), 0, 1);
  const pastDaysOfYear = (today.valueOf() - firstDay.valueOf()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDay.getDay() + 1) / 7);
}

export default function LeaveBalanceReportPage() {
  const [department, setDepartment] = useState('All Departments');
  const [employee, setEmployee] = useState('');
  const [leaveType, setLeaveType] = useState('All Leave Types');
  const [rangeType, setRangeType] = useState<RangeType>('Monthly');
  const [year, setYear] = useState(getCurrentYear());
  const [month, setMonth] = useState(getCurrentMonth());
  const [week, setWeek] = useState(getCurrentWeek());
  const [customStart, setCustomStart] = useState(() => {
    const today = new Date();
    today.setDate(1);
    return today.toISOString().split('T')[0];
  });
  const [customEnd, setCustomEnd] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fallbackWarning, setFallbackWarning] = useState<string | null>(null);
  const [results, setResults] = useState<typeof mockData>([]);

  const filterFields = [
    { type: "select" as const, label: "Department", name: "department", options: departments },
    { type: "text" as const, label: "Employee (Optional)", name: "employee", placeholder: "Enter Employee Name or ID" },
    { type: "select" as const, label: "Leave Type", name: "leaveType", options: leaveTypes },
  ];
  const filterValues = { department, employee, leaveType };
  function handleFilterChange(name: string, value: string) {
    if (name === "department") setDepartment(value);
    else if (name === "employee") setEmployee(value);
    else if (name === "leaveType") setLeaveType(value);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setShowResults(true);
    setLoading(true);
    setError(null);
    setFallbackWarning(null);
    // Build query params
    const params = new URLSearchParams();
    if (department && department !== 'All Departments') params.append('department', department);
    if (employee) params.append('employee', employee);
    if (leaveType && leaveType !== 'All Leave Types') params.append('leaveType', leaveType);
    // fromDate/toDate not used in mock
    fetch(`/api/admin/reports/leave-balance?${params.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then(data => {
        setResults(Array.isArray(data) ? data : mockData);
        setLoading(false);
        if (Array.isArray(data)) {
          toast.success('Report data loaded successfully.');
        } else {
          setFallbackWarning('API returned invalid data, using mock data.');
          toast('API returned invalid data, using mock data.', { icon: 'ℹ️' });
        }
      })
      .catch(() => {
        setResults(mockData);
        setLoading(false);
        setFallbackWarning('Failed to fetch data from API, using mock data.');
        toast.error('Failed to fetch data from API, using mock data.');
      });
  }
  function handleReset(e?: MouseEvent<HTMLButtonElement>) {
    if (e) e.preventDefault();
    setDepartment('All Departments');
    setEmployee('');
    setLeaveType('All Leave Types');
    setRangeType('Monthly');
    setYear(getCurrentYear());
    setMonth(getCurrentMonth());
    setWeek(getCurrentWeek());
    setCustomStart(() => {
      const today = new Date();
      today.setDate(1);
      return today.toISOString().split('T')[0];
    });
    setCustomEnd(() => {
      const today = new Date();
      return today.toISOString().split('T')[0];
    });
    setShowResults(false);
  }

  // Range selectors
  const renderRangeSelector = () => {
    const inputBase =
      "mt-0 block w-full h-12 px-4 text-base bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all shadow-inner placeholder-gray-400 disabled:bg-gray-100 disabled:text-gray-400";
    const labelBase = "block text-base font-medium text-gray-900 mb-2";
    const cardBase = "bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex flex-col";
    switch (rangeType) {
      case 'Weekly':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:col-span-3">
            <div className={cardBase}>
              <label htmlFor="week" className={labelBase}>Week Number</label>
              <input
                type="number"
                id="week"
                name="week"
                min={1}
                max={53}
                className={inputBase}
                value={week}
                onChange={e => setWeek(Number(e.target.value))}
              />
            </div>
            <div className={cardBase}>
              <label htmlFor="year" className={labelBase}>Year</label>
              <input
                type="number"
                id="year"
                name="year"
                min={2000}
                max={2100}
                className={inputBase}
                value={year}
                onChange={e => setYear(Number(e.target.value))}
              />
            </div>
          </div>
        );
      case 'Monthly':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:col-span-3">
            <div className={cardBase}>
              <label htmlFor="month" className={labelBase}>Month</label>
              <div className="relative">
                <select
                  id="month"
                  name="month"
                  className={inputBase + " appearance-none pr-10"}
                  value={month}
                  onChange={e => setMonth(Number(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </div>
            </div>
            <div className={cardBase}>
              <label htmlFor="year" className={labelBase}>Year</label>
              <input
                type="number"
                id="year"
                name="year"
                min={2000}
                max={2100}
                className={inputBase}
                value={year}
                onChange={e => setYear(Number(e.target.value))}
              />
            </div>
          </div>
        );
      case 'Yearly':
        return (
          <div className={cardBase + " md:col-span-3"}>
            <label htmlFor="year" className={labelBase}>Year</label>
            <input
              type="number"
              id="year"
              name="year"
              min={2000}
              max={2100}
              className={inputBase}
              value={year}
              onChange={e => setYear(Number(e.target.value))}
            />
          </div>
        );
      case 'Custom':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:col-span-3">
            <div className={cardBase}>
              <label htmlFor="customStart" className={labelBase}>Start Date</label>
              <input
                type="date"
                id="customStart"
                name="customStart"
                className={inputBase}
                value={customStart}
                onChange={e => setCustomStart(e.target.value)}
              />
            </div>
            <div className={cardBase}>
              <label htmlFor="customEnd" className={labelBase}>End Date</label>
              <input
                type="date"
                id="customEnd"
                name="customEnd"
                className={inputBase}
                value={customEnd}
                onChange={e => setCustomEnd(e.target.value)}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full px-0 sm:px-6 md:px-12 bg-gray-50 min-h-screen font-sans text-sm">
      <div className="mb-6">
        <a href="/admin/reports" className="text-sm text-teal-600 hover:text-teal-800 flex items-center mb-2">
          <span className="mr-2">&#8592;</span> Back to Reports Hub
        </a>
        <h1 className="text-lg md:text-xl font-extrabold text-gray-900 tracking-tight mb-1">Leave Balance Report</h1>
        <p className="text-base text-gray-700">Generate and export leave balances for employees. Use the filters below to customize your report.</p>
      </div>
      {/* Filter Controls */}
      <div className="bg-gray-50 rounded-lg shadow border border-gray-100 p-6 mb-4 w-full">
        <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4">Report Filters</h2>
        <AdminReportFilterForm
          fields={filterFields}
          values={filterValues}
          onChange={handleFilterChange}
          onSubmit={handleSubmit}
          onReset={handleReset}
          loading={loading}
        >
          <div className="md:col-span-3">
            <label className="block text-sm font-semibold text-gray-900 mb-2">Range Type</label>
            <div className="flex space-x-4 mb-2">
              {rangeTypes.map(type => (
                <label key={type} className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="rangeType"
                    value={type}
                    checked={rangeType === type}
                    onChange={() => setRangeType(type)}
                    className="form-radio text-blue-600 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <span className="ml-2 text-sm text-gray-900 font-medium">{type}</span>
                </label>
              ))}
            </div>
            {renderRangeSelector()}
          </div>
        </AdminReportFilterForm>
      </div>
      {/* Divider between filter and results */}
      {showResults && <div className="w-full border-t border-gray-200 mb-6" />}
      {/* Report Display Area */}
      {showResults && (
        <>
          <style jsx global>{`
            @media print {
              body * {
                visibility: hidden !important;
              }
              #print-area, #print-area * {
                visibility: visible !important;
              }
              #print-area {
                position: absolute !important;
                left: 0; top: 0; width: 100vw; background: white;
              }
              .no-print {
                display: none !important;
              }
            }
            #print-area {
              animation: fadein 0.5s;
            }
            @keyframes fadein {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>
          <div id="print-area" className="bg-white rounded-lg shadow-xl border border-gray-100 p-6 md:p-8 w-full animate-fadein">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-3">
              <h2 className="text-base md:text-lg font-extrabold text-gray-900">Report Results: Leave Balances</h2>
              <div className="flex gap-2 no-print">
                <button
                  type="button"
                  aria-label="Export to CSV"
                  className="px-3 py-2 rounded-md bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:outline-none shadow-md transition-colors"
                  onClick={() => {
                    // Simple CSV export
                    const headers = [
                      'Emp. ID', 'Name', 'Department', 'Leave Type', 'Entitled', 'Taken', 'Pending', 'Available'
                    ];
                    const rows = results.map(row => [
                      row.id, row.name, row.department, row.leaveType, row.entitled, row.taken, row.pending, row.available
                    ]);
                    const csvContent = [headers, ...rows]
                      .map(r => r.map(String).map(s => '"' + s.replace(/"/g, '""') + '"').join(','))
                      .join('\n');
                    const blob = new Blob([csvContent], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'leave-balance-report.csv';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                >
                  Export to CSV
                </button>
                <button
                  type="button"
                  aria-label="Print Report"
                  className="px-3 py-2 rounded-md bg-gray-700 text-white text-xs font-semibold hover:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-md transition-colors"
                  onClick={() => window.print()}
                >
                  Print
                </button>
              </div>
            </div>
            {/* Table view for desktop/tablet */}
            <div className="overflow-x-auto bg-white rounded-2xl shadow border border-gray-100">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Emp. ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Leave Type</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Entitled</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Taken</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Available</th>
                  </tr>
                </thead>
                <tbody>
                  {results.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-400 text-lg">
                        {loading ? 'Loading...' : error ? error : fallbackWarning ? 'Using mock data due to API error' : 'No results found for the selected filters.'}
                      </td>
                    </tr>
                  ) : (
                    results.map((row, idx) => (
                      <tr
                        key={row.id + row.leaveType}
                        className={
                          idx % 2 === 0
                            ? 'bg-white hover:bg-teal-50 transition'
                            : 'bg-gray-50 hover:bg-teal-50 transition'
                        }
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{row.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{row.department}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{row.leaveType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{row.entitled}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{row.taken}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{row.pending}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-teal-700 text-right">{row.available}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Card view for mobile */}
            <div className="block md:hidden divide-y divide-gray-200 mt-4">
              {results.length === 0 ? (
                <div className="text-center text-sm text-gray-500 py-8">
                  {loading ? 'Loading...' : error ? error : fallbackWarning ? 'Using mock data due to API error' : 'No results found for the selected filters.'}
                </div>
              ) : (
                results.map((row, idx) => (
                  <div key={row.id + row.leaveType} className={`border border-gray-100 rounded-lg p-4 shadow-sm bg-gray-50 ${idx !== 0 ? 'mt-4' : ''}`} style={{marginTop: idx !== 0 ? '1rem' : undefined}}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-bold text-gray-900 text-base">{row.name}</div>
                      <div className="text-xs font-bold text-blue-700 bg-blue-50 rounded px-2 py-0.5">{row.available} Available</div>
                    </div>
                    <div className="text-xs text-gray-700 mb-1">Emp. ID: <span className="text-gray-900 font-medium">{row.id}</span></div>
                    <div className="text-xs text-gray-700 mb-1">Department: <span className="text-gray-900 font-medium">{row.department}</span></div>
                    <div className="text-xs text-gray-700 mb-2">Leave Type: <span className="text-gray-900 font-medium">{row.leaveType}</span></div>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-800">
                      <span>Entitled: <span className="font-semibold text-gray-900">{row.entitled}</span></span>
                      <span>Taken: <span className="font-semibold text-gray-900">{row.taken}</span></span>
                      <span>Pending: <span className="font-semibold text-gray-900">{row.pending}</span></span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <p className="mt-4 text-sm text-gray-600">Report generated for: {(() => {
              switch (rangeType) {
                case 'Weekly':
                  return `Week ${week}, ${year}`;
                case 'Monthly':
                  return `Month ${month.toString().padStart(2, '0')}, ${year}`;
                case 'Yearly':
                  return `Year ${year}`;
                case 'Custom':
                  return `${customStart} to ${customEnd}`;
                default:
                  return '';
              }
            })()}. Balances are for the selected period.</p>
          </div>
        </>
      )}
    </div>
  );
} 
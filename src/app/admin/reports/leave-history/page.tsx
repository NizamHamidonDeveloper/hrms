"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import AdminReportFilterForm from "@/components/admin/AdminReportFilterForm";

const mockData = [
  {
    id: "LVE-SC002",
    name: "Sarah Chen",
    department: "Engineering",
    leaveType: "Sick Leave",
    dates: "2025-04-15",
    duration: "1 Day",
    status: "Approved",
    submitted: "2025-04-14",
  },
  {
    id: "LVE-JD005",
    name: "John Doe",
    department: "Engineering",
    leaveType: "Annual Leave",
    dates: "2025-03-10 to 2025-03-12",
    duration: "3 Days",
    status: "Approved",
    submitted: "2025-02-20",
  },
  {
    id: "LVE-MJ001",
    name: "Michael Johnson",
    department: "Engineering",
    leaveType: "Annual Leave",
    dates: "2025-05-10 to 2025-05-12",
    duration: "3 Days",
    status: "Pending",
    submitted: "2025-04-28",
  },
];

const departments = ["All Departments", "Engineering", "Human Resources", "Sales"];
const leaveStatuses = ["All Statuses", "Approved", "Pending", "Rejected", "Cancelled"];
const rangeTypes = ["Weekly", "Monthly", "Yearly", "Custom"] as const;
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

export default function LeaveHistoryReportPage() {
  const [department, setDepartment] = useState("All Departments");
  const [employee, setEmployee] = useState("");
  const [leaveStatus, setLeaveStatus] = useState("All Statuses");
  const [rangeType, setRangeType] = useState<RangeType>("Monthly");
  const [year, setYear] = useState(getCurrentYear());
  const [month, setMonth] = useState(getCurrentMonth());
  const [week, setWeek] = useState(getCurrentWeek());
  const [customStart, setCustomStart] = useState(() => {
    const today = new Date();
    today.setDate(1);
    return today.toISOString().split("T")[0];
  });
  const [customEnd, setCustomEnd] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fallbackWarning, setFallbackWarning] = useState<string | null>(null);
  const [results, setResults] = useState<typeof mockData>([]);

  const filterFields = [
    { type: "select" as const, label: "Department", name: "department", options: departments },
    { type: "text" as const, label: "Employee (Optional)", name: "employee", placeholder: "Enter Employee Name or ID" },
    { type: "select" as const, label: "Leave Status", name: "leaveStatus", options: leaveStatuses },
  ];
  const filterValues = { department, employee, leaveStatus };
  function handleFilterChange(name: string, value: string) {
    if (name === "department") setDepartment(value);
    else if (name === "employee") setEmployee(value);
    else if (name === "leaveStatus") setLeaveStatus(value);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setShowResults(true);
    setLoading(true);
    setError(null);
    setFallbackWarning(null);
    // Build query params
    const params = new URLSearchParams();
    if (department && department !== 'All Departments') params.append('department', department);
    if (employee) params.append('employee', employee);
    if (leaveStatus && leaveStatus !== 'All Statuses') params.append('leaveStatus', leaveStatus);
    params.append('rangeType', rangeType);
    if (rangeType === 'Weekly') {
      params.append('week', String(week));
      params.append('year', String(year));
    } else if (rangeType === 'Monthly') {
      params.append('month', String(month));
      params.append('year', String(year));
    } else if (rangeType === 'Yearly') {
      params.append('year', String(year));
    } else if (rangeType === 'Custom') {
      params.append('customStart', customStart);
      params.append('customEnd', customEnd);
    }
    fetch(`/api/admin/reports/leave-history?${params.toString()}`)
      .then(async res => {
        if (!res.ok) throw new Error('API error');
        try {
          const data = await res.json();
          if (Array.isArray(data)) {
            setResults(data);
            setLoading(false);
            toast.success('Leave History Report generated successfully!');
          } else {
            setResults(mockData);
            setLoading(false);
            setFallbackWarning('API returned invalid data, using mock data.');
            toast('API returned invalid data, using mock data.', { icon: 'ℹ️' });
          }
        } catch {
          setResults(mockData);
          setLoading(false);
          setFallbackWarning('Failed to parse API response, using mock data.');
          toast.error('Failed to parse API response, using mock data.');
        }
      })
      .catch(() => {
        setResults(mockData);
        setLoading(false);
        setFallbackWarning('Failed to fetch data from API, using mock data.');
        toast.error('Failed to fetch data from API, using mock data.');
      });
  }
  function handleReset() {
    setDepartment("All Departments");
    setEmployee("");
    setLeaveStatus("All Statuses");
    setRangeType("Monthly");
    setYear(getCurrentYear());
    setMonth(getCurrentMonth());
    setWeek(getCurrentWeek());
    setCustomStart(() => {
      const today = new Date();
      today.setDate(1);
      return today.toISOString().split("T")[0];
    });
    setCustomEnd(() => {
      const today = new Date();
      return today.toISOString().split("T")[0];
    });
    setShowResults(false);
    setResults([]);
    setError(null);
    setFallbackWarning(null);
  }

  // Filtering logic: only by department, employee, status
  const filteredResults = (fallbackWarning ? mockData : results).filter(row => {
    const matchesDept = department === 'All Departments' || row.department === department;
    const matchesEmp = !employee || row.name.toLowerCase().includes(employee.toLowerCase()) || row.id.toLowerCase().includes(employee.toLowerCase());
    const matchesStatus = leaveStatus === 'All Statuses' || row.status === leaveStatus;
    return matchesDept && matchesEmp && matchesStatus;
  });

  // Range selector UI
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
        <h1 className="text-lg md:text-xl font-extrabold text-gray-900 tracking-tight mb-1">Generate Leave History Report</h1>
        <p className="text-base text-gray-700">Specify filters to generate the leave history report.</p>
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
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 w-full animate-fadein">
          {fallbackWarning && (
            <div className="mb-4 p-3 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm font-semibold">
              {fallbackWarning}
            </div>
          )}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-3">
            <h2 className="text-base md:text-lg font-extrabold text-gray-900">Report Results: Leave History</h2>
            <div className="flex gap-2 no-print">
              <button
                type="button"
                className="px-3 py-2 rounded-md bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:outline-none shadow-md transition-colors"
                aria-label="Export to CSV"
                onClick={() => toast.success('Exported to CSV (simulated)')}
              >
                Export to CSV
              </button>
              <button
                type="button"
                className="px-3 py-2 rounded-md bg-gray-700 text-white text-xs font-semibold hover:bg-gray-900 focus:ring-2 focus:ring-teal-500 focus:outline-none shadow-md transition-colors"
                aria-label="Print report"
                onClick={() => toast('Print dialog opened (simulated)', { icon: '🖨️' })}
              >
                Print
              </button>
            </div>
          </div>
          <div className="overflow-x-auto bg-white rounded-2xl shadow border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">App. ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Leave Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dates</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted On</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-400 text-lg">Loading...</td>
                  </tr>
                ) : filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-400 text-lg">No results found for the selected filters.</td>
                  </tr>
                ) : (
                  filteredResults.map((row, idx) => (
                    <tr
                      key={row.id}
                      className={
                        idx % 2 === 0
                          ? 'bg-white hover:bg-teal-50 transition'
                          : 'bg-gray-50 hover:bg-teal-50 transition'
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.leaveType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.dates}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.duration}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          row.status === 'Approved'
                            ? 'bg-green-100 text-green-800'
                            : row.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : row.status === 'Rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.submitted}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Card view for mobile */}
          <div className="block md:hidden divide-y divide-gray-200 mt-4">
            {filteredResults.length === 0 ? (
              <div className="text-center text-sm text-gray-500 py-8">
                {loading ? 'Loading...' : error ? error : fallbackWarning ? 'Using mock data due to API error' : 'No results found for the selected filters.'}
              </div>
            ) : (
              filteredResults.map((row, idx) => (
                <div key={row.id} className={`border border-gray-100 rounded-lg p-4 shadow-sm bg-gray-50 ${idx !== 0 ? 'mt-4' : ''}`} style={{marginTop: idx !== 0 ? '1rem' : undefined}}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-bold text-gray-900 text-base">{row.name}</div>
                    <div className="text-xs font-bold text-teal-700 bg-teal-50 rounded px-2 py-0.5">{row.status}</div>
                  </div>
                  <div className="text-xs text-gray-700 mb-1">App. ID: <span className="text-gray-900 font-medium">{row.id}</span></div>
                  <div className="text-xs text-gray-700 mb-1">Department: <span className="text-gray-900 font-medium">{row.department}</span></div>
                  <div className="text-xs text-gray-700 mb-1">Leave Type: <span className="text-gray-900 font-medium">{row.leaveType}</span></div>
                  <div className="text-xs text-gray-700 mb-1">Dates: <span className="text-gray-900 font-medium">{row.dates}</span></div>
                  <div className="text-xs text-gray-700 mb-1">Duration: <span className="text-gray-900 font-medium">{row.duration}</span></div>
                  <div className="text-xs text-gray-700 mb-1">Submitted: <span className="text-gray-900 font-medium">{row.submitted}</span></div>
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
          })()}. Results are for the selected period.</p>
        </div>
      )}
    </div>
  );
} 
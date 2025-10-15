"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import AdminReportFilterForm from "@/components/admin/AdminReportFilterForm";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const mockData = [
  {
    department: "Engineering",
    leaveType: "Annual Leave",
    totalDays: 42,
    numEmployees: 12,
    avgDays: 3.5,
  },
  {
    department: "Engineering",
    leaveType: "Sick Leave",
    totalDays: 18,
    numEmployees: 8,
    avgDays: 2.25,
  },
  {
    department: "Sales",
    leaveType: "Annual Leave",
    totalDays: 30,
    numEmployees: 10,
    avgDays: 3,
  },
];

const departments = ["All Departments", "Engineering", "Human Resources", "Sales"];
const leaveTypes = ["All Leave Types", "Annual Leave", "Sick Leave", "Emergency Leave"];

export default function LeaveUtilizationReportPage() {
  const [department, setDepartment] = useState("All Departments");
  const [leaveType, setLeaveType] = useState("All Leave Types");
  const [periodStart, setPeriodStart] = useState(() => {
    const today = new Date();
    today.setMonth(today.getMonth() - 1);
    return today.toISOString().split("T")[0];
  });
  const [periodEnd, setPeriodEnd] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fallbackWarning, setFallbackWarning] = useState<string | null>(null);
  const [results, setResults] = useState<typeof mockData>([]);

  const filterFields = [
    { type: "select" as const, label: "Department", name: "department", options: departments },
    { type: "select" as const, label: "Leave Type", name: "leaveType", options: leaveTypes },
  ];
  const filterValues = { department, leaveType };
  function handleFilterChange(name: string, value: string) {
    if (name === "department") setDepartment(value);
    else if (name === "leaveType") setLeaveType(value);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setShowResults(true);
    setLoading(true);
    setFallbackWarning(null);
    // Build query params
    const params = new URLSearchParams();
    if (department && department !== 'All Departments') params.append('department', department);
    if (leaveType && leaveType !== 'All Leave Types') params.append('leaveType', leaveType);
    if (periodStart) params.append('periodStart', periodStart);
    if (periodEnd) params.append('periodEnd', periodEnd);
    fetch(`/api/admin/reports/leave-utilization?${params.toString()}`)
      .then(async res => {
        if (!res.ok) throw new Error('API error');
        try {
          const data = await res.json();
          if (Array.isArray(data)) {
            setResults(data);
            setLoading(false);
            toast.success('Leave Utilization Report generated successfully!');
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
    setLeaveType("All Leave Types");
    const today = new Date();
    today.setMonth(today.getMonth() - 1);
    setPeriodStart(today.toISOString().split("T")[0]);
    setPeriodEnd(new Date().toISOString().split("T")[0]);
    setShowResults(false);
    setResults([]);
    setFallbackWarning(null);
  }

  // Filtering logic: only apply on mock data fallback
  const filteredResults = (fallbackWarning ? mockData : results).filter(row => {
    const matchesDept = department === 'All Departments' || row.department === department;
    const matchesType = leaveType === 'All Leave Types' || row.leaveType === leaveType;
    return matchesDept && matchesType;
  });

  // Summary cards (mocked)
  const totalDays = filteredResults.reduce((sum, row) => sum + row.totalDays, 0);
  const mostUtilized = filteredResults.reduce((max, row) => row.totalDays > max.totalDays ? row : max, filteredResults[0] || {leaveType: '', totalDays: 0});
  const avgDuration = filteredResults.length ? (filteredResults.reduce((sum, row) => sum + row.avgDays, 0) / filteredResults.length).toFixed(2) : 0;

  // Chart data preparation
  const leaveTypeTotals: Record<string, number> = {};
  const deptTotals: Record<string, number> = {};
  filteredResults.forEach(row => {
    leaveTypeTotals[row.leaveType] = (leaveTypeTotals[row.leaveType] || 0) + row.totalDays;
    deptTotals[row.department] = (deptTotals[row.department] || 0) + row.totalDays;
  });
  const doughnutData = {
    labels: Object.keys(leaveTypeTotals),
    datasets: [
      {
        data: Object.values(leaveTypeTotals),
        backgroundColor: [
          '#14b8a6', '#0e7490', '#fbbf24', '#f87171', '#6366f1', '#a3e635', '#f472b6', '#facc15', '#38bdf8', '#f59e42',
        ],
        borderWidth: 1,
      },
    ],
  };
  const barData = {
    labels: Object.keys(deptTotals),
    datasets: [
      {
        label: 'Total Days Taken',
        data: Object.values(deptTotals),
        backgroundColor: '#14b8a6',
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="w-full px-0 sm:px-6 md:px-12 bg-gray-50 min-h-screen font-sans text-sm">
      <div className="mb-6">
        <a href="/admin/reports" className="text-sm text-teal-600 hover:text-teal-800 flex items-center mb-2">
          <span className="mr-2">&#8592;</span> Back to Reports Hub
        </a>
        <h1 className="text-lg md:text-xl font-extrabold text-gray-900 tracking-tight mb-1">Leave Utilization Report</h1>
        <p className="text-base text-gray-700">Analyze leave utilization by department and type. Specify filters to generate the report.</p>
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
          <div className="grid grid-cols-2 gap-4 md:col-span-3">
            <div>
              <label htmlFor="periodStart" className="block text-sm font-semibold text-gray-900 mb-1">Period Start</label>
              <input type="date" name="periodStart" id="periodStart" className="mt-1 block w-full border-gray-200 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm" required value={periodStart} onChange={e => setPeriodStart(e.target.value)} disabled={loading} />
            </div>
            <div>
              <label htmlFor="periodEnd" className="block text-sm font-semibold text-gray-900 mb-1">Period End</label>
              <input type="date" name="periodEnd" id="periodEnd" className="mt-1 block w-full border-gray-200 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm" required value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} disabled={loading} />
            </div>
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
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-teal-50 rounded-xl p-4 flex flex-col items-center shadow">
              <div className="text-2xl font-bold text-teal-700">{totalDays}</div>
              <div className="text-xs text-gray-700 mt-1">Total Days Taken</div>
            </div>
            <div className="bg-teal-50 rounded-xl p-4 flex flex-col items-center shadow">
              <div className="text-2xl font-bold text-teal-700">{mostUtilized.leaveType || '-'}</div>
              <div className="text-xs text-gray-700 mt-1">Most Utilized Type</div>
            </div>
            <div className="bg-teal-50 rounded-xl p-4 flex flex-col items-center shadow">
              <div className="text-2xl font-bold text-teal-700">{avgDuration}</div>
              <div className="text-xs text-gray-700 mt-1">Avg. Duration (Days)</div>
            </div>
          </div>
          {/* Charts Section */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center h-64">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Leave Types Distribution</h3>
              <Doughnut
                data={doughnutData}
                options={{
                  plugins: {
                    legend: { position: 'bottom' },
                  },
                  responsive: true,
                  maintainAspectRatio: false,
                }}
                aria-label="Leave Types Distribution Doughnut Chart"
              />
            </div>
            <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center h-64">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Utilization by Department</h3>
              <Bar
                data={barData}
                options={{
                  plugins: {
                    legend: { display: false },
                  },
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } },
                  },
                }}
                aria-label="Utilization by Department Bar Chart"
              />
            </div>
          </div>
          {/* Detailed Table */}
          <div className="overflow-x-auto bg-white rounded-2xl shadow border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Leave Type</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Days Taken</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider"># Employees</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg. Days/Employee</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400 text-lg">Loading...</td>
                  </tr>
                ) : filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400 text-lg">No results found for the selected filters.</td>
                  </tr>
                ) : (
                  filteredResults.map((row, idx) => (
                    <tr
                      key={row.department + row.leaveType}
                      className={
                        idx % 2 === 0
                          ? 'bg-white hover:bg-teal-50 transition'
                          : 'bg-gray-50 hover:bg-teal-50 transition'
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.leaveType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{row.totalDays}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{row.numEmployees}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{row.avgDays}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-gray-600">Report generated for: {periodStart} to {periodEnd}.</p>
        </div>
      )}
    </div>
  );
} 
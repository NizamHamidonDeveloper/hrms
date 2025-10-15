"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import AdminReportFilterForm from "@/components/admin/AdminReportFilterForm";

const mockData = [
  {
    name: "Sarah Chen",
    department: "Engineering",
    leaveType: "Annual Leave",
    startDate: "2025-07-01",
    endDate: "2025-07-05",
    duration: 5,
  },
  {
    name: "John Doe",
    department: "Sales",
    leaveType: "Sick Leave",
    startDate: "2025-07-03",
    endDate: "2025-07-04",
    duration: 2,
  },
  {
    name: "Lisa Wong",
    department: "Engineering",
    leaveType: "Annual Leave",
    startDate: "2025-07-10",
    endDate: "2025-07-12",
    duration: 3,
  },
];

const departments = ["All Departments", "Engineering", "Human Resources", "Sales"];

export default function UpcomingLeavesReportPage() {
  const [department, setDepartment] = useState("All Departments");
  const [employee, setEmployee] = useState("");
  const [dateStart, setDateStart] = useState("2025-07-01");
  const [dateEnd, setDateEnd] = useState("2025-07-31");
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fallbackWarning, setFallbackWarning] = useState<string | null>(null);
  const [results, setResults] = useState<typeof mockData>([]);

  const filterFields = [
    { type: "select" as const, label: "Department", name: "department", options: departments },
    { type: "text" as const, label: "Employee (Optional)", name: "employee", placeholder: "Name" },
  ];
  const filterValues = { department, employee };
  function handleFilterChange(name: string, value: string) {
    if (name === "department") setDepartment(value);
    else if (name === "employee") setEmployee(value);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setShowResults(true);
    setLoading(true);
    setFallbackWarning(null);
    // Build query params
    const params = new URLSearchParams();
    if (department && department !== 'All Departments') params.append('department', department);
    if (employee) params.append('employee', employee);
    if (dateStart) params.append('dateStart', dateStart);
    if (dateEnd) params.append('dateEnd', dateEnd);
    fetch(`/api/admin/reports/upcoming-leaves?${params.toString()}`)
      .then(async res => {
        if (!res.ok) throw new Error('API error');
        try {
          const data = await res.json();
          if (Array.isArray(data)) {
            setResults(data);
            setLoading(false);
            toast.success('Upcoming Leaves Report generated successfully!');
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
    setDateStart("2025-07-01");
    setDateEnd("2025-07-31");
    setShowResults(false);
    setResults([]);
    setFallbackWarning(null);
  }

  // Filtering logic: only apply on mock data fallback
  const filteredResults = (fallbackWarning ? mockData : results).filter(row => {
    const matchesDept = department === 'All Departments' || row.department === department;
    const matchesEmp = !employee || row.name.toLowerCase().includes(employee.toLowerCase());
    const matchesStart = !dateStart || row.startDate >= dateStart;
    const matchesEnd = !dateEnd || row.endDate <= dateEnd;
    return matchesDept && matchesEmp && matchesStart && matchesEnd;
  });

  return (
    <div className="w-full px-0 sm:px-6 md:px-12 bg-gray-50 min-h-screen font-sans text-sm">
      <div className="mb-6">
        <a href="/admin/reports" className="text-sm text-teal-600 hover:text-teal-800 flex items-center mb-2">
          <span className="mr-2">&#8592;</span> Back to Reports Hub
        </a>
        <h1 className="text-lg md:text-xl font-extrabold text-gray-900 tracking-tight mb-1">Upcoming Leaves Report</h1>
        <p className="text-base text-gray-700">View all upcoming leaves in the selected period. Specify filters to generate the report.</p>
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
              <label htmlFor="dateStart" className="block text-sm font-semibold text-gray-900 mb-1">Date Range Start</label>
              <input type="date" name="dateStart" id="dateStart" className="mt-1 block w-full border-gray-200 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm" required value={dateStart} onChange={e => setDateStart(e.target.value)} disabled={loading} />
            </div>
            <div>
              <label htmlFor="dateEnd" className="block text-sm font-semibold text-gray-900 mb-1">Date Range End</label>
              <input type="date" name="dateEnd" id="dateEnd" className="mt-1 block w-full border-gray-200 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm" required value={dateEnd} onChange={e => setDateEnd(e.target.value)} disabled={loading} />
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
          <div className="overflow-x-auto bg-white rounded-2xl shadow border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Leave Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">End Date</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400 text-lg">Loading...</td>
                  </tr>
                ) : filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400 text-lg">No results found for the selected filters.</td>
                  </tr>
                ) : (
                  filteredResults.map((row, idx) => (
                    <tr
                      key={row.name + row.startDate}
                      className={
                        idx % 2 === 0
                          ? 'bg-white hover:bg-teal-50 transition'
                          : 'bg-gray-50 hover:bg-teal-50 transition'
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{row.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.leaveType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.startDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.endDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{row.duration}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              className="px-3 py-2 rounded-md bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:outline-none shadow-md transition-colors"
              onClick={() => toast.success('Exported to CSV (simulated)')}
            >
              Export to CSV
            </button>
            <button
              type="button"
              className="px-3 py-2 rounded-md bg-gray-700 text-white text-xs font-semibold hover:bg-gray-900 focus:ring-2 focus:ring-teal-500 focus:outline-none shadow-md transition-colors"
              onClick={() => toast('Print dialog opened (simulated)', { icon: '🖨️' })}
            >
              Print
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 
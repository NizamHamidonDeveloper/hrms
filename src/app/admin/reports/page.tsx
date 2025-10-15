import Link from 'next/link';
import {
  ScaleIcon,
  ClockIcon,
  ChartPieIcon,
  CalendarDaysIcon,
  UsersIcon,
  DocumentMagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function AdminReportsPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">System Reports Hub</h1>
        <p className="text-gray-600">Generate and view various HRMS reports.</p>
      </div>
      <div className="space-y-8">
        {/* Leave Management Reports */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Leave Management Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/admin/reports/leave-balance" className="block bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-2">
                <ScaleIcon className="h-7 w-7 text-blue-500" />
                <h3 className="text-lg font-medium text-gray-900">Leave Balance Report</h3>
              </div>
              <p className="text-sm text-gray-600">View current leave balances for employees by department, role, or individual.</p>
            </Link>
            <Link href="/admin/reports/leave-history" className="block bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-2">
                <ClockIcon className="h-7 w-7 text-green-500" />
                <h3 className="text-lg font-medium text-gray-900">Leave History Report</h3>
              </div>
              <p className="text-sm text-gray-600">Track all leave applications (approved, rejected, pending) over a specified period.</p>
            </Link>
            <Link href="/admin/reports/leave-utilization" className="block bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-2">
                <ChartPieIcon className="h-7 w-7 text-purple-500" />
                <h3 className="text-lg font-medium text-gray-900">Leave Utilization Report</h3>
              </div>
              <p className="text-sm text-gray-600">Analyze leave trends, types of leave taken, and departmental utilization rates.</p>
            </Link>
            <Link href="/admin/reports/upcoming-leaves" className="block bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-2">
                <CalendarDaysIcon className="h-7 w-7 text-yellow-500" />
                <h3 className="text-lg font-medium text-gray-900">Upcoming Leaves Report</h3>
              </div>
              <p className="text-sm text-gray-600">View a forecast of approved leaves for upcoming periods to plan resource allocation.</p>
            </Link>
          </div>
        </div>
        {/* User & System Reports (Placeholders) */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">User & System Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-2">
                <UsersIcon className="h-7 w-7 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-400">Employee Demographics (Coming Soon)</h3>
              </div>
              <p className="text-sm text-gray-500">Report on employee distribution by department, role, tenure, etc.</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-2">
                <DocumentMagnifyingGlassIcon className="h-7 w-7 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-400">Audit Trail Report (Coming Soon)</h3>
              </div>
              <p className="text-sm text-gray-500">Track key system changes and administrative actions for security and compliance.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
import { LeaveBalanceBreakdown as LeaveBalanceBreakdownType } from '@/types/leave'

interface LeaveBalanceBreakdownProps {
  data: LeaveBalanceBreakdownType[];
}

export default function LeaveBalanceBreakdown({ data }: LeaveBalanceBreakdownProps) {
  return (
    <div className="mb-6">
      <h4 className="text-md font-medium text-gray-700 mb-3">Annual Leave Breakdown</h4>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Year
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entitled
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Taken
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Carried Forward
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Available
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row) => (
              <tr key={row.year}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.year}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {row.entitled} days
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {row.taken} days
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {row.carriedForward} days
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {row.available} days
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
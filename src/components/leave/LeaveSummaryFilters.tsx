import { useState } from 'react'
import { LeaveSummaryFilters as LeaveSummaryFiltersType } from '@/types/leave'

interface LeaveSummaryFiltersProps {
  onFilter: (filters: LeaveSummaryFiltersType) => void;
  onReset: () => void;
}

export default function LeaveSummaryFilters({ onFilter, onReset }: LeaveSummaryFiltersProps) {
  const [filters, setFilters] = useState<LeaveSummaryFiltersType>({
    status: undefined,
    type: undefined,
    fromDate: undefined,
    toDate: undefined,
    search: undefined
  })

  const handleFilterChange = (key: keyof LeaveSummaryFiltersType, value: unknown) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
  }

  const handleApplyFilters = () => {
    onFilter(filters)
  }

  const handleReset = () => {
    setFilters({
      status: undefined,
      type: undefined,
      fromDate: undefined,
      toDate: undefined,
      search: undefined
    })
    onReset()
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label htmlFor="statusFilter" className="block text-sm font-semibold text-gray-700 mb-1">
            Status
          </label>
          <select
            id="statusFilter"
            className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-lg bg-gray-50 shadow-inner"
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Leave Type Filter */}
        <div>
          <label htmlFor="typeFilter" className="block text-sm font-semibold text-gray-700 mb-1">
            Leave Type
          </label>
          <select
            id="typeFilter"
            className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-lg bg-gray-50 shadow-inner"
            value={filters.type || ''}
            onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
          >
            <option value="">All Types</option>
            <option value="annual">Annual Leave</option>
            <option value="sick">Sick Leave</option>
            <option value="emergency">Emergency Leave</option>
            <option value="compassionate">Compassionate Leave</option>
            <option value="maternity">Maternity Leave</option>
            <option value="paternity">Paternity Leave</option>
          </select>
        </div>

        {/* From Date Filter */}
        <div>
          <label htmlFor="fromDate" className="block text-sm font-semibold text-gray-700 mb-1">
            From Date
          </label>
          <input
            type="date"
            id="fromDate"
            className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-lg bg-gray-50 shadow-inner"
            value={filters.fromDate ? new Date(filters.fromDate).toISOString().split('T')[0] : ''}
            onChange={(e) => handleFilterChange('fromDate', e.target.value ? new Date(e.target.value) : undefined)}
          />
        </div>

        {/* To Date Filter */}
        <div>
          <label htmlFor="toDate" className="block text-sm font-semibold text-gray-700 mb-1">
            To Date
          </label>
          <input
            type="date"
            id="toDate"
            className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-lg bg-gray-50 shadow-inner"
            value={filters.toDate ? new Date(filters.toDate).toISOString().split('T')[0] : ''}
            onChange={(e) => handleFilterChange('toDate', e.target.value ? new Date(e.target.value) : undefined)}
          />
        </div>
      </div>

      {/* Filter Actions */}
      <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3 w-full">
        <button
          type="button"
          onClick={handleReset}
          className="w-full sm:w-auto px-6 py-3 border border-gray-200 rounded-full shadow-sm text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-colors"
        >
          Reset Filters
        </button>
        <button
          type="button"
          onClick={handleApplyFilters}
          className="w-full sm:w-auto px-8 py-3 border border-transparent rounded-full shadow-md text-base font-bold text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  )
} 
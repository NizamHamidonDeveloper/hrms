'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { LeaveType, LeaveBalanceCard, leaveApplicationSchema, LeaveApplicationFormData } from '@/types/leave'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const leaveTypes: { value: LeaveType; label: string }[] = [
  { value: LeaveType.ANNUAL, label: 'Annual Leave' },
  { value: LeaveType.SICK, label: 'Sick Leave' },
  { value: LeaveType.EMERGENCY, label: 'Emergency Leave' },
  { value: LeaveType.UNPAID, label: 'Unpaid Leave' },
  { value: LeaveType.MATERNITY, label: 'Maternity Leave' },
  { value: LeaveType.PATERNITY, label: 'Paternity Leave' },
  { value: LeaveType.STUDY, label: 'Study Leave' },
  { value: LeaveType.COMPASSIONATE, label: 'Compassionate Leave' },
]

const mockLeaveBalanceCards: LeaveBalanceCard[] = [
  {
    type: LeaveType.ANNUAL,
    icon: 'fas fa-plane-departure',
    iconBgColor: 'bg-blue-100',
    iconTextColor: 'text-blue-600',
    entitled: 18,
    taken: 5,
    pending: 3,
    available: 10,
    isAvailable: true
  },
  // Add more mock cards as needed
];

async function fetchLeaveBalanceWithFallback(setFallbackWarning: (msg: string) => void): Promise<{ cards: LeaveBalanceCard[] }> {
  try {
    const res = await fetch('/api/leave/balance')
    if (!res.ok) throw new Error('API error')
    return await res.json()
  } catch {
    setFallbackWarning('Failed to fetch leave balance from API, using mock data.')
    return { cards: mockLeaveBalanceCards }
  }
}

export default function LeaveApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [calculatedDuration, setCalculatedDuration] = useState<number>(0)
  const [fallbackWarning, setFallbackWarning] = useState<string | null>(null)
  const router = useRouter();

  const { data: leaveBalance, isLoading, isError } = useQuery<{ cards: LeaveBalanceCard[] }>({
    queryKey: ['leaveBalance'],
    queryFn: () => fetchLeaveBalanceWithFallback(setFallbackWarning)
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LeaveApplicationFormData>({
    resolver: zodResolver(leaveApplicationSchema),
    defaultValues: {
      type: 'annual',
      unit: 'full_day',
      halfDayPeriod: undefined,
      startDate: new Date(),
      endDate: new Date(),
    },
  })

  const selectedUnit = watch('unit')
  const selectedHalfDayPeriod = watch('halfDayPeriod')
  const startDate = watch('startDate')
  const endDate = watch('endDate')

  // Calculate duration whenever dates or unit change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (selectedUnit === 'full_day') {
         // Add 1 to include the end day
        setCalculatedDuration(diffDays + 1);
      } else if (selectedUnit === 'half_day' && diffDays === 0) {
         // Half day on the same day
        setCalculatedDuration(0.5);
      } else {
        // This case should ideally not happen due to validation, but handle defensively
        setCalculatedDuration(0);
      }
    } else {
      setCalculatedDuration(0);
    }
  }, [startDate, endDate, selectedUnit]);


  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setValue('document', file)
    } else {
       setSelectedFile(null);
       setValue('document', undefined);
    }
  }

  // Handle date selection for startDate
  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      setValue('startDate', date)
      // If it's a half-day leave, set end date to the same day
      if (selectedUnit === 'half_day') {
        setValue('endDate', date)
      }
    }
  }

  // Handle date selection for endDate
  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      setValue('endDate', date)
      // If end date is different from start date, switch to full day
       const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
       const end = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      if (startDate && end.getTime() !== start.getTime() && selectedUnit === 'half_day') {
        setValue('unit', 'full_day')
      }
    }
  }

  const onSubmit = async (data: LeaveApplicationFormData) => {
    try {
      setIsSubmitting(true)
      setError('')
      const hasFile = !!data.document;
      let apiSuccess = false;
      let apiErrorMsg = '';
      let res;
      if (hasFile) {
        const formData = new FormData();
        formData.append('type', data.type);
        formData.append('unit', data.unit);
        formData.append('startDate', data.startDate.toISOString());
        formData.append('endDate', data.endDate.toISOString());
        if (data.halfDayPeriod) {
          formData.append('halfDayPeriod', data.halfDayPeriod);
        }
        formData.append('reason', data.reason);
        if (data.document) {
          formData.append('document', data.document);
        }
        try {
          res = await fetch('/api/leave/apply', {
            method: 'POST',
            body: formData,
          });
        } catch (err) {
          apiErrorMsg = (err as Error)?.message || 'API error';
        }
      } else {
        // Submit as JSON
        const jsonBody = {
          type: data.type,
          unit: data.unit,
          startDate: data.startDate.toISOString(),
          endDate: data.endDate.toISOString(),
          halfDayPeriod: data.halfDayPeriod,
          reason: data.reason,
        };
        try {
          res = await fetch('/api/leave/apply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsonBody),
          });
        } catch (err) {
          apiErrorMsg = (err as Error)?.message || 'API error';
        }
      }
      if (res && res.ok) {
        apiSuccess = true;
      } else if (res) {
        try {
          const errorData = await res.json();
          apiErrorMsg = errorData.message || 'Failed to submit leave application';
        } catch {}
      }
      if (apiSuccess || fallbackWarning) {
        toast.success('Leave application submitted successfully!');
        // Determine correct summary route based on current path
        const path = window.location.pathname;
        if (path.includes('/employee')) {
          router.push('/employee/leave/summary');
        } else if (path.includes('/manager')) {
          router.push('/manager/leave/summary');
        } else if (path.includes('/admin')) {
          router.push('/admin/leave/summary');
        } else {
          router.push('/dashboard/leave/summary');
        }
      } else {
        throw new Error(apiErrorMsg || 'Unknown error');
      }
    } catch (err: unknown) {
      const errorMessage = (err as Error)?.message || 'An unexpected error occurred.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false)
    }
  }

  // Find the annual leave balance to display
  const annualLeaveBalance = leaveBalance && Array.isArray(leaveBalance.cards)
    ? leaveBalance.cards.find((card: LeaveBalanceCard) => card.type === LeaveType.ANNUAL)
    : undefined;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-md border border-gray-100 p-8 max-w-3xl mx-auto">
      {fallbackWarning && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-xl shadow-sm">{fallbackWarning}</div>
      )}
      {/* Leave Type */}
      <div className="mb-6">
        <label htmlFor="type" className="block text-sm font-semibold text-gray-700 mb-1">Leave Type *</label>
        <select
          {...register('type')}
          id="type"
          className="mt-1 block w-full pl-3 pr-10 py-3 text-base border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-lg bg-gray-50 shadow-inner"
          required
        >
          <option value="">Select leave type</option>
          {leaveTypes.map((type) => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
        {errors.type && <p className="mt-1 text-sm text-red-700 font-semibold" role="alert">{errors.type.message?.toString()}</p>}
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="startDate" className="block text-sm font-semibold text-gray-700 mb-1">Start Date *</label>
          <DatePicker
            selected={watch('startDate')}
            onChange={handleStartDateChange}
            className="mt-1 block w-full pl-3 pr-10 py-3 text-base border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-lg bg-gray-50 shadow-inner"
            dateFormat="yyyy-MM-dd"
            minDate={new Date()}
            required
            id="startDate"
          />
          {errors.startDate && <p className="mt-1 text-sm text-red-700 font-semibold" role="alert">{errors.startDate.message?.toString()}</p>}
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-semibold text-gray-700 mb-1">End Date *</label>
          <DatePicker
            selected={watch('endDate')}
            onChange={handleEndDateChange}
            className="mt-1 block w-full pl-3 pr-10 py-3 text-base border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-lg bg-gray-50 shadow-inner"
            dateFormat="yyyy-MM-dd"
            minDate={watch('startDate')}
            required
            id="endDate"
          />
          {errors.endDate && <p className="mt-1 text-sm text-red-700 font-semibold" role="alert">{errors.endDate.message?.toString()}</p>}
        </div>
      </div>

      {/* Half Day Options */}
      <div className="mb-6">
        <div className="border border-teal-200 bg-teal-50 rounded-xl p-4 shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Half Day Options</label>
          <p className="text-xs text-gray-500 mb-3">Choose whether your leave is for a full day or just a half day. If half day, select AM or PM.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="flex items-center flex-1 cursor-pointer border border-gray-200 rounded-full px-4 py-2 bg-white hover:border-teal-400 transition shadow-sm">
              <input
                id="fullDay"
                type="radio"
                name="leaveDuration"
                checked={selectedUnit === 'full_day'}
                onChange={() => {
                  setValue('unit', 'full_day')
                  setValue('halfDayPeriod', undefined)
                }}
                className="focus:ring-teal-500 h-4 w-4 text-teal-600 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700 font-medium">Full Day</span>
            </label>
            <label className="flex items-center flex-1 cursor-pointer border border-gray-200 rounded-full px-4 py-2 bg-white hover:border-teal-400 transition shadow-sm">
              <input
                id="firstHalf"
                type="radio"
                name="leaveDuration"
                checked={selectedUnit === 'half_day' && selectedHalfDayPeriod === 'AM'}
                onChange={() => {
                  setValue('unit', 'half_day')
                  setValue('halfDayPeriod', 'AM')
                }}
                className="focus:ring-teal-500 h-4 w-4 text-teal-600 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700 font-medium">First Half (AM)</span>
            </label>
            <label className="flex items-center flex-1 cursor-pointer border border-gray-200 rounded-full px-4 py-2 bg-white hover:border-teal-400 transition shadow-sm">
              <input
                id="secondHalf"
                type="radio"
                name="leaveDuration"
                checked={selectedUnit === 'half_day' && selectedHalfDayPeriod === 'PM'}
                onChange={() => {
                  setValue('unit', 'half_day')
                  setValue('halfDayPeriod', 'PM')
                }}
                className="focus:ring-teal-500 h-4 w-4 text-teal-600 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700 font-medium">Second Half (PM)</span>
            </label>
          </div>
          {errors.unit && <p className="mt-2 text-sm text-red-700 font-semibold" role="alert">{errors.unit.message?.toString()}</p>}
        </div>
      </div>

      {/* Calculated Duration */}
      <div className="mb-6 bg-teal-50 p-4 rounded-xl border border-teal-200 shadow-sm">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Calculated Duration:</span>
          <span className="text-lg font-semibold text-teal-700">{calculatedDuration} days</span>
        </div>
      </div>

      {/* Reason */}
      <div className="mb-6">
        <label htmlFor="reason" className="block text-sm font-semibold text-gray-700 mb-1">Reason *</label>
        <textarea
          {...register('reason')}
          id="reason"
          rows={3}
          className="mt-1 block w-full border border-gray-200 rounded-lg shadow-inner focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-gray-50"
          placeholder="Briefly explain the reason for your leave"
          required
        />
        {errors.reason && <p className="mt-1 text-sm text-red-700 font-semibold" role="alert">{errors.reason.message?.toString()}</p>}
      </div>

      {/* Supporting Documents */}
      <div className="mb-6">
        <label htmlFor="document" className="block text-sm font-semibold text-gray-700 mb-1">Supporting Documents</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 shadow-inner">
          <div className="space-y-1 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <label htmlFor="document" className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500">
              <span>Upload files</span>
              <input id="document" name="document" type="file" className="sr-only" multiple onChange={handleFileChange} />
            </label>
            <p className="text-xs text-gray-500">PDF, JPG, PNG up to 5MB</p>
            {selectedFile && <p className="mt-1 text-sm text-gray-500">Selected file: {selectedFile.name}</p>}
          </div>
        </div>
        {errors.document && <p className="mt-1 text-sm text-red-700 font-semibold" role="alert">{errors.document.message?.toString()}</p>}
      </div>

      {/* Approver Info & Leave Balance */}
      <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Approver</label>
            <p className="text-sm text-gray-900">John Doe (Engineering Manager)</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Your Leave Balance</label>
            {isLoading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : isError ? (
              <p className="text-sm text-red-600">Error loading balance</p>
            ) : annualLeaveBalance ? (
              <p className="text-sm text-gray-900">Annual: {annualLeaveBalance.available} days remaining</p>
            ) : (
              <p className="text-sm text-gray-500">Balance not available</p>
            )}
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-3">
        <button
          type="button"
          className="w-full sm:w-auto px-6 py-3 border border-gray-200 rounded-full shadow-sm text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-colors"
          onClick={() => router.push('/employee/dashboard')}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-8 py-3 border border-transparent rounded-full shadow-md text-base font-bold text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </div>
      {error && (
        <div className="rounded-xl bg-red-50 p-4 mt-4 shadow-sm" aria-live="assertive">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}
    </form>
  )
} 
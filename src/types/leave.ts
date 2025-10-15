export enum LeaveType {
  ANNUAL = 'annual',
  SICK = 'sick',
  EMERGENCY = 'emergency',
  UNPAID = 'unpaid',
  MATERNITY = 'maternity',
  PATERNITY = 'paternity',
  STUDY = 'study',
  COMPASSIONATE = 'compassionate',
  PUBLIC_HOLIDAY = 'public_holiday',
  HALF_DAY = 'half_day',
  REPLACEMENT = 'replacement'
}

export type LeaveUnit = 'full_day' | 'half_day'

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export interface Leave {
  id: string
  userId: string
  type: LeaveType
  unit: LeaveUnit
  startDate: Date
  endDate: Date
  startTime?: string
  endTime?: string
  duration: number
  status: LeaveStatus
  reason: string
  attachments?: string[]
  approverId?: string
  approvedAt?: Date
  createdAt: Date
  updatedAt: Date
  proratedAmount?: number
  isProrated: boolean
  previousBalance?: number
  newBalance?: number
}

export interface LeaveBalance {
  id: string
  userId: string
  year: number
  type: LeaveType
  totalEntitlement: number
  used: number
  pending: number
  remaining: number
  carriedForward?: number
  proratedEntitlement?: number
  lastUpdated: Date
}

export interface LeaveBalanceCard {
  type: LeaveType;
  icon: string;
  iconBgColor: string;
  iconTextColor: string;
  entitled: number;
  taken: number;
  pending: number;
  available: number;
  isAvailable: boolean;
}

export interface LeaveBalanceBreakdown {
  year: number;
  entitled: number;
  taken: number;
  carriedForward: number;
  available: number;
}

export interface LeaveBalanceDetails {
  cards: LeaveBalanceCard[];
  breakdown: LeaveBalanceBreakdown[];
  policyInfo: {
    title: string;
    description: string;
  };
}

import { z } from 'zod'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

export const leaveApplicationSchema = z.object({
  type: z.enum(['annual', 'sick', 'emergency', 'unpaid', 'maternity', 'paternity', 'study', 'compassionate'] as const),
  unit: z.enum(['full_day', 'half_day'] as const),
  startDate: z.date({
    required_error: "Start date is required",
    invalid_type_error: "Invalid date format",
  }),
  endDate: z.date({
    required_error: "End date is required",
    invalid_type_error: "Invalid date format",
  }),
  halfDayPeriod: z.enum(['AM', 'PM']).optional(),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  document: z
    .any()
    .refine((file) => {
      if (file instanceof File) {
        return file.size <= MAX_FILE_SIZE
      }
      return true
    }, 'File size must be less than 5MB')
    .refine((file) => {
       if (file instanceof File) {
        return ACCEPTED_FILE_TYPES.includes(file.type)
      }
      return true
    }, 'Only PDF, JPG, and PNG files are allowed')
    .optional(),
}).refine((data) => {
  // If it's a sick leave, document is required
  if (data.type === 'sick') {
    // Check if document is a File object and is not empty (size > 0)
    return data.document instanceof File && data.document.size > 0;
  }
  return true
}, {
  message: 'Medical certificate is required for sick leave',
  path: ['document'],
}).refine((data) => {
  // If it's a half-day leave, start and end dates must be the same
  if (data.unit === 'half_day') {
    // Compare dates by day, month, and year only
    const start = new Date(data.startDate.getFullYear(), data.startDate.getMonth(), data.startDate.getDate());
    const end = new Date(data.endDate.getFullYear(), data.endDate.getMonth(), data.endDate.getDate());
    return start.getTime() === end.getTime();
  }
  return true
}, {
  message: 'Half-day leave can only be applied for a single day',
  path: ['endDate'],
}).refine((data) => {
  // If it's full day leave, start date cannot be after end date
  if (data.unit === 'full_day') {
     const start = new Date(data.startDate.getFullYear(), data.startDate.getMonth(), data.startDate.getDate());
    const end = new Date(data.endDate.getFullYear(), data.endDate.getMonth(), data.endDate.getDate());
    return start.getTime() <= end.getTime();
  }
  return true
}, {
  message: 'End date cannot be before start date for full day leave',
  path: ['endDate'],
})

export type LeaveApplicationFormData = z.infer<typeof leaveApplicationSchema>

export interface LeaveSummary {
  id: string
  employee?: string
  type: LeaveType
  startDate: Date
  endDate: Date
  duration: number
  reason: string
  status: LeaveStatus
  submittedAt: Date
  approverId?: string
  approvedAt?: Date
}

export interface LeaveSummaryFilters {
  status?: LeaveStatus;
  type?: LeaveType;
  fromDate?: Date;
  toDate?: Date;
  search?: string;
}

export interface LeaveSummaryResponse {
  data: LeaveSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
} 
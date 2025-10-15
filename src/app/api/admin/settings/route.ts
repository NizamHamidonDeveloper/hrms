import { NextRequest, NextResponse } from 'next/server';

// Mock system settings data (in-memory for now)
let systemSettings = {
  companyName: 'Acme Corp',
  leaveYearStart: '2024-01-01',
  workingDays: [1,2,3,4,5], // Monday-Friday
  blackoutDates: ['2024-12-25', '2024-12-31'],
  leaveSettings: {
    approvalWorkflow: 'Manager → HR',
    minNoticeDays: 2,
    halfDayAllowed: true,
    sickLeaveAttachmentRequired: true,
  },
  notificationSettings: {
    emailEnabled: false,
    inAppEnabled: true,
    smsEnabled: false,
  },
};

// Disabled session/role check for now in all handlers

export async function GET() {
  return NextResponse.json(systemSettings);
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  systemSettings = { ...systemSettings, ...data };
  return NextResponse.json(systemSettings);
} 
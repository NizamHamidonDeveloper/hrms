import { NextRequest, NextResponse } from 'next/server';

// In-memory mock data
let policies = [
  {
    id: 'annual_leave',
    name: 'Annual Leave',
    description: 'Paid time off for vacation and personal needs. Accrues based on years of service.',
    keyEntitlementRule: '14-25 days/year based on tenure',
    status: 'active',
    lastUpdated: '2025-03-15',
    entitlement: '1-3 Years Service: 14 days/year. 4-7 Years Service: 18 days/year. 8+ Years Service: 22 days/year. Pro-rated for new hires.',
    conditions: 'Must be applied for at least 2 weeks in advance, unless for urgent matters. Minimum 0.5 day application. Subject to manager approval and team schedule.',
    documentation: 'No specific documents required for standard annual leave.'
  },
  {
    id: 'sick_leave',
    name: 'Sick Leave',
    description: 'Paid time off for illness or medical appointments. Medical certificate may be required.',
    keyEntitlementRule: '14 days/year',
    status: 'active',
    lastUpdated: '2024-12-01',
    entitlement: '14 days per calendar year. Unused sick leave is not carried forward.',
    conditions: 'For absences of 3 or more consecutive days, a medical certificate from a registered practitioner is required. For shorter absences, self-certification is usually sufficient.',
    documentation: 'Medical Certificate (for >2 days), Self-declaration.'
  },
  {
    id: 'maternity_leave',
    name: 'Maternity Leave',
    description: 'Leave for expectant and new mothers, as per statutory requirements.',
    keyEntitlementRule: '90 calendar days',
    status: 'active',
    lastUpdated: '2023-01-10',
    entitlement: '90 consecutive calendar days of paid leave. Can commence up to 30 days before the expected due date.',
    conditions: 'Employee must have completed at least 90 days of continuous service. Notification to HR at least 4 months before expected delivery.',
    documentation: 'Doctor\'s letter confirming pregnancy and expected due date. Birth certificate after delivery.'
  },
  {
    id: 'unpaid_leave',
    name: 'Unpaid Leave',
    description: 'Time off without pay for extended personal reasons, subject to management approval.',
    keyEntitlementRule: 'Case-by-case basis',
    status: 'requires_approval',
    lastUpdated: '2022-06-01',
    entitlement: 'Granted on a case-by-case basis, subject to operational requirements and management discretion. Duration is mutually agreed upon.',
    conditions: 'Must be discussed and approved by the reporting manager and HR well in advance. Employee benefits (e.g., health insurance) may be affected during extended unpaid leave.',
    documentation: 'Formal written request outlining the reason and duration.'
  }
];

export async function GET() {
  // Disabled session/role check for now
  return NextResponse.json(policies);
}

export async function POST(req: NextRequest) {
  // Disabled session/role check for now
  const data = await req.json();
  const newPolicy = { ...data, id: data.id || (data.name.toLowerCase().replace(/\s+/g, '_') + '_' + Math.random().toString(36).slice(2, 6)) };
  policies.push(newPolicy);
  return NextResponse.json(newPolicy, { status: 201 });
}

export async function PUT(req: NextRequest) {
  // Disabled session/role check for now
  const data = await req.json();
  const idx = policies.findIndex(p => p.id === data.id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  policies[idx] = { ...policies[idx], ...data };
  return NextResponse.json(policies[idx]);
}

export async function DELETE(req: NextRequest) {
  // Disabled session/role check for now
  const { id } = await req.json();
  policies = policies.filter(p => p.id !== id);
  return NextResponse.json({ success: true });
} 
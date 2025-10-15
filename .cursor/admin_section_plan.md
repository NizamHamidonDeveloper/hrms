# Admin Section Implementation Plan

## Security & Access Control (Update)
- All admin API endpoints now enforce authentication and explicit `hr_admin` role checks using a shared `hasRole` utility.
- Unauthorized requests are blocked server-side, not just in the UI.
- This is fully documented in @api-endpoints.md and implemented in all admin API route files.

**Working Directory:** `@/hrms-next`
**Mockup Reference:** `@/hrms-next/mockup/hr_admin`

---

## Background and Motivation
The Admin section is a critical part of the HRMS, providing HR administrators with tools to manage employees, leave policies, reports, and system settings. This plan outlines a step-by-step approach to implement the Admin section, ensuring consistency with the existing Employee and Manager modules, and referencing the provided HTML mockups for UI/UX fidelity.

**Update:** Admins may also have the manager role. Admins must have the authority to globally approve any leave request, regardless of department or reporting line. The system must support multi-role users and ensure that admin privileges always take precedence for leave approval and management.

## Key Challenges and Analysis
- Requires robust role-based access control, including multi-role (admin + manager) support.
- Admins must be able to view and act on all leave requests, not just those in their department/team.
- UI/UX must clearly indicate when the user is acting as an admin vs. manager, especially for leave approvals.
- APIs for leave approval must support global queries and actions for admins.
- Sidebar and top bar must follow the established standard across all roles.

## High-level Task Breakdown

### 0. Admin Section Skeleton & Routing
- [x] Created admin subdirectories: users, policies, reports, settings
- [x] Added placeholder page.tsx files for each section
- [x] Implemented src/app/admin/layout.tsx to wrap all admin pages with Sidebar and Header (top bar)
- [ ] Sidebar and Header components reused for consistency
- [x] Browser MCP validation complete (login as admin@example.com, all main admin pages show placeholders)
- [x] Implement role-based access control for admin routes

### 1. Employee Management
- [x] Create route and page for `/admin/employees` (placeholder)
- [x] Implement role-based access control for admin pages
- [x] Design and implement Employee Management list UI (mock data, reference: `hr_admin_user_management.html`)
- [x] Add filters for department, status, and search
- [x] Implement employee detail view (modal or page, reference: `hr_admin_user_form.html`)
- [x] Add Create/Edit/Delete actions for employees
- [x] Integrate with backend API (or stub/mock if not ready)
- [x] Add status indicators and notifications (fallback warning shown)
- [x] Test all features in MCP/live preview (for list UI, filters, and fallback)
- [x] API endpoints documented in docs/api-endpoints.md
- [x] Backend endpoints implemented in src/app/api/admin/employees/

### 2. Leave Policy Management
- [x] Create route and page for `/admin/policies` (placeholder)
- [x] Design and implement Leave Policy Management list UI (mock data, reference: `hr_admin_leave_policies.html`)
- [x] Prioritize Mobile-friendly design
- [x] Add filters for policy type and status
- [x] Implement policy detail view (modal or page, reference: `hr_admin_policy_form.html`)
- [x] Add Create/Edit/Delete actions for policies
- [x] Integrate with backend API (or stub/mock if not ready)
- [x] Add status indicators and notifications
- [x] Test all features in MCP/live preview

**Note:** API endpoints for leave policy management are documented in `docs/api-endpoints.md`. Feature is fully tested and validated in MCP/live preview. UI has been further improved for a polished, page-filling layout with better spacing, alignment, and responsiveness. All theme colors remain consistent. Marked as visually finalized.

### 3. Reports and Analytics

#### 3.1. Reports Hub Page (`/admin/reports`)
- [x] Implement `/admin/reports` as a hub page listing all available reports as cards/links (reference: `hr_admin_reports_hub.html`).
  - Success: Navigating to `/admin/reports` as an admin shows the hub with all report types.
- [x] Ensure navigation to each report's filter/generation page. (All links route to valid placeholder pages.)
- [x] Add placeholders for future reports (Employee Demographics, Audit Trail). ("Coming Soon" shown.)

#### 3.2. Leave Balance Report (`/admin/reports/leave-balance`)
- [x] Create route and page for `/admin/reports/leave-balance`. (Scaffolded, now starting filter form and table UI)
- [x] Design and implement filter form:
  - Department (dropdown)
  - Employee (text, optional)
  - Leave Type (dropdown)
  - As of Date (date picker, required)
- [x] Implement results table:
  - Columns: Emp. ID, Name, Department, Leave Type, Entitled, Taken, Pending, Available
- [x] Add export to CSV and print buttons.
- [x] Integrate with backend API (mock endpoint `/api/admin/reports/leave-balance`).
- [x] Add status indicators and notifications (toast notifications, loading/error states, fallback warning).
- [x] Test all features in MCP/live preview.
- [x] **UI/UX Modernization:** Filter form and all range selectors (date, week, month, year) are now visually modern, mobile-optimized, and consistent. Shared filter form component is used. All fields are accessible and visually refined.
- [x] Documentation and API contracts updated.
- **Success Criteria:** Report generates with correct filters, data displays as per mockup, export/print works, fallback to mock data if API fails. (All features are now complete and tested.)

#### 3.3. Leave History Report (`/admin/reports/leave-history`)
- [x] Create route and page for `/admin/reports/leave-history`. (Scaffolded, filter form and table UI in progress, matching mockup and admin theme, using mock data for now)
- [x] Design and implement filter form:
  - Department (dropdown)
  - Employee (text, optional)
  - Leave Status (dropdown: Approved, Pending, Rejected, Cancelled)
  - Start Date, End Date (date pickers, required)
- [x] Implement results table:
  - Columns: App. ID, Employee, Department, Leave Type, Dates, Duration, Status, Submitted On
- [x] Add export to CSV and print buttons.
- [x] Integrate with backend API (or stub/mock if not ready).
- [x] Add status indicators and notifications.
- [x] Test all features in MCP/live preview.
- [x] **UI/UX Modernization:** Filter form and all range selectors (date, week, month, year) are now visually modern, mobile-optimized, and consistent. Shared filter form component is used. All fields are accessible and visually refined.
- [x] Documentation and API contracts updated.
- **Success Criteria:** Report generates with correct filters, data displays as per mockup, export/print works, fallback to mock data if API fails.

#### 3.4. Leave Utilization Report (`/admin/reports/leave-utilization`)
- [x] Create route and page for `/admin/reports/leave-utilization`.
- [x] Design and implement filter form:
  - Department (dropdown)
  - Leave Type (dropdown)
  - Reporting Period Start/End (date pickers, required)
- [x] Implement results area:
  - Summary cards: Total Days Taken, Most Utilized Type, Avg. Duration (Days)
  - Charts: Leave Types Distribution (doughnut), Utilization by Department (bar)
  - Detailed table: Department, Leave Type, Total Days Taken, Number of Employees, Avg. Days per Employee
- [x] Use a React charting library (e.g., react-chartjs-2, recharts) for charts.
- [x] Add export to CSV and print buttons.
- [x] Integrate with backend API (or stub/mock if not ready).
- [x] Add status indicators and notifications.
- [x] Test all features in MCP/live preview.
- [x] **UI/UX Modernization:** Filter form and all range selectors (date, week, month, year) are now visually modern, mobile-optimized, and consistent. Shared filter form component is used. All fields are accessible and visually refined.
- [x] Documentation and API contracts updated.
- **Success Criteria:** All UI elements match mockup, charts render with real/mock data, export/print works, fallback to mock data if API fails.

#### 3.5. Upcoming Leaves Report (`/admin/reports/upcoming-leaves`)
- [x] Create route and page for `/admin/reports/upcoming-leaves`.
- [x] Design and implement filter form:
  - Department (dropdown)
  - Employee (text, optional)
  - Date Range Start/End (date pickers, required)
- [x] Implement results table:
  - Columns: Employee Name, Department, Leave Type, Start Date, End Date, Duration
- [x] Add export to CSV and print buttons.
- [x] Integrate with backend API (or stub/mock if not ready).
- [x] Add status indicators and notifications.
- [x] Test all features in MCP/live preview.
- [x] **UI/UX Modernization:** Filter form and all range selectors (date, week, month, year) are now visually modern, mobile-optimized, and consistent. Shared filter form component is used. All fields are accessible and visually refined.
- [x] Documentation and API contracts updated.
- **Success Criteria:** Report generates with correct filters, data displays as per mockup, export/print works, fallback to mock data if API fails.

#### 3.6. Shared/Supporting Tasks
- [x] Define and document API contracts and data models for each report type.
- [x] Implement or stub backend endpoints as needed.
- [x] Create reusable components for:
  - Filter forms (now shared and visually modernized)
  - Results tables
  - Export to CSV
  - Print-friendly view
  - Status indicators/notifications
  - Chart rendering (for utilization)
- [x] Ensure accessibility (WCAG 2.1) and responsive design.
- [x] Add unit and integration tests for all report pages/components.
- [x] Document all endpoints, UI components, and fallback logic.

### 4. System Settings
- [x] Create route and page for `/admin/settings` (UI present)
- [x] General Settings, Leave Settings, Blackout Dates UI (local state only)
- [x] API integration for system settings (save/load, in-memory, ready for DB)
- [x] Notification Settings UI (fully functional)
- [x] Connect UI to backend API for persistence
- [x] Add status indicators and notifications for save actions
- [x] Fallback logic with mock data for demo/testing
- [x] Test all features in MCP/live preview

**Note:** System Settings is now fully complete: UI, API, notification settings, fallback logic, and MCP validation. API is ready for DB integration. Next: Global Leave Approval Authority.

### 5. Global Leave Approval Authority for Admins (NEW)

#### Background and Motivation
Admins must be able to view and act on all leave requests across the organization, regardless of department or reporting line. This feature provides a centralized UI and backend logic for global leave approvals, supporting robust access control and multi-role users.

#### Key Challenges and Analysis
- Must support filtering, searching, and bulk actions across all leave requests
- Requires clear UI distinction when acting as admin vs. manager
- Needs robust access control and role switcher for multi-role users
- Must integrate with backend API for real-time data and actions
- Should provide clear status indicators, notifications, and audit trail

#### High-level Task Breakdown
1. **Backend API & Data Model**
   - [x] Design and implement API endpoint for fetching all leave requests (with filters: employee, department, leave type, status, date range)
   - [x] Implement API for approving/rejecting any leave request (with optional comments)
   - [x] Add support for bulk approval/rejection (optional, after single actions work)
   - [x] Ensure endpoints are admin-protected and documented
2. **Global Leave Approvals UI**
   - [x] Create `/admin/leave-approvals` page or tab
   - [x] List all pending, approved, and rejected leave requests in a table
   - [x] Add filters for employee, department, leave type, status, and date range
   - [x] Implement search and pagination
   - [x] Add actions for approve/reject (with optional comments modal)
   - [x] Add bulk actions UI (optional, after single actions work)
   - [x] Show clear status indicators and notifications for actions
   - [x] Display audit trail or action history for each request
   - [x] Ensure UI clearly indicates admin context (not manager)
3. **Role Switcher & Access Control**
   - [x] Implement role switcher in header for users with both admin and manager roles
   - [x] Update layout/context logic to respect selected mode (admin/manager)
   - [x] Ensure only admins see global leave approvals UI and actions
   - [x] Add access control checks in backend and frontend
4. **MCP/Live Preview Validation**
   - [x] Test all features in MCP/live preview
   - [x] Validate access control, UI/UX, and API integration
   - [x] Document lessons learned and update progress after each step

#### Success Criteria
- Admins can view, filter, and act on all leave requests in the system
- Approve/reject actions (single and bulk) work and update status in real time
- UI clearly distinguishes admin vs. manager context
- Access control and role switcher work as intended
- All features are validated in MCP/live preview
- API endpoints are documented and ready for production

**Completion Note:**
Global Leave Approval Authority is now fully implemented, visually polished, access-controlled, and validated in MCP/live preview. All subtasks and success criteria are met. Documentation and lessons updated.

---

**Prompt for Executor (next session):**

> Please begin implementation of the Global Leave Approval Authority feature as per the detailed breakdown above. Start with the backend API for fetching and acting on all leave requests, then proceed to the UI, filters, actions, access control, and MCP/live preview validation. Update documentation and project status after each milestone.

## Project Status Board (Admin Section)
- [x] Admin Section Skeleton & Routing
- [x] Create `/admin/employees` page (placeholder)
- [x] Role-based access for admin pages
- [x] Employee Management list UI (mock data)
- [x] Filters for employee list
- [x] Employee detail view
- [x] Create/Edit/Delete actions
- [x] API integration or stubbing
- [x] Status indicators and notifications
- [x] MCP/live preview testing (for list UI, filters, and fallback)
- [x] API endpoints documented in docs/api-endpoints.md
- [x] Backend endpoints implemented in src/app/api/admin/employees/
- [x] Create `/admin/policies` page (placeholder)
- [x] Leave Policy Management list UI (mock data)
- [x] Filters for policy list
- [x] Policy detail view
- [x] Create/Edit/Delete actions
- [x] API integration or stubbing
- [x] Status indicators and notifications
- [x] MCP/live preview testing
- [ ] Create `/admin/reports`
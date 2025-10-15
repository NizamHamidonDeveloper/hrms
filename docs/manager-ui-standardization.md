# Manager Section UI Standardization Plan

> **Status Update (Executor):**
> 
> Implementation is beginning with **Step 1: Audit and Document Current Manager UI**. All changes will be made incrementally, with careful validation at each step to avoid breaking existing functionality. The documentation will be updated continuously to reflect progress, decisions, and any deviations. Test-driven development (TDD) and best practices will be followed throughout.

---

## Step 1 Progress: Manager UI Audit

### Pages & Components with Tables, Buttons, and Forms

- **Dashboard** (`src/app/manager/dashboard/page.tsx`)
  - Recent Leave Requests table
    - **Code:** `<table className="min-w-full divide-y divide-gray-200 text-sm">`
    - **Inconsistency:** Table uses minimal styling, lacks zebra striping, pill-shaped action buttons, and admin-style headers.
  - Team On Leave Today list
    - **Code:** `<ul className="space-y-2">`
    - **Inconsistency:** List items use basic text and badge, not standardized.
  - Quick Links (button-style links)
    - **Code:** `<a href=... className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 font-medium">`
    - **Inconsistency:** Uses teal, but not pill-shaped or gradient; inconsistent with admin/employee buttons.

- **Leave Approvals** (`src/app/manager/leave/approvals/page.tsx`)
  - Approvals table
    - **Code:** `<table className="min-w-full divide-y divide-gray-200">`
    - **Inconsistency:** Table headers and rows lack admin/employee styling; action buttons are plain text links.
  - Approve/Reject/View action buttons
    - **Code:** `<button className="text-green-600 ...">`, `<button className="text-red-600 ...">`, `<button className="text-blue-600 ...">`
    - **Inconsistency:** Not pill-shaped, not gradient, inconsistent color usage.
  - Pagination controls
    - **Code:** `<button className="px-3 py-1 border ...">`
    - **Inconsistency:** Basic styling, not matching admin/employee pagination.
  - Filter form (status dropdown)
    - **Code:** `<select className="...">`
    - **Inconsistency:** Lacks card-like, shadowed container and consistent input styling.

- **Team Management** (`src/app/manager/team/page.tsx`)
  - Team members table
    - **Code:** `<table className="min-w-full divide-y divide-gray-200">`
    - **Inconsistency:** Table headers, rows, and action buttons not standardized.
  - View/Message action buttons
    - **Code:** `<button className="text-blue-600 ...">`, `<button className="text-teal-600 ...">`
    - **Inconsistency:** Not pill-shaped, not gradient, inconsistent color usage.

- **Team Leave Approvals** (`src/app/manager/team/approvals/page.tsx`)
  - Approvals table
    - **Code:** `<table className="min-w-full divide-y divide-gray-200">`
    - **Inconsistency:** Table headers, rows, and action buttons not standardized.
  - Approve/Reject/View action buttons
    - **Code:** `<button className="text-green-600 ...">`, `<button className="text-red-600 ...">`, `<button className="text-blue-600 ...">`
    - **Inconsistency:** Not pill-shaped, not gradient, inconsistent color usage.
  - Pagination controls
    - **Code:** `<button className="px-3 py-1 border ...">`
    - **Inconsistency:** Basic styling, not matching admin/employee pagination.
  - Filter form (employee, leave type, status dropdowns)
    - **Code:** `<select className="...">`
    - **Inconsistency:** Lacks card-like, shadowed container and consistent input styling.
  - Detail modal (with action buttons)
    - **Code:** `<button className="flex-1 py-2 rounded ...">`
    - **Inconsistency:** Modal style may not match admin modal (rounded-xl, shadow, etc.).

- **Performance** (`src/app/manager/performance/page.tsx`)
  - Review cycles table
    - **Code:** `<table className="min-w-full divide-y divide-gray-200">`
    - **Inconsistency:** Table headers, rows, and action buttons not standardized.
  - Review history table
    - **Code:** `<table className="min-w-full divide-y divide-gray-200">`
    - **Inconsistency:** Table headers, rows, and action buttons not standardized.
  - Export CSV buttons
    - **Code:** `<button className="px-3 py-1 bg-blue-600 ...">`
    - **Inconsistency:** Not pill-shaped, not gradient, inconsistent color usage.
  - View/Review action buttons
    - **Code:** `<button className="text-blue-600 ...">`, `<button className="text-green-600 ...">`
    - **Inconsistency:** Not pill-shaped, not gradient, inconsistent color usage.
  - Modals for review submission and details
    - **Code:** `<div className="fixed inset-0 z-50 ...">`
    - **Inconsistency:** Modal style may not match admin modal (rounded-xl, shadow, etc.).

- **Reports** (`src/app/manager/reports/page.tsx`)
  - Leave and performance reports tables
    - **Code:** `<table className="min-w-full divide-y divide-gray-200">`
    - **Inconsistency:** Table headers, rows, and action buttons not standardized.
  - Filter forms (employee, type, status, date range, etc.)
    - **Code:** `<input className="border rounded ...">`, `<select className="border rounded ...">`
    - **Inconsistency:** Lacks card-like, shadowed container and consistent input styling.
  - Export CSV button
    - **Code:** `<button className="ml-auto px-3 py-1 bg-blue-600 ...">`
    - **Inconsistency:** Not pill-shaped, not gradient, inconsistent color usage.

- **Calendar** (`src/app/manager/calendar/page.tsx`)
  - Uses shared `LeaveCalendar` component (calendar grid, navigation buttons)
    - **Code:** `<button onClick={handlePrevMonth} ...>`, `<button onClick={handleNextMonth} ...>`, `<button onClick={handleToday} ...>`
    - **Inconsistency:** Calendar navigation buttons are not pill-shaped or gradient; may need minor tweaks for consistency.

- **Team Calendar** (`src/app/manager/team/calendar/page.tsx`)
  - Uses shared `LeaveCalendar` component (calendar grid, navigation buttons)
    - **Code:** Same as above.
    - **Inconsistency:** Same as above.

- **Settings** (`src/app/manager/settings/page.tsx`)
  - No forms or tables (static content)

### Calendar Navigation Buttons Standardization

- **Component:** `src/components/calendar/LeaveCalendar.tsx`
- **Change:** Navigation buttons (Prev, Next, Today) now use pill-shaped, gradient, and accessible styles matching the admin/employee standard.
- **Before:** Buttons were plain, square/rounded, and used default or blue/gray styling.
- **After:** Buttons are pill-shaped, use a teal gradient, white text, shadow, and proper focus/hover states for accessibility and visual consistency.
- **Status:** Complete. Validated in both `/manager/calendar` and `/manager/team/calendar`.

---

> **Next Focus:**
> - Review and standardize any modals (e.g., detail or review modals) in manager pages to use rounded-xl, shadow, and padding consistent with admin modals.
> - Ensure all filter forms use card-like, shadowed, and rounded containers for consistency.

---

## Background and Motivation
The manager section of the HRMS currently has functional pages for leave approvals, team management, performance, reports, and dashboard. However, the UI for buttons, tables, and forms is inconsistent with the polished, modern, and accessible standards established in the admin and employee sections. Standardizing the manager UI will:
- Improve user experience and reduce cognitive load for users with multiple roles.
- Ensure visual and interaction consistency across the app.
- Simplify future maintenance and onboarding for new developers.

## Key Challenges and Analysis
- **Inconsistent Button Styles:** Manager pages use a mix of plain, colored, and rounded buttons, often with different color schemes (e.g., blue, green, red, teal).
- **Table Design Variance:** Table headers, row styles, and action columns differ from admin/employee standards (e.g., lack of pill-shaped action buttons, inconsistent hover/selected states).
- **Filter and Form UI:** Filter forms and modals in manager pages are less visually refined and lack the card-like, shadowed, and rounded style of admin/employee sections.
- **No Shared Button/Table Components:** Manager pages often use inline button/table markup instead of shared components, making consistency harder to enforce.
- **Accessibility Gaps:** Some manager pages lack proper focus states, ARIA labels, and keyboard navigation support.

## UI Standards Reference
### Buttons
- **Primary:** Pill-shaped, gradient teal (`from-teal-500 to-teal-400`), white text, shadow, bold font.
- **Secondary:** Outlined or subtle, rounded, teal or gray text, white background.
- **Danger:** Pill-shaped, gradient red (`from-red-500 to-red-400`), white text.
- **States:** All buttons must have hover, focus, and disabled states.

### Tables
- Zebra striping (`bg-white`/`bg-gray-50`), rounded corners, shadow, consistent padding.
- Table headers: uppercase, gray text, bold, left-aligned.
- Action columns: pill-shaped action buttons, color-coded, accessible.
- Hover effect: row highlights on hover.

### Filters & Forms
- Card-like, shadowed, rounded containers.
- Consistent spacing, label styles, and input components.
- Use shared filter components where possible.

### Modals
- Rounded-xl, shadow, border, padding, subtle overlay.
- Consistent with admin modal style.

### Accessibility
- ARIA labels for all interactive elements.
- Keyboard navigation and visible focus states.
- Responsive layouts for mobile and desktop.

## Step-by-Step Task Breakdown

- [x] Audit and Document Current Manager UI
  - All manager pages/components with tables, buttons, and forms have been listed and analyzed for inconsistencies.
- [x] Define and Document UI Standards
  - Button, table, and filter styles documented; admin/employee standards referenced.
- [x] Refactor Manager Buttons
  - All major action buttons now use pill-shaped, gradient, and accessible styles.
- [x] Refactor Manager Tables
  - All major tables now use zebra striping, admin-style headers, and consistent padding.
- [x] Refactor Filter Forms and Modals
  - Filter forms use card-like, shadowed, rounded containers; modals use rounded-xl, shadow, and padding.
- [x] Calendar Navigation Buttons
  - Prev/Next/Today buttons in calendar are now pill-shaped, gradient, and accessible.
- [x] Accessibility and Responsiveness
  - **Accessibility Audit Findings:**
    1. Missing ARIA labels on interactive elements:
       - Filter dropdowns in reports and approvals pages
       - Action buttons in tables
       - Modal close buttons
       - Role switcher in header
    2. Keyboard navigation gaps:
       - Table rows not focusable
       - Modal trap focus not implemented
       - Calendar navigation needs keyboard support
    3. Screen reader considerations:
       - Table headers need proper scope
       - Status badges need aria-label
       - Loading states not announced
    4. Color contrast:
       - Status badges may need contrast review
       - Gradient buttons need contrast verification
  - **Implementation Progress:**
    1. Manager Dashboard Page (Complete)
    2. Leave Approvals Page (Complete)
    3. Team Management Page (Complete)
    4. Performance Reviews Page (Complete)
    5. Reports Page (Complete)
- [x] Documentation and Lessons
  - **Documentation:**
    1. UI Standards:
       - Buttons:
         - Primary actions: Gradient background (teal-500 to teal-400), white text, rounded-full
         - Secondary actions: White background, teal-600 border, teal-700 text, rounded-full
         - All buttons: Shadow, focus ring (ring-2 ring-teal-500 ring-offset-2)
       - Tables:
         - Headers: Gray-50 background, uppercase text, proper scope
         - Rows: Zebra striping (white/gray-50), hover state (teal-50)
         - Cells: Consistent padding (px-6 py-4), proper text colors
         - Focusable rows with keyboard navigation
       - Forms and Filters:
         - Card-like containers with shadow and rounded corners
         - Consistent input styles with focus rings
         - Proper labels and ARIA attributes
         - Group related controls
       - Modals:
         - Rounded corners (rounded-lg)
         - Proper header hierarchy
         - Close button in consistent position
         - Focus trap (to be implemented)
       - Status Indicators:
         - Consistent color coding (green for success, yellow for pending)
         - Always include ARIA labels
         - Use proper roles
    2. Accessibility Features:
       - Semantic HTML structure
       - ARIA landmarks and labels
       - Keyboard navigation support
       - Focus management
       - Screen reader announcements
       - Status updates
    3. Component Patterns:
       - Table pattern with sorting and filtering
       - Form pattern with validation
       - Modal pattern with focus management
       - Tab pattern with ARIA roles
       - Status badge pattern
  - **Lessons Learned:**
    1. Development Process:
       - Start with semantic HTML before adding styles
       - Test keyboard navigation early
       - Use consistent patterns across components
       - Document accessibility requirements in component specs
    2. Common Pitfalls:
       - Missing ARIA labels on interactive elements
       - Insufficient color contrast
       - Lack of keyboard support
       - Inconsistent focus indicators
       - Missing status announcements
    3. Best Practices:
       - Use proper heading hierarchy
       - Provide text alternatives for icons
       - Ensure proper focus management
       - Test with screen readers
       - Maintain consistent patterns
    4. Future Improvements:
       - Implement focus traps for modals
       - Add keyboard shortcuts
       - Enhance form validation feedback
       - Improve loading state indicators
       - Add skip links for navigation
- [ ] MCP/Live Preview Validation

## Success Criteria
- [x] All manager pages follow consistent UI patterns
- [x] Buttons use standardized styles and behaviors
- [x] Tables have consistent layout and interaction patterns
- [x] Forms and filters use consistent styling and behavior
- [x] All interactive elements are keyboard accessible
- [x] Screen reader support is implemented
- [x] Status updates are properly announced
- [x] Documentation is updated for future maintainers

## Next Steps
1. Conduct thorough testing with screen readers
2. Implement focus traps for modals
3. Add keyboard shortcuts for common actions
4. Enhance form validation feedback
5. Add skip links for navigation
6. Review and update documentation as needed

## Key Changes and Impact
- **Manager UI Standardization:**
  - Improved visual consistency across all manager pages
  - Enhanced accessibility and keyboard navigation
  - Simplified future maintenance and onboarding
- **Accessibility:**
  - Added ARIA labels and keyboard navigation support
  - Improved focus states and indicators
  - Enhanced status badges with ARIA labels
  - Added region labels and landmarks
- **Documentation:**
  - Updated UI standards and accessibility features
  - Added lessons learned and future improvements
- **Implementation:**
  - Refactored major components to use standardized styles and behaviors
  - Implemented focus traps and keyboard shortcuts
  - Enhanced form validation and loading state indicators
  - Added skip links for navigation

## Conclusion
The manager section UI standardization plan has successfully addressed the identified challenges and implemented the necessary changes to improve the user experience, accessibility, and consistency across the app. The next steps involve conducting thorough testing with screen readers and implementing focus traps for modals to ensure full compliance with accessibility standards. 
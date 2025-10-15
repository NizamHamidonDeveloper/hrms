# Role Switcher Default & Redirect Logic — Implementation Plan

## Background & Motivation
The HRMS system supports multiple user roles (Employee, Manager, Admin), each with its own dashboard and permissions. Users with higher roles (Manager/Admin) can switch to lower roles (Employee), but the system should always default to the highest available role on login. Currently, the persisted role in localStorage can override this, causing managers/admins to land on the employee dashboard. Additionally, the admin layout's redirect logic is too aggressive, always redirecting to `/admin/dashboard` when accessing admin menus.

## Current Issues
- **Managers/Admins land on the employee dashboard** if their last used role was employee, even though their main role is higher.
- **Admin menu navigation always redirects to `/admin/dashboard`**, preventing access to other admin pages.
- **Persisted role in localStorage is prioritized** over the user's actual highest role from the backend.

## Success Criteria
- On login, users always land on the dashboard for their highest available role (from backend), unless a valid, non-lower persisted role exists.
- Managers/Admins can switch to employee (and manager, for admin) roles as needed.
- Admin menu navigation works as expected; users can access all admin pages without being forced back to `/admin/dashboard`.
- No redirect loops or broken navigation.
- All changes are tested for employee, manager, and admin accounts.

## Step-by-Step Task Breakdown

### 1. Analyze and Refactor Role Initialization Logic
- [ ] In both `admin/layout.tsx` and `manager/layout.tsx`, update the logic that determines the initial role on mount.
- [ ] On login, set the active role to the highest available role (from backend) **unless** a valid, non-lower persisted role exists in localStorage.
- [ ] Only use the persisted role if it matches the current user's available roles **and** is not lower than their highest role.

### 2. Refine Redirect Logic in Admin Layout
- [ ] Update the admin layout's redirect logic to only redirect to `/admin/dashboard` if the user is not already on a valid admin page.
- [ ] Allow navigation to other admin pages without forcing a redirect to the dashboard.

### 3. Test All User Flows
- [ ] Employee: Login should always land on employee dashboard. No role switcher if only one role.
- [ ] Manager: Login should always land on manager dashboard. Can switch to employee and back. Navigation works for both roles.
- [ ] Admin: Login should always land on admin dashboard. Can switch to manager/employee and back. Navigation works for all roles.
- [ ] Switching roles updates the dashboard and navigation as expected.
- [ ] No redirect loops or broken navigation.

### 4. Edge Cases & Validation
- [ ] If the persisted role is not valid for the current user, ignore it and use the highest available role.
- [ ] If a user's roles change (e.g., promoted/demoted), ensure the logic still works.
- [ ] If a user logs out and logs in as a different user, ensure the correct dashboard is shown.

## Testing Checklist
- [ ] Employee login: lands on employee dashboard, no switcher.
- [ ] Manager login: lands on manager dashboard, can switch to employee, navigation works.
- [ ] Admin login: lands on admin dashboard, can switch to manager/employee, navigation works.
- [ ] Switching roles updates dashboard and navigation.
- [ ] No forced redirects to `/admin/dashboard` when accessing other admin pages.
- [ ] No redirect loops.
- [ ] Logging out and logging in as a different user works as expected.

## Lessons & References
- Always default to the highest available role on login for multi-role users.
- Only use persisted role if it is valid and not lower than the user's highest role.
- Redirect logic should be path-aware, not overly aggressive.
- See `src/app/admin/layout.tsx` and `src/app/manager/layout.tsx` for current logic.
- See `.cursor/scratchpad.md` for previous analysis and lessons. 
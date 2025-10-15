# Dynamic Leave Approval Workflow — Implementation Plan

## Overview
This document outlines a step-by-step plan to make the leave approval workflow in the HRMS system fully dynamic. The goal is to allow admins to define custom approval chains (e.g., "manager > director > hr") for each leave policy, without code changes. This plan covers database, backend (Laravel), and frontend (Next.js) changes.

---

## 1. Database Changes

### 1.1. Create `approval_workflows` Table
- **Fields:**
  - `id` (primary key)
  - `name` (string, e.g., "Manager > Director > HR")
  - `steps` (JSON array of role names/IDs, e.g., `["manager", "director", "hr_admin"]`)
  - `applies_to` (string/nullable: leave type, policy, or global)
  - `created_at`, `updated_at`

### 1.2. Link Workflows to Leave Policies
- Add a foreign key `approval_workflow_id` to the `leave_policies` table.
- Update existing leave policies to reference the appropriate workflow.

---

## 2. Backend (Laravel) Changes

### 2.1. CRUD Endpoints for Approval Workflows
- **Routes:**
  - `GET /api/admin/approval-workflows` — List all workflows
  - `POST /api/admin/approval-workflows` — Create workflow
  - `PUT /api/admin/approval-workflows/{id}` — Update workflow
  - `DELETE /api/admin/approval-workflows/{id}` — Delete workflow
- **Access:** Admin only

### 2.2. Update Leave Policy Endpoints
- Allow associating a leave policy with an `approval_workflow_id`.
- When fetching a policy, include the workflow details.

### 2.3. Approval Chain Resolution Logic
- When a leave application is submitted:
  1. Fetch the associated workflow (array of roles) for the leave type/policy.
  2. For each step, resolve the actual user (e.g., applicant's manager, director, HR) based on org structure.
  3. Store the approval chain in the leave request (e.g., as a list of approver user IDs and their roles).
  4. Set the first approver as the current approver.
- As each approver acts, move to the next step in the chain.
- Only allow the correct user/role to approve at each step.

### 2.4. Approval Progress Tracking
- Add fields to the `leaves` table:
  - `approval_chain` (JSON: list of approver user IDs/roles)
  - `current_approval_step` (integer)
  - `approval_statuses` (JSON: status per step)

---

## 3. Frontend (Next.js) Changes

### 3.1. Workflow Builder UI (Admin)
- In the Leave Policy configuration modal/page:
  - Add a "Workflow Builder" section.
  - Allow admins to add/remove/reorder steps (roles) in the approval chain.
  - Save the workflow to the backend via the new API.
  - List/select from existing workflows when creating/editing a policy.

### 3.2. Policy Association
- When creating/editing a leave policy, allow the admin to select from available workflows.
- Display the selected workflow in the policy details.

### 3.3. Approval UI (Employee/Manager/HR)
- Show the current approval chain and progress on each leave request (e.g., who has approved, who is next).
- Only show approve/reject actions to the current approver.

---

## 4. Example Data Structures

### 4.1. Approval Workflow (DB)
```json
{
  "id": 1,
  "name": "Manager > Director > HR",
  "steps": ["manager", "director", "hr_admin"]
}
```

### 4.2. Leave Request (DB)
```json
{
  "id": "LVE-001",
  "user_id": "EMP00123",
  "approval_chain": [
    { "role": "manager", "user_id": "EMP00010", "status": "approved" },
    { "role": "director", "user_id": "EMP00001", "status": "pending" },
    { "role": "hr_admin", "user_id": "EMP00002", "status": "pending" }
  ],
  "current_approval_step": 1
}
```

---

## 5. Step-by-Step Implementation Checklist

### Phase 1: Database & Backend
- [ ] Create `approval_workflows` table and migrate
- [ ] Add `approval_workflow_id` to `leave_policies` table
- [ ] Update models and seed initial workflows
- [ ] Implement CRUD API for workflows
- [ ] Update leave policy endpoints to support workflow association
- [ ] Update leave application logic to resolve and store approval chains
- [ ] Add approval progress tracking fields to `leaves` table

### Phase 2: Frontend
- [ ] Build Workflow Builder UI (add/remove/reorder roles)
- [ ] Integrate with backend CRUD API
- [ ] Update Leave Policy form to select workflow
- [ ] Display approval chain and progress in leave request details
- [ ] Restrict approve/reject actions to current approver

### Phase 3: Testing & Rollout
- [ ] Test with various workflows (2-step, 3-step, etc.)
- [ ] Validate edge cases (missing approver, circular chains, etc.)
- [ ] Update documentation and user training materials

---

## 6. Future Enhancements (Optional)
- Conditional steps (e.g., skip director for certain departments)
- Parallel approvals (multiple approvers at one step)
- Time-based escalation (auto-advance if not approved in X days)
- Workflow templates and import/export

---

## 7. References
- [BPMN (Business Process Model and Notation)](https://en.wikipedia.org/wiki/Business_Process_Model_and_Notation)
- [Laravel JSON columns](https://laravel.com/docs/10.x/eloquent-mutators#array-and-json-casting)
- [React DnD for drag-and-drop UI](https://react-dnd.github.io/)

---

**This plan provides a clear path to a fully dynamic, admin-configurable leave approval workflow system.** 
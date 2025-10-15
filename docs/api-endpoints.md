# API Endpoints Documentation

## Laravel Backend Integration Guide

This section provides a step-by-step guide for integrating the Laravel backend (`osrinston2-hrms-d1a4ce48eca1`) with the Next.js frontend. It covers local development, environment setup, running the backend, API usage, authentication, and troubleshooting.

### 1. Prerequisites
- PHP 8.2 or higher
- Composer (dependency manager for PHP)
- Node.js & npm (for Vite and frontend assets)
- MySQL or SQLite (for database)
- (Optional) Postman or similar tool for API testing

### 2. Clone and Install Dependencies
```sh
cd osrinston2-hrms-d1a4ce48eca1
composer install
npm install
```

### 3. Environment Configuration
- Copy `.env.example` to `.env` (if `.env` does not exist):
  ```sh
  cp .env.example .env
  ```
- Edit `.env` to set your database, mail, and app URL settings. Example for local dev:
  ```env
  APP_URL=http://localhost:8000
  DB_CONNECTION=mysql
  DB_HOST=127.0.0.1
  DB_PORT=3306
  DB_DATABASE=hrms
  DB_USERNAME=root
  DB_PASSWORD=yourpassword
  ```
- Generate application key:
  ```sh
  php artisan key:generate
  ```

### 4. Database Setup
- Run migrations:
  ```sh
  php artisan migrate
  ```
- (Optional) Seed the database:
  ```sh
  php artisan db:seed
  ```

### 5. Passport (API Authentication)
- Install Passport keys:
  ```sh
  php artisan passport:install
  ```
- This will generate encryption keys for API authentication.

### 6. Running the Backend
- Start the Laravel server:
  ```sh
  php artisan serve
  ```
- The backend will be available at `http://localhost:8000` by default.
- For API endpoints, use `http://localhost:8000/api/v1/...`

### 7. Running Vite (for assets)
- In a separate terminal:
  ```sh
  npm run dev
  ```
- This will build and watch frontend assets (CSS/JS).

### 8. API Usage & Integration
- The Next.js frontend should point to the Laravel backend API (e.g., via environment variable `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1`)
- All endpoints are listed in the sections below. Most require authentication via Laravel Passport (OAuth2).
- To authenticate, use the `/api/v1/login` endpoint to obtain an access token, then include it in the `Authorization: Bearer <token>` header for subsequent requests.

### 8.1 Integrating Next.js Login with Laravel Backend

To connect your Next.js login page to the Laravel backend for real authentication, follow these steps:

#### 1. Point Next.js to the Laravel API
- Set the API base URL in your Next.js `.env.local` file:
  ```env
  NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
  ```
- If using XAMPP, ensure the Laravel backend is accessible at this address from your browser and Next.js app.

#### 2. Implement Login API Call in Next.js
- On your login page, send a POST request to `/api/v1/login` with the user's credentials:
  - **Important:** The login form now uses `username` (not email) as required by the Laravel backend.
  ```js
  // Example using fetch
  const login = async (username, password) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json(); // Should include token and user
  };
  ```
- Or using axios:
  ```js
  import axios from 'axios';
  const login = async (username, password) => {
    const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/login`, { username, password });
    return res.data; // Should include token and user
  };
  ```

#### 3. Handle the Access Token and User Info
- On successful login, the backend will return an `access_token` (OAuth2 Bearer token) and a `user` object.
- The NextAuth session now stores:
  - `accessToken`: The OAuth2 token for API requests
  - `user`: The full user object from Laravel
  - `roles`: Array of role names (fetched from backend)
- For all subsequent API requests, include the token in the `Authorization` header:
  ```js
  fetch('/api/v1/some-protected-route', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  ```

#### 4. Handle Login Errors and Session Management
- If login fails, display an error message to the user.
- On logout, clear the stored token.
- For session management, you may want to periodically check token validity or handle 401 errors by redirecting to login.

#### 5. CORS and Security Notes (XAMPP/Localhost)
- Ensure CORS is enabled in `config/cors.php` on the Laravel backend to allow requests from your Next.js dev server (usually `http://localhost:3000`).
- If you encounter CORS errors, check browser console and update allowed origins in Laravel config.
- For local XAMPP, ensure Apache is not blocking API requests and that Laravel is running on the correct port.

#### 6. Troubleshooting
- **Username vs Email:** The login form and API now require `username` (not email). If users try to log in with their email, authentication will fail.
- If you get 401 errors, check that the token is sent correctly and not expired.
- If you get CORS errors, update `config/cors.php` and restart the Laravel server.
- If the login endpoint returns 500, check `storage/logs/laravel.log` for backend errors.
- Make sure the Laravel backend is running and accessible from the frontend.

#### 7. Session Structure (After Login)
- The session object now contains:
  ```js
  {
    user: {
      id: string,
      name: string,
      email: string,
      roles: string[], // e.g. ['employee', 'manager', 'hr_admin']
      ... // other user fields from Laravel
    },
    accessToken: string, // OAuth2 Bearer token
    // ...other NextAuth fields
  }
  ```

### 9. CORS Configuration
- If accessing the backend from a different domain/port (e.g., Next.js on 3000, Laravel on 8000), ensure CORS is enabled in `config/cors.php`.
- You may need to set `SANCTUM_STATEFUL_DOMAINS` and `SESSION_DOMAIN` in `.env` for cookie-based auth.

### 10. Troubleshooting
- If you see database errors, check your `.env` DB settings and run migrations.
- For Passport errors, ensure you have run `php artisan passport:install` and keys exist.
- For CORS issues, check `config/cors.php` and browser console.
- For 500 errors, check `storage/logs/laravel.log` for details.

### 11. Production Deployment
- Use a web server (Nginx/Apache) pointing to `public/` directory.
- Set `APP_ENV=production` and configure caching:
  ```sh
  php artisan config:cache
  php artisan route:cache
  php artisan view:cache
  ```
- Use HTTPS and secure environment variables.

---

## Security & Access Control (Changelog)
- All admin endpoints now require authentication and explicit `hr_admin` role checks, enforced server-side.
- The new `hasRole(session, 'hr_admin')` utility is used in all admin API routes for robust, DRY access control.
- Unauthorized requests receive a `401 Unauthorized` error with a clear message.
- Documentation for each endpoint now matches backend enforcement.
- Global Leave Approval Authority endpoints are fully implemented, access-controlled, and validated in production and MCP/live preview.

This document outlines the API endpoints available in the HRMS Next.js application for backend developers.

## Authentication
All endpoints require authentication using NextAuth.js. The session token should be included in the request headers.

## Employee Management (Admin)

### GET /api/admin/employees
Retrieves a list of all employees.
- **Method:** `GET`
- **URL:** `/api/admin/employees`
- **Authentication:** Admin required
- **Request Body:** None
- **Response:**
  - **Status:** `200 OK`
  - **Body:** Array of employee objects:
```json
[
  {
    "id": "EMP00123",
    "userId": "EMP00123",
    "firstName": "Sarah",
    "lastName": "Chen",
    "name": "Sarah Chen",
    "email": "sarah.chen@example.com",
    "department": "Engineering",
    "role": "employee",
    "reportingManager": "John Doe",
    "status": "active",
    "state": "Selangor",
    "gender": "Female",
    "race": "Chinese"
  }
]
```
- **Error Response:**
  - **Status:** `401 Unauthorized`
  - **Body:** `{ "error": "Unauthorized" }`
  - **Status:** `500 Internal Server Error`
  - **Body:** `{ "error": "Internal server error" }`

### POST /api/admin/employees
Creates a new employee.
- **Method:** `POST`
- **URL:** `/api/admin/employees`
- **Authentication:** Admin required
- **Request Body:**
```json
{
  "userId": "EMP00155",
  "firstName": "Michael",
  "lastName": "Johnson",
  "email": "michael.johnson@example.com",
  "department": "Engineering",
  "role": "employee",
  "reportingManager": "John Doe",
  "status": "active",
  "state": "Selangor",
  "gender": "Male",
  "race": "Malay",
  "initialPassword": "password123"
}
```
- **Response:**
  - **Status:** `201 Created`
  - **Body:** `{ "success": true, "employee": { ...employeeObject } }`
- **Error Response:**
  - **Status:** `400 Bad Request`
  - **Body:** `{ "success": false, "message": "Validation error", "errors": { ... } }`
  - **Status:** `401 Unauthorized`
  - **Body:** `{ "error": "Unauthorized" }`
  - **Status:** `500 Internal Server Error`
  - **Body:** `{ "error": "Internal server error" }`

### GET /api/admin/employees/[id]
Retrieves details for a single employee.
- **Method:** `GET`
- **URL:** `/api/admin/employees/[id]`
- **Authentication:** Admin required
- **Request Body:** None
- **Response:**
  - **Status:** `200 OK`
  - **Body:** Employee object (see above)
- **Error Response:**
  - **Status:** `404 Not Found`
  - **Body:** `{ "error": "Employee not found" }`
  - **Status:** `401 Unauthorized`
  - **Body:** `{ "error": "Unauthorized" }`
  - **Status:** `500 Internal Server Error`
  - **Body:** `{ "error": "Internal server error" }`

### PUT /api/admin/employees/[id]
Updates an existing employee.
- **Method:** `PUT`
- **URL:** `/api/admin/employees/[id]`
- **Authentication:** Admin required
- **Request Body:**
```json
{
  "firstName": "Sarah",
  "lastName": "Chen",
  "email": "sarah.chen@example.com",
  "department": "Engineering",
  "role": "employee",
  "reportingManager": "John Doe",
  "status": "active",
  "state": "Selangor",
  "gender": "Female",
  "race": "Chinese"
}
```
- **Response:**
  - **Status:** `200 OK`
  - **Body:** `{ "success": true, "employee": { ...updatedEmployeeObject } }`
- **Error Response:**
  - **Status:** `400 Bad Request`
  - **Body:** `{ "success": false, "message": "Validation error", "errors": { ... } }`
  - **Status:** `404 Not Found`
  - **Body:** `{ "error": "Employee not found" }`
  - **Status:** `401 Unauthorized`
  - **Body:** `{ "error": "Unauthorized" }`
  - **Status:** `500 Internal Server Error`
  - **Body:** `{ "error": "Internal server error" }`

### DELETE /api/admin/employees/[id]
Deletes an employee.
- **Method:** `DELETE`
- **URL:** `/api/admin/employees/[id]`
- **Authentication:** Admin required
- **Request Body:** None
- **Response:**
  - **Status:** `200 OK`
  - **Body:** `{ "success": true, "message": "Employee deleted" }`
- **Error Response:**
  - **Status:** `404 Not Found`
  - **Body:** `{ "error": "Employee not found" }`
  - **Status:** `401 Unauthorized`
  - **Body:** `{ "error": "Unauthorized" }`
  - **Status:** `500 Internal Server Error`
  - **Body:** `{ "error": "Internal server error" }`

## Leave Management

### GET /api/leave/balance

Retrieves the leave balance for the currently authenticated user.

- **Method:** `GET`
- **URL:** `/api/leave/balance`
- **Authentication:** Required (handled by NextAuth.js middleware)
- **Request Body:** None
- **Response:**
  - **Status:** `200 OK`
  - **Body:**
    ```json
    {
      "cards": [
        {
          "type": "annual",
          "icon": "fas fa-plane-departure",
          "iconBgColor": "bg-blue-100",
          "iconTextColor": "text-blue-600",
          "entitled": 18,
          "taken": 5,
          "pending": 3,
          "available": 10,
          "isAvailable": true
        },
        ...
      ],
      "breakdown": [...],
      "policyInfo": {...}
    }
    ```
  - The main leave balance data is in the `cards` array. Each card is a `LeaveBalanceCard` object.
  - **Note:** Consumers (forms, UI) should extract balances from `cards`, e.g. `cards.find(card => card.type === 'annual')`.
- **Frontend Fallback Logic:**
  - If the API is unavailable or returns an error, the UI will fallback to mock leave balance data and display a visible warning to the user. This ensures the page remains functional for demo/testing even if the backend is down.

### POST /api/leave/apply

Submits a new leave application for the currently authenticated user.

- **Method:** `POST`
- **URL:** `/api/leave/apply`
- **Authentication:** Required (handled by NextAuth.js middleware)
- **Request Body:** `multipart/form-data` (for file uploads)

#### Fields:
- `leaveType` (string, required): One of ['annual', 'sick', 'emergency', 'unpaid', 'maternity', 'paternity', 'study', 'compassionate']
- `startDate` (string, required): ISO date (YYYY-MM-DD)
- `endDate` (string, required): ISO date (YYYY-MM-DD)
- `halfDay` (string, required): 'none' | 'firstHalf' | 'secondHalf'
- `reason` (string, required): Reason for leave
- `documents` (file[], optional): Array of files (PDF, JPG, PNG, max 5MB each, up to 5 files)

#### Example Request (multipart/form-data)
```
{
  leaveType: 'annual',
  startDate: '2024-07-01',
  endDate: '2024-07-03',
  halfDay: 'none',
  reason: 'Family vacation',
  documents: [<file1.pdf>, <file2.jpg>]
}
```

#### Response
- **Success:**
  - `200 OK`
  - Body: `{ success: true, message: 'Leave application submitted', leaveId: '...' }`
- **Validation Error:**
  - `400 Bad Request`
  - Body: `{ success: false, message: 'Validation error', errors: { ... } }`
- **Server/Error:**
  - `500 Internal Server Error`
  - Body: `{ success: false, message: 'Something went wrong' }`
- **Frontend Fallback Logic:**
  - If the API is unavailable or returns an error, the UI will simulate a successful leave application (mock fallback) and display a visible warning to the user. This ensures the user experience is not blocked during backend outages or demo/testing.

#### Validation Rules
- All required fields must be present
- `endDate` must be >= `startDate`
- File types: PDF, JPG, PNG only
- File size: max 5MB per file, up to 5 files

#### Notes
- Approver and leave balance will be determined server-side based on user session and leave type
- On success, the backend should trigger notifications to the approver
- The endpoint should be protected (authenticated users only)

### PATCH /api/leave/apply/[id]

Cancels a pending leave application for the currently authenticated user by updating its status to 'cancelled'.

- **Method:** `PATCH`
- **URL:** `/api/leave/apply/[id]`
- **Authentication:** Required (handled by NextAuth.js middleware)
- **Request Body:**
```json
{
  "status": "cancelled"
}
```
- **Response:**
  - **Success:**
    - `200 OK`
    - Body: `{ "success": true, "message": "Leave application cancelled", "leaveId": "..." }`
  - **Validation/Error:**
    - `400 Bad Request` (e.g., not pending, not owned by user, invalid status)
    - Body: `{ "success": false, "message": "Cannot cancel leave application" }`
  - **Not Found:**
    - `404 Not Found` (leave not found)
    - Body: `{ "success": false, "message": "Leave application not found" }`
  - **Unauthorized:**
    - `401 Unauthorized`
    - Body: `{ "error": "Unauthorized" }`
  - **Server/Error:**
    - `500 Internal Server Error`
    - Body: `{ "success": false, "message": "Something went wrong" }`

#### Validation Rules
- Only the owner of the leave application can cancel it.
- Only leave applications with status 'pending' can be cancelled.
- The status in the request body must be 'cancelled'.
- The leave record is not deleted, only its status is updated.

#### Notes
- This endpoint is for marking a leave as 'cancelled' for audit/history. The record remains in the system.
- On success, the backend should trigger notifications to the approver (optional).

## Notes for Backend Implementation
1. All dates should be handled in ISO 8601 format
2. File uploads should be handled using multipart/form-data
3. Implement proper validation for:
   - Date ranges (start date must be before end date)
   - Leave balance availability
   - Required documents for specific leave types
   - Half-day period when unit is 'half_day'
4. Consider implementing rate limiting for API endpoints
5. Add proper logging for debugging and monitoring
6. Implement proper error handling and validation
7. Consider adding pagination for list endpoints
8. Add proper documentation for each endpoint
9. Implement proper security measures
10. Add proper testing for each endpoint

### GET /api/manager/team/approvals

Retrieves a list of team leave requests for the manager (prototype, mock data only).

- **Method:** `GET`
- **URL:** `/api/manager/team/approvals`
- **Authentication:** None (prototype only)
- **Request Body:** None
- **Response:**
  - **Status:** `200 OK`
  - **Body:** Array of leave request objects:
```json
[
  {
    "id": "emp00123-1",
    "employee": {
      "name": "Sarah Chen",
      "id": "EMP00123",
      "avatar": "https://via.placeholder.com/40x40?text=SC"
    },
    "type": "Annual Leave",
    "dates": "May 22 - May 24, 2025",
    "duration": "3 Days",
    "reason": "Personal trip to visit family for a wedding.",
    "submitted": "May 10, 2025",
    "balance": "10 Days AL",
    "status": "Pending"
  }
]
```
- **Error Response:**
  - **Status:** `405 Method Not Allowed`
  - **Body:** `{ message: string }`

### POST /api/manager/team/approvals/[id]

Approve or reject a leave request (prototype, mock only).

- **Method:** `POST`
- **URL:** `/api/manager/team/approvals/[id]`
- **Authentication:** None (prototype only)
- **Request Body:**
```json
{
  "action": "approve" // or "reject"
}
```
- **Response:**
  - **Status:** `200 OK`
  - **Body:** `{ success: true, status: "Approved" }` or `{ success: true, status: "Rejected" }`
- **Error Response:**
  - **Status:** `400 Bad Request`
  - **Body:** `{ success: false, message: string }`
- **Status:** `405 Method Not Allowed`
- **Body:** `{ message: string }`

> **Note:** These endpoints are for prototype/demo only and do not persist data or require authentication.

## Performance Reviews (Manager)

### GET /api/manager/performance/cycles
Retrieves a list of performance review cycles for the manager (prototype, mock data only).
- **Method:** `GET`
- **URL:** `/api/manager/performance/cycles`
- **Authentication:** None (prototype only)
- **Request Body:** None
- **Response:**
  - **Status:** `200 OK`
  - **Body:** Array of review cycle objects:
```json
[
  {
    "id": "cycle-1",
    "name": "2024 Mid-Year Review",
    "period": "Jan 2024 - Jun 2024",
    "status": "Open"
  },
  {
    "id": "cycle-2",
    "name": "2023 Year-End Review",
    "period": "Jul 2023 - Dec 2023",
    "status": "Closed"
  }
]
```
- **Error Response:**
  - **Status:** `405 Method Not Allowed`
  - **Body:** `{ message: string }`

### GET /api/manager/performance/reviews
Retrieves a list of performance reviews for the manager's team (prototype, mock data only).
- **Method:** `GET`
- **URL:** `/api/manager/performance/reviews`
- **Authentication:** None (prototype only)
- **Request Body:** None
- **Response:**
  - **Status:** `200 OK`
  - **Body:** Array of review objects:
```json
[
  {
    "id": "hist-1",
    "employee": "Alice Johnson",
    "cycle": "2023 Year-End Review",
    "feedback": "Consistently exceeded expectations.",
    "rating": 5,
    "date": "2024-01-15"
  }
]
```
- **Error Response:**
  - **Status:** `405 Method Not Allowed`
  - **Body:** `{ message: string }`

### POST /api/manager/performance/review
Submits a new performance review for an employee (prototype, mock only).
- **Method:** `POST`
- **URL:** `/api/manager/performance/review`
- **Authentication:** None (prototype only)
- **Request Body:**
```json
{
  "employee": "Alice Johnson",
  "cycle": "2024 Mid-Year Review",
  "feedback": "Great progress on goals.",
  "rating": 5
}
```
- **Response:**
  - **Status:** `200 OK`
  - **Body:** `{ success: true, message: "Review submitted" }`
- **Error Response:**
  - **Status:** `400 Bad Request`
  - **Body:** `{ success: false, message: string }`
  - **Status:** `405 Method Not Allowed`
  - **Body:** `{ message: string }`

> **Note:** These endpoints are for prototype/demo only and do not persist data or require authentication.

### GET /api/leave/summary

Retrieves a summary of leave records for the authenticated user or manager's team (prototype, mock data only).

- **Method:** `GET`
- **URL:** `/api/leave/summary`
- **Authentication:** Required (handled by NextAuth.js middleware)
- **Query Parameters:**
  - `status` (string, optional): Filter by leave status (e.g., 'approved', 'pending')
  - `type` (string, optional): Filter by leave type (e.g., 'annual', 'sick')
  - `fromDate` (string, optional): Filter by start date (YYYY-MM-DD)
  - `toDate` (string, optional): Filter by end date (YYYY-MM-DD)
- **Response:**
  - **Status:** `200 OK`
  - **Body:**
```json
{
  "leaves": [
    {
      "id": "1",
      "type": "annual",
      "startDate": "2024-03-01T00:00:00.000Z",
      "endDate": "2024-03-05T00:00:00.000Z",
      "duration": 5,
      "reason": "Family vacation",
      "status": "approved",
      "submittedAt": "2024-02-15T00:00:00.000Z",
      "approverId": "HR001",
      "approvedAt": "2024-02-16T00:00:00.000Z"
    }
  ],
  "total": 1
}
```
- **Note:** The mock data does **not** include employee names, so the UI will display 'N/A' for employee in the leave reports table.
- **Error Response:**
  - **Status:** `401 Unauthorized`
  - **Body:** `{ "error": "Unauthorized" }`
  - **Status:** `500 Internal Server Error`
  - **Body:** `{ "error": "Internal server error" }`

### Attendance Reports API

- **Not yet implemented.** The attendance report tab is currently hidden in the UI.

## Manager Section API Integration (Frontend)

All manager features (Leave Approvals, Team Management, Performance Reviews, Reports) are now integrated on the frontend to use real API endpoints. If the backend is unavailable, the UI gracefully falls back to mock data and displays a warning. All error, loading, and fallback states are handled for a robust user experience.

- **Leave Approvals:** `/api/manager/team/approvals`
- **Team Management:** `/api/manager/team`
- **Performance Reviews:** `/api/manager/performance/cycles`, `/api/manager/performance/reviews`, `/api/manager/performance/review`
- **Reports:** `/api/leave/summary`, `/api/manager/performance/reviews`

See each section above for request/response details and error handling.

### Personal Calendar (Employee/Manager)

Displays a calendar of leave events and public holidays for the current user.

- **Frontend API Integration:**
  - Fetches leave events from `/api/leave/summary`.
  - Maps leave records to calendar events by date.
- **Frontend Fallback Logic:**
  - If the API is unavailable, returns an error, or does not provide any events for 2025, the UI falls back to local mock data (including Malaysian Public Holidays) and displays a visible warning.
  - This ensures the calendar is always populated for demo/testing, even if the backend is down or has no relevant data.

## Leave Policy Management (Admin)

### GET /api/admin/policies
Retrieves a list of all leave policies.
- **Method:** `GET`
- **URL:** `/api/admin/policies`
- **Authentication:** Admin required
- **Request Body:** None
- **Response:**
  - **Status:** `200 OK`
  - **Body:** Array of leave policy objects:
```json
[
  {
    "id": "annual_leave",
    "name": "Annual Leave",
    "description": "Paid time off for vacation and personal needs. Accrues based on years of service.",
    "keyEntitlementRule": "14-25 days/year based on tenure",
    "status": "active",
    "lastUpdated": "2025-03-15",
    "entitlement": "1-3 Years Service: 14 days/year. 4-7 Years Service: 18 days/year. 8+ Years Service: 22 days/year. Pro-rated for new hires.",
    "conditions": "Must be applied for at least 2 weeks in advance, unless for urgent matters. Minimum 0.5 day application. Subject to manager approval and team schedule.",
    "documentation": "No specific documents required for standard annual leave."
  }
]
```
- **Error Response:**
  - **Status:** `401 Unauthorized`
  - **Body:** `{ "error": "Unauthorized" }`
  - **Status:** `500 Internal Server Error`
  - **Body:** `{ "error": "Internal server error" }`

### POST /api/admin/policies
Creates a new leave policy.
- **Method:** `POST`
- **URL:** `/api/admin/policies`
- **Authentication:** Admin required
- **Request Body:**
```json
{
  "name": "Special Leave",
  "description": "Special leave for unique circumstances.",
  "keyEntitlementRule": "Up to 5 days/year",
  "status": "active",
  "lastUpdated": "2025-06-01",
  "entitlement": "Up to 5 days per year, subject to approval.",
  "conditions": "Must be approved by HR.",
  "documentation": "Supporting documents required."
}
```
- **Response:**
  - **Status:** `201 Created`
  - **Body:** The created leave policy object
- **Error Response:**
  - **Status:** `400 Bad Request`
  - **Body:** `{ "error": "Validation error" }`
  - **Status:** `401 Unauthorized`
  - **Body:** `{ "error": "Unauthorized" }`
  - **Status:** `500 Internal Server Error`
  - **Body:** `{ "error": "Internal server error" }`

### PUT /api/admin/policies
Updates an existing leave policy.
- **Method:** `PUT`
- **URL:** `/api/admin/policies`
- **Authentication:** Admin required
- **Request Body:**
```json
{
  "id": "annual_leave",
  "name": "Annual Leave",
  "description": "Updated description...",
  "keyEntitlementRule": "14-25 days/year based on tenure",
  "status": "active",
  "lastUpdated": "2025-06-01",
  "entitlement": "...",
  "conditions": "...",
  "documentation": "..."
}
```
- **Response:**
  - **Status:** `200 OK`
  - **Body:** The updated leave policy object
- **Error Response:**
  - **Status:** `404 Not Found`
  - **Body:** `{ "error": "Policy not found" }`
  - **Status:** `400 Bad Request`
  - **Body:** `{ "error": "Validation error" }`
  - **Status:** `401 Unauthorized`
  - **Body:** `{ "error": "Unauthorized" }`
  - **Status:** `500 Internal Server Error`
  - **Body:** `{ "error": "Internal server error" }`

### DELETE /api/admin/policies
Deletes a leave policy.
- **Method:** `DELETE`
- **URL:** `/api/admin/policies`
- **Authentication:** Admin required
- **Request Body:**
```json
{
  "id": "annual_leave"
}
```
- **Response:**
  - **Status:** `200 OK`
  - **Body:** `{ "success": true }`
- **Error Response:**
  - **Status:** `404 Not Found`
  - **Body:** `{ "error": "Policy not found" }`
  - **Status:** `401 Unauthorized`
  - **Body:** `{ "error": "Unauthorized" }`
  - **Status:** `500 Internal Server Error`
  - **Body:** `{ "error": "Internal server error" }`

### GET /api/admin/reports/leave-balance

Retrieves leave balance data for all employees (admin only).
- **Method:** `GET`
- **URL:** `/api/admin/reports/leave-balance`
- **Authentication:** Admin required
- **Query Parameters:**
  - `department` (string, optional): Filter by department
  - `employee` (string, optional): Filter by employee name or ID
  - `leaveType` (string, optional): Filter by leave type
  - `fromDate` (string, optional): Filter by start date (YYYY-MM-DD, ignored in mock)
  - `toDate` (string, optional): Filter by end date (YYYY-MM-DD, ignored in mock)
- **Response:**
  - **Status:** `200 OK`
  - **Body:** Array of leave balance objects:
```json
[
  {
    "id": "EMP00123",
    "name": "Sarah Chen",
    "department": "Engineering",
    "leaveType": "Annual Leave",
    "entitled": 20,
    "taken": 5,
    "pending": 3,
    "available": 12
  }
]
```
- **Error Response:**
  - **Status:** `401 Unauthorized`
  - **Body:** `{ "error": "Unauthorized" }`
  - **Status:** `500 Internal Server Error`
  - **Body:** `{ "error": "Internal server error" }`

### GET /api/admin/reports/leave-history
- **Description:** Returns leave history records for all employees, filterable by department, employee, leave status, and date range. Used for the Leave History Report in the admin module.
- **Query Parameters:**
  - `department` (string, optional): Department name or 'All Departments'
  - `employee` (string, optional): Employee name or ID (partial match)
  - `leaveStatus` (string, optional): One of 'All Statuses', 'Approved', 'Pending', 'Rejected', 'Cancelled'
  - `startDate` (string, optional): ISO date (YYYY-MM-DD)
  - `endDate` (string, optional): ISO date (YYYY-MM-DD)
- **Response:** `200 OK`
  - JSON array of leave history records:
    ```json
    [
      {
        "id": "LVE-SC002",
        "name": "Sarah Chen",
        "department": "Engineering",
        "leaveType": "Sick Leave",
        "dates": "2025-04-15",
        "duration": "1 Day",
        "status": "Approved",
        "submitted": "2025-04-14"
      },
      ...
    ]
    ```
- **Fallback:** If the API fails or returns invalid data, the frontend will fallback to mock data and show a warning/notification.

### GET /api/admin/reports/leave-utilization
- **Description:** Returns leave utilization records, filterable by department, leave type, and reporting period. Used for the Leave Utilization Report in the admin module.
- **Query Parameters:**
  - `department` (string, optional): Department name or 'All Departments'
  - `leaveType` (string, optional): Leave type or 'All Leave Types'
  - `periodStart` (string, optional): ISO date (YYYY-MM-DD)
  - `periodEnd` (string, optional): ISO date (YYYY-MM-DD)
- **Response:** `200 OK`
  - JSON array of utilization records:
    ```json
    [
      {
        "department": "Engineering",
        "leaveType": "Annual Leave",
        "totalDays": 42,
        "numEmployees": 12,
        "avgDays": 3.5
      },
      ...
    ]
    ```
- **Fallback:** If the API fails or returns invalid data, the frontend will fallback to mock data and show a warning/notification.

### GET /api/admin/reports/upcoming-leaves
- **Description:** Returns upcoming leave records, filterable by department, employee, and date range. Used for the Upcoming Leaves Report in the admin module.
- **Query Parameters:**
  - `department` (string, optional): Department name or 'All Departments'
  - `employee` (string, optional): Employee name (partial match)
  - `dateStart` (string, optional): ISO date (YYYY-MM-DD)
  - `dateEnd` (string, optional): ISO date (YYYY-MM-DD)
- **Response:** `200 OK`
  - JSON array of upcoming leave records:
    ```json
    [
      {
        "name": "Sarah Chen",
        "department": "Engineering",
        "leaveType": "Annual Leave",
        "startDate": "2025-07-01",
        "endDate": "2025-07-05",
        "duration": 5
      },
      ...
    ]
    ```
- **Fallback:** If the API fails or returns invalid data, the frontend will fallback to mock data and show a warning/notification.

## Admin Reports & Analytics (UI/UX & API Integration Update)

All admin report endpoints below are fully integrated with the frontend. The UI for all report filters (including date, week, month, year fields) is now visually modern, mobile-optimized, and accessible. A shared filter form component is used for all reports, ensuring consistency and maintainability. If the API is unavailable or returns invalid data, the frontend falls back to mock data and displays a visible warning. All error, loading, and fallback states are handled for a robust user experience.

- `/api/admin/reports/leave-balance` (GET): Leave Balance Report (filter: department, employee, leave type, period)
- `/api/admin/reports/leave-history` (GET): Leave History Report (filter: department, employee, leave status, period)
- `/api/admin/reports/leave-utilization` (GET): Leave Utilization Report (filter: department, leave type, period)
- `/api/admin/reports/upcoming-leaves` (GET): Upcoming Leaves Report (filter: department, employee, date range)

**Frontend UI/UX Improvements:**
- All filter forms use a modern, card-like design with large touch targets, teal focus, and custom dropdowns.
- Date, week, month, and year fields are visually consistent and mobile-optimized.
- Buttons are pill-shaped, bold, and responsive.
- Accessibility and color contrast are improved throughout.
- All reports support export to CSV, print, and robust fallback logic.

## System Settings (Admin)

### GET /api/admin/settings
Retrieves the current system settings (company info, leave year, working days, global blackout dates, leave settings, notification settings).
- **Method:** `GET`
- **URL:** `/api/admin/settings`
- **Authentication:** Admin required
- **Request Body:** None
- **Response:**
  - **Status:** `200 OK`
  - **Body:**
```json
{
  "companyName": "Acme Corp",
  "leaveYearStart": "2024-01-01",
  "workingDays": [1,2,3,4,5],
  "blackoutDates": ["2024-12-25", "2024-12-31"],
  "leaveSettings": {
    "approvalWorkflow": "Manager → HR",
    "minNoticeDays": 2,
    "halfDayAllowed": true,
    "sickLeaveAttachmentRequired": true
  },
  "notificationSettings": {
    "emailEnabled": false,
    "inAppEnabled": true,
    "smsEnabled": false
  }
}
```
- **Error Response:**
  - **Status:** `401 Unauthorized`
  - **Body:** `{ "error": "Unauthorized" }`
  - **Status:** `500 Internal Server Error`
  - **Body:** `{ "error": "Internal server error" }`

### PUT /api/admin/settings
Updates the system settings. Accepts a partial or full settings object. (In-memory only for now, ready for DB integration.)
- **Method:** `PUT`
- **URL:** `/api/admin/settings`
- **Authentication:** Admin required
- **Request Body:**
```json
{
  "companyName": "Acme Corp",
  "leaveYearStart": "2024-01-01",
  "workingDays": [1,2,3,4,5],
  "blackoutDates": ["2024-12-25", "2024-12-31"],
  "leaveSettings": {
    "approvalWorkflow": "Manager → HR",
    "minNoticeDays": 2,
    "halfDayAllowed": true,
    "sickLeaveAttachmentRequired": true
  },
  "notificationSettings": {
    "emailEnabled": false,
    "inAppEnabled": true,
    "smsEnabled": false
  }
}
```
- **Response:**
  - **Status:** `200 OK`
  - **Body:** The updated settings object
- **Error Response:**
  - **Status:** `401 Unauthorized`
  - **Body:** `{ "error": "Unauthorized" }`
  - **Status:** `500 Internal Server Error`
  - **Body:** `{ "error": "Internal server error" }`

#### Fallback Logic
- If the API is unavailable or returns an error, the frontend falls back to mock settings data and displays a visible warning. This ensures the settings page remains functional for demo/testing even if the backend is down.
- **Note:** Endpoint is ready for real DB integration.

### GET /api/admin/activity-logs
Retrieves a list of system activity logs (audit logs) for admin users.
- **Method:** `GET`
- **URL:** `/api/admin/activity-logs`
- **Authentication:** Admin required
- **Query Parameters:**
  - `user` (string, optional): Filter by user name
  - `action` (string, optional): Filter by action type
  - `status` (string, optional): Filter by status (e.g., Success, Failure)
  - `search` (string, optional): Free-text search across all fields
  - `page` (number, optional): Page number (default: 1)
  - `pageSize` (number, optional): Results per page (default: 5)
- **Response:**
  - **Status:** `200 OK`
  - **Body:**
    ```json
    {
      "logs": [
        {
          "timestamp": "2025-06-01T09:15:00Z",
          "user": "Emily Carter",
          "email": "emily.carter@acme.com",
          "role": "HR Admin",
          "action": "Created Employee",
          "target": "David Lee (EMP00153)",
          "status": "Success",
          "details": "Initial onboarding, department: Engineering"
        }
      ],
      "total": 6
    }
    ```
- **Error Response:**
  - **Status:** `500 Internal Server Error`
  - **Body:** `{ "error": "Simulated backend failure" }`
- **Fallback Logic:**
  - If the API is unavailable or returns an error, the frontend falls back to mock data and displays a visible warning. All filtering, search, and pagination are supported in the fallback.
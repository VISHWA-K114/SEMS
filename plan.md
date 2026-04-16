# plan.md

## Project
**Smart Employee Management System with Secure Role-Based Access**

## Objective
Build an internship-ready full-stack employee management application using free tools and services. The system must support secure authentication, employee CRUD, department management, leave workflows, role-based access control, dashboard analytics, file upload, audit logs, exports, testing, and deployment.

---

## Stack
### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- Express.js
- Mongoose

### Database
- MongoDB Atlas

### Security
- JWT
- bcrypt
- helmet
- express-rate-limit
- dotenv
- CORS

### Upload
- Cloudinary
- multer

### Testing
- Postman
- Playwright

### Deployment
- Vercel
- Render

### Version control
- GitHub
- GitHub Actions

---

## Folder structure

```text
smart-employee-management-system/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── layout/
│   │   │   ├── forms/
│   │   │   ├── tables/
│   │   │   └── charts/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── employees/
│   │   │   ├── departments/
│   │   │   ├── leave/
│   │   │   └── profile/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validations/
│   │   ├── app.js
│   │   └── server.js
│   ├── package.json
│   └── .env
├── docs/
├── README.md
├── plan.md
└── prompt.md
```

---

## Phase board

### Phase 1 — Setup and authentication
**Goal:** Establish the project foundation and secure authentication.

#### Tasks
- [x] Create root project folder
- [x] Create `client`, `server`, and `docs`
- [x] Initialize Git
- [x] Create frontend with Vite
- [x] Install Tailwind CSS
- [x] Initialize backend with Express
- [x] Install backend dependencies
- [x] Configure MongoDB connection
- [x] Create `User` model
- [x] Implement register API
- [x] Implement login API
- [x] Add bcrypt password hashing
- [x] Add JWT token generation
- [x] Add auth middleware
- [x] Add protected backend route
- [x] Create frontend login page
- [x] Create frontend register page
- [x] Save token after login
- [x] Protect frontend routes
- [x] Verify login flow

#### Deliverable
A user can register, log in, receive a JWT, and access protected routes.

---

### Phase 2 — Employee CRUD ✅
**Goal:** Build the employee management core.

#### Tasks
- [x] Create `Employee` model
- [x] Create employee validation rules
- [x] Implement create employee API
- [x] Implement list employees API
- [x] Implement get employee by ID API
- [x] Implement update employee API
- [x] Implement delete employee API
- [x] Add error handling middleware
- [x] Create employee list page
- [x] Create add employee page
- [x] Create edit employee page
- [x] Create employee detail page
- [x] Connect frontend forms to APIs
- [x] Add loading, success, and error states

#### Deliverable
Admin can create, view, update, and delete employee records from the UI.

---

### Phase 3 — Departments, search, filter, sort, pagination ✅
**Goal:** Make the employee module usable and scalable.

#### Tasks
- [x] Create `Department` model
- [x] Implement department CRUD APIs
- [x] Add department management page
- [x] Add employee search by name/email
- [x] Add filtering by department
- [x] Add filtering by role
- [x] Add filtering by status
- [x] Add sorting by name/date
- [x] Add pagination to employee list
- [x] Improve admin table layout

#### Deliverable
Employee records can be searched, filtered, sorted, and paginated.

#### Deliverable
Employee records can be searched, filtered, sorted, and paginated.

---

### Phase 4 — RBAC, profile upload, leave module ✅
**Goal:** Add practical business workflows and enforce permissions.
**Goal:** Add practical business workflows and enforce permissions.

#### Tasks
- [x] Create role middleware
- [x] Restrict admin routes
- [x] Restrict HR routes
- [x] Restrict employee routes
- [x] Hide unauthorized UI actions
- [x] Set up Cloudinary config
- [x] Add profile photo upload API
- [x] Add image upload UI
- [x] Create `Leave` model
- [x] Implement apply leave API
- [x] Implement leave list API
- [x] Implement my leave history API
- [x] Implement approve leave API
- [x] Implement reject leave API
- [x] Create leave apply page
- [x] Create leave approval page
- [x] Create leave history page

#### Deliverable
Roles are enforced, profile upload works, and leave workflow is functional.

---

### Phase 5 — Audit, analytics, export, testing, deployment
**Goal:** Finish the project properly and make it demo-ready.

#### Tasks
- [x] Create `AuditLog` model
- [x] Log major actions
- [x] Build dashboard summary APIs
- [x] Build chart-ready analytics APIs
- [x] Create dashboard UI cards
- [x] Add charts to dashboard (Bar, Pie, Line via Recharts)
- [x] Export employee data to Excel
- [x] Export employee data to CSV
- [ ] Build Postman collection
- [ ] Write Playwright tests
- [ ] Prepare frontend deployment
- [ ] Prepare backend deployment
- [ ] Add GitHub Actions workflow
- [ ] Finalize environment variable documentation
- [x] Final review and cleanup

#### Deliverable
The application is tested, documented, exported, and deployable.

---

## Database schema

### users
- `_id`
- `fullName`
- `email`
- `password`
- `role`
- `employeeId`
- `isActive`
- `lastLogin`
- `createdAt`
- `updatedAt`

### employees
- `_id`
- `employeeCode`
- `fullName`
- `email`
- `phone`
- `gender`
- `dateOfBirth`
- `departmentId`
- `jobTitle`
- `role`
- `joiningDate`
- `employmentStatus`
- `profilePhoto`
- `address`
- `salary`
- `createdBy`
- `updatedBy`
- `createdAt`
- `updatedAt`

### departments
- `_id`
- `name`
- `description`
- `status`
- `createdAt`
- `updatedAt`

### leaves
- `_id`
- `employeeId`
- `leaveType`
- `startDate`
- `endDate`
- `reason`
- `status`
- `appliedAt`
- `reviewedBy`
- `reviewedAt`
- `reviewComment`
- `createdAt`
- `updatedAt`

### audit_logs
- `_id`
- `userId`
- `action`
- `module`
- `targetId`
- `description`
- `ipAddress`
- `createdAt`

---

## API map

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Employees
- `POST /api/employees`
- `GET /api/employees`
- `GET /api/employees/:id`
- `PUT /api/employees/:id`
- `DELETE /api/employees/:id`
- `GET /api/employees/profile/me`

### Departments
- `POST /api/departments`
- `GET /api/departments`
- `GET /api/departments/:id`
- `PUT /api/departments/:id`
- `DELETE /api/departments/:id`

### Leaves
- `POST /api/leaves`
- `GET /api/leaves`
- `GET /api/leaves/my`
- `GET /api/leaves/:id`
- `PATCH /api/leaves/:id/approve`
- `PATCH /api/leaves/:id/reject`

### Dashboard
- `GET /api/dashboard/summary`
- `GET /api/dashboard/employees-by-department`
- `GET /api/dashboard/leave-summary`
- `GET /api/dashboard/employee-status-summary`

### Upload
- `POST /api/upload/profile-photo`

### Audit logs
- `GET /api/audit-logs`
- `GET /api/audit-logs/:id`

---

## Daily execution rule
For each phase:
1. install only the needed packages
2. build backend first
3. test backend
4. connect frontend
5. verify manually
6. update docs
7. save all files inside the project folder

---

## Progress log
### Current status
- [x] Not started
- [x] Phase 1 in progress
- [x] Phase 1 completed ✅ — 2026-04-14
- [x] Phase 2 completed ✅ — 2026-04-14
- [x] Phase 3 completed ✅ — 2026-04-15
- [x] Premium Enterprise UI Redesign (Josefin Sans, functional cards) ✅ — 2026-04-15
- [x] Phase 4 completed ✅ — 2026-04-16
- [x] Extra Admin Support & Staff Seeding ✅ — 2026-04-16
- [x] Phase 5 completed ✅ — 2026-04-16 (Audit Logs, Dashboard Charts, CSV/Excel Export)


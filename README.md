# Smart Employee Management System with Secure Role-Based Access

A full-stack internship project built phase by phase using free tools and services. This application is designed to demonstrate practical software engineering skills: authentication, employee CRUD, role-based access, leave workflows, analytics, audit logs, testing, and deployment.

---

## Project summary
This system allows:
- secure login and registration
- admin and HR employee management
- department and role management
- search, filter, sort, and pagination
- profile photo upload
- leave application and approval
- role-based access control
- audit logging
- dashboard analytics
- PDF/Excel export
- responsive UI

---

## Recommended stack

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
- MongoDB Atlas free tier

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

---

## Project structure

```text
smart-employee-management-system/
├── client/
├── server/
├── docs/
├── README.md
├── plan.md
└── prompt.md
```

---

## Setup flow for Antigravity

Antigravity should use this order:

1. inspect current folder
2. create missing folders
3. initialize frontend and backend
4. install required dependencies
5. save all generated files inside this project folder
6. complete one phase at a time
7. verify each phase before moving on
8. update `README.md` and `plan.md` after each phase

---

## Installation requirements

### Root
Typical tools needed on the machine:
- Node.js LTS
- npm
- Git
- MongoDB Atlas account
- Cloudinary account
- Vercel account
- Render account

### Backend packages
Typical server dependencies:
- express
- mongoose
- cors
- dotenv
- bcryptjs
- jsonwebtoken
- multer
- cloudinary
- helmet
- express-rate-limit

Typical dev dependencies:
- nodemon

### Frontend packages
Typical client dependencies:
- react-router-dom
- axios
- lucide-react
- recharts

Typical frontend styling/dev packages:
- tailwindcss
- postcss
- autoprefixer

### Testing packages
- @playwright/test

---

## Phase-by-phase build plan

### Phase 1 — Setup and authentication
Build:
- project structure
- frontend and backend initialization
- MongoDB connection
- user model
- register/login APIs
- JWT auth
- protected backend route
- login/register UI
- protected frontend routes

Expected result:
- user can register and log in
- protected routes work

### Phase 2 — Employee CRUD
Build:
- employee model
- CRUD APIs
- validations
- employee list, add, edit, details pages

Expected result:
- admin can manage employee records

### Phase 3 — Departments and usability
Build:
- department model and CRUD
- search
- filter
- sort
- pagination

Expected result:
- employee records are usable at scale

### Phase 4 — RBAC, upload, leave
Build:
- role middleware
- admin/HR/employee access control
- Cloudinary upload
- leave request and approval flow

Expected result:
- permissions work correctly
- leave module works
- profile upload works

### Phase 5 — Audit, analytics, export, testing, deployment
Build:
- audit logs
- analytics APIs
- dashboard cards and charts
- export to PDF/Excel
- Playwright tests
- deployment configs

Expected result:
- project is demo-ready and deployable

---

## Database collections

### users
- fullName
- email
- password
- role
- employeeId
- isActive
- lastLogin

### employees
- employeeCode
- fullName
- email
- phone
- gender
- dateOfBirth
- departmentId
- jobTitle
- role
- joiningDate
- employmentStatus
- profilePhoto
- address
- salary
- createdBy
- updatedBy

### departments
- name
- description
- status

### leaves
- employeeId
- leaveType
- startDate
- endDate
- reason
- status
- appliedAt
- reviewedBy
- reviewedAt
- reviewComment

### audit_logs
- userId
- action
- module
- targetId
- description
- ipAddress

---

## API overview

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

## Working rules
- Do not skip phases.
- Do backend first for each feature.
- Test APIs before frontend integration.
- Keep all files inside this project folder.
- Use environment variables for secrets.
- Record setup steps in documentation.
- Keep the project maintainable and demo-ready.

---

## Progress checklist

### Overall
- [x] Phase 1 complete ✅ — 2026-04-14
- [x] Phase 2 complete ✅ — 2026-04-14
- [x] Phase 3 complete ✅ — 2026-04-15
- [x] Professional Enterprise UI Redesign ✅ — 2026-04-15
- [ ] Phase 4 complete
- [ ] Phase 5 complete

### Current notes
- Phase 1 complete: auth system built and tested
- Phase 2 complete: employee CRUD system functional
- Phase 3 complete: department management and advanced filtering active
- **UI Transformation**: Successfully migrated from "Tropical Sunrise" to a **restrained, high-end "Graphite" Enterprise theme**. The design now aligns with premium SaaS standards (GitHub, Linear, Stripe).
- Backend: Express + MongoDB + JWT + bcrypt + helmet + rate-limit
- Frontend: Vite + React 18 + Tailwind CSS v3 + React Router v6
- Redesigned Components: Sidebar, Login, Register, Dashboard, Employee Directory (List/Detail/Forms), Department Units, Utility Pages.
- Phase 4 next: Role-Based Access Control and Leave Management.

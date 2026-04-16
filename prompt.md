# prompt.md

You are Antigravity, acting as a full-stack development agent inside the project folder.

Your job is to build a **Smart Employee Management System with Secure Role-Based Access** in a disciplined, phase-by-phase manner. Work only inside this project folder unless package managers need global/system access for installation. Always save generated code, configs, documentation, and progress updates inside this project.

## Core instruction
Build the project in **5 phases**, completing one phase fully before moving to the next. At the end of each phase:
1. install any missing requirements
2. save all created files inside the project folder
3. verify the phase with tests or manual checks
4. update `README.md` progress
5. update `plan.md` status board
6. commit only if Git is initialized and the user approves

Do not jump ahead to later modules unless the current phase is functionally complete.

---

## Project title
**Smart Employee Management System with Secure Role-Based Access**

## Main goal
Build a secure, maintainable, internship-ready full-stack application with:
- Admin login
- Employee record management
- Department and role management
- Search, filter, sort, pagination
- Profile photo upload
- Leave tracking
- Role-based access control
- Validation and audit logs
- Dashboard analytics
- Export to PDF/Excel
- Responsive UI

---

## Required stack
Use only free or free-tier tools.

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

### Auth and security
- JWT
- bcrypt
- dotenv
- CORS
- helmet
- express-rate-limit

### Upload
- Cloudinary free plan
- multer

### Testing
- Postman
- Playwright

### Deployment
- Vercel for frontend
- Render for backend

### Version control / automation
- Git
- GitHub
- GitHub Actions

---

## Rules for execution
- Create clean folder structure first.
- Prefer readable, maintainable code over clever code.
- Add comments only where they help.
- Use environment variables for secrets.
- Never hardcode credentials.
- Backend first for each major feature, then frontend integration.
- Test each API before connecting UI.
- Keep UI clean and professional, not overdesigned.
- Save all documentation inside `/docs` or root markdown files.
- If a dependency is missing, install it and record it in the relevant `package.json`.
- If setup fails, debug the failure before moving on.
- Keep all generated files inside the project folder.

---

## Folder structure target

```text
smart-employee-management-system/
├── client/
├── server/
├── docs/
├── README.md
├── plan.md
└── prompt.md
```

Expected substructure:

```text
client/src/
  assets/
  components/
    common/
    layout/
    forms/
    tables/
    charts/
  pages/
    auth/
    dashboard/
    employees/
    departments/
    leave/
    profile/
  routes/
  services/
  context/
  hooks/
  utils/

server/src/
  config/
  controllers/
  middleware/
  models/
  routes/
  services/
  utils/
  validations/
```

---

## Phase-by-phase execution

### Phase 1 — Setup and authentication
Complete:
- initialize project
- create `client` and `server`
- install frontend and backend requirements
- connect MongoDB
- create user model
- register API
- login API
- bcrypt password hashing
- JWT generation
- auth middleware
- protected route
- frontend login/register pages
- token storage
- protected frontend routing

Phase 1 success criteria:
- user can register
- user can login
- JWT works
- protected backend route works
- protected frontend route works

---

### Phase 2 — Employee CRUD
Complete:
- employee schema
- employee create/read/update/delete APIs
- validation
- error handling
- employee list page
- add/edit/detail views
- API integration
- status and error messages

Employee fields:
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

Phase 2 success criteria:
- admin can create, view, update, delete employees from UI

---

### Phase 3 — Departments and usability features
Complete:
- department schema
- department CRUD
- role assignment support
- employee search
- filter by department/role/status
- sorting
- pagination
- cleaner admin table UI

Phase 3 success criteria:
- employee records are searchable, filterable, sortable, and paginated

---

### Phase 4 — RBAC, upload, leave module
Complete:
- role middleware
- admin, HR, employee permission separation
- profile photo upload with Cloudinary
- leave schema
- apply leave API
- approve/reject leave API
- leave history UI
- employee self-profile page
- unauthorized access handling

Role rules:
- Admin: full access
- HR: employee management + leave approval
- Employee: own profile + own leave actions

Phase 4 success criteria:
- permissions are enforced correctly
- leave workflow works
- profile upload works

---

### Phase 5 — Audit, analytics, export, testing, deployment
Complete:
- audit log schema
- log major actions
- dashboard summary APIs
- charts
- export employee list to PDF/Excel
- Postman collection
- Playwright tests
- deploy frontend/backend
- environment variable docs
- final README cleanup

Phase 5 success criteria:
- project is runnable, testable, and deployable
- analytics and export work
- audit trail exists
- app is ready for demo

---

## Database schema to implement

### users
- fullName
- email
- password
- role
- employeeId
- isActive
- lastLogin
- timestamps

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
- timestamps

### departments
- name
- description
- status
- timestamps

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
- timestamps

### audit_logs
- userId
- action
- module
- targetId
- description
- ipAddress
- createdAt

---

## API groups to implement

### Auth
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me`

### Employees
- POST `/api/employees`
- GET `/api/employees`
- GET `/api/employees/:id`
- PUT `/api/employees/:id`
- DELETE `/api/employees/:id`
- GET `/api/employees/profile/me`

### Departments
- POST `/api/departments`
- GET `/api/departments`
- GET `/api/departments/:id`
- PUT `/api/departments/:id`
- DELETE `/api/departments/:id`

### Leaves
- POST `/api/leaves`
- GET `/api/leaves`
- GET `/api/leaves/my`
- GET `/api/leaves/:id`
- PATCH `/api/leaves/:id/approve`
- PATCH `/api/leaves/:id/reject`

### Dashboard
- GET `/api/dashboard/summary`
- GET `/api/dashboard/employees-by-department`
- GET `/api/dashboard/leave-summary`
- GET `/api/dashboard/employee-status-summary`

### Upload
- POST `/api/upload/profile-photo`

### Audit logs
- GET `/api/audit-logs`
- GET `/api/audit-logs/:id`

---

## Required output behavior
At the start of work:
- inspect current folder
- create missing folders
- install requirements
- document setup commands

At the end of every phase:
- verify what works
- list unfinished items
- update `README.md`
- update `plan.md`
- keep the project runnable

When blocked:
- explain the issue briefly
- propose the smallest fix
- apply the fix if safe

Do not produce vague summaries. Produce working files, commands, and saved code.

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GuestRoute, PrivateRoute } from './routes/ProtectedRoute';

import LoginPage          from './pages/auth/LoginPage';
import RegisterPage       from './pages/auth/RegisterPage';
import DashboardPage      from './pages/dashboard/DashboardPage';
import EmployeeListPage   from './pages/employees/EmployeeListPage';
import AddEmployeePage    from './pages/employees/AddEmployeePage';
import EditEmployeePage   from './pages/employees/EditEmployeePage';
import EmployeeDetailPage from './pages/employees/EmployeeDetailPage';
import DepartmentsPage    from './pages/departments/DepartmentsPage';
import LeaveHistoryPage  from './pages/leave/LeaveHistoryPage';
import LeaveApplyPage    from './pages/leave/LeaveApplyPage';
import LeaveApprovalPage from './pages/leave/LeaveApprovalPage';
import ProfilePage       from './pages/profile/ProfilePage';
import AuditLogPage      from './pages/audit/AuditLogPage';
import UnauthorizedPage   from './pages/UnauthorizedPage';
import NotFoundPage       from './pages/NotFoundPage';

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Guest-only routes */}
        <Route element={<GuestRoute />}>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected — all roles */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard"    element={<DashboardPage />} />
          <Route path="/profile"      element={<ProfilePage />} />
          <Route path="/leaves"       element={<LeaveHistoryPage />} />
          <Route path="/leaves/apply" element={<LeaveApplyPage />} />
        </Route>

        {/* Protected — admin + hr only */}
        <Route element={<PrivateRoute allowedRoles={['admin', 'hr']} />}>
          <Route path="/employees"            element={<EmployeeListPage />} />
          <Route path="/employees/add"        element={<AddEmployeePage />} />
          <Route path="/employees/:id"        element={<EmployeeDetailPage />} />
          <Route path="/employees/:id/edit"   element={<EditEmployeePage />} />
          <Route path="/departments"          element={<DepartmentsPage />} />
          <Route path="/leaves/approval"      element={<LeaveApprovalPage />} />
        </Route>

        {/* Protected — admin only */}
        <Route element={<PrivateRoute allowedRoles={['admin']} />}>
          <Route path="/audit-logs"           element={<AuditLogPage />} />
        </Route>

        {/* Utility pages */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*"             element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default App;

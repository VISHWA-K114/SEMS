import api from './api';

const employeeService = {
  // Create employee
  create: (data) => api.post('/employees', data).then((r) => r.data),

  // Get all employees with optional query params
  getAll: (params = {}) => api.get('/employees', { params }).then((r) => r.data),

  // Get single employee
  getById: (id) => api.get(`/employees/${id}`).then((r) => r.data),

  // Update employee
  update: (id, data) => api.put(`/employees/${id}`, data).then((r) => r.data),

  // Delete employee
  delete: (id) => api.delete(`/employees/${id}`).then((r) => r.data),

  // Get own profile
  getMyProfile: () => api.get('/employees/profile/me').then((r) => r.data),
};

export default employeeService;

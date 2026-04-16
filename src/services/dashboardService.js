import api from './api';

const dashboardService = {
  getSummary:               ()  => api.get('/dashboard/summary').then(r => r.data),
  getEmployeesByDepartment: ()  => api.get('/dashboard/employees-by-department').then(r => r.data),
  getLeaveSummary:          ()  => api.get('/dashboard/leave-summary').then(r => r.data),
  getEmployeeStatusSummary: ()  => api.get('/dashboard/employee-status-summary').then(r => r.data),
  getJoinTrend:             ()  => api.get('/dashboard/join-trend').then(r => r.data),
};

export default dashboardService;

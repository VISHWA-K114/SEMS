import api from './api';

const auditLogService = {
  getLogs: (params = {}) => api.get('/audit-logs', { params }).then(r => r.data),
};

export default auditLogService;

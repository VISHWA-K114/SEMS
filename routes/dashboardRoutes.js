const express    = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getSummary,
  getEmployeesByDepartment,
  getLeaveSummary,
  getEmployeeStatusSummary,
  getJoinTrend,
} = require('../controllers/dashboardController');

const router = express.Router();

// All dashboard routes are for admin + hr only
router.use(protect, authorize('admin', 'hr'));

router.get('/summary',                   getSummary);
router.get('/employees-by-department',   getEmployeesByDepartment);
router.get('/leave-summary',             getLeaveSummary);
router.get('/employee-status-summary',   getEmployeeStatusSummary);
router.get('/join-trend',                getJoinTrend);

module.exports = router;

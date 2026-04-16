const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getLeaves,
  getMyLeaves,
  updateLeaveStatus,
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');
const { applyLeaveRules, updateLeaveStatusRules } = require('../validations/leaveValidation');

// All leave routes require authentication
router.use(protect);

// Employee routes
router.post('/', applyLeaveRules, applyLeave);
router.get('/my', getMyLeaves);

// HR/Admin routes
router.get('/', authorize('admin', 'hr'), getLeaves);
router.patch('/:id/status', authorize('admin', 'hr'), updateLeaveStatusRules, updateLeaveStatus);

module.exports = router;

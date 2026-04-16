const express = require('express');
const router = express.Router();
const {
  createEmployee, getEmployees, getEmployeeById,
  updateEmployee, deleteEmployee, getMyProfile, updateProfilePhoto,
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { createEmployeeRules, updateEmployeeRules } = require('../validations/employeeValidation');

// All employee routes require authentication
router.use(protect);

// Must come BEFORE /:id to avoid route conflict
router.get('/profile/me', getMyProfile);

// Admin + HR routes
router.post('/', authorize('admin', 'hr'), createEmployeeRules, createEmployee);
router.get('/', authorize('admin', 'hr'), getEmployees);

// Any authenticated user can view a single employee
router.get('/:id', getEmployeeById);

// Update — admin + HR
router.put('/:id', authorize('admin', 'hr'), updateEmployeeRules, updateEmployee);

// Upload profile photo
router.patch('/:id/photo', authorize('admin', 'hr'), upload.single('photo'), updateProfilePhoto);

// Delete — admin only
router.delete('/:id', authorize('admin'), deleteEmployee);

module.exports = router;

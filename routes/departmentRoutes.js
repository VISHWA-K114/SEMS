const express = require('express');
const router  = express.Router();
const {
  createDepartment, getDepartments, getDepartmentById,
  updateDepartment, deleteDepartment,
} = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/',    getDepartments);
router.get('/:id', getDepartmentById);

// Admin only — create, update, delete
router.post('/',    authorize('admin'), createDepartment);
router.put('/:id',  authorize('admin'), updateDepartment);
router.delete('/:id', authorize('admin'), deleteDepartment);

module.exports = router;

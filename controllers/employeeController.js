const { validationResult } = require('express-validator');
const Employee = require('../models/Employee');
const cloudinary = require('../config/cloudinary');
const { logAction } = require('../utils/auditLogger');

// Helper — extract validation errors
const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
    return false;
  }
  return true;
};

// @desc    Create a new employee
// @route   POST /api/employees
// @access  Private — admin, hr
const createEmployee = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;

    const {
      fullName, email, phone, gender, dateOfBirth,
      departmentId, jobTitle, role, joiningDate,
      employmentStatus, salary, address, employeeCode,
    } = req.body;

    // Check email uniqueness
    const existing = await Employee.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An employee with this email already exists' });
    }

    const employee = await Employee.create({
      fullName, email, phone, gender, dateOfBirth,
      departmentId: departmentId || null,
      jobTitle, role, joiningDate, employmentStatus,
      salary, address, employeeCode,
      createdBy: req.user._id,
    });

    logAction({
      user: req.user, action: 'CREATE_EMPLOYEE', module: 'Employee',
      targetId: employee._id,
      description: `Created employee ${employee.fullName} (${employee.employeeCode})`,
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all employees (with optional search / filter)
// @route   GET /api/employees
// @access  Private — admin, hr
const getEmployees = async (req, res, next) => {
  try {
    const {
      search = '',
      status,
      role,
      departmentId,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { fullName:     { $regex: search, $options: 'i' } },
        { email:        { $regex: search, $options: 'i' } },
        { employeeCode: { $regex: search, $options: 'i' } },
        { jobTitle:     { $regex: search, $options: 'i' } },
      ];
    }
    if (status)       filter.employmentStatus = status;
    if (role)         filter.role = role;
    if (departmentId) filter.departmentId = departmentId;

    const sortOrder = order === 'asc' ? 1 : -1;
    const allowedSort = ['fullName', 'email', 'createdAt', 'joiningDate', 'salary', 'employeeCode'];
    const sortField = allowedSort.includes(sortBy) ? sortBy : 'createdAt';

    const pageNum  = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * pageSize;

    const [employees, total] = await Promise.all([
      Employee.find(filter)
        .populate('departmentId', 'name status')
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Employee.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / pageSize),
      limit: pageSize,
      employees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single employee by ID
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('departmentId', 'name description status')
      .populate('createdBy', 'fullName email')
      .populate('updatedBy', 'fullName email');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({ success: true, employee });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private — admin, hr
const updateEmployee = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Check email uniqueness if changing email
    if (req.body.email && req.body.email !== employee.email) {
      const emailTaken = await Employee.findOne({ email: req.body.email });
      if (emailTaken) {
        return res.status(409).json({ success: false, message: 'This email is already in use' });
      }
    }

    const allowedUpdates = [
      'fullName', 'email', 'phone', 'gender', 'dateOfBirth',
      'departmentId', 'jobTitle', 'role', 'joiningDate',
      'employmentStatus', 'salary', 'address', 'profilePhoto',
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        employee[field] = req.body[field];
      }
    });

    employee.updatedBy = req.user._id;
    await employee.save();

    const updated = await Employee.findById(employee._id)
      .populate('departmentId', 'name status');

    logAction({
      user: req.user, action: 'UPDATE_EMPLOYEE', module: 'Employee',
      targetId: employee._id,
      description: `Updated employee ${employee.fullName} (${employee.employeeCode})`,
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      employee: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private — admin only
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const empName = employee.fullName;
    const empCode = employee.employeeCode;
    await employee.deleteOne();

    logAction({
      user: req.user, action: 'DELETE_EMPLOYEE', module: 'Employee',
      description: `Deleted employee ${empName} (${empCode})`,
      req,
    });

    res.status(200).json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get the logged-in user's own employee profile
// @route   GET /api/employees/profile/me
// @access  Private
const getMyProfile = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ email: req.user.email })
      .populate('departmentId', 'name description status');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found for your account' });
    }

    res.status(200).json({ success: true, employee });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee profile photo
// @route   PATCH /api/employees/:id/photo
// @access  Private — admin, hr
const updateProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      // If employee not found, delete the newly uploaded image from Cloudinary to save space
      if (req.file.filename) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Delete old photo from Cloudinary if it exists
    if (employee.profilePhotoPublicId) {
      await cloudinary.uploader.destroy(employee.profilePhotoPublicId);
    }

    // Update employee with new photo details
    employee.profilePhoto = req.file.path; // Cloudinary URL
    employee.profilePhotoPublicId = req.file.filename; // Cloudinary public ID
    employee.updatedBy = req.user._id;
    await employee.save();

    logAction({
      user: req.user, action: 'UPDATE_PROFILE_PHOTO', module: 'Profile',
      targetId: employee._id,
      description: `Updated profile photo for ${employee.fullName}`,
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Profile photo updated successfully',
      profilePhoto: employee.profilePhoto,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getMyProfile,
  updateProfilePhoto,
};

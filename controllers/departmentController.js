const Department = require('../models/Department');
const Employee   = require('../models/Employee');

// @desc    Create department
// @route   POST /api/departments
// @access  Private — admin only
const createDepartment = async (req, res, next) => {
  try {
    const { name, description, status, staffCount } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Department name is required' });
    }

    const existing = await Department.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A department with this name already exists' });
    }

    const department = await Department.create({
      name: name.trim(),
      description: description?.trim() || '',
      status: status || 'active',
      staffCount: parseInt(staffCount, 10) || 0,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Department created successfully', department });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
const getDepartments = async (req, res, next) => {
  try {
    const { search = '', status, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (status) filter.status = status;

    const pageNum  = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * pageSize;

    const [departments, total] = await Promise.all([
      Department.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Department.countDocuments(filter),
    ]);

    // Attach employee count to each department
    const deptsWithCount = await Promise.all(
      departments.map(async (dept) => {
        const employeeCount = await Employee.countDocuments({ departmentId: dept._id });
        return { ...dept, employeeCount };
      })
    );

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / pageSize),
      departments: deptsWithCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single department by ID
// @route   GET /api/departments/:id
// @access  Private
const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    const employeeCount = await Employee.countDocuments({ departmentId: department._id });
    res.status(200).json({ success: true, department: { ...department.toObject(), employeeCount } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private — admin only
const updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const { name, description, status, staffCount } = req.body;

    // Check name uniqueness if changing name
    if (name && name.trim() !== department.name) {
      const nameTaken = await Department.findOne({ name: name.trim() });
      if (nameTaken) {
        return res.status(409).json({ success: false, message: 'A department with this name already exists' });
      }
    }

    if (name !== undefined)        department.name        = name.trim();
    if (description !== undefined) department.description = description.trim();
    if (status !== undefined)      department.status      = status;
    if (staffCount !== undefined)  department.staffCount  = parseInt(staffCount, 10) || 0;

    await department.save();
    res.status(200).json({ success: true, message: 'Department updated successfully', department });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private — admin only
const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    // Un-assign employees from this department before deleting
    await Employee.updateMany(
      { departmentId: department._id },
      { $set: { departmentId: null } }
    );

    await department.deleteOne();
    res.status(200).json({ success: true, message: 'Department deleted and employees unassigned' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createDepartment, getDepartments, getDepartmentById, updateDepartment, deleteDepartment };

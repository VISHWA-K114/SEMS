const { validationResult } = require('express-validator');
const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
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

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private (Employee, HR, Admin)
const applyLeave = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;

    const { leaveType, startDate, endDate, reason } = req.body;

    // Find the employee profile associated with the user
    // In our system, the User model has an employeeId
    const employee = await Employee.findById(req.user.employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    // 1. Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({ success: false, message: 'Start date cannot be in the past' });
    }

    // 2. Calculate duration (in days)
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // 3. Check balance (if not unpaid)
    if (leaveType !== 'unpaidLeave') {
      const balance = employee.leaveBalance[leaveType];
      if (balance < diffDays) {
        return res.status(400).json({
          success: false,
          message: `Insufficient ${leaveType} balance. Requested: ${diffDays}, Available: ${balance}`,
        });
      }
    }

    // 4. Check for overlapping leaves (Pending or Approved)
    const overlapping = await Leave.findOne({
      employeeId: employee._id,
      status: { $in: ['pending', 'approved'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } },
      ],
    });

    if (overlapping) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending or approved leave during these dates',
      });
    }

    const leave = await Leave.create({
      employeeId: employee._id,
      leaveType,
      startDate,
      endDate,
      reason,
    });

    logAction({
      user: req.user, action: 'APPLY_LEAVE', module: 'Leave',
      targetId: leave._id,
      description: `Applied for ${leaveType} from ${startDate} to ${endDate}`,
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      leave,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all leave applications (Admin/HR)
// @route   GET /api/leaves
// @access  Private (Admin, HR)
const getLeaves = async (req, res, next) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.leaveType = type;

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * pageSize;

    const [leaves, total] = await Promise.all([
      Leave.find(filter)
        .populate('employeeId', 'fullName employeeCode jobTitle')
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Leave.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / pageSize),
      leaves,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get personal leave history
// @route   GET /api/leaves/my
// @access  Private
const getMyLeaves = async (req, res, next) => {
  try {
    const leaves = await Leave.find({ employeeId: req.user.employeeId })
      .sort({ appliedAt: -1 })
      .lean();

    res.status(200).json({ success: true, leaves });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or Reject leave
// @route   PATCH /api/leaves/:id/status
// @access  Private (Admin, HR)
const updateLeaveStatus = async (req, res, next) => {
  try {
    const { status, reviewComment } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave application not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Leave has already been ${leave.status}` });
    }

    if (status === 'approved') {
      const employee = await Employee.findById(leave.employeeId);
      if (leave.leaveType !== 'unpaidLeave') {
        const diffDays = Math.ceil(Math.abs(leave.endDate - leave.startDate) / (1000 * 60 * 60 * 24)) + 1;
        
        // Final check on balance before approving
        if (employee.leaveBalance[leave.leaveType] < diffDays) {
          return res.status(400).json({ success: false, message: 'Insufficient leave balance to approve this request' });
        }

        // Deduct balance
        employee.leaveBalance[leave.leaveType] -= diffDays;
        await employee.save();
      }
      
      // Update employee status if leave is starting today or active
      // (Optional: this could be handled by a cron job, but we'll leave it for now)
    }

    leave.status = status;
    leave.reviewComment = reviewComment || '';
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = Date.now();
    await leave.save();

    logAction({
      user: req.user, action: 'LEAVE_STATUS_UPDATE', module: 'Leave',
      targetId: leave._id,
      description: `${status.toUpperCase()} leave request for employee ${leave.employeeId}`,
      req,
    });

    res.status(200).json({
      success: true,
      message: `Leave ${status} successfully`,
      leave,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyLeave,
  getLeaves,
  getMyLeaves,
  updateLeaveStatus,
};

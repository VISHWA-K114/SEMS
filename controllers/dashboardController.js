const Employee   = require('../models/Employee');
const Department = require('../models/Department');
const Leave      = require('../models/Leave');
const AuditLog   = require('../models/AuditLog');

// @desc    Get summary stats for dashboard cards
// @route   GET /api/dashboard/summary
// @access  Private (Admin, HR)
const getSummary = async (req, res, next) => {
  try {
    const [
      totalEmployees,
      activeEmployees,
      totalDepartments,
      pendingLeaves,
      approvedLeaves,
      rejectedLeaves,
    ] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ employmentStatus: 'active' }),
      Department.countDocuments({ status: 'active' }),
      Leave.countDocuments({ status: 'pending' }),
      Leave.countDocuments({ status: 'approved' }),
      Leave.countDocuments({ status: 'rejected' }),
    ]);

    res.status(200).json({
      success: true,
      summary: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees: totalEmployees - activeEmployees,
        totalDepartments,
        pendingLeaves,
        approvedLeaves,
        rejectedLeaves,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get employee count grouped by department (for bar/pie chart)
// @route   GET /api/dashboard/employees-by-department
// @access  Private (Admin, HR)
const getEmployeesByDepartment = async (req, res, next) => {
  try {
    const data = await Employee.aggregate([
      {
        $lookup: {
          from: 'departments',
          localField: 'departmentId',
          foreignField: '_id',
          as: 'department',
        },
      },
      {
        $group: {
          _id: '$departmentId',
          name: { $first: { $arrayElemAt: ['$department.name', 0] } },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          name: { $ifNull: ['$name', 'Unassigned'] },
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Get leave status breakdown (for pie chart)
// @route   GET /api/dashboard/leave-summary
// @access  Private (Admin, HR)
const getLeaveSummary = async (req, res, next) => {
  try {
    const data = await Leave.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          count: 1,
        },
      },
    ]);

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Get employee employment status split (for gauge/donut)
// @route   GET /api/dashboard/employee-status-summary
// @access  Private (Admin, HR)
const getEmployeeStatusSummary = async (req, res, next) => {
  try {
    const data = await Employee.aggregate([
      {
        $group: {
          _id: '$employmentStatus',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          count: 1,
        },
      },
    ]);

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent join trend (employees joined per month, last 6 months)
// @route   GET /api/dashboard/join-trend
// @access  Private (Admin, HR)
const getJoinTrend = async (req, res, next) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const data = await Employee.aggregate([
      { $match: { joiningDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year:  { $year: '$joiningDate' },
            month: { $month: '$joiningDate' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          month: {
            $let: {
              vars: {
                months: [
                  '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
                ],
              },
              in: { $arrayElemAt: ['$$months', '$_id.month'] },
            },
          },
          count: 1,
        },
      },
    ]);

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
  getEmployeesByDepartment,
  getLeaveSummary,
  getEmployeeStatusSummary,
  getJoinTrend,
};

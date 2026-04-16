const AuditLog = require('../models/AuditLog');

// @desc    Get all audit logs (paginated, filterable)
// @route   GET /api/audit-logs
// @access  Private (Admin only)
const getAuditLogs = async (req, res, next) => {
  try {
    const { module, userId, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (module) filter.module = module;
    if (userId) filter.userId = userId;

    const pageNum  = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * pageSize;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('userId', 'fullName email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / pageSize),
      logs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAuditLogs };

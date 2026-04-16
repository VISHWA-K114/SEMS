const AuditLog = require('../models/AuditLog');

/**
 * Log an action to the audit trail.
 * Safe to call without await — errors are swallowed to avoid breaking main flow.
 *
 * @param {Object} params
 * @param {Object|null} params.user   - The authenticated user (req.user)
 * @param {string}      params.action - Short action label e.g. 'CREATE_EMPLOYEE'
 * @param {string}      params.module - Module name e.g. 'Employee'
 * @param {*}           [params.targetId] - The affected document _id
 * @param {string}      [params.description] - Human-readable detail
 * @param {Object}      [params.req]  - Express req object (for IP + UA)
 * @param {string}      [params.status] - 'success' | 'failure'
 */
const logAction = async ({
  user = null,
  action,
  module,
  targetId = null,
  description = '',
  req = null,
  status = 'success',
}) => {
  try {
    await AuditLog.create({
      userId: user?._id || null,
      action,
      module,
      targetId: targetId || null,
      description,
      ipAddress: req
        ? req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || ''
        : '',
      userAgent: req?.headers?.['user-agent'] || '',
      status,
    });
  } catch {
    // Never let audit failures break main operations
  }
};

module.exports = { logAction };

const { body } = require('express-validator');

const applyLeaveRules = [
  body('leaveType')
    .notEmpty().withMessage('Leave type is required')
    .isIn(['sickLeave', 'casualLeave', 'earnedLeave', 'maternityLeave', 'paternityLeave', 'unpaidLeave'])
    .withMessage('Invalid leave type'),
  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Start date must be a valid ISO8601 date'),
  body('endDate')
    .notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('End date must be a valid ISO8601 date')
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('reason')
    .notEmpty().withMessage('Reason is required')
    .trim()
    .isLength({ min: 5, max: 500 }).withMessage('Reason must be between 5 and 500 characters'),
];

const updateLeaveStatusRules = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected'),
  body('reviewComment')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Comment cannot exceed 200 characters'),
];

module.exports = {
  applyLeaveRules,
  updateLeaveStatusRules,
};

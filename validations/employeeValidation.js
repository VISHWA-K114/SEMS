const { body, param } = require('express-validator');

const createEmployeeRules = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),

  body('phone')
    .optional()
    .matches(/^[0-9+\-\s()]{7,20}$/).withMessage('Please enter a valid phone number'),

  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say']).withMessage('Invalid gender value'),

  body('dateOfBirth')
    .optional()
    .isISO8601().withMessage('Date of birth must be a valid date'),

  body('jobTitle')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Job title cannot exceed 100 characters'),

  body('role')
    .optional()
    .isIn(['admin', 'hr', 'employee']).withMessage('Role must be admin, hr, or employee'),

  body('joiningDate')
    .optional()
    .isISO8601().withMessage('Joining date must be a valid date'),

  body('employmentStatus')
    .optional()
    .isIn(['active', 'inactive', 'on_leave', 'terminated']).withMessage('Invalid employment status'),

  body('salary')
    .optional()
    .isFloat({ min: 0 }).withMessage('Salary must be a positive number'),

  body('employeeCode')
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 }).withMessage('Employee code must be between 2 and 20 characters'),
];

const updateEmployeeRules = [
  param('id').isMongoId().withMessage('Invalid employee ID'),
  ...createEmployeeRules.map((rule) => rule.optional()),
];

module.exports = { createEmployeeRules, updateEmployeeRules };

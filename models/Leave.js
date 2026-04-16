const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee ID is required'],
    },
    leaveType: {
      type: String,
      enum: ['sickLeave', 'casualLeave', 'earnedLeave', 'maternityLeave', 'paternityLeave', 'unpaidLeave'],
      required: [true, 'Leave type is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    reason: {
      type: String,
      required: [true, 'Reason for leave is required'],
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewComment: {
      type: String,
      trim: true,
      maxlength: [200, 'Comment cannot exceed 200 characters'],
      default: '',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Basic validation to ensure endDate is after startDate
leaveSchema.pre('save', function (next) {
  if (this.startDate > this.endDate) {
    const error = new Error('End date cannot be before start date');
    return next(error);
  }
  next();
});

module.exports = mongoose.model('Leave', leaveSchema);

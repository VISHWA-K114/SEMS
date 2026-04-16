require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');

const run = async () => {
  console.log('Connecting to MongoDB…');
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000, socketTimeoutMS: 45000 });
  console.log('✅ Connected');

  const Employee = require('../models/Employee');
  const Leave = require('../models/Leave');
  const User = require('../models/User');
  const Department = require('../models/Department');

  let admin = await User.findOne({ email: 'admin@sems.com' });
  if (!admin) {
    console.log('❌ No admin user found.');
    process.exit(1);
  }

  let adminEmployee;
  if (!admin.employeeId) {
    console.log('Admin has no employee profile. Creating one...');
    const dept = await Department.findOne();
    adminEmployee = await Employee.create({
      employeeCode: 'EMP9999',
      fullName: 'Admin User',
      email: 'admin@sems.com',
      jobTitle: 'System Administrator',
      departmentId: dept ? dept._id : null,
      employmentStatus: 'active',
      role: 'admin',
      joiningDate: new Date('2023-01-01'),
      phone: '+1 555-0100',
      dateOfBirth: new Date('1990-01-01'),
      address: { city: 'San Francisco', country: 'USA' },
      salary: 150000,
      leaveBalance: { sickLeave: 12, casualLeave: 12, earnedLeave: 15, unpaidLeave: 0 }
    });
    
    admin.employeeId = adminEmployee._id;
    await admin.save();
    console.log('✅ Created Admin employee profile.');
  } else {
    adminEmployee = await Employee.findById(admin.employeeId);
    console.log('Admin already has an employee profile.');
  }

  // Create personal leaves for admin
  const leaveTypes = ['sickLeave', 'casualLeave', 'earnedLeave'];
  const logs = [];
  const now = new Date();

  for (let i = 0; i < 3; i++) {
    const isPast = Math.random() > 0.5;
    const offsetDays = Math.floor(Math.random() * 30);
    const durationDays = Math.floor(Math.random() * 3) + 1;
    
    const startDate = new Date(now);
    if (isPast) {
      startDate.setDate(startDate.getDate() - offsetDays - durationDays);
    } else {
      startDate.setDate(startDate.getDate() + offsetDays);
    }
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationDays);

    logs.push({
      employeeId: adminEmployee._id,
      leaveType: leaveTypes[i],
      startDate,
      endDate,
      reason: 'Personal admin leave request test data.',
      status: i === 0 ? 'approved' : (i === 1 ? 'pending' : 'rejected'),
      appliedAt: new Date(startDate.getTime() - 3 * 24 * 60 * 60 * 1000),
      reviewedBy: (i === 0 || i === 2) ? admin._id : undefined,
      reviewedAt: (i === 0 || i === 2) ? new Date() : undefined,
      reviewComment: i === 0 ? 'Approved by HR' : (i === 2 ? 'Need coverage' : undefined)
    });
  }

  await Leave.insertMany(logs);
  console.log('✅ Generated 3 dummy leaves for Admin!');
  
  process.exit(0);
};

run().catch((err) => { console.error('❌ Error:', err.message); process.exit(1); });

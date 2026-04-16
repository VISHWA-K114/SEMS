require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');

const run = async () => {
  console.log('Connecting to MongoDB…');
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000, socketTimeoutMS: 45000 });
  console.log('✅ Connected');

  const AuditLog = require('../models/AuditLog');
  const User = require('../models/User');

  const admin = await User.findOne({ email: 'admin@sems.com' });
  const otherUsers = await User.find({ email: { $ne: 'admin@sems.com' } }).limit(3);

  if (!admin) {
    console.log('❌ No admin user found. Cannot seed properly.');
    process.exit(1);
  }

  const logs = [
    {
      userId: admin._id,
      action: 'LOGIN_SUCCESS',
      module: 'Auth',
      description: 'Admin logged into the system',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'success'
    },
    {
      userId: admin._id,
      action: 'UPDATE_SYSTEM_SETTINGS',
      module: 'System',
      description: 'Updated global leave policy settings',
      ipAddress: '192.168.1.100',
      status: 'success'
    },
    ...otherUsers.map(u => ({
      userId: u._id,
      action: 'LOGIN_SUCCESS',
      module: 'Auth',
      description: `User ${u.fullName} logged into the system`,
      ipAddress: '192.168.1.10' + Math.floor(Math.random() * 9),
      status: 'success'
    })),
    ...otherUsers.map(u => ({
      userId: admin._id,
      action: 'UPDATE_EMPLOYEE',
      module: 'Employee',
      description: `Updated employee details for ${u.fullName}`,
      ipAddress: '192.168.1.100',
      status: 'success'
    })),
    {
      userId: admin._id,
      action: 'CREATE_DEPARTMENT',
      module: 'Department',
      description: 'Created new department: Innovation Lab',
      ipAddress: '192.168.1.100',
      status: 'success'
    },
    {
      userId: otherUsers[0]?._id || admin._id,
      action: 'APPLY_LEAVE',
      module: 'Leave',
      description: 'Applied for sick leave from 2026-04-20 to 2026-04-22',
      status: 'success'
    },
    {
      userId: admin._id,
      action: 'LEAVE_STATUS_UPDATE',
      module: 'Leave',
      description: 'APPROVED leave request for employee',
      status: 'success'
    },
    {
      userId: null,
      action: 'FAILED_LOGIN_ATTEMPT',
      module: 'Auth',
      description: 'Multiple failed login attempts from unknown IP',
      ipAddress: '203.0.113.45',
      status: 'failure'
    },
    {
      userId: otherUsers[1]?._id || admin._id,
      action: 'UPDATE_PROFILE_PHOTO',
      module: 'Profile',
      description: 'Uploaded new profile picture',
      status: 'success'
    }
  ];

  // Randomize dates over the last 30 days
  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;

  const logsToInsert = logs.map(log => ({
    ...log,
    createdAt: new Date(now - Math.random() * thirtyDays),
    updatedAt: new Date(now - Math.random() * thirtyDays),
  })).sort((a, b) => b.createdAt - a.createdAt);

  await AuditLog.insertMany(logsToInsert);
  
  console.log(`✅ Inserted ${logsToInsert.length} dummy audit logs!`);
  process.exit(0);
};

run().catch((err) => { console.error('❌ Error:', err.message); process.exit(1); });

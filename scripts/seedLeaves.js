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

  const employees = await Employee.find();
  const admin = await User.findOne({ email: 'admin@sems.com' });

  if (employees.length === 0 || !admin) {
    console.log('❌ Missing employees or admin user. Seed them first.');
    process.exit(1);
  }

  const leaveTypes = ['sickLeave', 'casualLeave', 'earnedLeave'];
  const statuses = ['pending', 'approved', 'rejected', 'cancelled'];
  const reasons = [
    'Feeling unwell, need some rest.',
    'Family emergency to attend to.',
    'Planned vacation with family.',
    'Attending a friends wedding.',
    'Personal errands.',
  ];

  const logs = [];
  const now = new Date();

  // Give each employee 1-3 leaves
  for (const emp of employees) {
    const numLeaves = Math.floor(Math.random() * 3) + 1; // 1 to 3
    for (let i = 0; i < numLeaves; i++) {
      const isPast = Math.random() > 0.5;
      const offsetDays = Math.floor(Math.random() * 30);
      const durationDays = Math.floor(Math.random() * 5) + 1; // 1 to 5 days
      
      const startDate = new Date(now);
      if (isPast) {
        startDate.setDate(startDate.getDate() - offsetDays - durationDays);
      } else {
        startDate.setDate(startDate.getDate() + offsetDays);
      }
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + durationDays);

      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const leaveType = leaveTypes[Math.floor(Math.random() * leaveTypes.length)];

      const leaveDoc = {
        employeeId: emp._id,
        leaveType,
        startDate,
        endDate,
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        status,
        appliedAt: new Date(startDate.getTime() - 3 * 24 * 60 * 60 * 1000), // applied 3 days before start
      };

      if (status === 'approved' || status === 'rejected') {
        leaveDoc.reviewedBy = admin._id;
        leaveDoc.reviewedAt = new Date(leaveDoc.appliedAt.getTime() + 1 * 24 * 60 * 60 * 1000); // reviewed 1 day later
        leaveDoc.reviewComment = status === 'approved' ? 'Approved as requested.' : 'Cannot approve at this time due to tight deadlines.';
      }

      logs.push(leaveDoc);
    }
  }

  await Leave.insertMany(logs);
  
  console.log(`✅ Inserted ${logs.length} dummy leave applications!`);
  process.exit(0);
};

run().catch((err) => { console.error('❌ Error:', err.message); process.exit(1); });

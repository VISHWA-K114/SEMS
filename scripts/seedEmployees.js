require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const run = async () => {
  console.log('Connecting to MongoDB…');
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000, socketTimeoutMS: 45000 });
  console.log('✅ Connected');

  const Department = require('../models/Department');
  const Employee = require('../models/Employee');
  const User = require('../models/User');

  const depts = await Department.find();
  if (depts.length === 0) {
    console.log('❌ No departments found. Run seed.js first.');
    process.exit(1);
  }

  const sampleStaff = [
    { fullName: 'Arjun Mehta', jobTitle: 'Lead Engineer', extension: '101' },
    { fullName: 'Priya Sharma', jobTitle: 'Senior Developer', extension: '102' },
    { fullName: 'Rohan Gupta', jobTitle: 'Product Manager', extension: '103' },
    { fullName: 'Sanya Iyer', jobTitle: 'HR Specialist', extension: '201' },
    { fullName: 'Vikram Singh', jobTitle: 'Talent Scout', extension: '202' },
    { fullName: 'Ananya Das', jobTitle: 'Marketing Lead', extension: '301' },
    { fullName: 'Karan Malhotra', jobTitle: 'Content Strategist', extension: '302' },
    { fullName: 'Neha Reddy', jobTitle: 'Financial Analyst', extension: '401' },
    { fullName: 'Siddharth Jain', jobTitle: 'Operations Manager', extension: '501' },
    { fullName: 'Aditi Verma', jobTitle: 'UI/UX Lead', extension: '601' },
  ];

  console.log(`Seeding staff for ${depts.length} departments…`);

  for (let i = 0; i < depts.length; i++) {
    const dept = depts[i];
    // Add 2-3 employees per department
    const count = 2 + (i % 2); 
    for (let j = 0; j < count; j++) {
      const staffIndex = (i * 2 + j) % sampleStaff.length;
      const staff = sampleStaff[staffIndex];
      const email = `${staff.fullName.toLowerCase().replace(' ', '.')}@sems.com`;

      const exists = await Employee.findOne({ email });
      if (!exists) {
        const password = await bcrypt.hash('Employee@123', 12);
        
        // 1. Create Employee Record
        const newEmp = await Employee.create({
          employeeCode: `EMP${1000 + Math.floor(Math.random() * 9000)}`,
          fullName: staff.fullName,
          email,
          jobTitle: staff.jobTitle,
          departmentId: dept._id,
          employmentStatus: 'active',
          role: 'employee',
          joiningDate: new Date(),
        });

        // 2. Create User Record for Login
        await User.create({
          fullName: staff.fullName,
          email,
          password,
          role: 'employee',
          employeeId: newEmp._id,
          isActive: true
        });

        console.log(`  ✅ Added: ${staff.fullName} to ${dept.name}`);
      }
    }
  }

  console.log('\n✅ Staff seeding complete!');
  process.exit(0);
};

run().catch((err) => { console.error('❌ Error:', err.message); process.exit(1); });

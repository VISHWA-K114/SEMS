/**
 * Seed script — run once to populate departments and reset admin password
 * Usage: node src/seed.js
 */
require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const DEPARTMENTS = [
  { name: 'Engineering',       description: 'Software development and infrastructure' },
  { name: 'Human Resources',   description: 'People operations and talent management' },
  { name: 'Marketing',         description: 'Brand, growth, and communications' },
  { name: 'Finance',           description: 'Accounting, budgeting, and reporting' },
  { name: 'Operations',        description: 'Business operations and process management' },
  { name: 'Design',            description: 'UI/UX, product design, and branding' },
];

const run = async () => {
  console.log('Connecting to MongoDB…');
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000, socketTimeoutMS: 45000 });
  console.log('✅ Connected');

  // Dynamic model loading after connection
  const Department = require('./models/Department');
  const User       = require('./models/User');

  // 1) Seed departments
  for (const dept of DEPARTMENTS) {
    const exists = await Department.findOne({ name: dept.name });
    if (!exists) {
      await Department.create({ ...dept, status: 'active' });
      console.log(`  ✅ Created dept: ${dept.name}`);
    } else {
      console.log(`  ⏭  Skip (exists): ${dept.name}`);
    }
  }

  // 2) Reset / ensure admin user with known password
  const ADMINS = [
    { email: 'admin@sems.com',  fullName: 'Admin User', password: 'Admin@1234' },
    { email: 'vishwa@sems.com', fullName: 'Vishwa Admin', password: 'Admin@1234' },
  ];

  for (const adm of ADMINS) {
    const hash = await bcrypt.hash(adm.password, 12);
    const adminUser = await User.findOneAndUpdate(
      { email: adm.email },
      { $set: { password: hash, role: 'admin', fullName: adm.fullName } },
      { upsert: true, new: true }
    );
    console.log(`  ✅ Admin ready: ${adminUser.email} / ${adm.password}`);
  }

  console.log('\n✅ Seed complete!');
  process.exit(0);
};

run().catch((err) => { console.error('❌ Seed error:', err.message); process.exit(1); });

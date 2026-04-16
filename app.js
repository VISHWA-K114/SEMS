const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes        = require('./routes/authRoutes');
const employeeRoutes    = require('./routes/employeeRoutes');
const departmentRoutes  = require('./routes/departmentRoutes');
const leaveRoutes       = require('./routes/leaveRoutes');
const dashboardRoutes   = require('./routes/dashboardRoutes');
const auditLogRoutes    = require('./routes/auditLogRoutes');
const errorHandler      = require('./middleware/errorHandler');

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow any localhost origin or specified CLIENT_URL
      if (!origin || /^http:\/\/localhost:\d+$/.test(origin) || origin === process.env.CLIENT_URL) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for development, can restrict later
      }
    },
    credentials: true,
  })
);

// Rate limiting - global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { message: 'Too many requests, please try again later' },
});
app.use(limiter);

// Auth rate limit - stricter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many auth attempts, please try again in 15 minutes' },
});

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SEMS API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/auth',        authLimiter, authRoutes);
app.use('/api/employees',   employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/leaves',      leaveRoutes);
app.use('/api/dashboard',   dashboardRoutes);
app.use('/api/audit-logs',  auditLogRoutes);

// 404 not found
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

module.exports = app;

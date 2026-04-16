const express    = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getAuditLogs } = require('../controllers/auditLogController');

const router = express.Router();

// Admin-only
router.use(protect, authorize('admin'));

router.get('/', getAuditLogs);

module.exports = router;

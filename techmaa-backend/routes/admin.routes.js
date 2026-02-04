const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const adminController = require('../controllers/admin.controller');

// --- Auth Routes ---
router.post('/seed', adminController.seedAdmin);
router.post('/login', adminController.login);

// --- Job Routes ---
router.post('/jobs', protect, adminController.createJob);

// --- Post Routes ---
router.post('/posts', protect, adminController.createPost);

// --- Application Routes ---
router.get('/applications', protect, adminController.getApplications);
router.put('/applications/:id/status', protect, adminController.updateApplicationStatus);

module.exports = router;
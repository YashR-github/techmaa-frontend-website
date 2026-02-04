const express = require('express');
const multer = require('multer');
const path = require('path');
const controller = require('../controllers/public.controller');

const router = express.Router();

// Configure multer for file uploads (resumes)
const uploadsDir = path.join(__dirname, '..', 'uploads');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage: storage });

// --- Form & Application Routes ---
router.post('/newsletter', controller.subscribeNewsletter);
router.post('/contact', controller.handleContactForm);
router.post('/apply', upload.single('resume'), controller.createApplication);
router.get('/applications/:id', controller.getApplicationStatus);

// --- Dynamic Content Routes (serving mock data) ---
router.get('/jobs', controller.getJobs);
router.get('/posts', controller.getPosts);

module.exports = router;
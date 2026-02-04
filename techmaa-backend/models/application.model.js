const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  applicationId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  college: { type: String },
  cgpa: { type: Number },
  jobRole: { type: String, required: true },
  coverLetter: { type: String, required: true },
  resumePath: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ['Received', 'Under Review', 'Interviewing', 'Final Decision', 'Closed'],
    default: 'Received'
  }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
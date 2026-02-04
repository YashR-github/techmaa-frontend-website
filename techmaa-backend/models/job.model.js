const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  department: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, required: true, enum: ['Full-time', 'Part-time', 'Internship', 'Contract'] },
  experience: { type: String },
  salary: { type: String },
  description: { type: String, required: true },
  requirements: [String],
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
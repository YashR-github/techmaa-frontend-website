const crypto = require('crypto');
const mongoose = require('mongoose');

const Application = require('../models/application.model');
const Contact = require('../models/contact.model');
const Newsletter = require('../models/newsletter.model');
const Job = require('../models/job.model');
const Post = require('../models/post.model');

function isDbReady() {
  return mongoose.connection.readyState === 1;
}

function generateApplicationId() {
  // Matches the style used in status.html placeholder: TMAI-XXXX-XXXX
  const bytes = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 hex chars
  return `TMAI-${bytes.slice(0, 4)}-${bytes.slice(4, 8)}`;
}

// In-memory fallback store (used when MongoDB isn't configured/connected)
const memory = {
  newsletterEmails: new Set(),
  contacts: [],
  applications: new Map(), // key: applicationId
};

const sampleJobs = [
  {
    title: 'Frontend Developer (React)',
    location: 'Remote / India',
    type: 'Full-time',
    summary: 'Build responsive UI, improve performance, and ship delightful web experiences.',
  },
  {
    title: 'Backend Developer (Node.js)',
    location: 'Bengaluru, India',
    type: 'Full-time',
    summary: 'Design APIs, integrate databases, and build reliable services at scale.',
  },
  {
    title: 'AI/ML Engineer',
    location: 'Hybrid',
    type: 'Full-time',
    summary: 'Train, evaluate, and deploy models for real-world product use-cases.',
  },
];

const samplePosts = [
  {
    title: 'How we approach delivery with confidence',
    category: 'ENGINEERING',
    excerpt: 'A practical look at quality gates, CI/CD, and building feedback loops that actually work.',
    author: 'TechMaa-AI',
    imageUrl: '',
    publishedAt: new Date().toISOString(),
  },
  {
    title: 'Modernizing legacy systems: a phased playbook',
    category: 'ARCHITECTURE',
    excerpt: 'From strangler fig to modular monoliths—what to do first, and what to avoid.',
    author: 'TechMaa-AI',
    imageUrl: '',
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// --- Form Handlers ---
exports.subscribeNewsletter = async (req, res) => {
  const email = (req.body?.email || '').trim().toLowerCase();
  if (!email) return res.status(400).json({ message: 'Email is required.' });

  // very light validation (frontend also validates)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address.' });
  }

  try {
    if (isDbReady()) {
      await Newsletter.create({ email });
      return res.status(201).json({ message: 'Thanks for subscribing!' });
    }

    if (memory.newsletterEmails.has(email)) {
      return res.status(409).json({ message: 'This email is already subscribed.' });
    }
    memory.newsletterEmails.add(email);
    return res.status(201).json({ message: 'Thanks for subscribing! (saved in memory)' });
  } catch (error) {
    // Mongoose duplicate key error
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'This email is already subscribed.' });
    }
    return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

exports.handleContactForm = async (req, res) => {
  const name = (req.body?.name || '').trim();
  const email = (req.body?.email || '').trim().toLowerCase();
  const phone = (req.body?.phone || '').trim();
  const service = (req.body?.service || '').trim();
  const company = (req.body?.company || '').trim();
  const message = (req.body?.message || '').trim();

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email, and message are required.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address.' });
  }

  try {
    if (isDbReady()) {
      await Contact.create({ name, email, phone, service, company, message });
      return res.status(201).json({ message: 'Message received. We will get back to you soon.' });
    }

    memory.contacts.push({ name, email, phone, service, company, message, createdAt: new Date().toISOString() });
    return res.status(201).json({ message: 'Message received. (saved in memory)' });
  } catch (error) {
    return res.status(500).json({ message: 'Could not send. Try again later.' });
  }
};

// --- Application Handlers ---
exports.createApplication = async (req, res) => {
  const fullName = (req.body?.fullName || '').trim();
  const email = (req.body?.email || '').trim().toLowerCase();
  const phone = (req.body?.phone || '').trim();
  const college = (req.body?.college || '').trim();
  const cgpaRaw = (req.body?.cgpa || '').toString().trim();
  const cgpa = cgpaRaw ? Number(cgpaRaw) : undefined;
  const jobRole = (req.body?.jobRole || '').trim();
  const coverLetter = (req.body?.coverLetter || '').trim();

  if (!fullName || !email || !jobRole || !coverLetter) {
    return res.status(400).json({ message: 'fullName, email, jobRole, and coverLetter are required.' });
  }
  if (cgpaRaw && Number.isNaN(cgpa)) {
    return res.status(400).json({ message: 'cgpa must be a number.' });
  }
  if (!req.file) {
    return res.status(400).json({ message: 'Resume file is required.' });
  }

  const applicationId = generateApplicationId();
  const resumePath = `/uploads/${req.file.filename}`;

  try {
    if (isDbReady()) {
      await Application.create({
        applicationId,
        fullName,
        email,
        phone,
        college: college || undefined,
        cgpa: typeof cgpa === 'number' ? cgpa : undefined,
        jobRole,
        coverLetter,
        resumePath,
        status: 'Received',
      });

      return res.status(201).json({
        message: 'Application submitted successfully!',
        applicationId,
      });
    }

    const record = {
      applicationId,
      fullName,
      email,
      phone,
      college: college || undefined,
      cgpa: typeof cgpa === 'number' ? cgpa : undefined,
      jobRole,
      coverLetter,
      resumePath,
      status: 'Received',
      createdAt: new Date().toISOString(),
    };
    memory.applications.set(applicationId, record);

    return res.status(201).json({
      message: 'Application submitted successfully! (saved in memory)',
      applicationId,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error submitting application. Please try again later.' });
  }
};

exports.getApplicationStatus = async (req, res) => {
  const applicationId = (req.params?.id || '').trim().toUpperCase();
  if (!applicationId) return res.status(400).json({ message: 'Application ID is required.' });

  try {
    if (isDbReady()) {
      const application = await Application.findOne({ applicationId });
      if (!application) return res.status(404).json({ message: 'Application not found.' });

      return res.json({
        applicationId: application.applicationId,
        status: application.status,
        jobTitle: application.jobRole,
        submissionDate: application.createdAt,
      });
    }

    const application = memory.applications.get(applicationId);
    if (!application) return res.status(404).json({ message: 'Application not found.' });
    return res.json({
      applicationId: application.applicationId,
      status: application.status,
      jobTitle: application.jobRole,
      submissionDate: application.createdAt,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching application status.' });
  }
};

// --- Dynamic Content ---
exports.getJobs = async (req, res) => {
  try {
    if (isDbReady()) {
      const jobs = await Job.find({}).sort({ createdAt: -1 });
      // Frontend expects location/type/title and optionally summary
      const normalized = jobs.map((j) => ({
        title: j.title,
        location: j.location,
        type: j.type,
        summary: j.description?.slice(0, 140) || '',
      }));
      return res.status(200).json(normalized);
    }

    return res.status(200).json(sampleJobs);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching jobs' });
  }
};

exports.getPosts = async (req, res) => {
  try {
    if (isDbReady()) {
      const posts = await Post.find({}).sort({ publishedAt: -1 });
      return res.status(200).json(posts);
    }
    return res.status(200).json(samplePosts);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching posts' });
  }
};
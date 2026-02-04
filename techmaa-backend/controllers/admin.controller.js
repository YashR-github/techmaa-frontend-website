const User = require('../models/user.model');
const Job = require('../models/job.model');
const Post = require('../models/post.model');
const Application = require('../models/application.model');
const jwt = require('jsonwebtoken');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Seed admin user (run once)
// @route   POST /api/admin/seed
// @access  Public
exports.seedAdmin = async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        if (userCount > 0) {
            return res.status(400).json({ message: 'Admin user already exists.' });
        }
        
        await User.create({
            email: 'admin@techmaa-ai.com',
            password: 'SecurePassword123!', // Change this in production
        });

        res.status(201).json({ message: 'Admin user created successfully. Please login.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error while seeding admin.' });
    }
}

// @desc    Auth admin & get token
// @route   POST /api/admin/login
// @access  Public
exports.login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user.id,
            email: user.email,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
};

// --- Content Management ---

// @desc    Create a job
// @route   POST /api/admin/jobs
// @access  Private
exports.createJob = async (req, res) => {
    const newJob = new Job(req.body);
    const createdJob = await newJob.save();
    res.status(201).json(createdJob);
};

// @desc    Create a post
// @route   POST /api/admin/posts
// @access  Private
exports.createPost = async (req, res) => {
    const newPost = new Post(req.body);
    const createdPost = await newPost.save();
    res.status(201).json(createdPost);
};

// --- Application Management ---

// @desc    Get all applications
// @route   GET /api/admin/applications
// @access  Private
exports.getApplications = async (req, res) => {
    const applications = await Application.find({}).sort({ createdAt: -1 });
    res.json(applications);
};

// @desc    Update application status
// @route   PUT /api/admin/applications/:id/status
// @access  Private
exports.updateApplicationStatus = async (req, res) => {
    const application = await Application.findById(req.params.id);
    if (application) {
        application.status = req.body.status || application.status;
        const updatedApplication = await application.save();
        res.json(updatedApplication);
    } else {
        res.status(404).json({ message: 'Application not found' });
    }
};
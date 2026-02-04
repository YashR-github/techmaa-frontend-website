// 1. Import Dependencies
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// 2. Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;

// 3. Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Allow app to accept JSON format

// 4. Connect to MongoDB (optional)
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.warn('[newsletter-backend] MONGO_URI is not set. Starting without MongoDB; subscriptions will not be persisted.');
} else {
  mongoose.connect(mongoUri)
    .then(() => console.log('Successfully connected to MongoDB!'))
    .catch(err => console.error('Connection error:', err));
}

// 5. Create a Database Schema and Model
const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Ensures no duplicate emails
    lowercase: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  }
});

const Subscriber = mongoose.model('Subscriber', subscriberSchema);

// 6. Create API Endpoint (Route)
app.post('/subscribe', async (req, res) => {
  const { email } = req.body;

  // Basic validation
  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const newSubscriber = new Subscriber({ email });
    await newSubscriber.save();
    res.status(201).json({ message: 'Thank you for subscribing!' });
  } catch (error) {
    // Check for duplicate email error code
    if (error.code === 11000) {
      return res.status(409).json({ message: 'This email is already subscribed.' });
    }
    // Handle other potential errors
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
});

// 7. Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
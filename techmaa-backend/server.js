require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Route files
const publicRoutes = require('./routes/public.routes');
const adminRoutes = require('./routes/admin.routes'); // <-- ADD THIS

const app = express();
const PORT = process.env.PORT || 4000;

// Avoid hanging requests when DB isn't connected
mongoose.set('bufferCommands', false);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes); // <-- ADD THIS

function startServer() {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Database Connection (optional for local/static-site preview)
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.warn('[techmaa-backend] MONGO_URI is not set. Starting without MongoDB; public endpoints may use fallback/in-memory data.');
  startServer();
} else {
  mongoose.connect(mongoUri)
    .then(() => {
      console.log('Successfully connected to MongoDB.');
      startServer();
    })
    .catch(err => {
      console.error('Database connection error:', err);
      console.warn('[techmaa-backend] Starting server without MongoDB due to connection error.');
      startServer();
    });
}
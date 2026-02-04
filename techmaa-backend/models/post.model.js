const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true }, // In a real app, this might store Markdown or HTML
  author: { type: String, default: 'TechMaa-AI' },
  imageUrl: { type: String },
  publishedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
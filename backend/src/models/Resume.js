const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    text: { type: String, required: true },
    skills: { type: [String], default: [] },
    summary: { type: String, default: '' },
    experienceYears: { type: Number, default: 0, min: 0 },
    education: { type: String, default: '' },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ResumeProfile', resumeSchema);

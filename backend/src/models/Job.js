const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, default: 'Remote' },
    description: { type: String, required: true },
    skills: { type: [String], default: [] },
    seniority: { type: String, default: 'Mid-level' },
    salaryRange: { type: String, default: '' },
    sourceUrl: { type: String, default: '' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);

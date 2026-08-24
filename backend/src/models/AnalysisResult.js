const mongoose = require('mongoose');

const analysisResultSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    score: { type: Number, required: true },
    semanticScore: { type: Number, default: 0 },
    matchedSkills: { type: [Object], default: [] },
    weakSkills: { type: [Object], default: [] },
    missingSkills: { type: [String], default: [] },
    candidateSkills: { type: [String], default: [] },
  },
  { timestamps: true }
);

analysisResultSchema.index({ user: 1, job: 1 }, { unique: true });
module.exports = mongoose.model('AnalysisResult', analysisResultSchema);

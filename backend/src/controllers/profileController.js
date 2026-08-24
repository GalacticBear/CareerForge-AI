const User = require('../models/User');
const Resume = require('../models/Resume');
const AnalysisResult = require('../models/AnalysisResult');

async function getProfile(req, res, next) {
  try {
    const [user, resume, analyses] = await Promise.all([
      User.findById(req.user._id).lean(),
      Resume.findOne({ user: req.user._id }).lean(),
      AnalysisResult.find({ user: req.user._id }).populate('job', 'title company location skills').sort({ updatedAt: -1 }).limit(20).lean(),
    ]);
    return res.json({ user, resume, analyses });
  } catch (error) { next(error); }
}

module.exports = { getProfile };

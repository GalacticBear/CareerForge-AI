const axios = require('axios');
const pdfParse = require('pdf-parse');
const Resume = require('../models/Resume');

function cleanText(value) {
  return value.replace(/\u0000/g, ' ').replace(/\s+/g, ' ').trim();
}

async function uploadResume(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: 'Upload a PDF resume' });
    if (req.file.mimetype !== 'application/pdf') return res.status(415).json({ message: 'Only PDF resumes are supported' });

    const parsed = await pdfParse(req.file.buffer);
    const text = cleanText(parsed.text || '');
    if (text.length < 80) return res.status(422).json({ message: 'The PDF did not contain enough extractable text' });

    const aiResponse = await axios.post(
      `${process.env.AI_SERVICE_URL}/api/ai/extract-skills`,
      { text },
      { timeout: 30_000 }
    );

    const resume = await Resume.findOneAndUpdate(
      { user: req.user._id },
      {
        user: req.user._id,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        text,
        skills: aiResponse.data.skills || [],
        summary: text.slice(0, 500),
        uploadedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json({
      message: 'Resume uploaded and analyzed',
      resume: {
        id: resume._id,
        fileName: resume.fileName,
        skills: resume.skills,
        summary: resume.summary,
      },
    });
  } catch (error) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') return res.status(504).json({ message: 'AI service timed out' });
    if (error.response?.data?.detail) return res.status(502).json({ message: error.response.data.detail });
    next(error);
  }
}

module.exports = { uploadResume };

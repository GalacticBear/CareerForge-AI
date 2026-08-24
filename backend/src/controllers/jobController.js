const axios = require('axios');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const AnalysisResult = require('../models/AnalysisResult');

const defaultJobs = [
  {
    title: 'Full Stack Engineer', company: 'NovaCloud', location: 'Remote', seniority: 'Mid-level', salaryRange: '$90k–$125k',
    skills: ['javascript', 'react', 'node.js', 'mongodb', 'docker', 'rest api'],
    description: 'Build scalable web applications using React, Node.js, MongoDB, REST APIs, Docker, and JavaScript. Work with product and platform teams to ship reliable features.',
  },
  {
    title: 'Machine Learning Engineer', company: 'VectorLabs', location: 'Bengaluru / Hybrid', seniority: 'Mid-level', salaryRange: '$100k–$145k',
    skills: ['python', 'machine learning', 'pandas', 'numpy', 'scikit-learn', 'docker', 'aws'],
    description: 'Develop production machine learning systems in Python. Use pandas, NumPy and scikit-learn, deploy services with Docker, and operate workloads on AWS.',
  },
  {
    title: 'AI Backend Engineer', company: 'ForgeAI', location: 'Remote', seniority: 'Senior', salaryRange: '$120k–$165k',
    skills: ['python', 'fastapi', 'nlp', 'machine learning', 'docker', 'rest api', 'aws'],
    description: 'Design AI-backed APIs using Python and FastAPI. Build NLP pipelines, embeddings and semantic systems, package them with Docker, and deploy on AWS.',
  },
  {
    title: 'Data Analyst', company: 'InsightWorks', location: 'Mumbai / Hybrid', seniority: 'Entry–Mid', salaryRange: '$60k–$90k',
    skills: ['python', 'sql', 'pandas', 'data analysis', 'power bi', 'communication'],
    description: 'Analyze business data with SQL and Python, create dashboards in Power BI, and communicate findings clearly to business stakeholders.',
  },
];

async function ensureSeedJobs() {
  const count = await Job.countDocuments({ active: true });
  if (count > 0) return;
  await Job.insertMany(defaultJobs);
}

async function listJobs(req, res, next) {
  try {
    await ensureSeedJobs();
    const jobs = await Job.find({ active: true }).sort({ createdAt: -1 }).lean();
    return res.json({ jobs });
  } catch (error) { next(error); }
}

async function matchJob(req, res, next) {
  try {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ message: 'jobId is required' });

    const [resume, job] = await Promise.all([
      Resume.findOne({ user: req.user._id }).lean(),
      Job.findById(jobId).lean(),
    ]);
    if (!resume) return res.status(409).json({ message: 'Upload a resume before matching jobs' });
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const response = await axios.post(
      `${process.env.AI_SERVICE_URL}/api/ai/match`,
      {
        candidate_text: resume.text,
        candidate_skills: resume.skills,
        required_skills: job.skills,
        job_description: `${job.title}. ${job.description}. Required skills: ${job.skills.join(', ')}`,
      },
      { timeout: 60_000 }
    );

    const data = response.data;
    await AnalysisResult.findOneAndUpdate(
      { user: req.user._id, job: job._id },
      {
        user: req.user._id,
        job: job._id,
        score: data.score,
        semanticScore: data.semantic_score,
        matchedSkills: data.matched_skills,
        weakSkills: data.weak_skills,
        missingSkills: data.missing_skills,
        candidateSkills: data.candidate_skills,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({ job, analysis: data });
  } catch (error) {
    if (error.response?.data?.detail) return res.status(502).json({ message: error.response.data.detail });
    next(error);
  }
}

async function createJob(req, res, next) {
  try {
    const { title, company, location, description, skills, seniority, salaryRange, sourceUrl } = req.body;
    if (!title || !company || !description) return res.status(400).json({ message: 'title, company and description are required' });
    const job = await Job.create({ title, company, location, description, skills: Array.isArray(skills) ? skills : [], seniority, salaryRange, sourceUrl });
    return res.status(201).json({ job });
  } catch (error) { next(error); }
}

async function evaluateInterview(req, res, next) {
  try {
    const { question, answer } = req.body;
    if (!question || !answer) return res.status(400).json({ message: 'question and answer are required' });
    const response = await axios.post(`${process.env.AI_SERVICE_URL}/api/ai/interview-eval`, { question, answer }, { timeout: 30_000 });
    return res.json(response.data);
  } catch (error) {
    if (error.response?.data?.detail) return res.status(502).json({ message: error.response.data.detail });
    next(error);
  }
}

module.exports = { listJobs, matchJob, createJob, evaluateInterview };

const axios = require('axios');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const AnalysisResult = require('../models/AnalysisResult');

// Built-in demo roles. Existing seeded roles are preserved; missing roles are
// inserted automatically so an existing production database can be upgraded
// without deleting user data.
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
  {
    title: 'Frontend Developer', company: 'PixelForge', location: 'Remote', seniority: 'Entry–Mid', salaryRange: '$70k–$105k',
    skills: ['javascript', 'typescript', 'react', 'rest api', 'git'],
    description: 'Build responsive user interfaces with JavaScript, TypeScript and React. Integrate REST APIs and collaborate with designers and backend engineers.',
  },
  {
    title: 'Backend Developer', company: 'DataSpring', location: 'Hyderabad / Hybrid', seniority: 'Mid-level', salaryRange: '$80k–$120k',
    skills: ['javascript', 'node.js', 'express', 'mongodb', 'rest api', 'docker', 'git'],
    description: 'Develop secure backend services with Node.js and Express. Design REST APIs, work with MongoDB, containerize services with Docker, and maintain clean Git workflows.',
  },
  {
    title: 'Software Engineer', company: 'TechCore', location: 'Pune / Hybrid', seniority: 'Mid-level', salaryRange: '$85k–$125k',
    skills: ['javascript', 'python', 'git', 'docker', 'rest api', 'problem solving'],
    description: 'Develop reliable software features across backend and platform services. Apply software engineering fundamentals, problem solving, Git and Docker in a collaborative environment.',
  },
  {
    title: 'Data Scientist', company: 'InsightAI', location: 'Bengaluru / Hybrid', seniority: 'Mid-level', salaryRange: '$95k–$140k',
    skills: ['python', 'pandas', 'numpy', 'scikit-learn', 'machine learning', 'sql', 'data analysis'],
    description: 'Build data science solutions using Python, pandas, NumPy and scikit-learn. Explore datasets with SQL and translate analysis into useful business decisions.',
  },
  {
    title: 'AI Engineer', company: 'NeuralWorks', location: 'Remote', seniority: 'Mid-level', salaryRange: '$105k–$150k',
    skills: ['python', 'machine learning', 'deep learning', 'pytorch', 'nlp', 'fastapi', 'docker'],
    description: 'Develop applied AI systems using Python, machine learning, deep learning and NLP. Package models behind FastAPI services and deploy them with Docker.',
  },
  {
    title: 'DevOps Engineer', company: 'CloudOps', location: 'Remote', seniority: 'Mid-level', salaryRange: '$90k–$135k',
    skills: ['docker', 'kubernetes', 'aws', 'azure', 'git', 'rest api'],
    description: 'Automate and operate cloud-native workloads using Docker, Kubernetes and cloud platforms. Improve deployment reliability, observability and developer workflows.',
  },
  {
    title: 'Cloud Engineer', company: 'SkyScale', location: 'Chennai / Hybrid', seniority: 'Mid-level', salaryRange: '$90k–$135k',
    skills: ['aws', 'azure', 'docker', 'kubernetes', 'python', 'git'],
    description: 'Design and support cloud infrastructure across AWS and Azure. Automate services with Python, containerize workloads with Docker, and operate Kubernetes platforms.',
  },
  {
    title: 'MLOps Engineer', company: 'ModelFlow', location: 'Remote', seniority: 'Senior', salaryRange: '$115k–$165k',
    skills: ['python', 'machine learning', 'docker', 'kubernetes', 'aws', 'git'],
    description: 'Build reliable machine learning delivery pipelines. Package models with Docker, operate Kubernetes workloads, automate cloud deployments, and collaborate with data science teams.',
  },
  {
    title: 'Python Developer', company: 'CodeWorks', location: 'Delhi / Hybrid', seniority: 'Entry–Mid', salaryRange: '$65k–$100k',
    skills: ['python', 'fastapi', 'flask', 'sql', 'git', 'rest api'],
    description: 'Develop Python applications and APIs using FastAPI or Flask. Work with SQL, REST APIs and Git to deliver maintainable production software.',
  },
  {
    title: 'Cybersecurity Analyst', company: 'SecureGrid', location: 'Remote', seniority: 'Entry–Mid', salaryRange: '$70k–$105k',
    skills: ['python', 'sql', 'communication', 'problem solving', 'git'],
    description: 'Investigate security events, automate analysis with Python and SQL, document findings clearly, and collaborate with engineering teams on practical security improvements.',
  },
];

async function ensureSeedJobs() {
  // Migrate older deployments that already contain the original four roles.
  // Insert only missing built-in roles so we never duplicate or delete jobs.
  await Promise.all(
    defaultJobs.map((job) =>
      Job.updateOne(
        { title: job.title, company: job.company },
        { $setOnInsert: { ...job } },
        { upsert: true },
      ),
    ),
  );
}

async function listJobs(req, res, next) {
  try {
    await ensureSeedJobs();
    const jobs = await Job.find({ active: true }).sort({ title: 1, company: 1 }).lean();
    return res.json({ jobs });
  } catch (error) { next(error); }
}

async function matchJob(req, res, next) {
  try {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ message: 'jobId is required' });

    const [resume, job] = await Promise.all([
      Resume.findOne({ user: req.user._id }).lean(),
      Job.findOne({ _id: jobId, active: true }).lean(),
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
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') return res.status(504).json({ message: 'AI matching service timed out. Please try again.' });
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
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') return res.status(504).json({ message: 'Interview evaluation timed out. Please try again.' });
    next(error);
  }
}

module.exports = { listJobs, matchJob, createJob, evaluateInterview };

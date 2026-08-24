require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDatabase = require('./config/db');
const authRoutes = require('./routes/auth');
const resumeRoutes = require('./routes/resume');
const jobRoutes = require('./routes/jobs');
const profileRoutes = require('./routes/profile');
const interviewRoutes = require('./routes/interview');

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'careerforge-backend' }));
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/interview', interviewRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  if (err.name === 'MulterError') return res.status(400).json({ message: err.message });
  res.status(err.statusCode || 500).json({ message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message });
});

const port = Number(process.env.PORT || 5000);

async function start() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be at least 32 characters');
  await connectDatabase();
  app.listen(port, () => console.log(`Backend listening on ${port}`));
}

start().catch((error) => {
  console.error('Startup failed:', error);
  process.exit(1);
});

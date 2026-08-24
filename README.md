# CareerForge AI

> AI-powered career intelligence platform for resume analysis, semantic job matching, skill-gap detection, personalized career roadmaps, and interview practice.

## 🌐 Live Demo

**Frontend:** https://careerforge-ai-1-bk3l.onrender.com  
**Backend API:** https://careerforge-ai-backend-2ucj.onrender.com  
**AI Service:** https://careerforge-ai-moqo.onrender.com

> Free Render services may sleep after inactivity, so the first request after a period of inactivity can take longer than usual.

## 📌 Overview

CareerForge AI helps students and job seekers understand their current skills, evaluate their fit for target roles, identify skill gaps, build learning roadmaps, and practice interviews from one platform.

The application combines a React/Vite frontend, a Node.js/Express backend, a Python/FastAPI AI microservice, and MongoDB.

## ✨ Core Features

- 🔐 User registration and JWT-based authentication
- 📄 Resume upload and PDF text extraction
- 🧠 AI-powered skill extraction
- 🎯 Semantic resume-to-job matching
- 📊 Overall match and semantic similarity scores
- ✅ Matched skill identification
- ⚠️ Weak skill identification
- ❌ Missing skill identification
- 🗺️ Personalized learning roadmap
- 🎤 Interview answer evaluation
- 📈 Dashboard analytics and visual skill-gap summaries

## 🏗️ Architecture

```text
                    ┌─────────────────────────┐
                    │     React + Vite UI     │
                    │      Tailwind CSS       │
                    └────────────┬────────────┘
                                 │ REST API
                                 ▼
                    ┌─────────────────────────┐
                    │    Node.js + Express    │
                    │      JWT Auth API       │
                    └──────────┬───────┬──────┘
                               │       │
                         MongoDB│       │AI Requests
                               │       ▼
                               │  ┌──────────────────┐
                               │  │ Python + FastAPI │
                               │  │   AI/ML Service  │
                               │  └────────┬─────────┘
                               │           │
                               │     Sentence
                               │     Transformers
                               │           │
                               ▼           ▼
                    ┌─────────────────────────┐
                    │      MongoDB Atlas       │
                    └─────────────────────────┘
```

## 🧰 Tech Stack

### Frontend
- React
- Vite
- JavaScript
- Tailwind CSS

### Backend
- Node.js
- Express.js
- REST APIs
- JWT authentication
- Mongoose
- Axios

### AI / Machine Learning
- Python
- FastAPI
- Sentence Transformers
- Transformers
- scikit-learn
- NumPy
- SciPy
- NLP
- Dense embeddings
- Cosine / semantic similarity
- Skill extraction and gap analysis
- Interview response analysis

### Resume / PDF Processing
- pdfplumber
- PyPDF2
- PDFMiner
- python-multipart

### Database
- MongoDB
- MongoDB Atlas

### DevOps / Tools
- Docker
- Docker Compose
- Git
- GitHub
- Visual Studio Code
- Postman
- MongoDB Compass

### Deployment
- Render
- MongoDB Atlas

## 🔄 How It Works

### 1. Authentication

A user creates an account or logs in. The backend issues a JWT that is used for authenticated API requests.

### 2. Resume Analysis

The user uploads a PDF resume. The backend extracts the text and sends the relevant content to the FastAPI AI service.

### 3. Skill Extraction

The AI service identifies candidate skills from the resume and normalizes them for comparison.

### 4. Job Matching

Resume skills and job requirements are compared using both explicit skill matching and semantic similarity. The dashboard presents an overall match score and a breakdown of matched, weak, and missing skills.

### 5. Career Roadmap

Missing skills are translated into a learning-oriented roadmap so users can focus on the most important gaps for a target role.

### 6. Interview Practice

Users can submit interview responses. The AI service evaluates the response and returns feedback such as answer quality, clarity, specificity, and tone-related indicators.

## 🧪 Tested Workflows

The deployed application has been tested end-to-end for:

- User login and authentication
- Resume upload
- PDF processing
- AI skill extraction
- Job-fit analysis
- Skill-gap visualization
- Learning roadmap generation
- Interview response evaluation

## 📂 Project Structure

```text
CareerForge-AI/
├── ai-service/
│   ├── routers/
│   ├── services/
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   ├── package.json
│   └── Dockerfile
│
├── frontend/
│   ├── public/
│   │   └── favicon.png
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 🚀 Run Locally

### Prerequisites

- Node.js
- Python 3.11+
- Docker Desktop
- Git
- MongoDB (Docker Compose is recommended)

### Clone the repository

```bash
git clone https://github.com/GalacticBear/CareerForge-AI.git
cd CareerForge-AI
```

### Environment configuration

Create the required environment files from your local project configuration.

Keep secrets out of GitHub. Do not commit `.env`, passwords, JWT secrets, or other private credentials.

### Run with Docker Compose

```bash
docker compose up --build
```

The local services use these ports:

```text
Frontend   http://localhost:5173
Backend    http://localhost:5000
AI Service http://localhost:8000
MongoDB    mongodb://localhost:27017
```

## ☁️ Deployment

The deployed setup uses:

```text
React/Vite frontend  → Render
Node/Express backend  → Render
FastAPI AI service    → Render
MongoDB database      → MongoDB Atlas
Source control        → GitHub
```

## 🔒 Security Notes

- Never commit `.env` files.
- Never publish database passwords or JWT secrets.
- Use environment variables for deployment credentials.
- Keep MongoDB credentials separate from source code.

## 📚 API Surface

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### Resume

```text
POST /api/resume/upload
```

### Jobs / Matching

```text
POST /api/jobs/match
GET  /api/jobs
```

### Profile

```text
GET /api/profile
```

### AI service

```text
POST /api/ai/match
POST /api/ai/extract-skills
POST /api/ai/interview-eval
GET  /health
```

## 🎯 Project Goals

CareerForge AI is designed to make career preparation more actionable by connecting three questions in one workflow:

1. **What skills do I already have?**
2. **How well do my skills match a target role?**
3. **What should I learn and practice next?**

## 🔮 Future Improvements

- More job-source integrations
- Stronger resume section extraction
- Advanced role recommendations
- User progress tracking over time
- More interview question categories
- Automated learning-resource recommendations
- Improved production observability and rate controls

## 👤 Author

**CareerForge AI**  
Built as a full-stack AI/ML portfolio project using React, Node.js, Python, FastAPI, MongoDB, Docker, and cloud deployment.

## ⭐ If You Like the Project

Give the repository a star and explore the live demo.

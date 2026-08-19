# CareerForge AI

> AI-powered career intelligence platform for personalized career development.

## Overview

CareerForge AI is a full-stack career intelligence platform that helps students and job seekers understand their skills, discover relevant job opportunities, identify skill gaps, prepare for interviews, and build personalized career roadmaps.

The platform combines a modern web application with AI/ML services to analyze user profiles and resumes and provide personalized career recommendations.

## Problem Statement

Students and early-career professionals often struggle to:

- Understand which skills they already have
- Identify missing skills for their target roles
- Find jobs that match their actual skill set
- Know what to learn next
- Prepare effectively for technical interviews
- Track their progress toward a career goal

CareerForge AI aims to bring these capabilities together in a single platform.

## Core Features

### 1. User Authentication
- User registration and login
- Secure password handling
- JWT-based authentication
- User profile management

### 2. Resume Intelligence
- Resume upload
- Resume text extraction
- Skill extraction
- Education and experience extraction
- Resume analysis

### 3. Job Intelligence
- Job listing management
- Job search and filtering
- Resume-to-job matching
- Match score
- Missing skill identification

### 4. Skill Gap Analysis
- Compare current skills with target job requirements
- Identify missing skills
- Prioritize skills to learn
- Track learning progress

### 5. Career Roadmap
- Personalized career goals
- Recommended learning paths
- Skill progression
- Milestone tracking

### 6. AI Career Assistant
- Career-related questions
- Personalized recommendations
- Learning suggestions
- Resume improvement suggestions

### 7. Mock Interview
- Role-specific interview questions
- Technical and behavioral questions
- Answer evaluation
- Feedback and improvement suggestions

### 8. Analytics Dashboard
- Current skill profile
- Job match statistics
- Skill gap progress
- Career roadmap progress

## Technology Stack

### Frontend
- React
- Vite
- JavaScript
- Tailwind CSS

### Backend
- Node.js
- Express.js
- REST API
- JWT Authentication

### AI/ML Service
- Python
- FastAPI
- Natural Language Processing
- Machine Learning
- Embeddings
- Semantic similarity

### Database
- MongoDB

### Development Tools
- Git
- GitHub
- Docker
- Postman
- MongoDB Compass
- Visual Studio Code

## Architecture

```text
                    ┌─────────────────────┐
                    │      React UI       │
                    │     Frontend        │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │   Node.js/Express   │
                    │      Backend        │
                    └──────┬─────────┬────┘
                           │         │
                           │         │ AI Requests
                           │         ▼
                           │  ┌─────────────────┐
                           │  │  Python/FastAPI │
                           │  │    AI Service   │
                           │  └─────────────────┘
                           │
                           ▼
                    ┌─────────────────────┐
                    │      MongoDB        │
                    │      Database       │
                    └─────────────────────┘
```



## Project Structure

```text
CareerForge-AI/
│
├── frontend/
├── backend/
├── ai-service/
├── docs/
│
├── .gitignore
├── README.md
└── docker-compose.yml
```

## Development Philosophy

CareerForge AI is being developed as a production-style software project rather than a simple academic prototype.

The development process focuses on:

- Modular architecture
- Secure configuration
- API-first development
- Automated testing
- Version control
- Documentation
- Containerization
- Maintainable code

## Project Status

🚧 Currently under development.

## Future Improvements

Potential future improvements include:

- Real-time job market analysis
- More advanced recommendation models
- Personalized learning recommendations
- Advanced interview evaluation
- Career trend analysis
- Multi-language resume support
- Integration with external job platforms

## License

This project is currently intended as an academic major project.
# CareerForge AI

Production-oriented multi-container career intelligence platform built with FastAPI, Express, MongoDB, React/Vite, Tailwind CSS, and sentence-transformers.

## Services

- MongoDB: persistent document database.
- AI service: FastAPI NLP/embedding/semantic analysis on port 8000.
- Backend: Express API/JWT orchestration on port 5000.
- Frontend: React/Vite dashboard served by Nginx on port 5173.

## Run

```bash
docker compose up --build
```

Open http://localhost:5173.

For local development outside Docker, use Node.js 22+, Python 3.11+, and MongoDB 8+.

## API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/resume/upload`
- `POST /api/jobs/match`
- `GET /api/jobs`
- `GET /api/profile`
- `POST /api/jobs`
- `POST /api/interview/evaluate`
- `GET /health`

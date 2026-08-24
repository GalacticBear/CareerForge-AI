import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.analysis import router as analysis_router

origins = [origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",") if origin.strip()]

app = FastAPI(title="CareerForge AI Service", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)
app.include_router(analysis_router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "careerforge-ai"}


@app.get("/")
def root():
    return {"service": "CareerForge AI Service", "docs": "/docs"}
